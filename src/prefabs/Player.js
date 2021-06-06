class Player extends Phaser.Physics.Matter.Sprite {
    constructor(scene, x, y, velocity, jump_velocity, texture){
        super(scene.matter.world, x, y, texture);
        scene.add.existing(this);

        // horizontal movement variables
        this.MAX_VELOCITY = velocity;       // max x-velocity
        this.CURRENT_VELOCITY = 0;          // current x-velocity
        this.GRAPPLE_FORCE = 0.000125;      // grappling force

        // jump variables
        this.JUMP_VELOCITY = jump_velocity; // jump velocity
        this.jumps = 1;                     // current amt jumps
        this.MAX_JUMPS = 1;                 // max amt jumps
        this.jumping = false;               // jumping boolean
        this.isGrounded = false;             // grounded boolean
        this.JUMP_AIR_FRICTION = 0;
        this.FALL_AIR_FRICTION = 0.015;

        // other variables
        this.isGrappling = false;           // currently grappling boolean
        this.canSwing = true;               // detect when can swing boolean (false if too high)
        this.finishedGrappling = true;      // finished landing after grappling boolean
        this.isWalking = false;             // bool for walk sound 
        this.grappleAgain = true;           // bool for allowing to grapple again
        this.canKick = true;                // bool for checking if player is allowed to kick again
        this.applyForceCounter = 0;
        this.currentHook = null;
        this.shortImmunity = false;
        this.immunityLeft = 0;
        this.isKicking = false;

        // other things
        this.setFriction(0);                // remove sliding on walls
        this.setFixedRotation(0);           // prevent player sprite from unnecessarily spinning when moving
        this.setCollisionGroup(4);

        // for state machine logic
        this.grappleFailed = 2;             // bool for checking grapples

        // when colliding with the ground, check if can reset the jump
        this.setOnCollideActive(pair => {
            //console.log(pair.bodyA);
            //console.log(pair.bodyB);
            if (pair.bodyB.gameObject != null)
            {
                if (pair.bodyB.collisionFilter.group == 2)
                {
                    // boss collision
                    if (scene.beetle.shellCracked == false)
                    {
                        if (this.shortImmunity == false)
                        {
                            this.shortImmunity = true;
                            this.lowerHealth(this, scene);
                        }
                        else if (this.shortImmunity == true)
                        {
                            if (scene.beetle.direction == 1)
                            {
                                this.setVelocityX(-this.MAX_VELOCITY*2);
                                this.setVelocityY(this.JUMP_VELOCITY);
                            }
                            else if (scene.beetle.direction == 2)
                            {
                            
                                this.setVelocityX(this.MAX_VELOCITY*2);
                                this.setVelocityY(this.JUMP_VELOCITY);
                            }
                        }
                    }
                    else if (scene.beetle.shellCracked == true && !this.isKicking && scene.beetle.kickStunned == false)
                    {
                        if (this.shortImmunity == false)
                        {
                            this.shortImmunity = true;
                            this.lowerHealth(this, scene);
                        }
                        else if (this.shortImmunity == true)
                        {
                            if (scene.beetle.direction == 1)
                            {
                                this.setVelocityX(-this.MAX_VELOCITY*2);
                                this.setVelocityY(this.JUMP_VELOCITY);
                            }
                            else if (scene.beetle.direction == 2)
                            {
                                this.setVelocityX(this.MAX_VELOCITY*2);
                                this.setVelocityY(this.JUMP_VELOCITY);
                            }
                        }
                    }
                    else if (scene.beetle.shellCracked == true && this.isKicking)
                    {
                        scene.beetle.isStunned = true;
                        scene.beetle.kickStunned = true;
                        this.isGrounded = true;
                        if (scene.beetle.direction == 1)
                            {
                                this.setVelocityX(-this.MAX_VELOCITY*2);
                                this.setVelocityY(this.JUMP_VELOCITY);
                            }
                            else if (scene.beetle.direction == 2)
                            {
                                this.setVelocityX(this.MAX_VELOCITY*2);
                                this.setVelocityY(this.JUMP_VELOCITY);
                            }
                    }
                }
                else if (pair.bodyB.collisionFilter.group == 3)
                {
                    // rock collision
                    if (this.shortImmunity == false)
                    {
                        this.shortImmunity = true;
                        this.lowerHealth(this, scene);
                    }

                }
                else if (pair.bodyB.collisionFilter.group == 0)
                {
                    if (this.checkCollide(pair.bodyB))
                    {
                        this.isGrounded = true;
                        this.finishedGrappling = true;
                        if (this.stopPlayer)
                        {
                            this.scene.clock = this.scene.time.delayedCall(50, () => {
                                player.setVelocityX(0);
                            }, null, this);
                        }
                    }
                }
                
            }
        });
    }

    lowerHealth(player, scene)
    {
        if (scene.currentHeart == 2)
        {
            player.setVelocityY(player.JUMP_VELOCITY);
            player.hitDirection = Phaser.Math.Between(1, 2);
            if (scene.beetle.direction == 1)
            {
                player.setVelocityX(-player.MAX_VELOCITY*2);
            }
            else if (scene.beetle.direction == 2)
            {
                player.setVelocityX(player.MAX_VELOCITY*2);
            }
            scene.updateHealth(2);
            scene.currentHeart--;
            player.setAlpha(0.4);

            scene.clock = scene.time.delayedCall(1600, () => {
                player.shortImmunity = false;
                player.setAlpha(1);
            }, null, player);
        }
        else if (scene.currentHeart == 1)
        {
            player.setVelocityY(player.JUMP_VELOCITY);
            player.hitDirection = Phaser.Math.Between(1, 2);
            if (scene.beetle.direction == 1)
            {
                player.setVelocityX(-player.MAX_VELOCITY*2);
            }
            else if (scene.beetle.direction == 2)
            {
                player.setVelocityX(player.MAX_VELOCITY*2);
            }
            scene.updateHealth(1);
            scene.currentHeart--;
            player.setAlpha(0.4);

            scene.clock = scene.time.delayedCall(1600, () => {
                player.shortImmunity = false;
                player.setAlpha(1);
            }, null, player);
        }
        else if (scene.currentHeart == 0)
        {
            scene.updateHealth(0);
            scene.currentHeart--;
            scene.gameOver = true;
            scene.gameOverScreen();
        }
    }

    checkCollide(platform)
    {
        this.stopPlayer = false;
        //console.log(platform.faceTop);
        if (platform.gameObject.tile.faceTop && !platform.gameObject.tile.faceLeft && !platform.gameObject.tile.faceRight)
        {
            return true;
        }
        else if (platform.gameObject.tile.faceLeft && !platform.gameObject.tile.faceTop)
        {
            this.direction = 'left';
            this.delayedTime = true;
            this.applyForce(this);   // apply swinging force
            return false;
        }
        else if (platform.gameObject.tile.faceRight && !platform.gameObject.tile.faceTop)
        { 
            this.direction = 'right';
            this.delayedTime = true;
            this.applyForce(this);   // apply swinging force
            return false;
        }
        else if (platform.gameObject.tile.faceLeft && platform.gameObject.tile.faceTop)
        {
            if (this.y + this.height*.8 <= platform.position.y)
            {
                return true;
            }
            else
            {
                this.direction = 'left';
                this.delayedTime = true;
                this.applyForce(this);   // apply swinging force
                return false;
            }
        }
        else if (platform.gameObject.tile.faceRight && platform.gameObject.tile.faceTop)
        {
            if (this.y + this.height*.8 <= platform.position.y)
            {
                return true;
            }
            else
            {
                this.direction = 'right';
                this.delayedTime = true;
                this.applyForce(this);   // apply swinging force
                return false;
            }
        }
        else if (platform.gameObject.tile.faceLeft && platform.gameObject.tile.faceTop && platform.gameObject.tile.faceDown)
        {
            this.direction = 'left';
            this.delayedTime = true;
            this.applyForce(this);   // apply swinging force
            return false;
        }
        else if (platform.gameObject.tile.faceRight && platform.gameObject.tile.faceTop && platform.gameObject.tile.faceDown)
        {
            this.direction = 'right';
            this.delayedTime = true;
            this.applyForce(this);   // apply swinging force
            return false;
        }
        else
        {
            return false;
        }
    }

    applyForce(player)
    {
        // while grappled
        if(player.direction == 'left')
        {
            player.setVelocityX(-0.75);
            player.stopPlayer = true;
        }
        else if(player.direction == 'right')
        {
            player.setVelocityX(0.75);
            player.stopPlayer = true;
        }
    }

    pause()
    {
        this.setVelocityX(0);
        this.setVelocityY(0);
        this.setIgnoreGravity(true);
        this.scene.walk.pause();
        this.scene.anims.pauseAll();
    }

    resume()
    {
        this.setIgnoreGravity(false);
    }
}

// state classes
class IdleState extends State
{
    enter (scene, player)
    {
        player.setVelocityX(0);
        scene.walk.pause();
        scene.player.anims.play('player_idle');
        player.isWalking = false;
    }

    execute(scene, player)
    {
        const { left, right, space, down }  = scene.keys;
        const keyQ = scene.keys.keyQ;

        //--------------------------------------------------------------------
        
        if (left.isDown || right.isDown || space.isDown)
        {
            this.stateMachine.transition('move');
            return;
        }

        if (keyQ.isDown && player.grappleAgain)
        {
            this.stateMachine.transition('checkGrapple');
            return;
        }

        if (down.isDown && !player.isGrounded && player.canKick)
        {
            this.stateMachine.transition('kick');
            return;
        }

        //--------------------------------------------------------------------

        if (!player.isGrappling)
        {
            player.grappleFailed = 2;
        }

        if (keyQ.isUp)
        {
            player.grappleAgain = true;
        }

        if (down.isUp)
        {
            player.canKick = true;
        }

        if (scene.isGrounded && scene.finishedGrappling)
        {
            player.isGrounded = true;
            player.finishedGrappling = true;
        }
    }
}

class MoveState extends State
{
    execute(scene, player)
    {
        const { left, right, space, down }  = scene.keys;
        const keyQ = scene.keys.keyQ;

        //--------------------------------------------------------------------

        if (!left.isDown && !right.isDown && !space.isDown && player.isGrounded)
        {
            this.stateMachine.transition('idle');
            return;
        }

        if (keyQ.isDown && player.grappleAgain)
        {
            this.stateMachine.transition('checkGrapple');
            return;
        }

        if (down.isDown && !player.isGrounded && player.canKick)
        {
            this.stateMachine.transition('kick');
            return;
        }

        //--------------------------------------------------------------------

        // horizontal movement
        if (left.isDown)
        {
            player.setVelocityX(-player.MAX_VELOCITY);       // move right
            if (player.isWalking == false)
            {
                scene.walk.play();
                scene.player.anims.play('player_run');
                player.isWalking = true;
            }
            player.flipX = true;
        }
        else if (right.isDown)
        {
            player.setVelocityX(player.MAX_VELOCITY);      // move left
            if (player.isWalking == false)
            {
                scene.walk.play();
                scene.player.anims.play('player_run');
                player.isWalking = true;
            }
            player.flipX = false;
        }
        else
        {
            player.setVelocityX(0);
        }

        // vertical movement
        // check if grounded, if true, make sure the player can jump
        if (player.isGrounded)
        {
            player.jumps = player.MAX_JUMPS;
            player.jumping = false;
        }
        else
        {
            //Stop playing walking sound when in the air
            scene.walk.pause();
            player.isWalking = false;                              // reset air friction
        }

        // if can jump, then jump based on how long space bar is pressed
        if (!player.isGrappling && player.jumps > 0 && player.finishedGrappling &&  Phaser.Input.Keyboard.DownDuration(scene.keys.space, 150))
        {
            player.setVelocityY(player.JUMP_VELOCITY);    // jumping
            player.jumping = true;                                        // currently jumping set to true
            player.isGrounded = false;                                    // set grounded boolean to false
            scene.isGrounded = false;
            player.setFrictionAir(player.JUMP_AIR_FRICTION);
            scene.player.anims.play('player_fall');       
        }

        // remove a jump upon releasing the space bar
        if (!player.isGrappling && player.jumping && player.finishedGrappling && Phaser.Input.Keyboard.UpDuration(scene.keys.space)) 
        {
            player.jumps--;                                               // subtract a jump from current jumps
            player.jumping = false;                                       // set boolean to false to prevent another jump
        }

        if (!player.isGrappling)
        {
            player.grappleFailed = 2;
        }

        if (keyQ.isUp)
        {
            player.grappleAgain = true;
        }

        if (down.isUp)
        {
            player.canKick = true;
        }

        if (scene.isGrounded && scene.finishedGrappling)
        {
            player.isGrounded = true;
            player.finishedGrappling = true;
        }
    }
}

class CheckGrappleState extends State
{
    execute(scene, player)
    {
        const { left, right, space, down }  = scene.keys;
        const keyQ = scene.keys.keyQ;

        //--------------------------------------------------------------------

        if (player.grappleFailed == 0 && player.finishedGrappling)
        {
            this.stateMachine.transition('idle');
            return;
        }

        if (player.grappleFailed == 1 && player.finishedGrappling)
        {
            this.stateMachine.transition('grappled');
            return;
        }

        if (player.grappleFailed == 0 && !player.finishedGrappling)
        {
            this.stateMachine.transition('falling');
            return;
        }
        
        if (player.grappleFailed == 1 && !player.finishedGrappling)
        {
            this.stateMachine.transition('grappled');
            return;
        }

        //--------------------------------------------------------------------

        // grappling
        if (Phaser.Input.Keyboard.JustDown(keyQ))
        {
            // check each individual branch
            for (var i = 0; i < scene.branchChildren.length; i++)
            {
                // check branches
                if (player.x < scene.branchChildren[i].x + scene.branchChildren[i].xBound && player.x > scene.branchChildren[i].x - scene.branchChildren[i].xBound)
                {
                    if (player.y >= scene.branchChildren[i].y && player.y <= scene.branchChildren[i].y + scene.branchChildren[i].yBound)
                    {
                        scene.player.anims.play('player_grapple');
                        scene.hook.play(); //play hooking sound effect
                        player.applyForceCounter = 0;
                        player.setVelocityX(0);       // stop x momentum 
                        player.setVelocityY(0.5);     // slow y momentum if necessary
                        scene.branchChildren[i].hookCharacter(player, scene.branchChildren[i]); // hook to branch
                        player.currentHook = scene.branchChildren[i];        // remember current branch
                        player.setFrictionAir(0);     // reset air friction
                        player.finishedGrappling = false;    // set finished grappling to false
                        scene.finishedGrappling = false;
                        player.isGrappling = true;           // set currently grappling boolean to true
                        player.grappleFailed = 1;
                        player.grappleAgain = false;
                    }
                }
            }
            if (!player.isGrappling)
            {
                player.grappleAgain = false;
                player.grappleFailed = 0;
            }
        }
    }
}

class GrappledState extends State
{
    execute(scene, player)
    {
        const { left, right, space, down }  = scene.keys;
        const keyQ = scene.keys.keyQ;

        //--------------------------------------------------------------------

        if (!player.isGrappling)
        {
            this.stateMachine.transition('falling');
            return;
        }

        //--------------------------------------------------------------------

        //if currently grappling, Q to release
        if (Phaser.Input.Keyboard.JustDown(keyQ))
        {
            player.currentHook.unHookCharacter();   // unhook the character
            player.isGrappling = false;             // set currently grappling bool to false
        }

        // actual grappling update
        if (player.y >= player.currentHook.y + player.height)
        {
            player.canSwing = true;       // if you can swing higher based on bounds allowed to swing
            player.currentHook.applyForce(player, player.currentHook);   // apply swinging force
        }
        else
        {
            player.canSwing = false;      // if you cannot swing higher based on bounds allowed to swing
            player.currentHook.applyForce(player, player.currentHook);   // apply swinging force
        }
        if (player.x > player.currentHook.x)
        {
            player.direction = 'right';       // detect which way the moment is carrying
        }
        else if (player.x < player.currentHook.x)
        {
            player.direction = 'left';        // detect which way the moment is carrying
        }

        // updated current hook
        player.currentHook.update();
    }
}

class FallingState extends State
{
    execute(scene, player)
    {
        const { left, right, space, down }  = scene.keys;
        const keyQ = scene.keys.keyQ;
        scene.player.anims.play('player_fall');

        //--------------------------------------------------------------------

        if (player.isGrounded && player.finishedGrappling)
        {
            this.stateMachine.transition('idle');
            return;
        }

        if (keyQ.isDown && player.grappleAgain)
        {
            this.stateMachine.transition('checkGrapple');
            return;
        }

        if (down.isDown && !player.isGrounded && player.canKick)
        {
            this.stateMachine.transition('kick');
            return;
        }

        //--------------------------------------------------------------------
        
        if (keyQ.isUp)
        {
            player.grappleFailed = 2;
            player.grappleAgain = true;
        }

        // after letting go of grapple, continue momentum until hitting ground
        if (player.canSwing && player.applyForceCounter < 5)
        {
            player.currentHook.applyFallingForce(player, player.currentHook);
            player.setFrictionAir(player.FALL_AIR_FRICTION);
            player.applyForceCounter++;
            if (player.direction == 'right')
            {
                player.flipX = false;
            }
            else if (player.direction == 'left')
            {
                player.flipX = true;
            }
        }
        if (!player.canSwing && player.applyForceCounter < 5)
        {
            player.currentHook.applyForceVertical(player, player.currentHook);
            player.setFrictionAir(player.FALL_AIR_FRICTION);
            player.applyForceCounter++;
            if (player.direction == 'right')
            {
                player.flipX = false;
            }
            else if (player.direction == 'left')
            {
                player.flipX = true;
            }
        }
    }
}

class KickState extends State
{
    execute(scene, player)
    {
        const { left, right, space, down }  = scene.keys;
        const keyQ = scene.keys.keyQ;
        player.isKicking = true;

        //--------------------------------------------------------------------

        if (player.isGrounded)
        {
            player.isKicking = false;
            this.stateMachine.transition('idle');
            return;
        }

        //--------------------------------------------------------------------

        player.canKick = false;
        scene.player.anims.play('player_kick');
        player.setVelocityX(0);
        player.setVelocityY(-player.JUMP_VELOCITY);
    }
}