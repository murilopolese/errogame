$(document).ready(function() {
    Crafty.init(800, 576);
    Crafty.canvas.init();
    Crafty.sprite(32, "img/game_32.png", {
        player: [0,4],
        enemy1: [6,0],
        terrain: [0,8]
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
        generateWorld();
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
                .animate("walk_right", [[6,2], [7,2], [8,2]])
                .animate("walk_up", [[6,3], [7,3], [8,3]])
                .animate("walk_down", [[6,0], [7,0], [8,0]])
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
                    UP_ARROW: -90, 
                    DOWN_ARROW: 90, 
                    RIGHT_ARROW: 0, 
                    LEFT_ARROW: 180
                })
                return this;
            }
        });
        Crafty.c("EnemyControls", {
            init: function() {
                this.requires('Multiway');
            },

            enemyControls: function(speed) {
                this.multiway(speed, {
                    W: -90, 
                    S: 90, 
                    D: 0, 
                    A: 180
                })
                return this;
            }
        });
        player = Crafty.e('2D, Canvas, player, RightControls, Hero, Animate, Collision')
        .attr({
            x: 160, 
            y: 160, 
            z: 1
        })
        .rightControls(2);
        generateEnemies(1);
        var interval = setInterval(function() {
            generateEnemies(1);
        }, 20000);
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
                var enemy = Crafty.e('2D, Canvas, enemy1, EnemyControls, Enemy, Animate, Collision')
                .attr({
                    x: 100, 
                    y: 32, 
                    z: 1
                })
                .enemyControls(1);
            }
        }
    }
    
});