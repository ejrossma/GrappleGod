class Tilemap extends Phaser.Scene {
    constructor(config) {
        super({
            key: 'tilemapScene',
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
            }
        });
    }


    create() {
        this.rect = this.add.rectangle(0, 0, game.config.width * 3, game.config.height * 3, 0x6e6e6e).setOrigin(0);
        // this.MAX_VELOCITY = 5;      // x-velocity
        // this.JUMP_VELOCITY = -8;    // y-velocity
        // this.branches = this.add.group();
        // this.branch1 = new Branch(this, 100, 250, 'bigBranch', 90, 90, 70, false);
        // this.branchChildren = this.branches.getChildren();
        // this.platformChildren = this.platforms.getChildren();

        //add tilemap data & attach image to it
        const map = this.add.tilemap('starterarea_twoJSON');
        const tileset = map.addTilesetImage('GrassyTileSet', 'tileset');

        // create player (must set below the creation of platform/branch children)
        //this.player = new Player(this, 66, 128, this.MAX_VELOCITY, this.JUMP_VELOCITY, 'player');   // player using matter physics

        const terrainLayer = map.createLayer('Terrain', tileset, 0, 0);
        terrainLayer.setCollisionByProperty({ collision: true });

        this.p1 = this.physics.add.sprite(60, 220, 'pixeldude');

        //set world bounds
        this.matter.world.setBounds(0, 0, map.widthInPixels, map.heightInPixels);

        //camera stuff
        this.cameras.main.startFollow(this.p1);
        this.cameras.main.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
        this.cameras.main.setZoom(1);
        cursors = this.input.keyboard.createCursorKeys();
        this.physics.add.collider(this.p1, terrainLayer);

        this.changeScene();
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

