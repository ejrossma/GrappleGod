'use strict';

//game configuration
let config = {
    parent: 'phaser-game',
    type: Phaser.CANVAS,
    width: 600, //going to change to 480 x 320 to fit 16 x 16 sprites perfectly
    height: 400,
    zoom: 1,
    scene: [ firstScene, secondScene, Test ],
    scale: { 
        //autoCenter: Phaser.Scale.CENTER_BOTH
    },
    physics: {
        default: 'matter',
        matter: {
            debug: true,
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