class Outro extends Phaser.Scene {
    constructor() {
        super('outroScene');
    }

    create() {
        //tracks which screen of intro (out of the 8 screens) 0-7
        this.introIndex = 0;
        //booleans to help button know when it can be clicked
        this.screenFinished = false;

        if(musicPlaying == false){
            this.music = this.sound.add('titleMusic', {
                loop:true,
                volume: 0.3
            });
            this.music.play();
            musicPlaying = true;     
        }

        //text & text styling
        let narrativeConfig = {
            fontFamily: 'Georgia',
            fontSize: '18px',
            color: '#FFFFFF',
            wordWrap: {width: 500, useAdvancedWrap: true},
            align: 'center'
        }
        this.narrative = this.add.text(game.config.width/2, game.config.height - 100, '', narrativeConfig).setOrigin(0.5, 0.5);

        let nextConfig = {
            fontFamily: 'Georgia',
            fontSize: '32px',
            color: '#FFFFFF'
        }
        this.next = this.add.text(game.config.width - 50, game.config.height - 25, 'Next', nextConfig).setOrigin(0.5, 0.5);
        this.next.setInteractive(new Phaser.Geom.Rectangle(0, 0, this.next.width, this.next.height), Phaser.Geom.Rectangle.Contains);
        this.next.on('pointerover', () => {
            this.next.setColor('#808080');
        });
        this.next.on('pointerout', () => {
            this.next.setColor('#FFFFFF');
        });
        this.next.on('pointerdown', () => {
            console.log(this.introIndex);
            if (this.introIndex == 2) {
                this.cameras.main.fadeOut(750, 0, 0, 0);
                this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, (cam, effect) => {
                    this.music.stop();
                    musicPlaying = false;
                    currentLevel = 0; 
                    this.scene.start('menuScene');
                });
            }
            this.cameras.main.fadeOut(750, 0, 0, 0);
            this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, (cam, effect) => {
                this.screenHandler(++this.introIndex);
                this.cameras.main.fadeIn(750, 0, 0, 0);
            });
        });
        this.campfire = this.add.image(game.config.width/2, game.config.height/2 - 60, 'campfire').setOrigin(0.5, 0.5).setAlpha(0);
        this.player = this.add.sprite(game.config.width/2 - 125, game.config.height/2 - 25, 'player').setOrigin(0.5, 0.5).setScale(2);
        this.cat = this.add.sprite(game.config.width/2 + 125, game.config.height/2 - 20, 'cat').setOrigin(0.5, 0.5).setScale(5);
        
        //animation for player
        this.anims.create({
            key: 'player_run',
            frames: this.anims.generateFrameNames('player_animations', {
                prefix: 'player_run',
                start: 1,
                end: 8,
                suffix: '',
                zeroPad: 4
            }),
            frameRate: 12,
            repeat: -1
        });
        this.anims.create({
            key: 'player_idle',
            frames: this.anims.generateFrameNames('player_animations', {
                prefix: 'player_idle',
                start: 1,
                end: 4,
                suffix: '',
                zeroPad: 4
            }),
            frameRate: 4,
            repeat: -1
        });

        //animations for cat
        this.anims.create({
            key: 'cat_idle',
            frames: this.anims.generateFrameNames('cat_animations', {
                prefix: 'cat_idle',
                start: 1,
                end: 4,
                suffix: '',
                zeroPad: 4
            }),
            frameRate: 4,
            repeat: -1
        });
        this.anims.create({
            key: 'cat_run',
            frames: this.anims.generateFrameNames('cat_animations', {
                prefix: 'cat_run',
                start: 1,
                end: 4,
                suffix: '',
                zeroPad: 4
            }),
            frameRate: 12,
            repeat: -1
        });

        this.screenHandler(this.introIndex);
        //3 screens
            //screen 1
                //Having slain the beetle you, {playername} get to reunite with your cat, {catname}
                    //show their running animations facing each other
            //screen 2
                //"You didn't end up getting that rat did you buddy."
                    //cat with wagging tail & player standing next to
            //screen 3
                //Congratulations & Thank you for Playing
                    //return to menu button
    }

    update() {
        if  (this.screenFinished)
            this.next.setAlpha(1);
        else
            this.next.setAlpha(0);
    }

    screenHandler(index) {
        switch(index) {
            case 0:
                this.reuniteCat();
                break;
            case 1:
                this.standingStill();
                break;
            case 2:
                this.congrats();
                break;
            default:
                break;
        }
    }

    reuniteCat() {
        this.next.setAlpha(0);
        this.player.play('player_run');
        this.player.setScale(5);
        this.cat.play('cat_run');
        this.typeText(`Having slain the beetle you get to reunite with your ${catAdjective} companion, ${catName}.`);
        //player & cat are running towards each other
    }

    standingStill() {
        this.next.setAlpha(0);
        this.player.x += 75;
        this.player.play('player_idle');
        this.cat.x -= 75;
        this.cat.play('cat_idle');
        this.cat.setScale(4);
        this.typeText(`It seems like ${catName} didn't end up catching that rat, but they seem happy to be back in your presence & ready to head home.`);
        //cat is idle animation & player is standing still
    }

    congrats() {
        this.next.setAlpha(0);
        this.campfire.setAlpha(1);
        this.player.y += 22;
        this.cat.y += 26;
        this.typeText('Congratulations & Thank You for Playing');
        this.next.text = 'Menu';
    }

    typeText(string) {
        const length = string.length
        let i = 0;
        this.narrative.text = '';
        this.time.addEvent({
            callback: () => {
                this.narrative.text += string[i];
                ++i;
                if (i == length)
                    this.screenFinished = true;
            },
            repeat: length - 1,
            delay: 50
        });
    }

}