'use strict';

//game configuration
let config = {
    type: Phaser.AUTO,
    width: 600,
    height: 400,
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