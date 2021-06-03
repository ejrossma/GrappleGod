class Menu extends Phaser.Scene {
    constructor() {
        super('menuScene');
    }

    create() {
        this.background = this.add.image(0, 0, 'menuBackground').setOrigin(0, 0);
        this.creatorsBackground = this.add.rectangle(0, game.config.height, game.config.width * 2, 80, 0x5C4033).setOrigin(0.5, 0.5);
        this.creators = this.add.text(50, game.config.height - 27, 'Game Created By Elijah Rossman, Kevin Lewis, & Kristopher Yu', 
        {
            fontFamily: 'Georgia',
            fontSize: '16px',
            color: '#FFFFFF',
            align: 'left',
        }).setOrigin(0, 0);
        //this.creators.setResolution(1);

        this.title = this.add.text(game.config.width/2, game.config.height/3, 'The Ascent', 
        {
            fontFamily: 'Georgia',
            fontSize: '64px',
            color: '#FFFFFF',
            align: 'left',
        }).setOrigin(0.5, 0.5);

        let buttonConfig = {
            fontFamily: 'Georgia',
            fontSize: '28px',
            color: '#FFFFFF',
            align: 'left'
        }

        this.continue = this.add.text(game.config.width/2, game.config.height/2, 'Continue', buttonConfig).setOrigin(0.5, 0.5).setAlpha(0);
        this.continue.setInteractive(new Phaser.Geom.Rectangle(0, 0, this.continue.width, this.continue.height), Phaser.Geom.Rectangle.Contains);
        this.continue.on('pointerover', () => {
            this.continue.setColor('#808080');
        });
        this.continue.on('pointerout', () => {
            this.continue.setColor('#FFFFFF');
        });
        this.continue.on('pointerdown', () => {
            this.scene.start('tilemapScene');
        });

        this.newGame = this.add.text(game.config.width/2, game.config.height/2, 'New Game', buttonConfig).setOrigin(0.5, 0.5);
        this.newGame.setInteractive(new Phaser.Geom.Rectangle(0, 0, this.newGame.width, this.newGame.height), Phaser.Geom.Rectangle.Contains);
        this.newGame.on('pointerover', () => {
            this.newGame.setColor('#808080');
        });
        this.newGame.on('pointerout', () => {
            this.newGame.setColor('#FFFFFF');
        });
        this.newGame.on('pointerdown', () => {
            currentLevel = 0;
            hearts = 3;
            this.scene.start('tilemapScene');
        });

        this.credits = this.add.text(game.config.width/2, game.config.height/1.7, 'Credits', buttonConfig).setOrigin(0.5, 0.5);
        this.credits.setInteractive(new Phaser.Geom.Rectangle(0, 0, this.credits.width, this.credits.height), Phaser.Geom.Rectangle.Contains);
        this.credits.on('pointerover', () => {
            this.credits.setColor('#808080');
        });
        this.credits.on('pointerout', () => {
            this.credits.setColor('#FFFFFF');
        });
        this.credits.on('pointerdown', () => {
            this.scene.start('creditsScene');
        });
    }

    update() {
        if (currentLevel != 0) {
            this.continue.alpha = 1;
            this.newGame.y = game.config.height/1.7;
            this.credits.y = game.config.height/1.48;
        }
    }
}