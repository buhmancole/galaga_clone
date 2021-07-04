// This file contains the functionality for the main menu (non-canvas) stuff

MyGame.menu = (function(game) {
    'use strict';
    let timeout = null;
    let scores = [];
    let controls = {
        shoot: ' ',
        left: 'ArrowLeft',
        right: 'ArrowRight'
    }
    
    function showScreen(id, auto = false) {
        for (let x of document.getElementsByClassName('active')) {
            x.classList.remove('active');
        }
        if (!auto && timeout != null) clearTimeout(timeout);
        if (id == 'mainmenu') {
            game.stop();
            localStorage['scores'] = JSON.stringify(scores);
            timeout = setTimeout(function() {
                document.addEventListener('keydown', e => {
                    showScreen('mainmenu');
                }, {once: true});
                showScreen('game', true);
            }, 10000);
        }
        if (id == 'game') {
            game.initialize(controls, scores, auto);
        }
        if (id == 'highscores') {
            updateScores();
        }
        document.getElementById(id).classList.add('active');
    }

    function updateKey(id) {
        let button = document.getElementById(id);
        button.style.background = '#ee82ee';
        button.addEventListener('keydown', function(event) {  
            button.textContent = event.key;
            controls[id] = event.key;
            button.style.background = 'whitesmoke';
            localStorage['controls'] = JSON.stringify(controls);
        }, {once: true});
    }

    function updateScores() {
        let ele = document.getElementById('scores');
        ele.innerHTML = '';
        for (let x of scores) {
            let span = document.createElement('span');
            span.style.marginTop = '5px';
            span.textContent = '' + x;
            ele.append(span);
        }
    }

    function initialize() {
        // set up main menu navigation
        let navIds = ['game', 'highscores', 'howto', 'credits'];
        for (let id of navIds) {
            document.getElementById('nav' + id).onclick = () => showScreen(id);
        }

        // get scores/controls from storage and update the interface
        let scoreItem = localStorage.getItem('scores');
        if (scoreItem !== null) {
            scores = JSON.parse(scoreItem);
            updateScores();
        }
        let controlItem = localStorage.getItem('controls');
        if (controlItem !== null) {
            controls = JSON.parse(controlItem);
        }
        let ctrlIds = ['shoot', 'left', 'right'];
        for (let id of ctrlIds) {
            let ele = document.getElementById(id);
            ele.onclick = () => updateKey(id);
            ele.textContent = controls[id];
        }

        // add escape key functionality and show the menu
        document.addEventListener('keydown', e => {
            if (e.key == 'Escape') {
                showScreen('mainmenu');
            }
        });
        showScreen('mainmenu');
    }

    return {
        initialize: initialize
    }
}(MyGame.game));
