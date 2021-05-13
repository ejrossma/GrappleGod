class Player extends Phaser.Physics.Matter.Image {
    constructor(scene, x, y, velocity, jump_velocity, texture){
        super(scene.matter.world, x, y, texture);
        scene.add.existing(this);

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
        this.inVicinity = false;
        this.canSwing = true;

        // other things
        this.setFriction(0);             // remove sliding on walls
        //this.setFrictionAir(0)
        this.setFixedRotation(0);        // prevent player sprite from unnecessarily spinning when moving
    }

    update(deltaMultiplier)
    {
        // grappling
        this.checkGrapple();

        if (this.isGrappling && Phaser.Input.Keyboard.JustDown(keyQ))
        {
            this.scene.unHookCharacter();   // unhook the character
            this.isGrappling = false;       // set bool to false
        }
        // horizontal movement
        if (!this.isGrappling && cursors.right.isDown) 
        {
            this.setVelocityX(this.MAX_VELOCITY * deltaMultiplier);       // move right
        }
        else if(!this.isGrappling && cursors.left.isDown)
        {
            this.setVelocityX(-this.MAX_VELOCITY * deltaMultiplier);      // move left
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
        if (!this.isGrappling && this.jumps > 0 && Phaser.Input.Keyboard.DownDuration(cursors.space, 150))
        {
            this.setVelocityY(this.JUMP_VELOCITY);
            this.jumping = true;
        }

        // letting go of space key subtracting a jump
        if (!this.isGrappling && this.jumping && Phaser.Input.Keyboard.UpDuration(cursors.space)) 
        {
            this.jumps--;
            this.jumping = false;
        }
        
        // check if can swing so you cant go in a full
        if (this.isGrappling)
        {
            if (this.currentBranch = 1)
            {
                if (this.y >= this.scene.branch1.y + this.width*0.5)
                {
                    this.canSwing = true;
                    this.scene.applyForce(this, this.scene.branch1, deltaMultiplier);
                }
                else
                {
                    this.canSwing = false;
                    this.scene.applyForce(this, this.scene.branch1, deltaMultiplier);
                }
            }
            if (this.currentBranch = 2)
            {
                if (this.y >= this.scene.branch2.y + this.width*0.5)
                {
                    this.canSwing = true;
                    this.scene.applyForce(this, this.scene.branch2, deltaMultiplier);
                }
                else
                {
                    this.canSwing = false;
                    this.scene.applyForce(this, this.scene.branch2, deltaMultiplier);
                }
            }
        }
    }

    // check if can grapple
    checkGrapple()
    {
        if (!this.isGrappling && Phaser.Input.Keyboard.JustDown(keyQ))
        {
            if (this.x < this.scene.branch1.x + 90 && this.x > this.scene.branch1.x - 90)
            {
                if (this.y >= this.scene.branch1.y && this.y <= this.scene.branch1.y + 80)
                {
                    this.scene.hookCharacter(this, this.scene.branch1);
                    this.currentBranch = 1;
                    this.isGrappling = true;
                }
            }
            if (this.x < this.scene.branch2.x + 90 && this.x > this.scene.branch2.x - 90)
            {
                if (this.y >= this.scene.branch2.y && this.y <= this.scene.branch2.y + 80)
                {
                    this.scene.hookCharacter(this, this.scene.branch2);
                    this.currentBranch = 2;
                    this.isGrappling = true;
                }
            }
        }
        
    }
}