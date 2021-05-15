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
        this.load.image('background2', './assets/starter2Background.png');
    }

    create() {
        // variables and settings
        this.MAX_VELOCITY = 5;
        this.JUMP_VELOCITY = -8;
        this.jumps = 1;
        this.MAX_JUMPS = 1;
        this.MIN_CONSTRAINT_LENGTH = 80;
        this.jumping = false;
        cursors = this.input.keyboard.createCursorKeys();

        this.background = this.add.tileSprite(0, 0, 300, 100, 'background2').setOrigin(0, 0).setScale(4, 4);
        this.platforms = this.add.group();
        //add ground reset
        this.addPlatform(0, 160, 'r', 6);
        this.addPlatform(500, 160, 'r', 6);
        this.addPlatform(1200, 160, 'l', 8);

        // create player
        this.player = new Player(this, 66, 128, this.MAX_VELOCITY, this.JUMP_VELOCITY, 'player');   // player using matter physics

        // matter physics world bounds
        this.matter.world.setBounds(0, -50, 1200, game.config.height + 50);       // world bounds

        // //add group for hooks
        // this.hookGroup = this.add.group();
        // add hook
        this.branches = this.add.group();
        this.branch1Bounds = this.add.rectangle(300 - 90, 50, 90*2, 90, 0xff0000, 0.2).setOrigin(0);    // bounds
        this.branch1 = new Branch(this, 300, 50, 'bigBranch', 90, 90);     // spawn branch
        this.branches.add(this.branch1);
        this.branch1Bounds = this.add.rectangle(850 - 90, 50, 90*2, 90, 0xff0000, 0.2).setOrigin(0);    // bounds
        this.branch2 = new Branch(this, 850, 50, 'bigBranch', 90, 90);     // spawn branch
        this.branches.add(this.branch2);

        // children of groups
        this.branchChildren = this.branches.getChildren();
        this.platformChildren = this.platforms.getChildren();

        // //give player grappled status
        // this.player.isGrappled = false;
        // console.log(this.player.isGrappled);
        //add hook
        //this.addHook(300, 200);
        //Set keys 
        keyLEFT = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.LEFT);
        keyRIGHT = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.RIGHT);
        keyQ = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.Q);

        //camera setup
        this.cameras.main.setBounds(0, 0, 1200, 400);
        this.cameras.main.startFollow(this.player);

        // collision for jumping
        for (var i = 0; i < this.platformChildren.length; i++)
        {
            this.player.setOnCollideWith(this.platformChildren[i], pair => {
                this.player.setTouchingDown();
            });
        }
        //player goes to next stage
        let next = this.matter.add.image(1168, 112, 'player').setOrigin(0.5, 0.5);
        this.player.setOnCollideWith(next, pair => {
            this.scene.start("secondScene");
        });
        //resets when hits floor
        let reset = this.matter.add.image(1168, game.config.height - 16, 'player').setOrigin(0.5, 0.5);
        this.player.setOnCollideWith(reset, pair => {
            this.scene.start("secondScene");
        });

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
        // while grappled
        if(player.isGrappling && cursors.right.isDown && player.canSwing){
            this.matter.applyForceFromAngle(player, 0.00035 * deltaMultiplier, 0);
        }
        else if(player.isGrappling && cursors.left.isDown && player.canSwing){
            this.matter.applyForceFromAngle(player, 0.00035 * deltaMultiplier, -180);
        }

        // when letting go of grapple
        if (!player.isGrappling && !player.isGrounded && !player.finishedGrappling && player.x > branch.x && player.canSwing == true)
        {
            this.matter.applyForceFromAngle(player, 0.0005 * deltaMultiplier, 0);
        }
        else if (!player.isGrappling && !player.isGrounded && !player.finishedGrappling && player.x < branch.x && player.canSwing == true)
        {
            this.matter.applyForceFromAngle(player, 0.0005 * deltaMultiplier, 180);
        }
        if (!player.isGrappling && !player.isGrounded && !player.finishedGrappling && player.x > branch.x && player.canSwing == false)
        {
            this.matter.applyForceFromAngle(player, 0.00075 * deltaMultiplier, -45);
        }
        else if (!player.isGrappling && !player.isGrounded && !player.finishedGrappling && player.x < branch.x && player.canSwing == false)
        {
            this.matter.applyForceFromAngle(player, 0.00075 * deltaMultiplier, -135);
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