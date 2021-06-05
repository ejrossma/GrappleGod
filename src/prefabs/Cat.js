class Cat extends Phaser.Physics.Matter.Sprite {
    constructor(scene, x, y, velocity, xBound, yBound, texture){
        super(scene.matter.world, x, y, texture);
        scene.add.existing(this);

        this.MAX_VELOCITY = velocity;       // max x-velocity
        this.setFriction(0);                // remove sliding on walls
        this.setFixedRotation(0);           // prevent player sprite from unnecessarily spinning when moving
        this.running = false;
        this.setRun = false;

        // area of detection for bounds
        this.spawnX = x;
        this.spawnY = y;
        this.xBound = xBound;
        this.yBound = yBound;

        // visual bounds (comment out to remove)
        //this.scene.add.rectangle(x - xBound, y, xBound*2, yBound, 0xff0000, 0.2).setOrigin(0);
    }
}

class CatIdleState extends State
{
    enter (scene, player, cat)
    {
        
    }

    execute(scene, player, cat)
    {
        //--------------------------------------------------------------------

        if (cat.running)
        {
            scene.cat.anims.play('cat_run');
            this.stateMachine.transition('run');
            return;
        }

        //--------------------------------------------------------------------

        if (player.x < cat.spawnX + cat.xBound && player.x > cat.spawnX - cat.xBound)
        {
            if (player.y >= cat.spawnY && player.y <= cat.spawnY + cat.yBound)
            {
                cat.running = true;
            }
        }
    }
}

class CatRunState extends State
{
    execute(scene, player, cat)
    {
        //--------------------------------------------------------------------

        if (!cat.running)
        {
            this.stateMachine.transition('idle');
            return;
        }

        //--------------------------------------------------------------------

        cat.setIgnoreGravity(true);
        cat.setCollisionCategory(0);
        cat.setVelocityX(cat.MAX_VELOCITY/2);
        cat.flipX = true;

    }
}