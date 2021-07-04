// this file contains the main game code

MyGame.game = (function (systems, renderer, assets, input) {
    'use strict';
    let previousTime = performance.now();
    let keyboard = input.Keyboard();
    let game = null;
    let scores = [];
    let cancelRequest = false;
    let ps = systems.ParticleSystem();

    function stop() {
        cancelRequest = true;
    }

    function processInput(elapsedTime) {
        keyboard.update(elapsedTime);
    }
    
    function update(elapsedTime) {
        game.update(elapsedTime);
        ps.update(elapsedTime);
    }
    
    function render(elapsedTime) {
        renderer.render(game, ps, assets);
    }

    function gameLoop(time) {
        let elapsedTime = (time - previousTime);
        previousTime = time;

        processInput(elapsedTime);
        update(elapsedTime);
        render(elapsedTime);
        
        if (!cancelRequest) requestAnimationFrame(gameLoop);
    };
    
    function initialize(controls, scores, auto) {
        cancelRequest = false;
        previousTime = performance.now();
        game = new GameModel(keyboard, controls, scores, ps, assets, auto);
        requestAnimationFrame(gameLoop);
    }

    return {
        scores: scores,
        stop: stop,
        initialize: initialize
    };
}(MyGame.systems, MyGame.renderer, MyGame.assets, MyGame.input));
