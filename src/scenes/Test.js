class Test extends Phaser.Scene {
    constructor() {
        super("testScene");
    }

    preload() {
        this.load.image('arrow', './assets/arrowTile.png');
        this.load.image('blank', './assets/blankTile.png');
    }

    create() {
        this.rect = this.add.rectangle(0, 0, game.config.height, game.config.width, 0x6e6e6e).setOrigin(0);
        this.platforms = this.add.group();

        this.addPlatform(64, 256, 'r', 3);

        this.addPlatform(200, 100, 'r', 5);

    }

    update() {

    }

    addPlatform(x, y, direction, length) {
        //select direction
        let dir = 1;
        if (direction == 'l')
            dir *= -1;
        //loop through to place
        for (var i = 0; i < length; i++) {
            var temp = Math.random();
            //make an arrow if > 0.20 else make blank
            if (temp < 0.20)
                this.platforms.create(x + dir * (32 * i), y, 'arrow').setOrigin(0);
            else
                this.platforms.create(x + dir * (32 * i), y, 'blank').setOrigin(0);
        }
    }
}