$(document).ready(function() {
    var round = 1;
    Crafty.init(800, 576);
    Crafty.canvas.init();
    Crafty.sprite(32, "img/game_32.png", {
        player: [0,4],
        enemy1: [6,0],
        terrain: [0,8]
    });
    Crafty.c('Hero', {
        init:  function() {
            this.requires("SpriteAnimation, Collision")
            .animate("walk_left", [[0,5], [1,5], [2,5]])
            .animate("walk_right", [[0,6], [1,6], [2,6]])
            .animate("walk_up", [[0,7], [1,7], [2,7]])
            .animate("walk_down", [[0,4], [1,4], [2,4]])
            .bind("NewDirection",
                function (direction) {
                    if (direction.x < 0) {
                        if (!this.isPlaying("walk_left"))
                            this.stop().animate("walk_left", 10, -1);
                    }
                    if (direction.x > 0) {
                        if (!this.isPlaying("walk_right"))
                            this.stop().animate("walk_right", 10, -1);
                    }
                    if (direction.y < 0) {
                        if (!this.isPlaying("walk_up"))
                            this.stop().animate("walk_up", 10, -1);
                    }
                    if (direction.y > 0) {
                        if (!this.isPlaying("walk_down"))
                            this.stop().animate("walk_down", 10, -1);
                    }
                    if(!direction.x && !direction.y) {
                        this.stop();
                    }
                })
            .bind('Moved', function(from) {
                if(this.hit('solid')){
                    this.attr({
                        x: from.x, 
                        y:from.y
                    });
                }
            });
            return this;
        }
    });
    Crafty.c('Enemy', {
        init: function() {
            this.requires("SpriteAnimation, Collision")
            .animate("walk_left", [[6,1], [7,1], [8,1]])
            .animate("walk_left", 3, -1)
//            .animate("walk_right", [[6,2], [7,2], [8,2]])
//            .animate("walk_up", [[6,3], [7,3], [8,3]])
//            .animate("walk_down", [[6,0], [7,0], [8,0]])
            .bind("NewDirection",
                function (direction) {
                    if (direction.x < 0) {
                        if (!this.isPlaying("walk_left"))
                            this.stop().animate("walk_left", 10, -1);
                    }
                    if (direction.x > 0) {
                        if (!this.isPlaying("walk_right"))
                            this.stop().animate("walk_right", 10, -1);
                    }
                    if (direction.y < 0) {
                        if (!this.isPlaying("walk_up"))
                            this.stop().animate("walk_up", 10, -1);
                    }
                    if (direction.y > 0) {
                        if (!this.isPlaying("walk_down"))
                            this.stop().animate("walk_down", 10, -1);
                    }
                    if(!direction.x && !direction.y) {
                        this.stop();
                    }
                })
            .bind('Moved', function(from) {
                if(this.hit('solid')){
                    this.attr({
                        x: from.x, 
                        y:from.y
                    });
                }
            });
            return this;
        }
    })
    Crafty.c("RightControls", {
        init: function() {
            this.requires('Multiway');
        },

        rightControls: function(speed) {
            this.multiway(speed, {
                W: -90, 
                S: 90, 
                D: 0, 
                A: 180
            })
            return this;
        }
    });
    
    Crafty.scene('loading', function() {
        Crafty.load(['img/game_32.png'], function () {
            Crafty.scene('main'); //when everything is loaded, run the main scene
        });
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
        Crafty.e("2D,Canvas,Color,Mouse").attr({
            w:Crafty.viewport.width,
            h:Crafty.viewport.height,
            x:0,
            y:0
        })
        .bind('MouseMove',function(e){
            
            })
        .bind('Click',function(e) {
            console.log(e);
        });
        generateWorld();
        
        
        player = Crafty.e('2D, Canvas, player, RightControls, Hero, Animate, Collision')
        .attr({
            x: 160, 
            y: 160, 
            z: 1
        })
        .bind('KeyDown', function(e) {
            if(e.keyCode === Crafty.keys.SPACE) {
                console.log('Blast!');
                Crafty.e("2D, DOM, Color, Collision")
                .color('rgb(0,0,0)')
                .attr({
                    x: this._x, 
                    y: this._y+10, 
                    w: 4, 
                    h: 4, 
                    dX: 10, 
                    dY: 0
                })
                .bind('EnterFrame', function () {
                    this.x += this.dX;
                    this.y += this.dY;
                    if(this._x > Crafty.viewport.width || this._x < 0 || this._y > Crafty.viewport.height || this._y < 0) {
                        this.destroy();
                        console.log('removeu o bullet')
                    }
                })
                .onHit('Enemy', function (e) {
                    console.log(e);
                    e[0].obj.destroy(); // Destrói o inimigo
                    this.destroy(); // Destrói a bala
                })
            }
        })
        .onHit('Enemy', function(e) {
            clearInterval(interval);
            Crafty.scene('main');
        })
        .rightControls(3);
        
        
        generateEnemies(1);
        interval = setInterval(function() {
            round += 0.01;
            generateEnemies(Math.floor(round));
        }, 1000);
        
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
    
    function generateEnemies(n) {
        if(n > 0) {
            for(i = 0; i < n; i++) {
                var enemy = Crafty.e('2D, Canvas, enemy1, Enemy, Animate, Collision')
                .attr({
                    x: parseInt(Crafty.viewport.width)-40, 
                    y: Crafty.math.randomInt(0, Crafty.viewport.height), 
                    z: 1,
                    dX: -2,
                    dY: 0
                })
                .bind('EnterFrame', function () {
                    this.y += this.dY;
                    this.x += this.dX;
                    if(this._x > Crafty.viewport.width || this._x < 0 || this._y > Crafty.viewport.height || this._y < 0) {
                        this.destroy();
                        console.log('removeu o inimigo')
                    }
                });
            }
        }
    }
    
});