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
                  }
            },
        });
    }

    create() {
        //this.world.update30Hz();
        this.background = this.add.tileSprite(0, 0, 175, 100, 'background').setOrigin(0, 0).setScale(4, 4);

        // new Branch(scene, x, y, texture, xBound, yBound, MIN_CONSTRAINT_LENGTH, static_constraint_length, static_length)
        this.branches = this.add.group();
        // variables and settings
        this.MAX_VELOCITY = 5;      // x-velocity
        this.JUMP_VELOCITY = -8;    // y-velocity
        cursors = this.input.keyboard.createCursorKeys();   // cursor keys

        this.platforms = this.add.group();  // platform group
        // ground level platforms (add platforms to the group)
        for (let i = 0; i < game.config.width * 3; i+= 32)
        {
            let platformGround = this.matter.add.sprite(i, game.config.height - 16, 'treePlatform', null, { isStatic: true }).setOrigin(0.5);
            platformGround.body.immovable = true;
            platformGround.body.allowGravity = false;
            this.platforms.add(platformGround);
        }

        this.addPlatform(10, game.config.height - 48, 'r', 8);
        this.addPlatform(10, game.config.height - 80, 'r', 8);
        this.addPlatform(10, game.config.height - 112, 'r', 5);
        this.addPlatform(10, game.config.height - 144, 'r', 5);
        
        this.addPlatform(240, 160, 'r', 15);

        // children of groups (used for detection)
        this.branchChildren = this.branches.getChildren();
        this.platformChildren = this.platforms.getChildren();

        // create player (must set below the creation of platform/branch children)
        this.player = new Player(this, game.config.width*0.85, game.config.height - 48, this.MAX_VELOCITY, this.JUMP_VELOCITY, 'player');   // player using matter physics

        // matter physics world bounds
        this.matter.world.setBounds(0, 0, 700, game.config.height);       // world bounds

        //Set grapple
        keyQ = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.Q);

        //camera setup
        this.cameras.main.setBounds(0, 0, 700, 400);
        this.cameras.main.startFollow(this.player);

        //player goes to next stage
        let next = this.matter.add.sprite(668, 112, 'player').setOrigin(0.5, 0.5);
        this.player.setOnCollideWith(next, pair => {
            this.walk.stop();
            this.scene.start("secondScene");
        });

        //sound for walking
        this.walk = this.sound.add('walking', {
            loop:true,
            volume:0.5
        });
        //sound for hooking
        this.hook = this.sound.add('hooking', {volume: 0.5});

        // temp change scenes screen
        this.changeScene();

        document.getElementById('description').innerHTML = '<br>1: First Scene<br>2: Second Scene<br>T: Test Scene<br>Left Arrow + Right Arrow: Move<br>Space: Jump<br>Q: Connect to Grapple & Release Grapple';
    }

    update(time, delta) {
        let deltaMultiplier = (delta/16.66667);
        // update the player/branches
        this.player.update(this.branchChildren, deltaMultiplier);
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
                let platformGround = this.matter.add.sprite(x + dir * (32 * i), y, 'treePlatformTwo', null, { isStatic: true }).setOrigin(0.5);
                this.platforms.add(platformGround);
            }
            else{
                let platformGround = this.matter.add.sprite(x + dir * (32 * i), y, 'treePlatform', null, { isStatic: true }).setOrigin(0.5);
                this.platforms.add(platformGround);
            }
        }
    }

    changeScene()
    {
        this.input.keyboard.on('keydown', (event) => {
            this.walk.stop();
            switch(event.key) {
                case '1':
                    this.scene.start('firstScene');
                    break;
                case '2':
                    this.scene.start('secondScene');
                    break;
                case 't':
                    this.scene.start('testScene');
                    break;
                case 's':
                    this.scene.start('tilemapScene');
                default:
                    break;
            }
        });
    }
}
