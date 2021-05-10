class Test extends Phaser.Scene {
    constructor(config) {
        super({
            key: 'testScene',
            physics: {
                default: 'arcade',
                  arcade: {
                      debug: true,
                      gravity: {
                        y: 200
                      }
                  },
                  matter: {
                    debug: true,
                    gravity: { y: 0.5 }
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
            let platformGround = this.physics.add.sprite(i, game.config.height - 32, 'treePlatform').setScale(1).setOrigin(0);
            platformGround.body.immovable = true;
            platformGround.body.allowGravity = false;
            this.platforms.add(platformGround);
        }

        this.addPlatform(64, 256, 'r', 3);

        this.addPlatform(200, 100, 'r', 5);

        this.testBranch = this.add.sprite(250, 150, 'bigBranch').setOrigin(0);

        // create player
        this.player = new Player(this, game.config.width/2, game.config.height/2, this.MAX_VELOCITY, this.JUMP_VELOCITY, 'player');
        // add physics collider
        this.physics.add.collider(this.player, this.platforms);
        this.player.setCollideWorldBounds(true);

        //add group for hooks
        this.hookGroup = this.add.group();
        //give player grappled status
        this.player.isGrappled = false;
        console.log(this.player.isGrappled);
        //add hook
        this.addHook(300, 200);
                //Set keys 
                keyLEFT = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.LEFT);
                keyRIGHT = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.RIGHT);
    }

    update() {
        // update the player
        this.player.update();
        if (cursors.up.isDown && this.player.isGrappled == false){
            console.log('grapple');
            this.player.isGrappled = true;
        }
        //temp add
        if(keyRIGHT.isDown){
            this.matter.applyForceFromAngle(this.hero, 0.00005, 0);
        }
        if(keyLEFT.isDown){
            this.matter.applyForceFromAngle(this.hero, 0.00005, 180);
        }
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
                let platformGround = this.physics.add.sprite(x + dir * (32 * i), y, 'treePlatformTwo').setOrigin(0);
                platformGround.body.immovable = true;
                platformGround.body.allowGravity = false;
                this.platforms.add(platformGround);
            }
            else{
                let platformGround = this.physics.add.sprite(x + dir * (32 * i), y, 'treePlatform').setOrigin(0);
                platformGround.body.immovable = true;
                platformGround.body.allowGravity = false;
                this.platforms.add(platformGround);
            }
        }
    }
    addHook(x, y){
        let poly = this.matter.add.rectangle(x, y, 22, 22, {
            isStatic:true
        });
        this.hero = this.matter.add.rectangle(game.config.width / 3, game.config.height / 3, 10, 10, {
            restitution: 0.5
        });
        this.rope = this.matter.add.constraint(this.hero, poly, 50, 0);
        this.physics.add.collider(this.player, poly);
        //this.hookGroup.add(hook);
    }
    hookCharacter() {
        
    }
}