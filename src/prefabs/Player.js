class Player extends Phaser.Physics.Matter.Sprite {
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
        this.isWalking = false;
        this.walked = false;

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

    update(branchChildren, deltaMultiplier)
    {
        // detect if and where to grapple
        this.checkGrapple(branchChildren);

        // if currently grappling, Q to release
        if (this.isGrappling && Phaser.Input.Keyboard.JustDown(keyQ))
        {
            this.currentHook.unHookCharacter();   // unhook the character
            this.isGrappling = false;             // set currently grappling bool to false
        }

        // horizontal movement
        if (!this.isGrappling && this.finishedGrappling &&  cursors.right.isDown) 
        {
            this.setVelocityX(this.MAX_VELOCITY);       // move right
            //Play walking sound effect
            if(!this.isWalking && this.isGrounded){
                this.isWalking = true;
                if(this.walked == false){
                    this.scene.walk.play();
                }
                else{
                    this.scene.walk.resume();
                }
            }
        }
        else if(!this.isGrappling && this.finishedGrappling && cursors.left.isDown)
        {
            this.setVelocityX(-this.MAX_VELOCITY);      // move left
            //Play walking sound effect
            if(!this.isWalking && this.isGrounded){
                this.isWalking = true;
                if(this.walked == false){
                    this.scene.walk.play();
                }
                else{
                    this.scene.walk.resume();
                }
            }
        }
        else if (!this.isGrappling && this.finishedGrappling)
        {
            this.setVelocityX(0);                                         // dont move
        }
        //Stop walking sound effect when not moving
        if(this.isWalking && cursors.left.isUp && cursors.right.isUp && !cursors.left.isDown && !cursors.right.isDown){
            this.scene.walk.pause();
            this.isWalking = false;
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
            this.setVelocityY(this.JUMP_VELOCITY);    // jumping
            this.jumping = true;                                        // currently jumping set to true
            this.isGrounded = false;                                    // set grounded boolean to false
            this.setFrictionAir(0);       
            //Stop playing walking sound when in the air
            this.scene.walk.pause();
            this.isWalking = false;                              // reset air friction
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
            
            // update branches when grappling
            for (var i = 0; i < branchChildren.length; i++)
            {
                branchChildren[i].update(deltaMultiplier);

                // disable tint
                branchChildren[i].setAlpha(1);
                branchChildren[i].tempTintedImage.setAlpha(0);
            }
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

        // highlight the branch if within range
        if (!this.isGrappling)
        {
            // check each individual branch
            for (var i = 0; i < branchChildren.length; i++)
            {
                if (this.x < branchChildren[i].x + branchChildren[i].xBound && this.x > branchChildren[i].x - branchChildren[i].xBound)
                {
                    if (this.y >= branchChildren[i].y && this.y <= branchChildren[i].y + branchChildren[i].yBound)
                    {
                        branchChildren[i].setAlpha(0);
                        branchChildren[i].tempTintedImage.setAlpha(1);
                    }
                    else
                    {
                        branchChildren[i].setAlpha(1);
                        branchChildren[i].tempTintedImage.setAlpha(0);
                    }
                }
                else
                {
                    branchChildren[i].setAlpha(1);
                    branchChildren[i].tempTintedImage.setAlpha(0);
                }
            }
        }
    }

    // check if can grapple
    checkGrapple(branchChildren)
    {
        if (!this.isGrappling && Phaser.Input.Keyboard.JustDown(keyQ))
        {
            // check each individual branch
            for (var i = 0; i < branchChildren.length; i++)
            {
                if (this.x < branchChildren[i].x + branchChildren[i].xBound && this.x > branchChildren[i].x - branchChildren[i].xBound)
                {
                    if (this.y >= branchChildren[i].y && this.y <= branchChildren[i].y + branchChildren[i].yBound)
                    {
                        this.setVelocityX(0);       // stop x momentum 
                        this.setVelocityY(2.5);     // slow y momentum if necessary
                        branchChildren[i].hookCharacter(this, branchChildren[i]); // hook to branch
                        this.currentHook = branchChildren[i];        // remember current branch
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
        if(player.isGrappling && cursors.right.isDown && player.canSwing)
        {
            this.scene.matter.applyForceFromAngle(player, 0.00035, 0);    // force right
        }
        else if(player.isGrappling && cursors.left.isDown && player.canSwing)
        {
            this.scene.matter.applyForceFromAngle(player, 0.00035, -180); // force left
        }

        if (player.y <= branch.y + branch.yBound + player.height)
        {
            // after letting go of grapple
            if (!player.isGrappling && !player.isGrounded && !player.finishedGrappling && player.direction == 'right' && player.canSwing == true)
            {
                this.scene.matter.applyForceFromAngle(player, 0.0005, 0);     // force right
            }
            else if (!player.isGrappling && !player.isGrounded && !player.finishedGrappling && player.direction == 'left' && player.canSwing == true)
            {
                this.scene.matter.applyForceFromAngle(player, 0.0005, 180);   // force left
            }
        }
    }

    // apply force if grapple is released above canSwing bounds
    applyForceVertical(player, branch, deltaMultiplier)
    {
        if (player.y <= branch.y + branch.yBound + player.height)
        {
            if (!player.isGrappling && !player.isGrounded && !player.finishedGrappling && player.direction == 'right' && player.canSwing == false)
            {
                player.x += player.MAX_VELOCITY*deltaMultiplier;  // add a little bit of forward momentum
                player.y += -3*deltaMultiplier;  // add a little bit of vertical momentum
                this.scene.matter.applyForceFromAngle(player, 0.00035, -90);  // force up
            }
            else if (!player.isGrappling && !player.isGrounded && !player.finishedGrappling && player.direction == 'left' && player.canSwing == false)
            {
                player.x += -player.MAX_VELOCITY*0.5*deltaMultiplier; // add a little bit of backward momentum
                player.y += -3*deltaMultiplier;  // add a little bit of verticle momentum
                this.scene.matter.applyForceFromAngle(player, 0.00035, -90);  // force up
            }
        }
    }
}