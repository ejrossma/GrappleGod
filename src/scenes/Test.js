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
        this.MAX_VELOCITY = 2;
        this.JUMP_VELOCITY = -5;
        this.jumps = 1;
        this.MAX_JUMPS = 1;
        this.jumping = false;
        cursors = this.input.keyboard.createCursorKeys();

        this.rect = this.add.rectangle(0, 0, game.config.width * 3, game.config.height, 0x6e6e6e).setOrigin(0);
        this.platforms = this.add.group();
        // ground level platforms (add platforms to the group)
        for (let i = 0; i < game.config.width * 3; i+= 32)
        {
            let platformGround = this.matter.add.image(i, game.config.height - 16, 'treePlatform', null, { isStatic: true }).setOrigin(0.5);
            platformGround.body.immovable = true;
            platformGround.body.allowGravity = false;
            this.platforms.add(platformGround);
        }

        this.addPlatform(64, 256, 'r', 3);

        this.addPlatform(200, 100, 'r', 5);

        // create player
        this.player = new Player(this, game.config.width/2, game.config.height/2, this.MAX_VELOCITY, this.JUMP_VELOCITY, 'player');   // player using matter physics

        // add physics collider
        

        // matter physics world bounds
        this.matter.world.setBounds(0, 0, game.config.width * 3, game.config.height);

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
        keyQ = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.Q);

        //camera setup
        this.cameras.main.setBounds(0, 0, 1800, 400);
        this.cameras.main.startFollow(this.player);
    }

    update() {
        // update the player
        this.player.update();
        // if (cursors.up.isDown && this.player.isGrappled == false){
        //     console.log('grapple');
        //     this.player.isGrappled = true;
        // }
        //temp add
        if(this.player.isGrappling && cursors.right.isDown){
            this.matter.applyForceFromAngle(this.player, 0.0005, 0);
        }
        else if(this.player.isGrappling && cursors.left.isDown){
            this.matter.applyForceFromAngle(this.player, 0.0005, 180);
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
                let platformGround = this.matter.add.image(x + dir * (32 * i), y, 'treePlatformTwo', null, { isStatic: true }).setOrigin(0.5);
                this.platforms.add(platformGround);
            }
            else{
                let platformGround = this.matter.add.image(x + dir * (32 * i), y, 'treePlatform', null, { isStatic: true }).setOrigin(0.5);
                this.platforms.add(platformGround);
            }
        }
    }
    addHook(x, y){
        this.poly =  this.matter.add.image(x, y, 'bigBranch', null, { isStatic: true }).setOrigin(0.5);

        // this.hero = this.matter.add.rectangle(game.config.width / 3, game.config.height / 3, 10, 10, {
        //     restitution: 0.5
        // });
        // this.rope = this.matter.add.constraint(this.hero, poly, 50, 0);
        //this.hookGroup.add(hook);
    }
    hookCharacter() {
        this.rope = this.matter.add.constraint(this.player, this.poly, 70, 0);
    }
    unHookCharacter() {
        this.matter.world.remove(this.rope);
    }
}