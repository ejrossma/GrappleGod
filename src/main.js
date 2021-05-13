'use strict';

//game configuration
let config = {
    type: Phaser.AUTO,
    pixelArt: true,
    width: 480,
    height: 320,
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