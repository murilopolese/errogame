$(document).ready(function() {
    Crafty.init(800, 576);
    Crafty.canvas.init();
    
    //turn the sprite map into usable components
    Crafty.sprite(32, "img/game_32.png", {
        player: [0,0],
        terrain: [0,8]
    });
    
    Crafty.scene('loading', function() {
        Crafty.load(['img/game_32.png'], function () {
            Crafty.scene('main'); //when everything is loaded, run the main scene
        });
        //black background with some loading text
        Crafty.background('#000');
        Crafty.e('2D, DOM, Text').attr({
            w: 100, 
            h: 20, 
            x: 150, 
            y: 120
        })
        .text('Loading')
        .css({
            'text-align': 'center',
            'color': '#FFF'
        });
       
    });
    Crafty.scene('loading');
    
    Crafty.scene('main', function() {
        generateWorld();
        Crafty.e('2D, Canvas, player')
        .attr({
            x: 400, 
            y: 200
        })
    })
    
    function generateWorld() {
        for(i = 0; i < 25; i++) {
            for(j = 0; j < 18; j++) {
                Crafty.e('2D, Canvas, terrain')
                .attr({
                    x: i * 32, 
                    y: j * 32
                });
            }
        }
    }
    
});