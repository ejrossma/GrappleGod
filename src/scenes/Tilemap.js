class Tilemap extends Phaser.Scene {
    constructor(config) {
        super('tilemapScene');
    }


    create() {
        this.cameras.main.fadeIn(750, 0, 0, 0);
        this.matter.world.update30Hz();
        this.levels = ['starterarea_oneJSON', 'starterarea_twoJSON', 'starterarea_threeJSON', 'starterarea_fourJSON', 'starterarea_fiveJSON', 'starterarea_sixJSON'];
        this.backgrounds = ['background', 'background2', 'background3', 'background4', 'background5', 'background 6'];

        this.MAX_VELOCITY = 2;      // x-velocity
        this.JUMP_VELOCITY = -4;    // y-velocity

        this.gameOver = false;
        this.playerControl = true;
        this.jumping = false;
        this.isGrounded = false;
        this.finishedGrappling = false;
        this.frameTime = 0;         // initialized variable
        this.graphics = this.add.graphics();    // for constraint

        //Add background for current level
        this.background = this.add.image(0, 0, this.backgrounds[currentLevel]).setOrigin(0,0);

        //add tilemap data & attach image to it
        const map = this.add.tilemap(this.levels[currentLevel]);
        const tileset = map.addTilesetImage('Tilemap', 'tileset');
        const decorationLayer = map.createLayer('Decoration', tileset, 0, 0);
        const terrainLayer = map.createLayer('Terrain', tileset, 0, 0);
        terrainLayer.setCollisionByProperty({ collision: true });

        // create player (must set below the creation of platform/branch children)
        let playerObject = map.filterObjects("Objects", obj => obj.name === 'player');
        let playerList = playerObject;
        playerList.map((element) => {
            this.player = new Player(this, element.x, element.y, this.MAX_VELOCITY, this.JUMP_VELOCITY, 'player_animations', 'player_idle0001');   // player using matter physics
            this.respawnX = element.x;
            this.respawnY = element.y;
        });

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
        this.anims.create({
            key: 'player_run',
            frames: this.anims.generateFrameNames('player_animations', {
                prefix: 'player_run',
                start: 1,
                end: 8,
                suffix: '',
                zeroPad: 4
            }),
            frameRate: 12,
            repeat: -1
        });
        this.anims.create({
            key: 'player_grapple',
            frames: this.anims.generateFrameNames('player_animations', {
                prefix: 'player_grapple',
                start: 1,
                end: 1,
                suffix: '',
                zeroPad: 4
            }),
            frameRate: 1,
            repeat: -1
        });
        this.anims.create({
            key: 'player_fall',
            frames: this.anims.generateFrameNames('player_animations', {
                prefix: 'player_run',
                start: 1,
                end: 1,
                suffix: '',
                zeroPad: 4
            }),
            frameRate: 1,
            repeat: -1
        });
        this.anims.create({
            key: 'player_kick',
            frames: this.anims.generateFrameNames('player_animations', {
                prefix: 'player_kick',
                start: 1,
                end: 1,
                suffix: '',
                zeroPad: 4
            }),
            frameRate: 1,
            repeat: -1
        });

        this.player.anims.play('player_idle'); //start idle animation
        this.player.setDepth(2);    // bring player to front


        var tiles = terrainLayer.getTilesWithin(0, 0, terrainLayer.width, terrainLayer.height, { isColliding: true });
        const { TileBody: MatterTileBody } = Phaser.Physics.Matter;
        const matterTiles = tiles.map(tile => new MatterTileBody(this.matter.world, tile));
        console.log(map);
        //add next level collisionbox
        this.nextLevel = map.findObject("Objects", obj => obj.name === "nextLevel");
        this.transfer = this.matter.add.rectangle(this.nextLevel.x + 15, this.nextLevel.y, 32, 120);

        // add deadzone
        this.deadzone = map.findObject("Objects", obj => obj.name === "deadZone");
        if (this.deadzone != null)
        {
            this.hitDeadZone = this.matter.add.rectangle(this.deadzone.x + this.deadzone.width/2, this.deadzone.y, this.deadzone.width, this.deadzone.height);
        }
        

        //set world bounds
        this.matter.world.setBounds(0, -50, map.widthInPixels, map.heightInPixels + 50);

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

        // branches
        //console.log(map);
        let branchObject = map.filterObjects("Objects", obj => obj.name === 'branch');
        let branchList = branchObject;
        this.branches = this.add.group();
        branchList.map((element) => {
            let branch = new Branch(this, element.x + 8, element.y + 3, 'smallBranch', 80, 80, 50, true, 80);
            this.branches.add(branch);
        }); 
        this.branchChildren = this.branches.getChildren();  // branches as an array for checking
        //console.log(this.branchChildren);

        // branch state machine
        this.branchFSM = new StateMachine('detect', {
            detect: new DetectState(),
            highlight: new HighlightState(),
        }, [this, this.player, this.branchChildren]);

        //Create the next scene zone
        this.nextSceneSpawn(map, matterTiles, tileset, terrainLayer, MatterTileBody);
        
        // create cursor and q keys for use
        this.keys = this.input.keyboard.createCursorKeys();
        this.keys.keyQ = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.Q);

        // health
        this.healthGroup = this.add.group();
        let health1 = this.matter.add.sprite(152.5, 119, 'heartFull', null, { isStatic: true }).setOrigin(0.5);
        health1.setCollisionCategory(0);
        health1.setDepth(1);
        this.healthGroup.add(health1);
        let health2 = this.matter.add.sprite(172.5, 119, 'heartFull', null, { isStatic: true }).setOrigin(0.5);
        health2.setCollisionCategory(0);
        health2.setDepth(1);
        this.healthGroup.add(health2);
        let health3 = this.matter.add.sprite(192.5, 119, 'heartFull', null, { isStatic: true }).setOrigin(0.5);
        health3.setCollisionCategory(0);
        health3.setDepth(1);
        this.healthGroup.add(health3);  
        this.healthChildren = this.healthGroup.getChildren();
        this.healthChildren.forEach(function(child)
        {
            child.setScrollFactor(0);
        });
        this.currentHeart = 2;
        this.lowerHealth(this.healthChildren);

        let nameConfig = {
            fontFamily: 'Georgia',
            fontSize: '16px',
            color: '#FFFFFF',
            wordWrap: {width: 250, useAdvancedWrap: true},
            align: 'center'
        }
        let playerTitle = this.add.text(142, 101, `${playerName} the ${playerAdjective}`, nameConfig).setOrigin(0);
        playerTitle.setDepth(1).setScrollFactor(0).setScale(0.5);
        // game over screen
        let buttonConfig = {
            fontFamily: 'Georgia',
            fontSize: '64px',
            color: '#FFFFFF',
            align: 'left'
        }

        let gameOverConfig = {
            fontFamily: 'Georgia',
            fontSize: '64px',
            color: '#000000',
            align: 'left'
        }

        this.gameOverBG = this.add.image(207.5, 120, 'gameover').setOrigin(0, 0).setScale(0.75);
        this.gameOverBG.setDepth(3);
        this.gameOverBG.setScrollFactor(0);
        this.gameOverBG.alpha = 0;

        this.gameOverText = this.add.text(280, 150, 'GAME OVER!', gameOverConfig).setOrigin(0.5, 0.5).setScale(0.25);
        this.gameOverText.setScrollFactor(0);
        this.gameOverText.setDepth(3);
        this.gameOverText.alpha = 0;

        this.continue = this.add.text(277.5, 185, 'Continue', buttonConfig).setOrigin(0.5, 0.5).setScale(0.25);
        this.continue.setInteractive(new Phaser.Geom.Rectangle(0, 0, this.continue.width, this.continue.height), Phaser.Geom.Rectangle.Contains);
        this.continue.setScrollFactor(0);
        this.continue.setDepth(3);
        this.continue.alpha = 0;
        this.continue.on('pointerover', () => {
            this.continue.setColor('#808080');
        });
        this.continue.on('pointerout', () => {
            this.continue.setColor('#FFFFFF');
        });
        this.continue.on('pointerdown', () => {
            this.anims.resumeAll();
            this.scene.start('tilemapScene');
        });

        this.menu = this.add.text(278.75, 220, 'Menu', buttonConfig).setOrigin(0.5, 0.5).setScale(0.25);
        this.menu.setInteractive(new Phaser.Geom.Rectangle(0, 0, this.menu.width, this.menu.height), Phaser.Geom.Rectangle.Contains);
        this.menu.setScrollFactor(0);
        this.menu.setDepth(3);
        this.menu.alpha = 0;
        this.menu.on('pointerover', () => {
            this.menu.setColor('#808080');
        });
        this.menu.on('pointerout', () => {
            this.menu.setColor('#FFFFFF');
        });
        this.menu.on('pointerdown', () => {
            this.scene.start('menuScene');
            this.anims.resumeAll();
        });

        //in game tutorials so the player can learn gradually
        this.move = this.add.text(this.player.x - 100, this.player.y - 75, 'Move : ← & →', nameConfig).setDepth(1).setOrigin(0, 0);
        this.jump = this.add.text(this.player.x - 250, this.player.y - 100, 'Jump : Space', nameConfig).setDepth(1).setOrigin(0, 0);

        this.grapple = this.add.text(this.player.x - 200, this.player.y - 312, 'Grapple : Jump → Q', nameConfig).setDepth(1).setOrigin(0, 0);
        this.grappleHelp = this.add.text(this.player.x - 15, this.player.y - 325, 'Swing : ← & →', nameConfig).setDepth(1).setOrigin(0, 0);
        this.grappleHelpTwo = this.add.text(this.player.x - 15, this.player.y - 300, 'Release : Q', nameConfig).setDepth(1).setOrigin(0, 0);
    }

    update(time, delta)
    {
        if (!this.gameOver)
        {
            this.frameTime += delta;
            if (this.frameTime > 16.5)
            {
                this.frameTime = 0;
                game.gameTick++;
                if (this.playerControl)
                {
                    this.playerFSM.step();
                    this.branchFSM.step();
                    this.checkFps(this.player); // check fps and change variables depending on fps
                }
            }
        }
        if (currentLevel != 0) {
            this.move.alpha = 0;
            this.jump.alpha = 0;
            this.grapple.alpha = 0;
            this.grappleHelpTwo.alpha = 0;
            this.grappleHelp.alpha = 0;
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
            player.JUMP_AIR_FRICTION = 0;
            player.FALL_AIR_FRICTION = 0.015;
        }
        else
        {
            player.MAX_VELOCITY = 1.25;          // x-velocity
            player.JUMP_VELOCITY = -4;        // y-velocity
            player.GRAPPLE_FORCE = 0.0001;    // grappling force
            player.JUMP_AIR_FRICTION = 0.03;
            player.FALL_AIR_FRICTION = 0.015;
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

    //Sends the player to the next scene once they collide with the next zone marker
    nextSceneSpawn(map, matterTiles, tileset, terrainLayer, MatterTileBody){
        // const nextLevel = map.findObject("Objects", obj => obj.name === "nextLevel");
        // this.transfer = this.matter.add.rectangle(nextLevel.x + 15, nextLevel.y, 32, 120);
        this.player.setOnCollideWith(this.transfer, pair => {
            //take away player control -> fade to black -> replace tilemap & set player position to spot on tilemap -> fade back in
            this.playerControl = false; //take away player control (still need to implement with the state machine) (maybe add a state called cutscene)
            this.cameras.main.fadeOut(1000, 0, 0, 0);
            this.walk.stop();
            this.player.setVelocityX(0);
            this.player.setVelocityY(0);
            this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, (cam, effect) => {
                this.matter.world.remove(this.transfer);
                if (this.deadzone != null)
                {
                    this.matter.world.remove(this.hitDeadZone)
                }
                map.removeAllLayers(); //remove visuals
                matterTiles.forEach(tile => tile.destroy()); //remove collisions
                map = this.add.tilemap(this.levels[++currentLevel]); //change map
                //console.log(map);
                var tilesett = map.addTilesetImage('Tilemap', 'tileset');
                map.createLayer('Decoration', tilesett, 0, 0); //add new decor visuals
                terrainLayer = map.createLayer('Terrain', tilesett, 0, 0); //add new terrain visuals
                terrainLayer.setCollisionByProperty({collision: true }); //set collision
                var tiles = terrainLayer.getTilesWithin(0, 0, terrainLayer.width, terrainLayer.height, { isColliding: true }); //find all colliding tiles
                matterTiles = tiles.map(tile => new MatterTileBody(this.matter.world, tile)); //make a map of colliding tiles
                this.nextLevel = map.findObject("Objects", obj => obj.name === "nextLevel");
                this.transfer = this.matter.add.rectangle(this.nextLevel.x + 15, this.nextLevel.y, 32, 120);
                this.deadzone = map.findObject("Objects", obj => obj.name === "deadZone");
                if (this.deadzone != null)
                {
                    this.hitDeadZone = this.matter.add.rectangle(this.deadzone.x + this.deadzone.width/2, this.deadzone.y, this.deadzone.width, this.deadzone.height);
                }
                this.lowerHealth(this.healthChildren);
                this.matter.world.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
                this.cameras.main.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
                var playerLoc = map.filterObjects('Objects', obj => obj.name === 'player');
                //console.log(map);
                playerLoc.map((element) => {
                    this.player.x = element.x;
                    this.respawnX = element.x;
                    this.player.y = element.y;
                    this.respawnY = element.y;
                });
                //destroy the branches
                for (var i = this.branchChildren.length - 1; i > -1; i--) {
                    this.branchChildren[i].destroy();
                }
                //replace the branches
                let branchObject = map.filterObjects("Objects", obj => obj.name === 'branch');
                let branchList = branchObject;
                branchList.map((element) => {
                    let branch = new Branch(this, element.x + 8, element.y + 3, 'smallBranch', 80, 80, 50, true, 80);
                    this.branches.add(branch);
                }); 
                this.branchChildren = this.branches.getChildren();  // branches as an array for checking
                //Change the background to the new background
                this.background.setTexture(this.backgrounds[currentLevel]);
                this.background.setPosition(0, 0);
                this.cameras.main.fadeIn(1000, 0, 0, 0);
            });

            this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, (cam, effect) => {
                this.playerControl = true;
                this.nextSceneSpawn(map, matterTiles, tileset, terrainLayer, MatterTileBody);
            });
        });
    }

    // reset player
    resetPlayer(x, y){
        this.player.setX(x);
        this.player.setY(y);
    }

    updateHealth(health)
    {
        this.input.keyboard.on('keydown', (event) => {
            switch(event.key) {
                case 'f':
                    if (this.currentHeart == 2)
                    {
                        health[2].setTexture('heartEmpty');
                        this.currentHeart--;
                    }
                    else if (this.currentHeart == 1)
                    {
                        health[1].setTexture('heartEmpty');
                        this.currentHeart--;
                    }
                    else if (this.currentHeart == 0)
                    {
                        health[0].setTexture('heartEmpty');
                        this.currentHeart--;
                        this.gameOver = true;
                        this.gameOverScreen();
                    }
                    break;
                case 'g':
                    if (this.currentHeart == 1)
                    {
                        health[2].setTexture('heartFull');
                        this.currentHeart++;
                    }
                    else if (this.currentHeart == 0)
                    {
                        health[1].setTexture('heartFull');
                        this.currentHeart++;
                    }
                    else if (this.currentHeart == -1)
                    {
                        health[0].setTexture('heartFull');
                        this.currentHeart++;
                    }
                    break;
                default:
                    break;
            }
        });
    }

    lowerHealth(health)
    {
        // when hitting deadzone
        if (this.deadzone != null)
        {
            this.player.setOnCollideWith(this.hitDeadZone, pair => {
                if (this.currentHeart == 2)
                {
                    this.resetPlayer(this.respawnX, this.respawnY);
                    health[2].setTexture('heartEmpty');
                    this.currentHeart--;
                }
                else if (this.currentHeart == 1)
                {
                    this.resetPlayer(this.respawnX, this.respawnY);
                    health[1].setTexture('heartEmpty');
                    this.currentHeart--;
                }
                else if (this.currentHeart == 0)
                {
                    health[0].setTexture('heartEmpty');
                    this.currentHeart--;
                    this.gameOver = true;
                    this.gameOverScreen();
                }
            });
        }
    }

    gameOverScreen()
    {
        this.player.pause();
        this.gameOverBG.alpha = 1;
        this.gameOverText.alpha = 1;
        this.continue.alpha = 1;
        this.menu.alpha = 1;
    }
}
