'use strict';
//Groupmates: Elijah Rossman, Kristopher Yu, Kevin Lewis

//game configuration
let config = {
    parent: 'phaser-game',
    type: Phaser.CANVAS,
    width: 560, //going to change to 480 x 320 to fit 16 x 16 sprites perfectly
    height: 400,
    zoom: 2,
    scene: [ Load, Menu, Intro, Controls, Credits, Tilemap, Outro],
    scale: { 
        autoCenter: Phaser.Scale.CENTER_BOTH
    },
    backgroundColor: '#caa368',
    physics: {
        default: 'matter',
        matter: {
            tileBias: 64,
            debug: false,
            gravity: { y: 0.5 }
        }
    },
    render: {
        pixelArt: true
    },
}

let game = new Phaser.Game(config);
let cursors;
//reserve keyboard bindings
let keyQ, keySpace, keyLEFT, keyRIGHT, keyDOWN;
//current level index
let mapScene = 0;
let currentLevel = 0;
let hearts = 3;
let playerName = 'Alexander';
let playerAdjective = 'Kindhearted';
let catName = 'Fluff';
let catAdjective = 'heroic';
let musicPlaying = false;