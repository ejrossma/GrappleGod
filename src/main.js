//game configuration
let config = {
    type: Phaser.AUTO,
    width: 800,
    height: 800,
    scene: [ Test, Play ],
    scale: { 
        autoCenter: Phaser.Scale.CENTER_BOTH 
    }
}

let game = new Phaser.Game(config);

//reserve keyboard bindings
let keyQ, keySpace, keyLEFT, keyRIGHT, keyDOWN;