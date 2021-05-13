class Branch extends Phaser.Physics.Matter.Image {
    constructor(scene, x, y, texture, xBound, yBound){
        super(scene.matter.world, x, y, texture, xBound, yBound);
        scene.add.existing(this);

        this.body.isStatic = true;
        this.setCollisionCategory(0);

        // area of detection
        this.xBound = xBound;
        this.yBound = yBound;
    }

    update()
    {

    }
}