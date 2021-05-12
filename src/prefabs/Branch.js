class Branch extends Phaser.Physics.Matter.Image {
    constructor(scene, x, y, texture){
        super(scene.matter.world, x, y, texture);
        scene.add.existing(this);

        this.body.isStatic = true;
    }

    update()
    {

    }
}