class Tilemap extends Phaser.Scene {
    constructor(config) {
        super('tilemapScene');
    }


    create() {
        this.MAX_VELOCITY = 2;      // x-velocity
        this.JUMP_VELOCITY = -4;    // y-velocity

        this.jumping = false;
        this.isGrounded = false;
        this.finishedGrappling = false;
        this.branches = this.add.group();
        //this.branch1 = new Branch(this, 0, 150, 'bigBranch', 90, 90, 70, false);
        //this.branches.add(this.branch1);
        this.branchChildren = this.branches.getChildren();  // branches as an array for checking
        this.frameTime = 0;         // initialized variable

        // create player (must set below the creation of platform/branch children)
        let playerObject = map.filterObjects("Objects", obj => obj.name === 'player');
        let playerList = playerObject;
        playerList.map((element) => {
            this.player = new Player(this, element.x, element.y, this.MAX_VELOCITY, this.JUMP_VELOCITY, 'player_animations', 'player_idle0001');   // player using matter physics
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
        this.player.anims.play('player_idle'); //start idle animation
        this.player.setDepth(1);    // bring player to front

        //add tilemap data & attach image to it
        const map = this.add.tilemap('starterarea_twoJSON');
        const tileset = map.addTilesetImage('GrassyTileSet', 'tileset');
        const terrainLayer = map.createLayer('Terrain', tileset, 0, 0);
        const decorationLayer = map.createLayer('Decoration', tileset, 0, 0);
        terrainLayer.setCollisionByProperty({ collision: true });
        //this.matter.world.convertTilemapLayer(terrainLayer);

        // const map2 = this.add.tilemap('starterarea_oneJSON');
        // const terrainLayer2 = map2.createLayer('Terrain', tileset, 0, 0);
        // const decoration2 = map2.createLayer('Decoration', tileset, 0, 0);
        // terrainLayer2.setCollisionByProperty({ collision: true });
        // this.matter.world.convertTilemapLayer(terrainLayer2);


        var tiles = terrainLayer.getTilesWithin(0, 0, terrainLayer.width, terrainLayer.height, { isColliding: true });
        const { TileBody: MatterTileBody } = Phaser.Physics.Matter;
        const matterTiles = tiles.map(tile => new MatterTileBody(this.matter.world, tile));
        this.tilemapHandler(map, matterTiles, tileset, terrainLayer, MatterTileBody);
        
        console.log(map.layers);

        //set world bounds
        this.matter.world.setBounds(0, -50, map.widthInPixels, map.heightInPixels + 50);

        //camera stuff
        this.cameras.main.startFollow(this.player);
        this.cameras.main.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
        //this.cameras.main.setZoom(2);

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
            let branch = new Branch(this, element.x + 8, element.y + 3, 'smallBranch', 50, 50, 50, false);
            this.branches.add(branch);
        });
        this.branchChildren = this.branches.getChildren();  // branches as an array for checking

        // branch state machine
        this.branchFSM = new StateMachine('detect', {
            detect: new DetectState(),
            highlight: new HighlightState(),
        }, [this, this.player, this.branchChildren]);

        //Create the next scene zone
        this.nextSceneSpawn(map);
        
        // create cursor and q keys for use
        this.keys = this.input.keyboard.createCursorKeys();
    }

    update(time, delta)
    {
        this.frameTime += delta;
        if (this.frameTime > 16.5)
        {
            //console.log(deltaMultiplier);
            this.frameTime = 0;
            game.gameTick++;
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
        }
        else
        {
            player.MAX_VELOCITY = 1.5;          // x-velocity
            player.JUMP_VELOCITY = -3.5;        // y-velocity
            player.GRAPPLE_FORCE = 0.000125;    // grappling force
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

    tilemapHandler(map, matterTiles, tileset, terrainLayer, MatterTileBody) 
    {
        this.input.keyboard.on('keydown', (event) => {
            switch(event.key) {
                //one
                case '8':
                    //remove collision & visuals
                    console.log(map.layers);
                    map.removeAllLayers();
                    matterTiles.forEach(tile => tile.destroy());
                    console.log(map.layers);
                    //add new visuals
                    map = this.add.tilemap('starterarea_oneJSON');
                    terrainLayer = map.createLayer('Terrain', tileset, 0, 0);
                    map.createLayer('Decoration', tileset, 0, 0);
                    terrainLayer.setCollisionByProperty({ collision: true });
                    //give collision
                    var tiles = terrainLayer.getTilesWithin(0, 0, terrainLayer.width, terrainLayer.height, { isColliding: true });
                    matterTiles = tiles.map(tile => new MatterTileBody(this.matter.world, tile));
                    console.log(map.layers);
                    this.matter.world.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
                    this.cameras.main.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
                    break;
                //three    
                case '9':
                    map.removeAllLayers();
                    matterTiles.forEach(tile => tile.destroy());
                    console.log(map.layers);
                    //add new visuals
                    map = this.add.tilemap('starterarea_threeJSON');
                    var tilesett = map.addTilesetImage('Tilemap', 'tileset');
                    terrainLayer = map.createLayer('Terrain', tilesett, 0, 0);
                    map.createLayer('Decoration', tilesett, 0, 0);
                    terrainLayer.setCollisionByProperty({ collision: true });
                    //give collision
                    var tiles = terrainLayer.getTilesWithin(0, 0, terrainLayer.width, terrainLayer.height, { isColliding: true });
                    matterTiles = tiles.map(tile => new MatterTileBody(this.matter.world, tile));
                    console.log(map.layers);
                    this.matter.world.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
                    this.cameras.main.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
                    break;
                //six
                case '0':
                    map.removeAllLayers();
                    matterTiles.forEach(tile => tile.destroy());
                    console.log(map.layers);
                    //add new visuals
                    map = this.add.tilemap('starterarea_sixJSON');
                    map.createLayer('Decorations', tileset, 0, 0);
                    terrainLayer = map.createLayer('Terrain', tileset, 0, 0);
                    terrainLayer.setCollisionByProperty({ collision: true });
                    //give collision
                    var tiles = terrainLayer.getTilesWithin(0, 0, terrainLayer.width, terrainLayer.height, { isColliding: true });
                    matterTiles = tiles.map(tile => new MatterTileBody(this.matter.world, tile));
                    console.log(map.layers);
                    this.matter.world.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
                    this.cameras.main.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
                    break;
            }
        });
    }
    //Sends the player to the next scene once they collide with the next zone marker
    nextSceneSpawn(map){
        const nextLevel = map.findObject("Objects", obj => obj.name === "nextLevel");
        this.transfer = this.matter.add.rectangle(nextLevel.x + 15, nextLevel.y, 32, 120);
        this.player.setOnCollideWith(this.transfer, pair => {
            this.walk.stop();
            //this.scene.start("tilemapScene");
        });
    }
    playerRespawn(map){
        
    }
}
