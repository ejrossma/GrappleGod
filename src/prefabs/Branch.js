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
        this.tempTintedImage = this.scene.add.image(x, y, 'bigbranchHighlight');
        this.tempTintedImage.setAlpha(0);
    }

    update(deltaMultiplier)
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

        if (this.constraintLength < this.MIN_CONSTRAINT_LENGTH)
        {
            this.constraintLength = this.MIN_CONSTRAINT_LENGTH;
        }

        // if less than minumum set it to the minimum length
        if (this.constraintLength < this.static_length)
        {
            this.constraint_size = 'small';
        }
        else if (this.constraintLength > this.static_length)
        {
            this.constraint_size = 'large';
        }
        this.scene.hook.play(); //play hooking sound effect
        // create constraint
        this.rope = this.scene.matter.add.constraint(player, branch, this.constraintLength, 0);
    }

    // unhook the player from branch
    unHookCharacter() {
        this.scene.matter.world.remove(this.rope);    // delete constraint
    }
}