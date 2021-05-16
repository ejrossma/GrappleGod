class Player extends Phaser.Physics.Matter.Image {
    constructor(scene, x, y, velocity, jump_velocity, texture){
        super(scene.matter.world, x, y, texture);
        scene.add.existing(this);

        // horizontal movement variables
        this.MAX_VELOCITY = velocity;       // max x-velocity
        this.CURRENT_VELOCITY = 0;          // current x-velocity

        // jump variables
        this.JUMP_VELOCITY = jump_velocity; // jump velocity
        this.jumps = 1;                     // current amt jumps
        this.MAX_JUMPS = 1;                 // max amt jumps
        this.jumping = false;               // jumping boolean
        this.isGrounded = true;             // grounded boolean

        // other variables
        this.isGrappling = false;           // currently grappling boolean
        this.canSwing = true;               // detect when can swing boolean (false if too high)
        this.finishedGrappling = true;      // finished landing after grappling boolean

        // other things
        this.setFriction(0);                // remove sliding on walls
        this.setFixedRotation(0);           // prevent player sprite from unnecessarily spinning when moving

        // collision for jumping (resets upon collision)
        for (var i = 0; i < this.scene.platformChildren.length; i++)
        {
            this.setOnCollideWith(this.scene.platformChildren[i], pair => {
                this.setTouchingDown();
            });
        }
    }

    update(deltaMultiplier)
    {
        // detect if and where to grapple
        this.checkGrapple();

        // if currently grappling, Q to release
        if (this.isGrappling && Phaser.Input.Keyboard.JustDown(keyQ))
        {
            this.currentHook.unHookCharacter();   // unhook the character
            this.isGrappling = false;             // set currently grappling bool to false
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
            this.setVelocityX(0);                                         // dont move
        }

        // check if grounded, if true, make sure the player can jump
        if (this.isGrounded)
        {
            this.jumps = this.MAX_JUMPS;
            this.jumping = false;
        }

        // if can jump, then jump based on how long space bar is pressed
        if (!this.isGrappling && this.jumps > 0 && this.finishedGrappling &&  Phaser.Input.Keyboard.DownDuration(cursors.space, 150))
        {
            this.setVelocityY(this.JUMP_VELOCITY * deltaMultiplier);    // jumping
            this.jumping = true;                                        // currently jumping set to true
            this.isGrounded = false;                                    // set grounded boolean to false
            this.setFrictionAir(0);                                     // reset air friction
        }

        // remove a jump upon releasing the space bar
        if (!this.isGrappling && this.jumping && this.finishedGrappling && Phaser.Input.Keyboard.UpDuration(cursors.space)) 
        {
            this.jumps--;                                               // subtract a jump from current jumps
            this.jumping = false;                                       // set boolean to false to prevent another jump
        }
        
        // update while grappling
        if (this.isGrappling)
        {
            this.grapplingUpdate(this.currentHook, deltaMultiplier);
        }

        // after letting go of grapple, continue momentum until hitting ground
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
                        this.setVelocityX(0);       // stop x momentum 
                        this.setVelocityY(2.5);     // slow y momentum if necessary
                        this.scene.branchChildren[i].hookCharacter(this, this.scene.branchChildren[i]); // hook to branch
                        this.currentHook = this.scene.branchChildren[i];        // remember current branch
                        this.setFrictionAir(0);     // reset air friction
                        this.finishedGrappling = false;    // set finished grappling to false
                        this.isGrappling = true;           // set currently grappling boolean to true
                    }
                }
            }
        }
    }

    // function called when the player collides with ground
    setTouchingDown()
    {
        this.finishedGrappling = true;  // finished grappling set to true
        this.isGrounded = true;         // is currently grounded, so set to true
    }

    // update while grappling
    grapplingUpdate(hook, deltaMultiplier)
    {
        if (this.isGrappling && this.y >= hook.y + this.height)
        {
            this.canSwing = true;       // if you can swing higher based on bounds allowed to swing
            this.applyForce(this, hook, deltaMultiplier);   // apply swinging force
        }
        else
        {
            this.canSwing = false;      // if you cannot swing higher based on bounds allowed to swing
            this.applyForce(this, hook, deltaMultiplier);   // apply swinging force
        }
        if (this.isGrappling && this.x > hook.x)
        {
            this.direction = 'right';       // detect which way the moment is carrying
        }
        else if (this.isGrappling && this.x < hook.x)
        {
            this.direction = 'left';        // detect which way the moment is carrying
        }
    }

    // apply the swining/falling force
    applyForce(player, branch, deltaMultiplier)
    {
        // while grappled
        if(player.isGrappling && cursors.right.isDown && player.canSwing){
            this.scene.matter.applyForceFromAngle(player, 0.00035 * deltaMultiplier, 0);    // force right
        }
        else if(player.isGrappling && cursors.left.isDown && player.canSwing){
            this.scene.matter.applyForceFromAngle(player, 0.00035 * deltaMultiplier, -180); // force left
        }

        // after letting go of grapple
        if (!player.isGrappling && !player.isGrounded && !player.finishedGrappling && player.direction == 'right' && player.canSwing == true)
        {
            this.scene.matter.applyForceFromAngle(player, 0.0005 * deltaMultiplier, 0);     // force right
        }
        else if (!player.isGrappling && !player.isGrounded && !player.finishedGrappling && player.direction == 'left' && player.canSwing == true)
        {
            this.scene.matter.applyForceFromAngle(player, 0.0005 * deltaMultiplier, 180);   // force left
        }
    }

    // apply force if grapple is released above canSwing bounds
    applyForceVertical(player, branch, deltaMultiplier)
    {
        if (!player.isGrappling && !player.isGrounded && !player.finishedGrappling && player.direction == 'right' && player.canSwing == false)
        {
            player.x += 3*deltaMultiplier;  // add a little bit of forward momentum
            player.y += -3&deltaMultiplier;  // add a little bit of vertical momentum
            this.scene.matter.applyForceFromAngle(player, 0.00035 * deltaMultiplier, -90);  // force up
        }
        else if (!player.isGrappling && !player.isGrounded && !player.finishedGrappling && player.direction == 'left' && player.canSwing == false)
        {
            player.x += -3*deltaMultiplier; // add a little bit of backward momentum
            player.y += -3&deltaMultiplier;  // add a little bit of verticle momentum
            this.scene.matter.applyForceFromAngle(player, 0.00035 * deltaMultiplier, -90);  // force up
        }
    }
}