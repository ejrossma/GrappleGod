class Credits extends Phaser.Scene {
    constructor() {
        super('creditsScene');
    }

    create() {
        this.background = this.add.image(0,0, 'menuBackground').setOrigin(0, 0);
        
        let creditConfig = {
            fontFamily: 'Georgia',
            fontSize: '18px',
            color: '#FFFFFF'
        }
        this.credits = this.add.text(game.config.width/2, game.config.height/5, 'Credits', creditConfig).setFontSize('48px').setOrigin(0.5, 0.5);

        this.ely = this.add.text(game.config.width/2 - 5, game.config.height/3 + 10, 
        'Elijah Rossman -\nProducer, Player & World Artist, Level Designer, Programmer', creditConfig).setOrigin(0.5, 0.5);
        
        this.kevin = this.add.text(game.config.width/2, game.config.height/2 + 10, 
        'Kevin Lewis -\nLead Programmer (Movement, Collision, & World Interaction)', creditConfig).setOrigin(0.5, 0.5);
        
        this.kris = this.add.text(game.config.width/2 + 9, game.config.height/1.5 + 10, 
        'Kristopher Yu -\nBackground & Boss & World Artist, Level Designer, Programmer', creditConfig).setOrigin(0.5, 0.5);

        this.back = this.add.text(game.config.width/2, game.config.height/1.2, 'Back to Menu', creditConfig).setOrigin(0.5, 0.5).setFontSize('24px');
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