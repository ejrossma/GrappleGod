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
        this.setFixedRotation(0);        // prevent player sprite from unnecessarily spinning when moving

        // collision for jumping
        for (var i = 0; i < this.scene.platformChildren.length; i++)
        {
            this.setOnCollideWith(this.scene.platformChildren[i], pair => {
                this.setTouchingDown();
            });
        }
    }

    update(deltaMultiplier)
    {
        // grappling
        this.checkGrapple();

        if (this.isGrappling && Phaser.Input.Keyboard.JustDown(keyQ))
        {
            this.currentHook.unHookCharacter();   // unhook the character
            this.isGrappling = false;       // set bool to false
        }
        // horizontal movement
        if (!this.isGrappling && this.finishedGrappling &&  cursors.right.isDown) 
        {
            this.setVelocityX(this.MAX_VELOCITY * deltaMultiplier);       // move right
        }
        else if(!this.isGrappling && this.finishedGrappling && cursors.left.isDown)
        {
            this.setVelocityX(-this.MAX_VELOCITY * deltaMultiplier);      // move left
        }
        else if (!this.isGrappling && this.finishedGrappling)
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
        if (!this.isGrappling && this.jumps > 0 && this.finishedGrappling &&  Phaser.Input.Keyboard.DownDuration(cursors.space, 150))
        {
            this.setVelocityY(this.JUMP_VELOCITY * deltaMultiplier);
            this.jumping = true;
            this.isGrounded = false;
            this.setFrictionAir(0);
        }

        // letting go of space key subtracting a jump
        if (!this.isGrappling && this.jumping && this.finishedGrappling && Phaser.Input.Keyboard.UpDuration(cursors.space)) 
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
        if (!this.isGrappling && !this.isGrounded && !this.finishedGrappling && this.canSwing)
        {
            this.applyForce(this, this.currentHook, deltaMultiplier);
            this.setFrictionAir(0.015);
        }
        if (!this.isGrappling && !this.isGrounded && !this.finishedGrappling && !this.canSwing)
        {
            this.applyForceVertical(this, this.currentHook, deltaMultiplier);
            this.setFrictionAir(0.02);
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
                        this.setVelocityX(0);
                        this.setVelocityY(2.5);
                        this.scene.branchChildren[i].hookCharacter(this, this.scene.branchChildren[i]);
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
        if (this.isGrappling && this.y >= hook.y + this.height)
        {
            this.canSwing = true;
            this.applyForce(this, hook, deltaMultiplier);
        }
        else
        {
            this.canSwing = false;
            this.applyForce(this, hook, deltaMultiplier);    
        }
        if (this.isGrappling && this.x > hook.x)
        {
            this.direction = 'right';
        }
        else if (this.isGrappling && this.x < hook.x)
        {
            this.direction = 'left';
        }
    }

    applyForce(player, branch, deltaMultiplier)
    {
        // while grappled
        if(player.isGrappling && cursors.right.isDown && player.canSwing){
            this.scene.matter.applyForceFromAngle(player, 0.00035 * deltaMultiplier, 0);
        }
        else if(player.isGrappling && cursors.left.isDown && player.canSwing){
            this.scene.matter.applyForceFromAngle(player, 0.00035 * deltaMultiplier, -180);
        }

        // when letting go of grapple
        if (!player.isGrappling && !player.isGrounded && !player.finishedGrappling && player.direction == 'right' && player.canSwing == true)
        {
            this.scene.matter.applyForceFromAngle(player, 0.0005 * deltaMultiplier, 0);
        }
        else if (!player.isGrappling && !player.isGrounded && !player.finishedGrappling && player.direction == 'left' && player.canSwing == true)
        {
            this.scene.matter.applyForceFromAngle(player, 0.0005 * deltaMultiplier, 180);
        }
    }

    applyForceVertical(player, branch, deltaMultiplier)
    {
        if (!player.isGrappling && !player.isGrounded && !player.finishedGrappling && player.direction == 'right' && player.canSwing == false)
        {
            player.x += 3*deltaMultiplier;
            player.y += 3&deltaMultiplier
            this.scene.matter.applyForceFromAngle(player, 0.00035 * deltaMultiplier, -90);
        }
        else if (!player.isGrappling && !player.isGrounded && !player.finishedGrappling && player.direction == 'left' && player.canSwing == false)
        {
            player.x += -3*deltaMultiplier;
            player.y += 3&deltaMultiplier
            this.scene.matter.applyForceFromAngle(player, 0.00035 * deltaMultiplier, -90);
        }
    }
}