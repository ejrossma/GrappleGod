class Intro extends Phaser.Scene {
    constructor() {
        super('introScene');
    }

    create() {
        //tracks which screen of intro (out of the 7 screens) 0-6
        this.introIndex = 0;
        //booleans to help button know when it can be clicked
        this.screenFinished = false;
        this.fieldsFilled = false;

        //get the two html textboxes so the player can type
        this.nameField = document.getElementById('name');
        this.adjectiveField = document.getElementById('adjective');

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
        //on clicking next it sees if there is a special state & then moves onto next screen
        this.next.on('pointerdown', () => {
            this.screenFinished = false;
            if (this.introIndex === 0) {
                playerName = this.nameField.value;
                playerAdjective = this.adjectiveField.value;
                this.nameField.value = '';
                this.adjectiveField.value = '';
            } else if (this.introIndex == 3) {
                catName = this.nameField.value;
                catAdjective = this.adjectiveField.value;
                this.nameField.value = '';
                this.adjectiveField.value = '';
            } else if (this.introIndex == 6) {
                this.scene.start('tilemapScene');
            }
            this.screenHandler(++this.introIndex);
        });
        //all assets needed for intro (infinitely running player -> cat -> campfire + tent)
        this.player = this.add.sprite(game.config.width/2, game.config.height/2 - 50, 'player').setOrigin(0.5, 0.5).setScale(6);

        //animations
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
        this.anims.create({
            key: 'player_run',
            frames: this.anims.generateFrameNames('player_animations', {
                prefix: 'player_run',
                start: 1,
                end: 8,
                suffix: '',
                zeroPad: 4
            }),
            frameRate: 8,
            repeat: -1
        });
        this.player.play('player_idle');


        //start the intro
        this.playerSetup();
    }

    update() {
        //check what screen the player is on & if they need the text fields
        if (this.introIndex != 0 && this.introIndex != 3) {
            this.nameField.style = "display: none;";
            this.adjectiveField.style = "display: none;";
        } else {
            if (this.nameField.value != '' && this.adjectiveField.value != '')
                this.fieldsFilled = true;
            else
                this.fieldsFilled = false;
        }
        if (this.screenFinished && this.introIndex != 0 && this.introIndex != 3)
            this.next.setAlpha(1);
        else if ((this.introIndex == 3 || this.introIndex === 0) && this.screenFinished) {
            if (this.fieldsFilled)
                this.next.setAlpha(1);
            else
                this.next.setAlpha(0);
        }
    }

    screenHandler(index) {
        switch(index) {
            case 1:
                this.playerLore();
                break;
            case 2:
                this.playerLoreTwo();
                break;
            case 3:
                this.catSetup();
                break;
            case 4:
                this.catLore();
                break;
            case 5:
                this.story();
                break;
            case 6:
                this.storyTwo();
                break;
            default:
                break;
        } 
    }
    playerSetup() {
        this.next.setAlpha(0);
        this.typeText('Enter your name & an adjective to describe you');
        this.nameField.style = "display: ; position: absolute; top: 500px; left: 650px; height: 50px; font-size: 14pt;";
        this.adjectiveField.style = "display: ; position: absolute; top: 500px; left: 1050px; height: 50px; font-size: 14pt;";
    }

    playerLore() {
        this.next.setAlpha(0);
        this.player.play('player_run');
        this.typeText(`Here you are! ${playerName} the ${playerAdjective} Adventurer`);
    }

    playerLoreTwo() {
        this.next.setAlpha(0);
        this.typeText('Many great adventures built your past & many more await you in the future');
    }
    catSetup() {
        this.next.setAlpha(0);
        this.typeText('Enter your companions name & an adjective to describe them');
        this.nameField.style = "display: ; position: absolute; top: 500px; left: 650px; height: 50px; font-size: 14pt;";
        this.adjectiveField.style = "display: ; position: absolute; top: 500px; left: 1050px; height: 50px; font-size: 14pt;";
    }

    catLore() {
        this.next.setAlpha(0);
        this.typeText(`On your adventures you gained a ${catAdjective} companion whom you named ${catName}`);
    }

    story() {
        this.next.setAlpha(0);
        this.typeText(`One day your ${catAdjective} companion, ${catName}, ran off in pursuit of a rodent with no hint of stopping until it reaped its rewards`);
    }

    storyTwo() {
        this.next.setAlpha(0);
        this.typeText(`You chased & chased ${catName} until your legs gave out and you needed to take a rest.. This is the farthest you had ever traveled into the forest before`);
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

        //after pressing new game
            
        //after pressing finish
            //3 things
                //1: Show the player character running across the screen infinitely
                //2: type "Here you are! 'player name' the 'adjective' Adventurer. Many great adventures built your past & many more await you in the future"
                //3: next button (show after the text finishes typing out)
        //after pressing next button
            //3 things
                //1: enter your companions name
                //2: enter an adjective to describe your companion
                //3: finish button (Not clickable until both fields have an asnwer)
                    //(Gray = not clickable || White = clickable)
        //after pressing finish
            //3 things
                //1: replace the text with 'On your adventures you gained a great companion, 'cat name' the 'adjective'
                //2: replace the endlessly running player with a still image of the cat
                //3: next button (show after the text finishes typing out)
        //after pressing the next button
            //2 things
                //1: replace text with 'One day your great companion, 'cat name' the 'adjective', ran off in pursuit of a rodent with no hint of stopping until it reaped its rewards'
                //2: next button
        //after pressing the next button
            //3 things
                //1: replace cat image with the campfire and tent that kris made
                //2: replace text with 'You chased & chased 'cat name' the 'adjective' until your legs gave out and you needed to take a rest.. This is the farthest you had ever traveled into the forest before.'
                //3: play button (Goes to the actual game)
}