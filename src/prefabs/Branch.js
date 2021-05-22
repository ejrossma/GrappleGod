class Branch extends Phaser.Physics.Matter.Image {
    constructor(scene, x, y, texture, xBound, yBound, MIN_CONSTRAINT_LENGTH, static_constraint_length, static_length){
        super(scene.matter.world, x, y, texture, xBound, yBound);
        scene.add.existing(this);

        this.body.isStatic = true;      // immovable
        this.setCollisionCategory(0);   // prevent collision
        this.static_constraint_length = static_constraint_length;   // bool that tells if there is a static constraint length
        this.MIN_CONSTRAINT_LENGTH = MIN_CONSTRAINT_LENGTH;

        // area of detection for bounds
        this.xBound = xBound;
        this.yBound = yBound;

        // visual bounds (comment out to remove)
        this.scene.add.rectangle(x - xBound, y, xBound*2, yBound, 0xff0000, 0.2).setOrigin(0);

        // check if there is a set constraint length
        if (this.static_constraint_length == true)
        {
            this.static_length = static_length; // set variable to set constraint length
        }

        // temporary tinted sprite
        this.tempTintedImage = this.scene.add.image(x, y, 'bigBranchHighlight');
        this.tempTintedImage.setAlpha(0);
    }

    update()
    {
        if (this.static_constraint_length && this.constraint_size == 'small')
        {
            this.constraintLength += 1;
            this.rope.length += 1;
        }
        else if (this.static_constraint_length && this.constraint_size == 'large')
        {
            this.constraintLength -= 1;
            this.rope.length -= 1;
        }

        if (this.static_constraint_length && this.static_length < this.constraintLength && this.constraint_size == 'small')
        {
            this.constraint_size = 'good';
        }
        else if (this.static_constraint_length && this.static_length > this.constraintLength && this.constraint_size == 'large')
        {
            this.constraint_size = 'good';
        }
    }

    // hook the player to the branch
    hookCharacter(player, branch) {
        // calculate how long the constraint should be
        if (player.x > branch.x)
        {
            branch.constraintLength = (((player.x - branch.x)^2)+((player.y-branch.y)^2))^0.5;
        }
        else if (player.x < branch.x)
        {
            branch.constraintLength = (((branch.x - player.x)^2)+((player.y-branch.y)^2))^0.5;
        }
        else
        {
            branch.constraintLength = player.y - branch.y;
        }

        if (branch.constraintLength < branch.MIN_CONSTRAINT_LENGTH)
        {
            branch.constraintLength = branch.MIN_CONSTRAINT_LENGTH;
        }
        else if (branch.constraintLength > branch.yBound)
        {
            branch.constraintLength = branch.yBound;
        }

        // if less than minumum set it to the minimum length
        if (branch.constraintLength < branch.static_length && branch.static_constraint_length)
        {
            branch.constraint_size = 'small';
        }
        else if (branch.constraintLength > branch.static_length && branch.static_constraint_length)
        {
            branch.constraint_size = 'large';
        }
        // create constraint
        this.rope = this.scene.matter.add.constraint(player, branch, branch.constraintLength, 0);
    }

    // unhook the player from branch
    unHookCharacter() {
        this.scene.matter.world.remove(this.rope);    // delete constraint
    }

    // apply the swining/falling force
    applyForce(player, branch)
    {
        // while grappled
        if(this.scene.keys.right.isDown && player.canSwing)
        {
            this.scene.matter.applyForceFromAngle(player, player.GRAPPLE_FORCE, 0);    // force right
        }
        else if(this.scene.keys.left.isDown && player.canSwing)
        {
            this.scene.matter.applyForceFromAngle(player, player.GRAPPLE_FORCE, -180); // force left
        }
    }

    applyFallingForce(player, branch)
    {
        if (player.y <= branch.y + branch.yBound + player.height)
        {
            // after letting go of grapple
            if (player.direction == 'right' && player.canSwing == true)
            {
                this.scene.matter.applyForceFromAngle(player, player.GRAPPLE_FORCE, 0);     // force right
            }
            else if (player.direction == 'left' && player.canSwing == true)
            {
                this.scene.matter.applyForceFromAngle(player, player.GRAPPLE_FORCE, 180);   // force left
            }
        }
    }

    // apply force if grapple is released above canSwing bounds
    applyForceVertical(player, branch)
    {
        if (!player.isGrappling && !player.isGrounded && !player.finishedGrappling && player.direction == 'right' && player.canSwing == false)
        {
            player.x += 0.5;  // add a little bit of forward momentum
            player.y += -0.5;  // add a little bit of vertical momentum
            this.scene.matter.applyForceFromAngle(player, player.GRAPPLE_FORCE, 0);  // force up
        }
        else if (!player.isGrappling && !player.isGrounded && !player.finishedGrappling && player.direction == 'left' && player.canSwing == false)
        {
            player.x += 0.5; // add a little bit of backward momentum
            player.y += -0.5;  // add a little bit of verticle momentum
            this.scene.matter.applyForceFromAngle(player, player.GRAPPLE_FORCE, 180);  // force up
        }
    }
}

class DetectState extends State
{
    enter (scene, player, branchChildren)
    {
        
    }

    execute(scene, player, branchChildren)
    {
        //--------------------------------------------------------------------

        if (player.isGrappling)
        {
            this.stateMachine.transition('highlight');
            return;
        }

        //--------------------------------------------------------------------

        for (var i = 0; i < branchChildren.length; i++)
        {
            if (player.x < branchChildren[i].x + branchChildren[i].xBound && player.x > branchChildren[i].x - branchChildren[i].xBound)
            {
                if (player.y >= branchChildren[i].y && player.y <= branchChildren[i].y + branchChildren[i].yBound)
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

class HighlightState extends State
{
    execute(scene, player, branchChildren)
    {
        //--------------------------------------------------------------------

        if (!player.isGrappling)
        {
            this.stateMachine.transition('detect');
            return;
        }

        //--------------------------------------------------------------------
        
        for (var i = 0; i < branchChildren.length; i++)
        {
            branchChildren[i].setAlpha(1);
            branchChildren[i].tempTintedImage.setAlpha(0);
        }
    }
}