class Menu extends Phaser.Scene {
    constructor() {
        super('menuScene');
    }

    create() {

        if(musicPlaying == false){
            this.menuMusic = this.sound.add('titleMusic', {
                loop:true,
                volume: 0.3
            });
            this.menuMusic.play();
            musicPlaying = true;     
        }
        

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
            //stop the music
            this.menuMusic.stop();
            musicPlaying = false;  
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
            //stop the music
            this.menuMusic.stop();
            musicPlaying = false;
            currentLevel = 0;
            mapScene = 0;
            hearts = 3;
            this.scene.start('introScene');
        });

        this.controls = this.add.text(game.config.width/2, game.config.height/1.72, 'Controls', buttonConfig).setOrigin(0.5, 0.5);
        this.controls.setInteractive(new Phaser.Geom.Rectangle(0, 0, this.controls.width, this.controls.height), Phaser.Geom.Rectangle.Contains);
        this.controls.on('pointerover', () => {
            this.controls.setColor('#808080');
        });
        this.controls.on('pointerout', () => {
            this.controls.setColor('#FFFFFF');
        });
        this.controls.on('pointerdown', () => {
            this.scene.start('controlScene');
        });

        this.credits = this.add.text(game.config.width/2, game.config.height/1.5, 'Credits', buttonConfig).setOrigin(0.5, 0.5);
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
            this.newGame.y = game.config.height/1.72;
            this.controls.y = game.config.height/1.52;
            this.credits.y = game.config.height/1.35;
        }
    }
}