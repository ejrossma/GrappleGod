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
        this.MAX_VELOCITY = 5;      // player horizontal speed
        this.JUMP_VELOCITY = -12;    // player vertical speed
        this.jumps = 1;             // current amount of jumps
        this.MAX_JUMPS = 1;         // max amount of jumps
        this.MIN_CONSTRAINT_LENGTH = 70;
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
        this.branches = this.add.group();
        this.branch1 = new Branch(this, 300, 200, 'bigBranch', 90, 80);     // spawn branch
        this.branches.add(this.branch1);
        this.branch2 = new Branch(this, 500, 150, 'bigBranch', 90, 80);     // spawn branch
        this.branches.add(this.branch2);
        // children of grounp
        this.branchChildren = this.branches.getChildren();
        this.platformChildren = this.platforms.getChildren();

        //Set keys 
        keyLEFT = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.LEFT);
        keyRIGHT = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.RIGHT);
        keyQ = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.Q);

        //camera setup
        this.cameras.main.setBounds(0, 0, game.config.width * 3, game.config.height);
        this.cameras.main.startFollow(this.player);

        // collision
        for (var i = 0; i < this.platformChildren.length; i++)
        {
            this.player.setOnCollideWith(this.platformChildren[i], pair => {
                this.player.setTouchingDown();
            });
        }

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
    // addHook(x, y){
    //     this.poly =  this.matter.add.image(x, y, 'bigBranch', null, { isStatic: true }).setOrigin(0.5);

    //     // this.hero = this.matter.add.rectangle(game.config.width / 3, game.config.height / 3, 10, 10, {
    //     //     restitution: 0.5
    //     // });
    //     // this.rope = this.matter.add.constraint(this.hero, poly, 50, 0);
    //     //this.hookGroup.add(hook);
    // }
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
        if (this.constraintLength < this.MIN_CONSTRAINT_LENGTH)
        {
            this.constraintLength = this.MIN_CONSTRAINT_LENGTH;     // minimum length of constraint
        }

        //console.log(this.constraintLength);
        
        this.rope = this.matter.add.constraint(player, branch, this.constraintLength, 0);       // create constraint
    }
    unHookCharacter() {
        this.matter.world.remove(this.rope);    // delete constraint
    }

    // apply force on the swing
    applyForce(player, branch, deltaMultiplier)
    {
        if(player.isGrappling && cursors.right.isDown && player.canSwing){
            this.matter.applyForceFromAngle(this.player, 0.0005 * deltaMultiplier, 0);
        }
        else if(player.isGrappling && cursors.left.isDown && player.canSwing){
            this.matter.applyForceFromAngle(this.player, 0.0005 * deltaMultiplier, 180);
        }
        if (!player.canSwing && player.x < branch.x)
        {
            //player.setVelocity(0,0);
            this.matter.applyForceFromAngle(this.player, 0.00075 * deltaMultiplier, 90);
        }
        else if (!player.canSwing && player.x > branch.x)
        {
            //player.setVelocity(0,0);
            this.matter.applyForceFromAngle(this.player, 0.00075 * deltaMultiplier, 90);
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