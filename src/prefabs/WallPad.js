class WallPad extends Phaser.Physics.Matter.Image {
    constructor(scene, x, y, texture, resetTime, gate, rock) {
        super(scene.matter.world, x, y, texture);
        scene.add.existing(this);
        this.resetTime = resetTime;
        
        this.gate = gate;
        
        this.rock = rock;
        this.rockX = rock.x;
        this.rockY = rock.y;
        

        this.body.isStatic = true;    //immovable
        this.setCollisionCategory(0); //prevent collision (will do with matter.overlap) https://photonstorm.github.io/phaser3-docs/Phaser.Physics.Matter.MatterPhysics.html#overlap__anchor
        this.functional = true;
        this.rocks = 1;

        //image to replace current one after player pushes wallPad
        this.pushedWallPad = this.scene.add.image(x, y, 'pressedWallPad');
        this.pushedWallPad.setAlpha(0);
        if (x > 400)
            this.pushedWallPad.flipX = true;

    }

    update() {
        if (this.functional)
            this.scene.matter.overlap(this, this.scene.player, this.OpenGate, null, this);
    }
    //when player overlaps with the wallPad
        //replace image & make it so that the player cant activate it again
        //open corresponding Gate
            //set alpha to 0
            //change image from gateFive -> gateFiveOpen
                //after rock drops change image back
                //add another rock for next activation
        //after rock hits the ground
            //this.setAlpha(1);
            //this.functional = true;
            //this.pushedWallPad.setAlpha(0);
    OpenGate() {
        //change sprite for button/hide gate holding rock/turn on gravity for rock
        this.alpha = 0;
        this.functional = false;
        this.pushedWallPad.alpha = 1;
        this.scene.clock = this.scene.time.delayedCall(1000, () => {
            this.gate.alpha = 0;
            this.gate.setCollisionCategory(0);
            this.rock.setIgnoreGravity(false);

            //when rock hits something it thuds, despawns, deal damage to player/boss if it hits them, show gate again, & spawn another rcok
            this.rock.setOnCollideActive(pair => {
                this.rocks--;
                if (this.rocks === 0) {
                    //scene.thud.play();
                    this.rock.alpha = 0;
                    this.rock.body.enable = false;
                    this.rock.setVelocity(0);
                    this.rock.x = 1000;
                    this.rock.y = 1000;
                    if (pair.bodyB.collisionFilter.group == 2) {
                        this.scene.beetle.isStunned = true;
                    }
                    //wait 1 second to show gate again
                    this.scene.clock = this.scene.time.delayedCall(1000, () => {
                        this.gate.setAlpha(1);
                    }, null, this);
                    //wait 3 seconds to spawn new rock
                    this.scene.clock = this.scene.time.delayedCall(3000, () => {
                        this.rock.setVelocity(0);
                        this.rock.body.enable = true;
                        this.rock.setIgnoreGravity(true);
                        this.rock.x = this.rockX + 8;
                        this.rock.y = this.rockY - 8;
                        this.rock.alpha = 1;
                        this.rocks = 1;
                    }, null, this);
                    //wait 5 seconds before button comes back
                    this.scene.clock = this.scene.time.delayedCall(5000, () => {
                        this.alpha = 1;
                        this.functional = true;
                        this.pushedWallPad.alpha = 0;
                    }, null, this);
                }
            }, null, this);    
        });

    }
}