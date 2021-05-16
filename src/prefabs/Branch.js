class Branch extends Phaser.Physics.Matter.Image {
    constructor(scene, x, y, texture, xBound, yBound){
        super(scene.matter.world, x, y, texture, xBound, yBound);
        scene.add.existing(this);

        this.body.isStatic = true;      // immovable
        this.setCollisionCategory(0);   // prevent collision

        // area of detection for bounds
        this.xBound = xBound;
        this.yBound = yBound;

        // visual bounds (comment out to remove)
        this.scene.add.rectangle(x - xBound, y, xBound*2, yBound, 0xff0000, 0.2).setOrigin(0);
    }

    update()
    {
        // no update needed currently
    }

    // hook the player to the branch
    hookCharacter(player, branch) {
        // calculate how long the constraint should be
        if (player.x > branch.x)
        {
            this.constraintLength = (((player.x - branch.x)^2)+((player.y-branch.y)^2))^0.5;
        }
        else if (player < branch.x)
        {
            this.constraintLength = (((branch.x - player.x)^2)+((branch.y-player.y)^2))^0.5;
        }
        else
        {
            this.constraintLength = player.y - branch.y;
        }

        // if less than minumum set it to the minimum length
        if (this.constraintLength < this.scene.MIN_CONSTRAINT_LENGTH)
        {
            this.constraintLength = this.scene.MIN_CONSTRAINT_LENGTH;     // minimum length of constraint
        }
        
        // create constraint
        this.rope = this.scene.matter.add.constraint(player, branch, this.constraintLength, 0);
    }

    // unhook the player from branch
    unHookCharacter() {
        this.scene.matter.world.remove(this.rope);    // delete constraint
    }
}