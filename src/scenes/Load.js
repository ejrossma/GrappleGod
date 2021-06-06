class Load extends Phaser.Scene {
    constructor() {
        super('loadScene');
    }

    preload() {
        //testing purposes (need to make)
        this.load.image('rock', './assets/rock.png');
        this.load.image('wallPad', './assets/wallPad.png');
        this.load.image('pressedWallPad', './assets/pressedWallPad.png');
            //need to make
        this.load.image('gateThree', './assets/gateThree.png');
        this.load.image('gateFive', './assets/gateFive.png');

        //sprites
        this.load.image('player', './assets/playerWithPack.png');
        this.load.image('smallBranch', './assets/smallBranch.png');
        this.load.image('smallBranchHighlight', './assets/smallBranchHighlight.png');
        this.load.image('heartFull', './assets/heartFull.png');
        this.load.image('heartEmpty', './assets/heartEmpty.png');
        this.load.image('campfire', './assets/introCampfire.png');
        this.load.image('cat', './assets/cat.png');
        this.load.image('controls', './assets/controls.png');
        this.load.image('gameover', './assets/gameOver.png');
        this.load.spritesheet('beetlewalk', './assets/beetlewalk.png', {
            frameWidth: 192,
            frameHeight: 64,
            startFrame: 0,
            endFrame: 4
        });

        //backgrounds
        this.load.image('background', './assets/starterBackground.png');
        this.load.image('background2', './assets/starter2Background.png');
        this.load.image('background3', './assets/starter3Background.png');
        this.load.image('background4', './assets/starter4Background.png');
        this.load.image('background5', './assets/starter5Background.png');
        this.load.image('background6', './assets/empty.png');
        this.load.image('menuBackground', './assets/treeIntro.png');

        //tilemap images/jsons
        this.load.image('tileset', './assets/Tilemap.png');
        this.load.tilemapTiledJSON('tilemapJSON', './assets/Test.json');
        

        this.load.tilemapTiledJSON('starterarea_oneJSON', './assets/Tilemaps/starterarea_one.json');
        this.load.tilemapTiledJSON('starterarea_twoJSON', './assets/Tilemaps/starterarea_two.json');
        this.load.tilemapTiledJSON('starterarea_threeJSON', './assets/Tilemaps/starterarea_three.json');
        this.load.tilemapTiledJSON('starterarea_fourJSON', './assets/Tilemaps/starterarea_four.json');
        this.load.tilemapTiledJSON('starterarea_fiveJSON', './assets/Tilemaps/starterarea_five.json');        
        this.load.tilemapTiledJSON('starterarea_sixJSON', './assets/Tilemaps/starterarea_six.json');

        this.load.tilemapTiledJSON('treearea_bossJSON', './assets/Tilemaps/treearea_boss.json');

        //sfx
        this.load.audio('walking', './assets/sounds/Walking.wav');
        this.load.audio('hooking', './assets/sounds/hook.wav');

            //need to make
        // this.load.audio('wallPadPress', './assets/sounds/wallPadPress.wav');
        // this.load.audio('playerHit', './assets/sounds/playerHit.wav');
        // this.load.audio('rockThud', './assets/sounds/rockThud.wav');

        //music
        this.load.audio('outsideMusic', './assets/sounds/outsideMusic.wav');
        this.load.audio('titleMusic', './assets/sounds/titleMusic.wav');
        this.load.audio('treeMusic', './assets/sounds/treeMusic.wav');
        this.load.audio('bossMusic', './assets/sounds/BossMusic.wav');

        //atlas
        this.load.atlas('player_animations', './assets/atlas/player_sprites.png', './assets/atlas/player_sprites.json');
        this.load.atlas('cat_animations', './assets/atlas/cat_sprites.png', './assets/atlas/cat_sprites.json');
    }

    create() {
        this.scene.start('menuScene');
    }
}