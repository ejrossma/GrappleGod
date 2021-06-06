class Beetle extends Phaser.Physics.Matter.Sprite {
    constructor(scene, x, y, velocity, texture){
        super(scene.matter.world, x, y, texture);
        scene.add.existing(this);


    }


}

// state classes
class GroundPoundState extends State
{
    enter (scene, player, beetle)
    {
        
    }

    execute(scene, player, beetle)
    {

        //--------------------------------------------------------------------
        
        if (left.isDown || right.isDown || space.isDown)
        {
            this.stateMachine.transition('move');
            return;
        }

        if (keyQ.isDown && player.grappleAgain)
        {
            this.stateMachine.transition('checkGrapple');
            return;
        }

        if (down.isDown && !player.isGrounded && player.canKick)
        {
            this.stateMachine.transition('kick');
            return;
        }

        //--------------------------------------------------------------------

        
    }
}

class ChargeState extends State
{
    execute(scene, player, beetle)
    {

        //--------------------------------------------------------------------

        if (!left.isDown && !right.isDown && !space.isDown && player.isGrounded)
        {
            this.stateMachine.transition('idle');
            return;
        }

        if (keyQ.isDown && player.grappleAgain)
        {
            this.stateMachine.transition('checkGrapple');
            return;
        }

        if (down.isDown && !player.isGrounded && player.canKick)
        {
            this.stateMachine.transition('kick');
            return;
        }

        //--------------------------------------------------------------------

        
    }
}

class SearchState extends State
{
    execute(scene, playe, beetle)
    {

        //--------------------------------------------------------------------

        if (player.grappleFailed == 0 && player.finishedGrappling)
        {
            this.stateMachine.transition('idle');
            return;
        }

        if (player.grappleFailed == 1 && player.finishedGrappling)
        {
            this.stateMachine.transition('grappled');
            return;
        }

        if (player.grappleFailed == 0 && !player.finishedGrappling)
        {
            this.stateMachine.transition('falling');
            return;
        }
        
        if (player.grappleFailed == 1 && !player.finishedGrappling)
        {
            this.stateMachine.transition('grappled');
            return;
        }

        //--------------------------------------------------------------------

        
    }
}

class StunnedState extends State
{
    execute(scene, player, beetle)
    {

        //--------------------------------------------------------------------

        if (!player.isGrappling)
        {
            this.stateMachine.transition('falling');
            return;
        }

        //--------------------------------------------------------------------

        
    }
}