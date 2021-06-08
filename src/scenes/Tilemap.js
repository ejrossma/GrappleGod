class Tilemap extends Phaser.Scene {
    constructor(config) {
        super('tilemapScene');
    }


    create() {
        this.cameras.main.fadeIn(750, 0, 0, 0);
        this.matter.world.update30Hz();
        this.levels = ['starterarea_oneJSON', 'starterarea_twoJSON', 'starterarea_threeJSON', 'starterarea_fourJSON', 'starterarea_fiveJSON', 'starterarea_sixJSON', 'treearea_oneJSON', 'treearea_twoJSON', 'treearea_threeJSON', 'treearea_bossJSON'];
        this.backgrounds = ['background', 'background2', 'background3', 'background4', 'background5', 'background6','background7', 'background8', 'background9', 'bossBackground'];

        this.MAX_VELOCITY = 2;      // x-velocity
        this.JUMP_VELOCITY = -4;    // y-velocity

        this.gameOver = false;
        this.playerControl = true;
        this.jumping = false;
        this.isGrounded = false;
        this.finishedGrappling = false;
        this.frameTime = 0;         // initialized variable
        this.graphics = this.add.graphics();    // for constraint
        this.running = false;
        this.beetleDestroyed = false;

        //groups
        this.rocksGroup = this.add.group();

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
        //play overworld music
        if(musicPlaying == false){
            if(currentLevel >= 6){
                this.music = this.sound.add('treeMusic', {
                    loop:true,
                    volume: 0.3
                });
            }
            else{
                this.music = this.sound.add('outsideMusic', {
                    loop:true,
                    volume: 0.3
                });
            }
            this.music.play();
            musicPlaying = true;     
        }
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

        // beetle anims
        this.anims.create({
            key: 'beetle_walk',
            frames: this.anims.generateFrameNames('beetlewalk', {
                start: 0,
                end: 3,
                first: 0,
            }),
            frameRate: 12,
            repeat: -1
        });

        this.anims.create({
            key: 'beetle_walk_damaged',
            frames: this.anims.generateFrameNames('beetlewalkdamaged', {
                start: 0,
                end: 3,
                first: 0,
            }),
            frameRate: 12,
            repeat: -1
        });


        var tiles = terrainLayer.getTilesWithin(0, 0, terrainLayer.width, terrainLayer.height, { isColliding: true });
        const { TileBody: MatterTileBody } = Phaser.Physics.Matter;
        const matterTiles = tiles.map(tile => new MatterTileBody(this.matter.world, tile));
        //add next level collisionbox
        this.nextLevel = map.findObject("Objects", obj => obj.name === "nextLevel");
        this.transfer = this.matter.add.rectangle(this.nextLevel.x + 15, this.nextLevel.y, 32, 120);
        this.cat = new Cat(this, this.nextLevel.x + this.nextLevel.width*.25, this.nextLevel.y + 5, this.MAX_VELOCITY, this.nextLevel.width*2, this.nextLevel.height, 'cat_animations', 'cat_idle0001');

        // cat animation
        this.anims.create({
            key: 'cat_idle',
            frames: this.anims.generateFrameNames('cat_animations', {
                prefix: 'cat_idle',
                start: 1,
                end: 2,
                suffix: '',
                zeroPad: 4
            }),
            frameRate: 1,
            repeat: -1
        });
        
        this.anims.create({
            key: 'cat_run',
            frames: this.anims.generateFrameNames('cat_animations', {
                prefix: 'cat_run',
                start: 1,
                end: 4,
                suffix: '',
                zeroPad: 4
            }),
            frameRate: 12,
            repeat: -1
        });

        this.cat.anims.play('cat_idle');

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
        
        // sound for boss roar
        this.roar = this.sound.add('bossRoar', {volume: 0.5});

        // player state machine
        this.playerFSM = new StateMachine('idle', {
            idle: new IdleState(),
            move: new MoveState(),
            checkGrapple: new CheckGrappleState(),
            grappled: new GrappledState(),
            falling: new FallingState(),
            kick: new KickState(),
            run: new RunState(),
        }, [this, this.player]);

        // branches
        let branchObject = map.filterObjects("Objects", obj => obj.name === 'branch');
        let branchList = branchObject;
        this.branches = this.add.group();
        branchList.map((element) => {
            let branch = new Branch(this, element.x + 8, element.y + 3, 'smallBranch', 80, 80, 50, true, 80);
            this.branches.add(branch);
        }); 
        this.branchChildren = this.branches.getChildren();  // branches as an array for checking

        // branch state machine
        this.branchFSM = new StateMachine('detect', {
            detect: new DetectState(),
            highlight: new HighlightState(),
        }, [this, this.player, this.branchChildren]);

        // cat state machine
        this.catFSM = new StateMachine('idle', {
            idle: new CatIdleState(),
            run: new CatRunState(),
        }, [this, this.player, this.cat]);

        //Create the next scene zone
        this.nextSceneSpawn(map, matterTiles, tileset, terrainLayer, MatterTileBody);
        
        // create cursor and q keys for use
        this.keys = this.input.keyboard.createCursorKeys();
        this.keys.keyQ = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.Q);

        // health
        this.healthGroup = this.add.group();
        let health1 = this.add.sprite(152.5, 119, 'heartFull', null, { isStatic: true }).setOrigin(0.5);
        health1.setDepth(1);
        this.healthGroup.add(health1);
        let health2 = this.add.sprite(172.5, 119, 'heartFull', null, { isStatic: true }).setOrigin(0.5);
        health2.setDepth(1);
        this.healthGroup.add(health2);
        let health3 = this.add.sprite(192.5, 119, 'heartFull', null, { isStatic: true }).setOrigin(0.5);
        health3.setDepth(1);
        this.healthGroup.add(health3);  
        this.healthChildren = this.healthGroup.getChildren();
        this.healthChildren.forEach(function(child)
        {
            child.setScrollFactor(0);
        });
        this.currentHeart = 2;
        this.lowerHealth(this.healthChildren, this.player);

        let nameConfig = {
            fontFamily: 'Georgia',
            fontSize: '16px',
            color: '#FFFFFF',
            wordWrap: {width: 250, useAdvancedWrap: true},
            align: 'center'
        }
        this.playerTitle = this.add.text(142, 101, `${playerName} the ${playerAdjective}`, nameConfig).setOrigin(0);
        this.playerTitle.setDepth(1).setScrollFactor(0).setScale(0.5);
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
            if(currentLevel == 9){
                currentLevel = 8;
                this.music.stop();
                musicPlaying = false;
            }
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
                }
                if (currentLevel != 9)
                {
                    this.catFSM.step();
                }
                if (this.player.running)
                {
                    this.playerFSM.step();
                }
                this.checkFps(this.player, this.cat); // check fps and change variables depending on fps
            }
            //on the boss level if the rock hits the ground destroy it
            if (currentLevel == 9 && !this.beetleDestroyed) {
                this.beetleFSM.step();
                this.wallPadOne.update();
                this.wallPadTwo.update();
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
    checkFps(player, cat)
    {
        if (game.loop.actualFps <= 65)
        {
            player.MAX_VELOCITY = 1.82;      // x-velocity
            player.JUMP_VELOCITY = -4.25;    // y-velocity
            player.GRAPPLE_FORCE = 0.00005;  // grappling force
            player.JUMP_AIR_FRICTION = 0;
            player.FALL_AIR_FRICTION = 0.015;
            cat.MAX_VELOCITY = 1.82;
        }
        else
        {
            player.MAX_VELOCITY = 1.25;          // x-velocity
            player.JUMP_VELOCITY = -4;        // y-velocity
            player.GRAPPLE_FORCE = 0.0001;    // grappling force
            player.JUMP_AIR_FRICTION = 0.03;
            player.FALL_AIR_FRICTION = 0.015;
            cat.MAX_VELOCITY = 1.25;
        }
    }

    //Sends the player to the next scene once they collide with the next zone marker
    nextSceneSpawn(map, matterTiles, tileset, terrainLayer, MatterTileBody){
        // const nextLevel = map.findObject("Objects", obj => obj.name === "nextLevel");
        // this.transfer = this.matter.add.rectangle(nextLevel.x + 15, nextLevel.y, 32, 120);
        //Check to see if you need to change the soundtrack
        if(currentLevel == 6){
                this.music.stop();
                this.music = this.sound.add('treeMusic', {
                    loop:true,
                    volume: 0.3
                });
                this.music.play();
        }
        if(currentLevel == 9){
            this.clock = this.time.delayedCall(2400, () => {
                this.music.stop();
                this.music = this.sound.add('bossMusic', {
                    loop:true,
                    volume: 0.3
                });
                this.music.play();
            });
        }
        this.player.setOnCollideWith(this.transfer, pair => {
            //take away player control -> fade to black -> replace tilemap & set player position to spot on tilemap -> fade back in
            this.player.running = true;
            this.playerControl = false; //take away player control (still need to implement with the state machine) (maybe add a state called cutscene)
            this.transfer.collisionFilter.category = 0;
            this.cameras.main.fadeOut(1000, 0, 0, 0);
            this.walk.stop();
            this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, (cam, effect) => {
                this.matter.world.remove(this.transfer);
                this.player.running = false;
                this.cat.destroy();
                this.matter.world.remove(this.cat);
                if (this.deadzone != null)
                {
                    this.matter.world.remove(this.hitDeadZone)
                }
                map.removeAllLayers(); //remove visuals
                matterTiles.forEach(tile => tile.destroy()); //remove collisions
                map = this.add.tilemap(this.levels[++currentLevel]); //change map
                var tilesett = map.addTilesetImage('Tilemap', 'tileset');
                map.createLayer('Decoration', tilesett, 0, 0); //add new decor visuals
                terrainLayer = map.createLayer('Terrain', tilesett, 0, 0); //add new terrain visuals
                terrainLayer.setCollisionByProperty({collision: true }); //set collision
                var tiles = terrainLayer.getTilesWithin(0, 0, terrainLayer.width, terrainLayer.height, { isColliding: true }); //find all colliding tiles
                matterTiles = tiles.map(tile => new MatterTileBody(this.matter.world, tile)); //make a map of colliding tiles
                this.nextLevel = map.findObject("Objects", obj => obj.name === "nextLevel");
                if (this.nextLevel != null)
                {
                    this.transfer = this.matter.add.rectangle(this.nextLevel.x + 15, this.nextLevel.y, 32, 120);
                    this.cat = new Cat(this, this.nextLevel.x + this.nextLevel.width*.25, this.nextLevel.y + 5, this.MAX_VELOCITY, this.nextLevel.width*2, this.nextLevel.height, 'cat_animations', 'cat_idle0001');
                    this.cat.anims.play('cat_idle');
                    this.catFSM = new StateMachine('idle', {
                        idle: new CatIdleState(),
                        run: new CatRunState(),
                    }, [this, this.player, this.cat]);
                }
                //this.transfer = this.matter.add.rectangle(this.nextLevel.x + 15, this.nextLevel.y, 32, 120);
                this.deadzone = map.findObject("Objects", obj => obj.name === "deadZone");
                if (this.deadzone != null)
                    this.hitDeadZone = this.matter.add.rectangle(this.deadzone.x + this.deadzone.width/2, this.deadzone.y, this.deadzone.width, this.deadzone.height);
                this.lowerHealth(this.healthChildren, this.player);
                this.matter.world.setBounds(0, -50, map.widthInPixels, map.heightInPixels + 50);
                this.cameras.main.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
                var playerLoc = map.filterObjects('Objects', obj => obj.name === 'player');
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

                //if its the boss level
                    //zoom out & adjust UI Size
                    //setup WallPad, GateOne, GateTwo, RockGates, & Rock Object
                if (currentLevel == 9) {
                    //hide UI & change UI positions
                    this.playerTitle.x -= 135;
                    this.playerTitle.y -= 100;
                    this.playerTitle.setScale(1).setAlpha(0);
                    var temp = 0;
                    this.healthChildren.forEach( function(child) {
                        temp += 20;
                        child.x -= 145 - temp;
                        child.y -= 80;
                        child.setScale(2).setAlpha(0);
                    });
                    //zoom out the camera so the player has a better chance in the boss fight
                    this.cameras.main.zoomTo(1, 2000);
                    //once the zoom is finished then give the player control again
                    this.cameras.main.once(Phaser.Cameras.Scene2D.Events.ZOOM_COMPLETE, (cam, effect) => {
                        this.playerTitle.alpha = 1;
                        this.healthChildren.forEach( function(child) {
                            child.alpha = 1;
                        });
                    });
                    //setup gateOne & gateTwo
                    let gateOnePos = map.filterObjects('Objects', obj => obj.name === 'rockGateOne');
                    gateOnePos.map((element) => {
                        this.gateOne = this.matter.add.image(element.x + 40, element.y, 'gateFive', { isStatic: true}).setIgnoreGravity(true);
                    });
                    
                    
                    let gateTwoPos = map.filterObjects('Objects', obj => obj.name === 'rockGateTwo');
                    gateTwoPos.map((element) => {
                        this.gateTwo = this.matter.add.image(element.x + 40, element.y, 'gateFive', { isStatic: true}).setIgnoreGravity(true);
                    });
                    console.log(this.gameTwo);
                    
                    //setup rock above both
                    let rockOnePos = map.filterObjects('Objects', obj => obj.name === 'rockOne');
                    rockOnePos.map((element) => {
                        this.rockOne = this.matter.add.image(element.x + 8, element.y + 8, 'rock').setBody('circle').setIgnoreGravity(true);
                        this.rockOne.setCollisionGroup(3);
                    });
                    let rockTwoPos = map.filterObjects('Objects', obj => obj.name === 'rockTwo');
                    rockTwoPos.map((element) => {
                        this.rockTwo = this.matter.add.image(element.x + 8, element.y + 8, 'rock').setBody('circle').setIgnoreGravity(true);
                        this.rockTwo.setCollisionGroup(3);
                    });

                    //setup wallPadOne & wallPadTwo
                    let wallPadOnePos = map.filterObjects('Objects', obj => obj.name === 'wallPadOne');
                    wallPadOnePos.map((element) => {
                        this.wallPadOne = new WallPad(this, element.x + 8, element.y + 8, 'wallPad', 5, this.gateOne, this.rockOne);
                    });
                    let wallPadTwoPos = map.filterObjects('Objects', obj => obj.name === 'wallPadTwo');
                    wallPadTwoPos.map((element) => {
                        this.wallPadTwo = new WallPad(this, element.x + 8, element.y + 8, 'wallPad', 5, this.gateTwo, this.rockTwo);
                        this.wallPadTwo.flipX = true;
                    });

                    this.playerControl = true;

                    let beetleObject = map.filterObjects("Objects", obj => obj.name === 'beetle');
                    beetleObject.map((element) => {
                    this.beetle = new Beetle(this, element.x, element.y, this.MAX_VELOCITY, 'beetlewalk');   // player using matter physic
                    });
                    this.beetleFSM = new StateMachine('groundpound', {
                        groundpound: new GroundPoundState(),
                        search: new SearchState(),
                        charge: new ChargeState(),
                        stunned: new StunnedState(),
                    }, [this, this.player, this.beetle]);
                }

                //fade back in after changing the map
                this.cameras.main.fadeIn(1000, 0, 0, 0);
            });

            this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, (cam, effect) => {
                if (currentLevel != 9)
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

    lowerHealth(health, player)
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

    updateHealth(num)
    {
        this.healthChildren[num].setTexture('heartEmpty');
    }

    gameOverScreen()
    {
        this.player.pause();
        this.gameOverBG.alpha = 1;
        this.gameOverText.alpha = 1;
        this.continue.alpha = 1;
        this.menu.alpha = 1;
    }

    finalSceneTransition()
    {
        this.cameras.main.fadeOut(1000, 0, 0, 0);
        this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, (cam, effect) => {
            this.beetle.destroy();
            // transition to next scene here
        });
    }

}
