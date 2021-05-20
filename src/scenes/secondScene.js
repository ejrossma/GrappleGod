class secondScene extends Phaser.Scene {
    constructor(config) {
        super({
            key: 'secondScene',
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
        // variables and settings
        this.MAX_VELOCITY = 2;      // player horizontal speed
        this.JUMP_VELOCITY = -4;    // player vertical speed
        this.jumping = false;


        this.background = this.add.tileSprite(0, 0, 300, 100, 'background2').setOrigin(0, 0).setScale(4, 4);
        this.platforms = this.add.group();  // platform group
        //add ground reset
        this.addPlatform(0, 160, 'r', 6);
        this.addPlatform(500, 160, 'r', 6);
        this.addPlatform(1200, 160, 'l', 8);

        // matter physics world bounds
        this.matter.world.setBounds(0, -50, 1200, game.config.height + 50);       // world bounds

        // add hook
        // new Branch(scene, x, y, texture, xBound, yBound, MIN_CONSTRAINT_LENGTH, static_constraint_length, static_length)
        this.branches = this.add.group();
        this.branch1 = new Branch(this, 300, 50, 'bigBranch', 90, 90, 80, false);     // spawn branch
        this.branches.add(this.branch1);
        this.branch2 = new Branch(this, 850, 50, 'bigBranch', 90, 90, 80, false);     // spawn branch
        this.branches.add(this.branch2);

        // children of groups (used for detection)
        this.branchChildren = this.branches.getChildren();
        this.platformChildren = this.platforms.getChildren();

        // create player (must set below the creation of platform/branch children)
        this.player = new Player(this, 66, 128, this.MAX_VELOCITY, this.JUMP_VELOCITY, 'player');   // player using matter physics

        //Set grapple
        keyQ = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.Q);

        //camera setup
        this.cameras.main.setBounds(0, 0, 1200, 400);
        this.cameras.main.startFollow(this.player);

        //player goes to next stage
        let next = this.matter.add.sprite(1168, 112, 'player').setOrigin(0.5, 0.5);
        this.player.setOnCollideWith(next, pair => {
            this.walk.stop();
            this.scene.start("secondScene");
        });
        //resets when hits floor
        let reset = this.matter.add.sprite(1168, game.config.height - 16, 'player').setOrigin(0.5, 0.5);
        this.player.setOnCollideWith(reset, pair => {
            this.walk.stop();
            this.scene.start("secondScene");
        });

        //sound for walking
        this.walk = this.sound.add('walking', {
            loop:true,
            volume: 0.5
        });
        //sound for hooking
        this.hook = this.sound.add('hooking', {volume: 0.5});
        
        // temp change scenes screen
        this.changeScene();
        // state machine
        this.playerFSM = new StateMachine('idle', {
            idle: new IdleState(),
            move: new MoveState(),
            checkGrapple: new CheckGrappleState(),
            grappled: new GrappledState(),
            falling: new FallingState(),
            kick: new KickState(),
        }, [this, this.player]);

        this.keys = this.input.keyboard.createCursorKeys();
        this.keys.keyQ = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.Q);
    }

    update(time, delta) {
        this.playerFSM.step();
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

    adjustFPS()
    {
        console.log(game.loop.actualFps);
    }
}