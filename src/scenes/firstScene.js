class firstScene extends Phaser.Scene {
    constructor(config) {
        super({
            key: 'firstScene',
            physics: {
                default: 'arcade',
                  arcade: {
                      debug: true,
                      gravity: {
                        y: 1000
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
    }

    create() {
        // variables and settings
        this.MAX_VELOCITY = 2;
        this.JUMP_VELOCITY = -5;
        this.jumps = 1;
        this.MAX_JUMPS = 1;
        this.jumping = false;
        this.physics.world.gravity.y = 1000;
        cursors = this.input.keyboard.createCursorKeys();

        this.rect = this.add.rectangle(0, 0, game.config.height, game.config.width, 0x6e6e6e).setOrigin(0);
        this.platforms = this.add.group();
        // ground level platforms (add platforms to the group)
        for (let i = 0; i < game.config.width; i+= 32)
        {
            let platformGround = this.physics.add.sprite(i, game.config.height - 32, 'blank').setScale(1).setOrigin(0);
            platformGround.body.immovable = true;
            platformGround.body.allowGravity = false;
            this.platforms.add(platformGround);
        }
        let newPlatform = this.matter.add.rectangle(0, game.config.height, game.config.width*2, 64, {
            isStatic:true
        });

        this.addPlatform(0, game.config.height - 64, 'r', 7);
        this.addPlatform(0, game.config.height - 96, 'r', 7);
        this.addPlatform(0, game.config.height - 128, 'r', 4);
        this.addPlatform(0, game.config.height - 160, 'r', 4);

        this.addPlatform(100, 100, 'r', 9);

        // create player
        this.player = this.matter.add.sprite(game.config.width*0.75, game.config.height/2, 'arrow');   // player using matter physics
        this.player.setFixedRotation(0);        // prevent player sprite from unnecessarily spinning when moving
        //this.player = new Player(this, game.config.width/2, game.config.height/2, this.MAX_VELOCITY, this.JUMP_VELOCITY, 'arrow');

        // add physics collider
        this.physics.add.collider(this.player, this.platforms);
        //this.player.setCollideWorldBounds(true);

        // matter physics world bounds
        this.matter.world.setBounds(0, 0, game.config.width, game.config.height);

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
        this.updatePlayer();
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
            //make an arrow if > 0.20 else make blank
            if (temp < 0.20) {
                let platformGround = this.physics.add.sprite(x + dir * (32 * i), y, 'arrow').setOrigin(0);
                platformGround.body.immovable = true;
                platformGround.body.allowGravity = false;
                this.platforms.add(platformGround);
                //this.platforms.create(x + dir * (32 * i), y, 'arrow').setOrigin(0);
            }
            else{
                let platformGround = this.physics.add.sprite(x + dir * (32 * i), y, 'blank').setOrigin(0);
                platformGround.body.immovable = true;
                platformGround.body.allowGravity = false;
                this.platforms.add(platformGround);
                //this.platforms.create(x + dir * (32 * i), y, 'blank').setOrigin(0);
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
    hookCharacter(){
        
    }

    // updates the player sprite
    updatePlayer()
    {
        // horizontal movement
        if (cursors.right.isDown) 
        {
            this.matter.setVelocityX(this.player, this.MAX_VELOCITY);
            //this.player.body.velocity.x = this.MAX_VELOCITY;
        }
        else if(cursors.left.isDown)
        {
            this.matter.setVelocityX(this.player, -this.MAX_VELOCITY);
            //this.player.body.velocity.x = -this.MAX_VELOCITY;
        }
        else
        {
            this.matter.setVelocityX(this.player, 0);
            //this.player.body.velocity.x = 0;
        }

        // vertical movement
        // check if grounded
        //console.log(this.player.x)
        this.isGrounded = true;

        // if so, can jump
        if (this.isGrounded)
        {
            this.jumps = this.MAX_JUMPS;
            this.jumping = false;
        }
        else
        {

        }

        // actual jumping
        if (this.jumps > 0 && Phaser.Input.Keyboard.DownDuration(cursors.space, 150))
        {
            this.matter.setVelocityY(this.player, this.JUMP_VELOCITY);
            this.jumping = true;
        }

        // letting go of space key subtracting a jump
        if (this.jumping && Phaser.Input.Keyboard.UpDuration(cursors.space)) 
        {
            this.jumps--;
            this.jumping = false;
        }
    }
}