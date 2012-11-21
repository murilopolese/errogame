var round = {
    speed: 5000,
    enemy: {
        amount: 10,
        speed: 2
    }
};
var score = 0;
var angle = 0;
var interval;

Meteor.startup(function() {
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
        
        player = Crafty.e('2D, Canvas, player, RightControls, Hero, Animate, Collision')
        .attr({
            x: 160, 
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
        .rightControls(3);
        
        
        generateEnemies(round.enemy.amount);
        roundPlay();
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
                    z: 1
                })
                .bind('EnterFrame', function () {
                    var da = Math.atan2((player.x-this.x),(player.y-this.y));
                    this.x += round.enemy.speed*Math.sin(da);
                    this.y += round.enemy.speed*Math.cos(da);
                    if(this._x > Crafty.viewport.width || this._x < 0 || this._y > Crafty.viewport.height || this._y < 0) {
                        this.destroy();
                        refreshScore(-100);
                    }
                })
                .onHit('Enemy', function(e) {
                    if(e.length == 2) {
                        e[0].obj.x += 1;
                        e[1].obj.x -= 1;
                    }
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
        .color('rgb(0,0,0)')
        .attr({
            x: player.x, 
            y: player.y+10, 
            w: 4, 
            h: 4, 
            dX: 10*Math.sin(angle), 
            dY: 10*Math.cos(angle)
        })
        .bind('EnterFrame', function () {
            this.x += this.dX;
            this.y += this.dY;
            if(this._x > Crafty.viewport.width || this._x < 0 || this._y > Crafty.viewport.height || this._y < 0) {
                this.destroy();
                refreshScore(-10)
            }
        })
        .onHit('Enemy', function (e) {
            refreshScore(100);
            e[0].obj.destroy(); // Destrói o inimigo
            this.destroy(); // Destrói a bala
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
})