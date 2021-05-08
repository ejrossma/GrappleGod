class Player extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, velocity, jump_velocity, texture){
        super(scene, x, y, texture);
        scene.add.existing(this);
        scene.physics.add.existing(this);

        // horizontal movement variables
        this.MAX_VELOCITY = velocity;

        // jump variables
        this.JUMP_VELOCITY = jump_velocity;
        this.jumps = 1;
        this.MAX_JUMPS = 1;
        this.jumping = false;
    }

    update()
    {
        // horizontal movement
        if (cursors.right.isDown) 
        {
            this.body.velocity.x = this.MAX_VELOCITY;
        }
        else if(cursors.left.isDown)
        {
            this.body.velocity.x = -this.MAX_VELOCITY;
        }
        else
        {
            this.body.velocity.x = 0;
        }

        // vertical movement
        // check if grounded
        this.isGrounded = this.body.touching.down;
        
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
            this.body.velocity.y = this.JUMP_VELOCITY;
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