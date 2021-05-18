class Test extends Phaser.Scene {
    constructor(config) {
        super({
            key: 'testScene',
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

    create() {
        // variables and settings
        this.MAX_VELOCITY = 5;      // player horizontal speed
        this.JUMP_VELOCITY = -8;    // player vertical speed
        this.jumping = false;

        cursors = this.input.keyboard.createCursorKeys();

        this.rect = this.add.rectangle(0, 0, game.config.width * 3, game.config.height, 0x6e6e6e).setOrigin(0);
        this.platforms = this.add.group();
        // ground level platforms (add platforms to the group)
        for (let i = 0; i < game.config.width * 3; i+= 32)
        {
            let platformGround = this.matter.add.sprite(i, game.config.height - 16, 'treePlatform', null, { isStatic: true }).setOrigin(0.5);
            platformGround.body.immovable = true;
            platformGround.body.allowGravity = false;
            this.platforms.add(platformGround);
        }

        this.addPlatform(64, 256, 'r', 3);

        this.addPlatform(200, 100, 'r', 5);

        // matter physics world bounds
        this.matter.world.setBounds(0, 0, game.config.width * 3, game.config.height);       // world bounds

        // add hook
        // new Branch(scene, x, y, texture, xBound, yBound, MIN_CONSTRAINT_LENGTH, static_constraint_length, static_length)
        this.branches = this.add.group();
        this.branch1 = new Branch(this, 300, 200, 'bigbranch', 90, 90, 70, false);     // spawn branch
        this.branches.add(this.branch1);             
        this.branch2 = new Branch(this, 500, 150, 'bigbranch', 20, game.config.height - 182, 70, true, 50);     // spawn branch
        this.branches.add(this.branch2);

        // children of grounp
        this.branchChildren = this.branches.getChildren();
        this.platformChildren = this.platforms.getChildren();

        // create player (must set below the creation of platform/branch children)
        this.player = new Player(this, game.config.width/2, game.config.height/2, this.MAX_VELOCITY, this.JUMP_VELOCITY, 'player');   // player using matter physics

        //Set Grapple 
        keyQ = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.Q);

        //camera setup
        this.cameras.main.setBounds(0, 0, game.config.width * 3, game.config.height);
        this.cameras.main.startFollow(this.player);
        //sound for walking
        this.walk = this.sound.add('walking', {
            loop:true,
            volume: 0.5
        });
        //sound for hooking
        this.hook = this.sound.add('hooking', {volume: 0.5});
        // temp change scenes screen
        this.changeScene();
    }

    update(time, delta) {
        let deltaMultiplier = (delta/16.66667);
        // update the player/branches
        this.player.update(this.branchChildren, deltaMultiplier);       // main player update function
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