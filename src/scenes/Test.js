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

        // matter physics world bounds
        this.matter.world.setBounds(0, 0, game.config.width * 3, game.config.height);       // world bounds

        //add group for hooks
        this.hookGroup = this.add.group();
        // add hook
        this.branch1 = new Branch(this, 300, 200, 'bigBranch');     // spawn branch
        this.branch2 = new Branch(this, 500, 150, 'bigBranch');     // spawn branch

        //give player grappled status
        this.player.isGrappled = false;
        console.log(this.player.isGrappled);
        //add hook
        //this.addHook(300, 200);
        //Set keys 
        keyLEFT = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.LEFT);
        keyRIGHT = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.RIGHT);
        keyQ = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.Q);

        //camera setup
        this.cameras.main.setBounds(0, 0, 1800, 400);
        this.cameras.main.startFollow(this.player);
    }

    update() {
        // update the player/branches
        this.player.update();       // main player update function
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
    hookCharacter(player, branch) {
        // calculate how long the constraint should be
        if (player.x > branch.x)
        {
            this.constraintLength = (((player.x - branch.x)^2)+((player.y-branch.y)^2))^0.5;
        }
        else if (this.player < branch.x)
        {
            this.constraintLength = (((branch.x - player.x)^2)+((branch.y-player.y)^2))^0.5;
        }
        else
        {
            this.constraintLength = player.y - branch.y;
        }

        // if less than minumum set it to the minimum length
        if (this.constraintLength < 70)
        {
            this.constraintLength = 70;     // minimum length of constraint
        }

        console.log(this.constraintLength);
        
        this.rope = this.matter.add.constraint(player, branch, this.constraintLength, 0);       // create constraint
    }
    unHookCharacter() {
        this.matter.world.remove(this.rope);    // delete constraint
    }

    // apply force on the swing
    applyForce(player, branch)
    {
        if(player.isGrappling && cursors.right.isDown && player.canSwing){
            this.matter.applyForceFromAngle(player, 0.0005, 0);
        }
        else if(player.isGrappling && cursors.left.isDown && player.canSwing){
            this.matter.applyForceFromAngle(player, 0.0005, 180);
        }
        if (!player.canSwing && player.x < branch.x)
        {
            this.matter.applyForceFromAngle(player, 0.00075, 90);
        }
        else if (!player.canSwing && player.x > branch.x)
        {
            this.matter.applyForceFromAngle(player, 0.00075, 90);
        }
    }
}