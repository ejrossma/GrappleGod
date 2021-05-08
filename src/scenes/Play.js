class Play extends Phaser.Scene {
    constructor() {
        super("playScene");
    }

    preload() {
        
    }

    create() {
        this.rect = this.add.rectangle(0, 0, game.config.height, game.config.width, 0xFFFFFF);
    }

    update() {

    }
}