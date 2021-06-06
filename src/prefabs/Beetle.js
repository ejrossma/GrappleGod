class Beetle extends Phaser.Physics.Matter.Sprite {
    constructor(scene, x, y, velocity, texture){
        super(scene.matter.world, x, y, texture);
        scene.add.existing(this);

        this.MAX_VELOCITY = velocity;
        this.shakeCount = 0
        this.isShaking = true;
        this.setCollisionGroup(2);
        this.direction = 1;
        this.distanceTraveled = 0;
        this.animPlaying = false;
        this.inZone = false;

        this.setFriction(0);                // remove sliding on walls
        this.setFixedRotation(0);           // prevent player sprite from unnecessarily spinning when moving

        // visual bounds (comment out to remove)
        //this.scene.add.rectangle(game.config.width/2, game.config.height - 48, game.config.width*2, 64, 0xff0000, 0.2);
    }


}

// state classes
class GroundPoundState extends State
{
    enter (scene, player, beetle)
    {
        scene.clock = scene.time.delayedCall(1500, () => {
            beetle.isShaking = false;
        }, null, this);
    }

    execute(scene, player, beetle)
    {
        if (beetle.animPlaying)
        {
            beetle.animPlaying = false;
            scene.beetle.anims.pauseAll();
        }

        //--------------------------------------------------------------------
        
        if (!beetle.isShaking && beetle.shakeCount >= 1)
        {
            this.stateMachine.transition('search');
            return;
        }

        //--------------------------------------------------------------------

        // shake camera
        if (beetle.shakeCount < 1 && !beetle.isShaking)
        {
            scene.clock = scene.time.delayedCall(750, () => {
                scene.cameras.main.shake(500);
            }, null, this);
        }

        scene.cameras.main.on('camerashakestart', function () {
            beetle.isShaking = true;
            beetle.shakeCount++;
        });

        scene.cameras.main.on('camerashakecomplete', function () {
            beetle.isShaking = false;
        });

        if (!beetle.animPlaying)
        {
            scene.beetle.anims.play('beetle_walk');
        }
        
    }
}

class ChargeState extends State
{
    execute(scene, player, beetle)
    {

        //--------------------------------------------------------------------

        if (beetle.inZone == false && player.isGrounded)
        {
            beetle.shakeCount = 0;
            this.stateMachine.transition('groundpound');
            return;
        }

        if (beetle.inZone == false && player.isGrappling)
        {
            beetle.shakeCount = 0;
            this.stateMachine.transition('groundpound');
            return;
        }

        if (player.shortImmunity)
        {
            this.stateMachine.transition('search');
            return;
        }

        //--------------------------------------------------------------------

        if (player.x < beetle.x)
        {
            beetle.direction == 1;
            beetle.setVelocityX(-beetle.MAX_VELOCITY/2);
            beetle.flipX = false;
        }
        else if (player.x > beetle.x)
        {
            beetle.direction == 2;
            beetle.setVelocityX(beetle.MAX_VELOCITY/2);
            beetle.flipX = true;
        }
        else
        {
            beetle.setVelocityX(0);
        }

        if (player.x < game.config.width*2 && player.x > 0)
        {
            if (player.y <= game.config.height && player.y >= game.config.height - 48)
            {
                beetle.inZone = true;
            }
            else
            {
                beetle.inZone = false;
            }
        }
        else
        {
            beetle.inZone = false;
        }
    }
}

class SearchState extends State
{
    execute(scene, player, beetle)
    {

        //--------------------------------------------------------------------

        if (player.x < game.config.width*2 && player.x > 0)
        {
            if (player.y <= game.config.height && player.y >= game.config.height - 48)
            {
                beetle.inZone = true;
                this.stateMachine.transition('charge');
                return;
            }
        }

        //--------------------------------------------------------------------

        // randomize direction
        if (beetle.distanceTraveled >= 100)
        {
            beetle.direction = Phaser.Math.Between(1, 2);
            beetle.distanceTraveled = 0;
        }

        if (beetle.direction == 1)
        {
            beetle.setVelocityX(-beetle.MAX_VELOCITY/4);
            beetle.distanceTraveled += beetle.MAX_VELOCITY/4;
            beetle.flipX = false;
        }
        else if (beetle.direction == 2)
        {
            beetle.setVelocityX(beetle.MAX_VELOCITY/4);
            beetle.distanceTraveled += beetle.MAX_VELOCITY/4;
            beetle.flipX = true;
        }
        
    }
}

class StunnedState extends State
{
    execute(scene, player, beetle)
    {

        //--------------------------------------------------------------------

        if (!player.isGrappling)
        {
            this.stateMachine.transition('falling');
            return;
        }

        //--------------------------------------------------------------------

        
    }
}