class Test extends Phaser.Scene {
    constructor() {
        super("testScene");
    }

    preload() {
        this.load.image('arrow', './assets/arrowTile.png');
        this.load.image('blank', './assets/blankTile.png');
    }

    create() {
        // variables and settings
        this.MAX_VELOCITY = 200;
        this.JUMP_VELOCITY = -500;
        this.physics.world.gravity.y = 1000;
        cursors = this.input.keyboard.createCursorKeys();

        this.rect = this.add.rectangle(0, 0, game.config.height, game.config.width, 0x6e6e6e).setOrigin(0);
        this.platforms = this.add.group();
        // ground level platforms (add platforms to the group)
        for (let i = 0; i < game.config.width; i+= 32)
        {
            let platformGround = this.physics.add.sprite(i, game.config.height - 32, 'blank').setScale(1).setOrigin(0);
            platformGround.body.immovable = true;
            platformGround.body.allowGravity = false;
            this.platforms.add(platformGround);
        }

        this.addPlatform(64, 256, 'r', 3);

        this.addPlatform(200, 100, 'r', 5);

        // create player
        this.player = new Player(this, game.config.width/2, game.config.height/2, this.MAX_VELOCITY, this.JUMP_VELOCITY, 'arrow');

        // add physics collider
        this.physics.add.collider(this.player, this.platforms);
        this.player.setCollideWorldBounds(true);
    }

    update() {
        // update the player
        this.player.update();
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
            if (temp < 0.20) {
                let platformGround = this.physics.add.sprite(x + dir * (32 * i), y, 'arrow').setOrigin(0);
                platformGround.body.immovable = true;
                platformGround.body.allowGravity = false;
                this.platforms.add(platformGround);
                //this.platforms.create(x + dir * (32 * i), y, 'arrow').setOrigin(0);
            }
            else{
                let platformGround = this.physics.add.sprite(x + dir * (32 * i), y, 'blank').setOrigin(0);
                platformGround.body.immovable = true;
                platformGround.body.allowGravity = false;
                this.platforms.add(platformGround);
                //this.platforms.create(x + dir * (32 * i), y, 'blank').setOrigin(0);
            }
        }
    }
}