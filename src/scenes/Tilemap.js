class Tilemap extends Phaser.Scene {
    constructor(config) {
        super('tilemapScene');
    }


    create() {
        this.matter.world.update30Hz();
        this.levels = ['starterarea_oneJSON', 'starterarea_twoJSON', 'starterarea_threeJSON', 'starterarea_fourJSON', 'starterarea_fiveJSON', 'starterarea_sixJSON'];
        this.backgrounds = ['background', 'background2', 'background3', 'background4', 'background5', 'background 6'];
        this.currentLevel = 0;

        this.MAX_VELOCITY = 2;      // x-velocity
        this.JUMP_VELOCITY = -4;    // y-velocity

        this.playerControl = true;
        this.jumping = false;
        this.isGrounded = false;
        this.finishedGrappling = false;
        this.frameTime = 0;         // initialized variable
        this.graphics = this.add.graphics();    // for constraint

        //Add background for current level
        this.background = this.add.image(0, 0, this.backgrounds[this.currentLevel]).setOrigin(0,0);

        //add tilemap data & attach image to it
        const map = this.add.tilemap(this.levels[this.currentLevel]);
        const tileset = map.addTilesetImage('Tilemap', 'tileset');
        const terrainLayer = map.createLayer('Terrain', tileset, 0, 0);
        const decorationLayer = map.createLayer('Decoration', tileset, 0, 0);
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
            frameRate: 8,
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
            let branch = new Branch(this, element.x + 8, element.y + 3, 'smallBranch', 50, 60, 20, true, 50);
            branch.setDepth(1);
            this.branches.add(branch);
        });
        this.branchChildren = this.branches.getChildren();  // branches as an array for checking
        //console.log(this.branchChildren);

        // branch state machine
        this.branchFSM = new StateMachine('detect', {
            detect: new DetectState(),
            highlight: new HighlightState(),
        }, [this, this.player, this.branchChildren]);

        //Signify what map is next in the array.
        this.mapScene = 0;

        //Create the next scene zone
        this.nextSceneSpawn(map, matterTiles, tileset, terrainLayer, MatterTileBody);

        //Create the hitbox regions for the spiked areas
        this.spikeReset(this.respawnX, this.respawnY);
        
        // create cursor and q keys for use
        this.keys = this.input.keyboard.createCursorKeys();
        this.keys.keyQ = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.Q);

        // health
        this.healthGroup = this.add.group();
        let health1 = this.matter.add.sprite(92, 64, 'heartFull', null, { isStatic: true }).setOrigin(0.5);
        health1.setCollisionCategory(0);
        health1.setDepth(1);
        this.healthGroup.add(health1);
        let health2 = this.matter.add.sprite(116, 64, 'heartFull', null, { isStatic: true }).setOrigin(0.5);
        health2.setCollisionCategory(0);
        health2.setDepth(1);
        this.healthGroup.add(health2);
        let health3 = this.matter.add.sprite(140, 64, 'heartFull', null, { isStatic: true }).setOrigin(0.5);
        health3.setCollisionCategory(0);
        health3.setDepth(1);
        this.healthGroup.add(health3);  
        this.healthChildren = this.healthGroup.getChildren();
        this.healthChildren.forEach(function(child)
        {
            child.setScrollFactor(0);
        });
        this.currentHeart = 2;
        this.updateHealth(this.healthChildren);
    }

    update(time, delta)
    {
        this.frameTime += delta;
        if (this.frameTime > 16.5)
        {
            this.frameTime = 0;
            game.gameTick++;
            if (this.playerControl)
                this.playerFSM.step();
            this.branchFSM.step();
            this.checkFps(this.player); // check fps and change variables depending on fps
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
                map.removeAllLayers(); //remove visuals
                matterTiles.forEach(tile => tile.destroy()); //remove collisions
                map = this.add.tilemap(this.levels[++this.currentLevel]); //change map
                //console.log(map);
                var tilesett = map.addTilesetImage('Tilemap', 'tileset');
                terrainLayer = map.createLayer('Terrain', tilesett, 0, 0); //add new terrain visuals
                map.createLayer('Decoration', tilesett, 0, 0); //add new decor visuals
                terrainLayer.setCollisionByProperty({collision: true }); //set collision
                var tiles = terrainLayer.getTilesWithin(0, 0, terrainLayer.width, terrainLayer.height, { isColliding: true }); //find all colliding tiles
                matterTiles = tiles.map(tile => new MatterTileBody(this.matter.world, tile)); //make a map of colliding tiles
                this.nextLevel = map.findObject("Objects", obj => obj.name === "nextLevel");
                this.transfer = this.matter.add.rectangle(this.nextLevel.x + 15, this.nextLevel.y, 32, 120);
                this.matter.world.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
                this.cameras.main.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
                var playerLoc = map.filterObjects('Objects', obj => obj.name === 'player');
                //console.log(map);
                playerLoc.map((element) => {
                    this.player.x = element.x;
                    this.player.y = element.y;
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
                this.background.setTexture(this.backgrounds[this.currentLevel]);
                this.background.setPosition(0, 0);
                //console.log(this.branchChildren);
                this.cameras.main.fadeIn(1000, 0, 0, 0);
            });

            this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, (cam, effect) => {
                this.playerControl = true;
                this.nextSceneSpawn(map, matterTiles, tileset, terrainLayer, MatterTileBody);
            });
        });
    }

    //Creates the hitzones for the spiked areas
    spikeReset(x, y, map){

    }
    //Respawns the player to the start of the map
    playerRespawn(x, y){
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
}
