class Tilemap extends Phaser.Scene {
    constructor(config) {
        super({
            key: 'tilemapScene',
            physics: {
                default: 'matter',
                  matter: {
                      debug: false,
                      fps: 60,
                      gravity: {
                        y: 0.5
                      }
                  },
                  arcade: {
                    debug: true,
                    gravity: { y: 1000 }
                  }
            }
        });
    }


    create() {
        // this.rect = this.add.rectangle(0, 0, game.config.width * 3, game.config.height * 3, 0x6e6e6e).setOrigin(0);
        this.MAX_VELOCITY = 2;      // x-velocity
        this.JUMP_VELOCITY = -4;    // y-velocity
        this.jumping = false;
        this.isGrounded = false;
        this.finishedGrappling = false;
        this.branches = this.add.group();
        this.branch1 = new Branch(this, 0, 150, 'bigBranch', 90, 90, 70, false);
        this.branches.add(this.branch1);
        this.branchChildren = this.branches.getChildren();


        //add tilemap data & attach image to it
        const map = this.add.tilemap('starterarea_twoJSON');
        const tileset = map.addTilesetImage('GrassyTileSet', 'tileset');

        // create player (must set below the creation of platform/branch children)
        this.player = new Player(this, 66, 128, this.MAX_VELOCITY, this.JUMP_VELOCITY, 'pixeldude');   // player using matter physics
        this.player.setDepth(1);

        const terrainLayer = map.createLayer('Terrain', tileset, 0, 0);
        const decoration = map.createLayer('Decoration', tileset, 0, 0);
        terrainLayer.setCollisionByProperty({ collision: true });
        this.matter.world.convertTilemapLayer(terrainLayer);

        //this.p1 = this.physics.add.sprite(60, 220, 'pixeldude');

        //set world bounds
        this.matter.world.setBounds(0, 0, map.widthInPixels, map.heightInPixels);

        //camera stuff
        this.cameras.main.startFollow(this.player);
        this.cameras.main.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
        this.cameras.main.setZoom(1);

        //sound for walking
        this.walk = this.sound.add('walking', {
            loop:true,
            volume: 0.5
        });
        //sound for hooking
        this.hook = this.sound.add('hooking', {volume: 0.5});

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

        this.cameras.main.setZoom(2);
    }

    update(time, delta)
    {
        this.playerFSM.step();
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

