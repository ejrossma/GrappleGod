class firstScene extends Phaser.Scene {
    constructor(config) {
        super({
            key: 'firstScene',
            physics: {
                default: 'matter',
                  matter: {
                      debug: true,
                      gravity: {
                        y: 0.5
                      }
                  },
                  arcade: {
                    debug: true,
                    gravity: { y: 1000 }
                }
            },
        });
    }

    preload() {
        this.load.image('arrow', './assets/arrowTile.png');
        this.load.image('blank', './assets/blankTile.png');

        this.load.image('player', './assets/playerArt.png');
        this.load.image('treePlatform', './assets/treePlatform.png');
        this.load.image('treePlatformTwo', './assets/treePlatformTwo.png');
        this.load.image('smallBranch', './assets/smallBranch.png');
        this.load.image('bigBranch', './assets/bigBranch.png');
        this.load.image('background', './assets/starterBackground.png');
    }

    create() {
        this.background = this.add.tileSprite(0, 0, 175, 100, 'background').setOrigin(0, 0).setScale(4, 4);
        this.branches = this.add.group();
        this.branch1 = new Branch(this, 800, 200, 'bigBranch', 90, 90);     // spawn branch
        this.branches.add(this.branch1);
        this.branch2 = new Branch(this, 800, 150, 'bigBranch', 90, 80);     // spawn branch
        this.branches.add(this.branch2);
        // variables and settings
        this.MAX_VELOCITY = 5;
        this.JUMP_VELOCITY = -8;
        this.MIN_CONSTRAINT_LENGTH = 70;
        cursors = this.input.keyboard.createCursorKeys();

        this.platforms = this.add.group();
        // ground level platforms (add platforms to the group)
        for (let i = 0; i < game.config.width * 3; i+= 32)
        {
            let platformGround = this.matter.add.image(i, game.config.height - 16, 'treePlatform', null, { isStatic: true }).setOrigin(0.5);
            platformGround.body.immovable = true;
            platformGround.body.allowGravity = false;
            this.platforms.add(platformGround);
        }

        this.addPlatform(10, game.config.height - 48, 'r', 8);
        this.addPlatform(10, game.config.height - 80, 'r', 8);
        this.addPlatform(10, game.config.height - 112, 'r', 5);
        this.addPlatform(10, game.config.height - 144, 'r', 5);
        
        this.addPlatform(240, 160, 'r', 15);

        // children of groups
        this.branchChildren = this.branches.getChildren();
        this.platformChildren = this.platforms.getChildren();

        // create player
        this.player = new Player(this, game.config.width*0.85, game.config.height - 48, this.MAX_VELOCITY, this.JUMP_VELOCITY, 'player');   // player using matter physics

        // matter physics world bounds
        this.matter.world.setBounds(0, 0, 700, game.config.height);       // world bounds

        //Set keys 
        keyLEFT = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.LEFT);
        keyRIGHT = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.RIGHT);
        keyQ = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.Q);

        //camera setup
        this.cameras.main.setBounds(0, 0, 700, 400);
        this.cameras.main.startFollow(this.player);

        // collision for jumping
        for (var i = 0; i < this.platformChildren.length; i++)
        {
            this.player.setOnCollideWith(this.platformChildren[i], pair => {
                this.player.setTouchingDown();
            });
        }
        //player goes to next stage
        let next = this.matter.add.image(668, 112, 'player').setOrigin(0.5, 0.5);
        this.player.setOnCollideWith(next, pair => {
            this.scene.start("secondScene");
        });
        // temp change scenes screen
        this.changeScene();
    }

    update(time, delta) {
        let deltaMultiplier = (delta/16.66667);
        // update the player/branches
        this.player.update(deltaMultiplier);       // main player update function
    }

    addPlatform(x, y, direction, length) {
        //select direction
        let dir = 1;
        if (direction == 'l')
            dir *= -1;
        //loop through to place
        for (var i = 0; i < length; i++) {
            var temp = Math.random();
            if (temp < 0.4) {
                let platformGround = this.matter.add.image(x + dir * (32 * i), y, 'treePlatformTwo', null, { isStatic: true }).setOrigin(0.5);
                this.platforms.add(platformGround);
            }
            else{
                let platformGround = this.matter.add.image(x + dir * (32 * i), y, 'treePlatform', null, { isStatic: true }).setOrigin(0.5);
                this.platforms.add(platformGround);
            }
        }
    }

    changeScene()
    {
        this.input.keyboard.on('keydown', (event) => {
            switch(event.key) {
                case '1':
                    this.scene.start('firstScene');
                    break;
                case '2':
                    this.scene.start('secondScene');
                    break;
                case 't':
                    this.scene.start('testScene')
                    break;
                default:
                    break;
            }
        });
    }
}
