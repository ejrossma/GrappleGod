class Tilemap extends Phaser.Scene {
    constructor(config) {
        super('tilemapScene');
    }


    create() {
        this.MAX_VELOCITY = 2;      // x-velocity
        this.JUMP_VELOCITY = -4;    // y-velocity

        this.jumping = false;
        this.isGrounded = false;
        this.finishedGrappling = false;
        this.branches = this.add.group();
        this.branch1 = new Branch(this, 0, 150, 'bigBranch', 90, 90, 70, false);
        this.branches.add(this.branch1);
        this.branchChildren = this.branches.getChildren();  // branches as an array for checking
        this.frameTime = 0;         // initialized variable

        //add tilemap data & attach image to it
        const map = this.add.tilemap('starterarea_twoJSON');
        const tileset = map.addTilesetImage('GrassyTileSet', 'tileset');

        // create player (must set below the creation of platform/branch children)
        this.player = new Player(this, 66, 128, this.MAX_VELOCITY, this.JUMP_VELOCITY, 'player_animations', 'player_idle0001');   // player using matter physics

        //animations
        this.anims.create({
            key: 'player_idle',
            frames: this.anims.generateFrameNames('player_animations', {
                prefix: 'player_idle',
                start: 1,
                end: 4,
                suffix: '',
                zeroPad: 4
            }),
            frameRate: 4,
            repeat: -1
        });
        this.player.anims.play('player_idle'); //start idle animation
        this.player.setDepth(1);    // bring player to front

        // terrain layer
        const terrainLayer = map.createLayer('Terrain', tileset, 0, 0);
        const decoration = map.createLayer('Decoration', tileset, 0, 0);
        terrainLayer.setCollisionByProperty({ collision: true });
        this.matter.world.convertTilemapLayer(terrainLayer);

        //set world bounds
        this.matter.world.setBounds(0, 0, map.widthInPixels, map.heightInPixels);

        //camera stuff
        this.cameras.main.startFollow(this.player);
        this.cameras.main.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
        this.cameras.main.setZoom(2);

        //sound for walking
        this.walk = this.sound.add('walking', {
            loop:true,
            volume: 0.5
        });

        //sound for hooking
        this.hook = this.sound.add('hooking', {volume: 0.5});

        // change current scene
        this.changeScene();

        // player state machine
        this.playerFSM = new StateMachine('idle', {
            idle: new IdleState(),
            move: new MoveState(),
            checkGrapple: new CheckGrappleState(),
            grappled: new GrappledState(),
            falling: new FallingState(),
            kick: new KickState(),
        }, [this, this.player]);

        // branch state machine
        this.branchFSM = new StateMachine('detect', {
            detect: new DetectState(),
            highlight: new HighlightState(),
        }, [this, this.player, this.branchChildren]);

        // create cursor and q keys for use
        this.keys = this.input.keyboard.createCursorKeys();
        this.keys.keyQ = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.Q);
    }

    update(time, delta)
    {
        this.frameTime += delta;
        if (this.frameTime > 16.5)
        {
            //console.log(deltaMultiplier);
            this.frameTime = 0;
            game.gameTick++;
            this.playerFSM.step();
            this.branchFSM.step();
            this.checkFps(this.player); // check fps and change variables depending on fps
        }
    }

    // check the players fps and adjust variables accordingly
    checkFps(player)
    {
        if (game.loop.actualFps <= 65)
        {
            player.MAX_VELOCITY = 1.82;      // x-velocity
            player.JUMP_VELOCITY = -4.25;    // y-velocity
            player.GRAPPLE_FORCE = 0.00005;  // grappling force
        }
        else
        {
            player.MAX_VELOCITY = 1.5;          // x-velocity
            player.JUMP_VELOCITY = -3.5;        // y-velocity
            player.GRAPPLE_FORCE = 0.000125;    // grappling force
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

