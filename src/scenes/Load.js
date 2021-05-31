class Load extends Phaser.Scene {
    constructor() {
        super('loadScene');
    }

    preload() {
        //sprites
        this.load.image('player', './assets/archive/playerArt.png');
        this.load.image('pixeldude', './assets/archive/tilemapplayer.png');
        this.load.image('smallBranch', './assets/smallBranch.png');
        this.load.image('bigBranch', './assets/bigBranch.png');
        this.load.image('bigBranchHighlight', './assets/bigBranchHighlight.png');
        this.load.image('treePlatform', './assets/archive/treePlatform.png');
        this.load.image('treePlatformTwo', './assets/archive/treePlatformTwo.png');
        this.load.image('heartFull', './assets/heartFull.png');
        this.load.image('heartEmpty', './assets/heartEmpty.png');

        //backgrounds
        this.load.image('background', './assets/backgrounds/starterBackground.png');
        this.load.image('background2', './assets/backgrounds/starter2Background.png');

        //tilemap images/jsons
        this.load.image('tileset', './assets/Tilemap.png');
        this.load.tilemapTiledJSON('tilemapJSON', './assets/Test.json');
        this.load.tilemapTiledJSON('starterarea_twoJSON', './assets/Tilemaps/starterarea_two.json');

        this.load.tilemapTiledJSON('starterarea_oneJSON', './assets/Tilemaps/starterarea_one.json');
        this.load.tilemapTiledJSON('starterarea_threeJSON', './assets/Tilemaps/starterarea_three.json');
        this.load.tilemapTiledJSON('starterarea_sixJSON', './assets/Tilemaps/starterarea_six.json');

        //audio
        this.load.audio('walking', './assets/sounds/Walking.wav');
        this.load.audio('hooking', './assets/sounds/hook.wav');

        //atlas
        this.load.atlas('player_animations', './assets/atlas/player_sprites.png', './assets/atlas/player_sprites.json');
    }

    create() {
        document.getElementById('description').innerHTML = '<br>1: First Scene<br>2: Second Scene<br>T: Test Scene<br>Left Arrow + Right Arrow: Move<br>Space: Jump<br>Q: Connect to Grapple & Release Grapple';
        this.scene.start('tilemapScene');
    }
}