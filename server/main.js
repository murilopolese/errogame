Meteor.startup(function() {
    Game.remove({});
    Game.insert({
        speed: 5000,
        enemy: {
            amount: 10,
            speed: 2
        }
    });
})