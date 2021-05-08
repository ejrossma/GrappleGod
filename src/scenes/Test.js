class Test extends Phaser.Scene {
    constructor() {
        super("testScene");
    }

    create(){
        //Set keys 
        keyLEFT = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.LEFT);
        keyRIGHT = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.RIGHT);
        //set bound walls around screen
        let poly = this.matter.add.rectangle(game.config.width / 2, game.config.height / 4, 22, 22, {
            isStatic:true
        });
        //create temp object
        this.hero = this.matter.add.rectangle(game.config.width / 3, game.config.height / 3, 10, 10, {
            restitution: 0.5
        });
        this.rope = this.matter.add.constraint(this.hero, poly, 50, 0);
        this.matter.setVelocityY(this.hero, 500);
        this.matter.setVelocityX(this.hero, 500);
    }
    update(){
        if(keyRIGHT.isDown){
            this.matter.applyForceFromAngle(this.hero, 0.00005, 0);
        }
        if(keyLEFT.isDown){
            this.matter.applyForceFromAngle(this.hero, 0.00005, 180);
        }
    }
}