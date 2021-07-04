// This file contains the input object used to create keybinds

MyGame.input = (function() {
    'use strict';
    function Keyboard() {
        let that = {
            keys: {},
            handlers: {}
        };

        function keyPress(e) {
            that.keys[e.key] = e.timeStamp;
        }
        function keyRelease(e) {
            delete that.keys[e.key];
        }

        that.registerCommand = function(key, handler) {
            that.handlers[key] = handler;
        };
        that.update = function(elapsedTime) {
            for (let key in that.keys) {
                if (that.keys.hasOwnProperty(key)) {
                    if (that.handlers[key]) {
                        that.handlers[key](elapsedTime);
                    }
                }
            }
        };

        window.addEventListener('keydown', keyPress);
        window.addEventListener('keyup', keyRelease);
        
        return that;
    }

    return {
        Keyboard: Keyboard
    };
}());
