class Controls extends Phaser.Scene {
    constructor() {
        super('controlScene');
    }

    create() {
        this.background = this.add.image(0,0, 'controls').setOrigin(0, 0);
        
        let controlConfig = {
            fontFamily: 'Georgia',
            fontSize: '64px',
            color: '#FFFFFF'
        }
        this.credits = this.add.text(game.config.width/2, game.config.height/25, 'Controls', controlConfig).setOrigin(0.5, 0.5).setScale(0.4);


        this.back = this.add.text(game.config.width/2, game.config.height/1.05, 'Back to Menu', controlConfig).setOrigin(0.5, 0.5).setScale(0.4);
        this.back.setInteractive(new Phaser.Geom.Rectangle(0, 0, this.back.width, this.back.height), Phaser.Geom.Rectangle.Contains);
        this.back.on('pointerover', () => {
            this.back.setColor('#808080');
        });
        this.back.on('pointerout', () => {
            this.back.setColor('#FFFFFF');
        });
        this.back.on('pointerdown', () => {
            this.scene.start('menuScene');
        });
    }
}