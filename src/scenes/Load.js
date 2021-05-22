class Load extends Phaser.Scene {
    constructor() {
        super('loadScene');
    }

    preload() {
        //sprites
        this.load.image('player', './assets/playerArt.png');
        this.load.image('pixeldude', './assets/tilemapplayer.png');
        this.load.image('treePlatform', './assets/treePlatform.png');
        this.load.image('treePlatformTwo', './assets/treePlatformTwo.png');
        this.load.image('smallBranch', './assets/smallBranch.png');
        this.load.image('bigBranch', './assets/bigBranch.png');
        this.load.image('bigBranchHighlight', './assets/bigBranchHighlight.png');

        //backgrounds
        this.load.image('background', './assets/starterBackground.png');
        this.load.image('background2', './assets/starter2Background.png');

        //tilemap images/jsons
        this.load.image('tileset', './assets/Tilemap.png');
        this.load.tilemapTiledJSON('tilemapJSON', './assets/Test.json');
        this.load.tilemapTiledJSON('starterarea_twoJSON', './assets/Tilemaps/starterarea_two.json');

        //audio
        this.load.audio('walking', './assets/Walking.wav');
        this.load.audio('hooking', './assets/hook.wav');
    }

    create() {
        document.getElementById('description').innerHTML = '<br>1: First Scene<br>2: Second Scene<br>T: Test Scene<br>Left Arrow + Right Arrow: Move<br>Space: Jump<br>Q: Connect to Grapple & Release Grapple';
        this.scene.start('tilemapScene');
    }
}