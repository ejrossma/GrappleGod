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
        this.timesHit = 0;
        this.pauseAnims = false;
        this.shellCracked = false;
        this.kickStunned = false;
        this.health = 1;
        this.spikesFalling = false;
        this.hitOnce = false;
        

        this.setFriction(0);                // remove sliding on walls
        this.setFixedRotation(0);           // prevent player sprite from unnecessarily spinning when moving

        // visual bounds (comment out to remove)
        //this.scene.add.rectangle(game.config.width/2, game.config.height - 48, game.config.width*2, 64, 0xff0000, 0.2);

        this.setOnCollideActive(pair => {
            //console.log(pair.bodyA);
            //console.log(pair.bodyB);
            if (pair.bodyA.gameObject != null)
            {
                if (pair.bodyA.collisionFilter.group == 0)
                {
                    if (pair.bodyA.gameObject.tile.faceRight)
                    {
                        this.pauseAnims = true;
                    }
                    else if (pair.bodyA.gameObject.tile.faceLeft)
                    {
                        this.pauseAnims = true;
                    }
                    else
                    {
                        this.pauseAnims = false;
                    }
                }
            }
        });
    }

    spikeFall(scene)
    {
        scene.spikes = scene.add.group();
        for (var i = 0; i < 36; i++)
        {
            scene.spike = scene.matter.add.image(132 + 16*i, 20, 'spike').setAlpha(0);
            scene.spike.setIgnoreGravity(true);
            scene.spike.setCollisionGroup(3);
            scene.spike.setFixedRotation(0);
            scene.spike.spawn = Phaser.Math.Between(1,5);
            scene.spikes.add(scene.spike);
        }
        this.spikeChildren = scene.spikes.getChildren();
        this.spikeChildren.forEach(function(child)
        {
            if (child.spawn == 1)
            {
                child.alpha = 1;
                child.setFrictionAir(0.25);
                child.body.ignoreGravity = false;
                child.setOnCollideActive(pair => {
                    if(pair.bodyA.gameObject != null)
                    {
                        if (pair.bodyA.collisionFilter.group == 0)
                        {
                            child.alpha = 0;
                            scene.matter.world.remove(child);
                        }
                        else if (pair.bodyA.collisionFilter.group == 4)
                        {
                            child.alpha = 0;
                            scene.matter.world.remove(child);
                        }
                        else if (pair.bodyA.collisionFilter.group == 2)
                        {
                            child.alpha = 0;
                            scene.matter.world.remove(child);
                        }
                    }
                });
            }
            else
            {
                scene.matter.world.remove(child);
            }
        });
        scene.clock = scene.time.delayedCall(10000, () => {
            scene.beetle.spikesFalling = false;
        }, null, this);
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
            if (beetle.timesHit < 1)
            {
                scene.beetle.setTexture('beetlewalk');
            }
            else if (beetle.timesHit >= 1 && beetle.timesHit < 2)
            {
                scene.beetle.setTexture('beetlewalkdamaged');
            }
            else
            {
                scene.beetle.setTexture('beetlewalkcritical');
            }
        }

        //--------------------------------------------------------------------
        
        if (!beetle.isShaking && beetle.shakeCount >= 1)
        {
            this.stateMachine.transition('search');
            return;
        }

        if (beetle.isStunned)
        {
            this.stateMachine.transition('stunned');
            return;
        }

        //--------------------------------------------------------------------

        // shake camera
        if (beetle.shakeCount < 1 && !beetle.isShaking && !beetle.spikesFalling)
        {
            beetle.spikesFalling = true;
            if (beetle.timesHit < 1)
            {
                scene.beetle.setTexture('beetlewalk');
            }
            else if (beetle.timesHit >= 1 && beetle.timesHit < 2)
            {
                scene.beetle.setTexture('beetlewalkdamaged');
            }
            else
            {
                scene.beetle.setTexture('beetlewalkcritical');
            }
            scene.clock = scene.time.delayedCall(750, () => {
                scene.roar.play();
                scene.cameras.main.shake(500);
                beetle.spikeFall(scene);
            }, null, this);
        }

        scene.cameras.main.on('camerashakestart', function () {
            beetle.isShaking = true;
            beetle.shakeCount++;
        });

        scene.cameras.main.on('camerashakecomplete', function () {
            beetle.isShaking = false;
        });

    }
}

class ChargeState extends State
{
    execute(scene, player, beetle)
    {

        if (beetle.pauseAnims)
        {
            beetle.animPlaying = false;
            if (beetle.timesHit < 1)
            {
                scene.beetle.setTexture('beetlewalk');
            }
            else if (beetle.timesHit >= 1 && beetle.timesHit < 2)
            {
                scene.beetle.setTexture('beetlewalkdamaged');
            }
            else
            {
                scene.beetle.setTexture('beetlewalkcritical');
            }
        }
        if (!beetle.animPlaying)
        {
            beetle.animPlaying = true;
            if (beetle.timesHit < 1)
            {
                scene.beetle.anims.play('beetle_walk');
            }
            else if (beetle.timesHit >= 1 && beetle.timesHit < 2)
            {
                scene.beetle.anims.play('beetle_walk_damaged');
            }
            else
            {
                scene.beetle.anims.play('beetle_walk_critical');
            }
        }

        //--------------------------------------------------------------------

        if (beetle.inZone == false && player.isGrounded && !beetle.spikesFalling)
        {
            beetle.shakeCount = 0;
            this.stateMachine.transition('groundpound');
            return;
        }

        if (beetle.inZone == false && player.isGrappling && !beetle.spikesFalling)
        {
            beetle.shakeCount = 0;
            this.stateMachine.transition('groundpound');
            return;
        }

        if (player.shortImmunity || beetle.inZone == false)
        {
            this.stateMachine.transition('search');
            return;
        }

        if (beetle.isStunned)
        {
            this.stateMachine.transition('stunned');
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

        if (beetle.pauseAnims)
        {
            beetle.animPlaying = false;
            if (beetle.timesHit < 1)
            {
                scene.beetle.setTexture('beetlewalk');
            }
            else if (beetle.timesHit >= 1 && beetle.timesHit < 2)
            {
                scene.beetle.setTexture('beetlewalkdamaged');
            }
            else
            {
                scene.beetle.setTexture('beetlewalkcritical');
            }
        }
        if (!beetle.animPlaying)
        {
            beetle.animPlaying = true;
            if (beetle.timesHit < 1)
            {
                scene.beetle.anims.play('beetle_walk');
            }
            else if (beetle.timesHit >= 1 && beetle.timesHit < 2)
            {
                scene.beetle.anims.play('beetle_walk_damaged');
            }
            else
            {
                scene.beetle.anims.play('beetle_walk_critical');
            }
        }

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

        if (beetle.isStunned)
        {
            this.stateMachine.transition('stunned');
            return;
        }

        if (!beetle.spikesFalling)
        {
            beetle.shakeCount = 0;
            this.stateMachine.transition('groundpound');
            return;
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
        beetle.animPlaying = false;
        if (beetle.timesHit < 1)
        {
            scene.beetle.setTexture('beetlewalk');
        }
        else if (beetle.timesHit >= 1 && beetle.timesHit < 2)
        {
            scene.beetle.setTexture('beetlewalkdamaged');
        }
        else
        {
            scene.beetle.setTexture('beetlewalkcritical');
        }

        //--------------------------------------------------------------------

        if (!beetle.isStunned & !scene.beetleDestroyed)
        {
            beetle.shakeCount = 0;
            beetle.hitOnce = false;
            this.stateMachine.transition('search');
            return;
        }

        //--------------------------------------------------------------------

        if (beetle.hitOnce == false)
        {
            beetle.hitOnce = true;
            beetle.setVelocityX(0);
            beetle.timesHit++;
            if (beetle.timesHit >= 2)
            {
                beetle.shellCracked = true;
            }
            if (beetle.shellCracked && beetle.kickStunned)
            {
                beetle.health--;
            }
            if (beetle.health <= 0)
            {
                scene.beetleDestroyed = true;
                scene.roar.play();
                scene.cameras.main.shake(2000);
                scene.cameras.main.on('camerashakestart', function () {
                    
                });
        
                scene.cameras.main.on('camerashakecomplete', function () {
                    scene.finalSceneTransition();
                });
            }
            console.log('Shell Cracked:' + beetle.shellCracked);
            console.log('Times Hit:' + beetle.timesHit);
            console.log('Beetle Health' + beetle.health);
            scene.beetleHit.play();
            scene.clock = scene.time.delayedCall(2000, () => {
                beetle.isStunned = false;
                beetle.kickStunned = false;
            }, null, this);
        }
    }
}