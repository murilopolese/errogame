$(document).ready(function() {
    var round = {
        speed: 5000,
        enemy: {
            amount: 10,
            speed: 2
        }
    };
    var score = 0;
    var angle = 0;
    var left = -Math.PI/2;
    var up = Math.PI;
    var down = 2*Math.PI;
    var right = Math.PI/2;
    var dirs = [up, down];
    var interval;
    
    Crafty.init(1024, 576);
    Crafty.canvas.init();
    Crafty.sprite(64, "img/game_64.png", {
        player: [0,4],
        enemy: [6,0],
        terrain1: [0,8],
        terrain2: [1,8],
        terrain3: [2,8],
        obstacle: [3,8]
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
                if((from.x > Crafty.viewport.width) || (from.x < 0) ||
                    (from.y < 0) || (from.y > (Crafty.viewport.height - 32)))
                    {
                    loser();
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
            return this;
        }
    })
    Crafty.c("Controls", {
        init: function() {
            this.requires('Multiway');
        },
        
        controls: function(speed) {
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
            angle = Math.atan2((e.realX-player.x),(e.realY-player.y));
        })
        .bind('Click',function(e) {
            if(!Crafty.isPaused()) {
                fire();
            }
        });
        generateWorld();
        Crafty.e("Score, DOM, 2D, Text")
        .attr({
            x: 20, 
            y: 20, 
            w: 100, 
            h: 20, 
            score: 0
        })
        .text(score);
        
        player = Crafty.e('2D, Canvas, player, Controls, Hero, Animate, Collision')
        .attr({
            x: 0, 
            y: 160, 
            z: 1
        })
        .bind('KeyDown', function(e) {
            if(e.keyCode === Crafty.keys.SPACE) {
                Crafty.pause();
                if(Crafty.isPaused()) {
                    roundPause();
                } else {
                    roundPlay();
                }
            }
        })
        .onHit('Enemy', function(e) {
            loser();
        })
        .bind('Moved', function(from) {
            if(this.hit('obstacle')){
                this.attr({
                    x: from.x, 
                    y:from.y
                });
            }
            if(this.y > (Crafty.viewport.height-64) || this.y < 0 || this.x > (Crafty.viewport.width-64) || this.x < 0) {
                this.attr({
                    x: from.x, 
                    y:from.y
                });
            }
        })
        .controls(3);
        generateEnemies(round.enemy.amount);
        roundPlay();
    })
    
    function generateWorld() {
        for(i = 0; i < 16; i++) {
            for(j = 0; j < 9; j++) {
                var t = Crafty.math.randomInt(1, 3);
                Crafty.e('2D, Canvas, terrain'+t)
                .attr({
                    x: i * 64, 
                    y: j * 64
                });
            }
        }
        generateObstacles();
    }
    
    function generateObstacles() {
        for(i = 0; i < 15; i++) {
            Crafty.e("2D, DOM, obstacle, Color, Collision")
            .color('rgb(0,0,0)')
            .attr({
                x: Crafty.math.randomInt(1, 10) * 64, 
                y: Crafty.math.randomInt(1, 7) * 64,
                w: 60,
                h: 60
            });
        }
    }
    
    function generateEnemies(n) {
        n= 1;
        if(n > 0) {
            for(i = 0; i < n; i++) {
                var enemy = Crafty.e('2D, Canvas, enemy, Enemy, Animate, Collision')
                .attr({
                    x: Crafty.viewport.width-(Crafty.math.randomInt(0, 4)*64), 
                    y: Crafty.math.randomInt(0, 9) * 64, 
                    z: 1,
                    da: -Math.PI/2,
                    interval: null
                })
                .bind('EnterFrame', function () {
                    
                    if(this.hit('obstacle')){
                        if(this.da == left) {
                            this.da = dirs[Crafty.math.randomInt(0, 1)];
                            this.x += 1;
                            this.y += round.enemy.speed*Math.cos(this.da);
                        }
                    } else {
                        this.da = left;
                    }
                    
//                    if(this.y > (Crafty.viewport.height-64) || this.y < 0 || this.x > (Crafty.viewport.width-64)) {
//                        this.da = Crafty.math.randomInt(-4,0)*Math.PI/2;
//                    }
                    if(this.x < 0) {
                        refreshScore(-100);
                        this.destroy();
                    }
                    
                    this.x += round.enemy.speed*Math.sin(this.da);
                    this.y += round.enemy.speed*Math.cos(this.da);
                    
                })
            }
        }
    }
    
    function loser() {
        clearInterval(interval);
        refreshScore(-1000)
        Crafty.scene('main');
    }
    
    function fire() {
        //        console.log('Blast!');
        Crafty.e("2D, DOM, Color, Collision")
        .color('rgb(180,60,56)')
        .attr({
            x: player.x, 
            y: player.y+10, 
            w: 16, 
            h: 16, 
            dX: 10*Math.sin(angle), 
            dY: 10*Math.cos(angle)
        })
        .bind('EnterFrame', function () {
            this.x += this.dX;
            this.y += this.dY;
            if(this.hit('obstacle')) {
                this.destroy();
            }
            if(this._x > Crafty.viewport.width || this._x < 0 || this._y > Crafty.viewport.height || this._y < 0) {
                this.destroy();
                refreshScore(-10)
            }
        })
        .onHit('Enemy', function (e) {
            e[0].obj.destroy(); // Destrói o inimigo
            this.destroy(); // Destrói a bala
            refreshScore(100);
        })
    }
    
    function roundPlay() {
        interval = setInterval(function() {
            generateEnemies(round.enemy.amount);
            round.enemy.amount++;
            round.enemy.speed+=0.05;
            round.speed+=500;
        }, round.speed);
    }
    function roundPause() {
        clearInterval(interval);
    }
    function refreshScore(s) {
        score += s;
        Crafty("Score").each(function () { 
            this.text(score)
        });
    }

});