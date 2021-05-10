'use strict';

//game configuration
let config = {
    type: Phaser.AUTO,
    width: 400,
    height: 400,
    scene: [ Test, Play ],
    scale: { 
        autoCenter: Phaser.Scale.CENTER_BOTH
    },
    physics: {
        default: 'arcade',
        arcade: {
            debug: false,
            gravity: {
                x: 0,
                y: 0
            }
        }
    },
}

let game = new Phaser.Game(config);
let cursors;
//reserve keyboard bindings
let keyQ, keySpace, keyLEFT, keyRIGHT, keyDOWN;