class Load extends Phaser.Scene {
    constructor() {
        super('loadScene');
    }

    preload() {
        //sprites
        this.load.image('player', './assets/playerWithPack.png');
        this.load.image('smallBranch', './assets/smallBranch.png');
        this.load.image('smallBranchHighlight', './assets/smallBranchHighlight.png');
        this.load.image('heartFull', './assets/heartFull.png');
        this.load.image('heartEmpty', './assets/heartEmpty.png');

        //backgrounds
        this.load.image('background', './assets/starterBackground.png');
        this.load.image('background2', './assets/empty.png');
        this.load.image('background3', './assets/starter2Background.png');
        this.load.image('background4', './assets/starter4Background.png');
        this.load.image('background5', './assets/empty.png');
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

        //audio
        this.load.audio('walking', './assets/sounds/Walking.wav');
        this.load.audio('hooking', './assets/sounds/hook.wav');

        //atlas
        this.load.atlas('player_animations', './assets/atlas/player_sprites.png', './assets/atlas/player_sprites.json');
    }

    create() {
        this.scene.start('menuScene');
    }
}