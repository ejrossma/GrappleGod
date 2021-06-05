class WallPad extends Phaser.Physics.Matter.Image {
    constructor(scene, x, y, texture, resetTime, gate) {
        super(scene.matter.world, x, y, texture);
        console.log(x + ' ' + y);
        scene.add.existing(this);
        this.resetTime = resetTime;
        this.gate = gate;

        this.body.isStatic = true;    //immovable
        this.setCollisionCategory(0); //prevent collision (will do with matter.overlap) https://photonstorm.github.io/phaser3-docs/Phaser.Physics.Matter.MatterPhysics.html#overlap__anchor
        this.functional = true;

        //image to replace current one after player pushes wallPad
        this.pushedWallPad = this.scene.add.image(x, y, 'pressedWallPad');
        this.pushedWallPad.setAlpha(0);

    }

    update() {
        if (this.functional)
            this.scene.matter.overlap(this, this.scene.player, this.OpenGate, null, this);
    }
    //when player overlaps with the wallPad
        //replace image & make it so that the player cant activate it again
        //open corresponding Gate
            //set alpha to 0
            //change image from gateFive -> gateFiveOpen
                //after rock drops change image back
                //add another rock for next activation
        //after rock hits the ground
            //this.setAlpha(1);
            //this.functional = true;
            //this.pushedWallPad.setAlpha(0);
    OpenGate() {
        console.log(this);
        this.alpha = 0;
        this.functional = false;
        this.pushedWallPad.alpha = 1;
        this.gate.alpha = 0;
    }
}