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
        this.isGrounded = true;

        // other variables
        this.isGrappling = false;
        this.inVicinity = false;
        this.canSwing = true;
        this.finishedGrappling = true;

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
            this.setVelocityY(this.JUMP_VELOCITY * deltaMultiplier);
            this.jumping = true;
            this.isGrounded = false;
            this.setFrictionAir(0);
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
            this.grapplingUpdate(this.currentHook, deltaMultiplier);
        }

        // continue momentum
        if (!this.isGrappling && !this.isGrounded && !this.finishedGrappling)
        {
            this.scene.applyForce(this, this.currentHook, deltaMultiplier);
            this.setFrictionAir(0.025);
        }
    }

    // check if can grapple
    checkGrapple()
    {
        if (!this.isGrappling && Phaser.Input.Keyboard.JustDown(keyQ))
        {
            // check each individual branch
            for (var i = 0; i < this.scene.branchChildren.length; i++)
            {
                if (this.x < this.scene.branchChildren[i].x + this.scene.branchChildren[i].xBound && this.x > this.scene.branchChildren[i].x - this.scene.branchChildren[i].xBound)
                {
                    if (this.y >= this.scene.branchChildren[i].y && this.y <= this.scene.branchChildren[i].y + this.scene.branchChildren[i].yBound)
                    {
                        this.scene.hookCharacter(this, this.scene.branchChildren[i]);
                        this.currentHook = this.scene.branchChildren[i];
                        this.setFrictionAir(0);
                        this.finishedGrappling = false;
                        this.isGrappling = true;
                    }
                }
            }
        }
    }

    setTouchingDown()
    {
        this.finishedGrappling = true;
        this.isGrounded = true;
    }

    grapplingUpdate(hook, deltaMultiplier)
    {
        if (this.y >= hook.y + this.height)
        {
            this.canSwing = true;
            this.scene.applyForce(this, hook, deltaMultiplier);
        }
        else
        {
            this.canSwing = false;
            this.scene.applyForce(this, hook, deltaMultiplier);    
        }
        if (this.x > hook.x)
        {
            this.direction = 'right';
        }
        else if (this.x < hook.x)
        {
            this.direction = 'left';
        }
        else
        {
            this.direction = 'center';
        }
    }
}