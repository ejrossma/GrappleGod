'use strict';

//game configuration
let config = {
    type: Phaser.AUTO,
    pixelArt: true,
    width: 600, //going to change to 480 x 320 to fit 16 x 16 sprites perfectly
    height: 400,
    zoom: 2,
    scene: [ Test,  Play ],
    scale: { 
        autoCenter: Phaser.Scale.CENTER_BOTH
    },
    physics: {
        default: 'matter',
        matter: {
            debug: true,
            gravity: { y: 0.5 }
        }
    },
}

let game = new Phaser.Game(config);
let cursors;
//reserve keyboard bindings
let keyQ, keySpace, keyLEFT, keyRIGHT, keyDOWN;