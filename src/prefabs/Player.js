class Player extends Phaser.Physics.Matter.Image {
    constructor(scene, x, y, velocity, jump_velocity, texture){
        super(scene.matter.world, x, y, texture);
        scene.add.existing(this);
        //scene.physics.add.existing(this);

        // horizontal movement variables
        this.MAX_VELOCITY = velocity;
        this.CURRENT_VELOCITY = 0;

        // jump variables
        this.JUMP_VELOCITY = jump_velocity;
        this.jumps = 1;
        this.MAX_JUMPS = 1;
        this.jumping = false;

        // other variables
        this.isGrappling = false;

        // other things
        this.setFriction(0);             // remove sliding on walls
        this.setFixedRotation(0);        // prevent player sprite from unnecessarily spinning when moving
    }

    update()
    {
        // grappling
        if (!this.isGrappling && Phaser.Input.Keyboard.JustDown(keyQ))
        {
            this.isGrappling = true;
            this.scene.hookCharacter();     // hook the character
        }
        else if (this.isGrappling && Phaser.Input.Keyboard.JustDown(keyQ))
        {
            this.isGrappling = false;
            this.scene.unHookCharacter();   // unhook the character
        }

        // horizontal movement
        if (!this.isGrappling && cursors.right.isDown) 
        {
            this.setVelocityX(this.MAX_VELOCITY);       // move right
        }
        else if(!this.isGrappling && cursors.left.isDown)
        {
            this.setVelocityX(-this.MAX_VELOCITY);      // move left
        }
        else if (!this.isGrappling)
        {
            this.setVelocityX(0);                       // dont move
        }

        // vertical movement
        // check if grounded
        //console.log(this.player.x)
        
        this.isGrounded = true;

        // if so, can jump
        if (this.isGrounded)
        {
            this.jumps = this.MAX_JUMPS;
            this.jumping = false;
        }
        else
        {

        }

        // actual jumping
        if (this.jumps > 0 && Phaser.Input.Keyboard.DownDuration(cursors.space, 150))
        {
            this.setVelocityY(this.JUMP_VELOCITY);
            this.jumping = true;
        }

        // letting go of space key subtracting a jump
        if (this.jumping && Phaser.Input.Keyboard.UpDuration(cursors.space)) 
        {
            this.jumps--;
            this.jumping = false;
        }


    }
}