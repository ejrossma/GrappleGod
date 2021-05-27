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

        // other variables
        this.isGrappling = false;           // currently grappling boolean
        this.canSwing = true;               // detect when can swing boolean (false if too high)
        this.finishedGrappling = true;      // finished landing after grappling boolean
        this.isWalking = false;             // bool for walk sound 
        this.grappleAgain = true;           // bool for allowing to grapple again
        this.canKick = true;                // bool for checking if player is allowed to kick again

        // other things
        this.setFriction(0);                // remove sliding on walls
        this.setFixedRotation(0);           // prevent player sprite from unnecessarily spinning when moving

        // for state machine logic
        this.grappleFailed = 2;             // bool for checking grapples

        // when colliding with the ground, check if can reset the jump
        this.setOnCollideActive(pair => {
            // console.log(pair.bodyA);
            // console.log(pair.bodyB);
            if (this.checkCollide(pair.bodyB))
            {
                this.isGrounded = true;
                this.finishedGrappling = true;
            }
        })
    }

    checkCollide(platform)
    {
        if (this.y + this.height*.75 <= platform.position.y)
        {
            return true;
        }
        else
        {
            return false;
        }
    }
}

// state classes
class IdleState extends State
{
    enter (scene, player)
    {
        player.setVelocityX(0);
        scene.walk.pause();
        player.isWalking = false;
    }

    execute(scene, player)
    {
        const { left, right, space, up, down }  = scene.keys;

        //--------------------------------------------------------------------
        
        if (left.isDown || right.isDown || up.isDown)
        {
            this.stateMachine.transition('move');
            return;
        }

        if (space.isDown && player.grappleAgain)
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

        if (space.isUp)
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
        const { left, right, space, up, down }  = scene.keys;

        //--------------------------------------------------------------------

        if (!left.isDown && !right.isDown && !up.isDown && player.isGrounded)
        {
            this.stateMachine.transition('idle');
            return;
        }

        if (space.isDown && player.grappleAgain)
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
                player.isWalking = true;
                player.flipX = true;
            }
        }
        else if (right.isDown)
        {
            player.setVelocityX(player.MAX_VELOCITY);      // move left
            if (player.isWalking == false)
            {
                scene.walk.play();
                player.isWalking = true;
                player.flipX = false;
            }
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
        if (!player.isGrappling && player.jumps > 0 && player.finishedGrappling &&  Phaser.Input.Keyboard.DownDuration(scene.keys.up, 150))
        {
            player.setVelocityY(player.JUMP_VELOCITY);    // jumping
            player.jumping = true;                                        // currently jumping set to true
            player.isGrounded = false;                                    // set grounded boolean to false
            scene.isGrounded = false;
            player.setFrictionAir(0);       
        }

        // remove a jump upon releasing the space bar
        if (!player.isGrappling && player.jumping && player.finishedGrappling && Phaser.Input.Keyboard.UpDuration(scene.keys.up)) 
        {
            player.jumps--;                                               // subtract a jump from current jumps
            player.jumping = false;                                       // set boolean to false to prevent another jump
        }

        if (!player.isGrappling)
        {
            player.grappleFailed = 2;
        }

        if (space.isUp)
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
        const { left, right, space, up, down }  = scene.keys;

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
        if (Phaser.Input.Keyboard.JustDown(space))
        {

            // check each individual branch
            for (var i = 0; i < scene.branchChildren.length; i++)
            {
                // check branches
                if (player.x < scene.branchChildren[i].x + scene.branchChildren[i].xBound && player.x > scene.branchChildren[i].x - scene.branchChildren[i].xBound)
                {
                    if (player.y >= scene.branchChildren[i].y && player.y <= scene.branchChildren[i].y + scene.branchChildren[i].yBound)
                    {
                        scene.hook.play(); //play hooking sound effect
                        player.setVelocityX(0);       // stop x momentum 
                        player.setVelocityY(1);     // slow y momentum if necessary
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
        const { left, right, space, up, down }  = scene.keys;

        //--------------------------------------------------------------------

        if (!player.isGrappling)
        {
            this.stateMachine.transition('falling');
            return;
        }

        //--------------------------------------------------------------------

        //if currently grappling, Q to release
        if (Phaser.Input.Keyboard.JustDown(space))
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
        const { left, right, space, up, down }  = scene.keys;

        //--------------------------------------------------------------------

        if (player.isGrounded && player.finishedGrappling)
        {
            this.stateMachine.transition('idle');
            return;
        }

        if (space.isDown && player.grappleAgain)
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
        
        if (space.isUp)
        {
            player.grappleFailed = 2;
            player.grappleAgain = true;
        }

        // after letting go of grapple, continue momentum until hitting ground
        if (player.canSwing)
        {
            player.currentHook.applyFallingForce(player, player.currentHook);
            player.setFrictionAir(0.015);
        }
        if (!player.canSwing)
        {
            player.currentHook.applyForceVertical(player, player.currentHook);
            player.setFrictionAir(0.015);
        }
    }
}

class KickState extends State
{
    execute(scene, player)
    {
        const { left, right, space, up, down }  = scene.keys;

        //--------------------------------------------------------------------

        if (player.isGrounded)
        {
            this.stateMachine.transition('idle');
            return;
        }

        //--------------------------------------------------------------------

        player.canKick = false;
        player.setVelocityX(0);
        player.setVelocityY(-player.JUMP_VELOCITY);
    }
}