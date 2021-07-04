MyGame = {
    systems: {},
    render: {},
    assets: {}
};

MyGame.loader = (function() {
    'use strict';
    let scriptOrder = [{
            scripts: ['player', 'enemy', 'bullet', 'input', 'particles'],
            message: 'Basic scripts loaded',
            onComplete: null
        }, {
            scripts: ['gamemodel', 'render'],
            message: 'Game system loaded',
            onComplete: null
        }, {
            scripts: ['game'],
            message: 'Game loop loaded',
            onComplete: null
        }, {
            scripts: ['menu'],
            message: 'Menu system loaded',
            onComplete: null
        }
    ];

    let assetOrder = [{
            key: 'player',
            source: '/assets/player.png'
        }, {
            key: 'background',
            source: '/assets/background.png'
        }, {
            key: 'bee',
            source: '/assets/bee.png'
        }, {
            key: 'butterfly',
            source: '/assets/butterfly.png'
        }, {
            key: 'boss',
            source: '/assets/boss.png'
        }, {
            key: 'dragonfly',
            source: '/assets/dragonfly.png'
        }, {
            key: 'satellite',
            source: '/assets/satellite.png'
        }, {
            key: 'enterprise',
            source: '/assets/enterprise.png'
        }, {
            key: 'bullet',
            source: '/assets/bullet.png'
        }, {
            key: 'fire',
            source: '/assets/fire.png'
        }, {
            key: 'laser',
            source: '/assets/laser.ogg'
        }, {
            key: 'laser2',
            source: '/assets/laser2.ogg'
        }, {
            key: 'explosion',
            source: '/assets/explosion.ogg'
        }, {
            key: 'explosion2',
            source: '/assets/explosion2.ogg'
        }
    ];
    
    // loads scripts in order
    function loadScripts(scripts, onComplete) {
        if (scripts.length > 0) {
            let entry = scripts.shift();
            require(entry.scripts, function() {
                console.log(entry.message);
                if (entry.onComplete) {
                    entry.onComplete();
                }
                loadScripts(scripts, onComplete);
            });
        } else {
            onComplete();
        }
    }

    // load assets in order
    function loadAssets(assets, onSuccess, onError, onComplete) {
        if (assets.length > 0) {
            let entry = assets.shift();
            loadAsset(entry.source,
                function(asset) {
                    onSuccess(entry, asset);
                    loadAssets(assets, onSuccess, onError, onComplete);
                },
                function(error) {
                    onError(error);
                    loadAssets(assets, onSuccess, onError, onComplete);
                });
        } else {
            onComplete();
        }
    }

    // asyncronously loads image/audio
    function loadAsset(source, onSuccess, onError) {
        let xhr = new XMLHttpRequest();
        let fileExtension = source.substring(source.lastIndexOf('.') + 1);

        if (fileExtension) {
            xhr.open('GET', source, true);
            xhr.responseType = 'blob';

            xhr.onload = function() {
                let asset = null;
                if (xhr.status === 200) {
                    if (fileExtension === 'png' || fileExtension === 'jpg') {
                        asset = new Image();
                    } else if (fileExtension === 'mp3' || fileExtension === 'ogg') {
                        asset = new Audio();
                    } else {
                        if (onError) { onError('Unknown file extension: ' + fileExtension); }
                    }
                    asset.onload = function() {
                        window.URL.revokeObjectURL(asset.src);
                    };
                    asset.src = window.URL.createObjectURL(xhr.response);
                    if (onSuccess) { onSuccess(asset); }
                } else {
                    if (onError) { onError('Failed to retrieve: ' + source); }
                }
            };
        } else {
            if (onError) { onError('Unknown file extension: ' + fileExtension); }
        }

        xhr.send();
    }
    
    // start game
    function mainComplete() {
        console.log('Everything was loaded');
        MyGame.menu.initialize();
    }
    
    // load assets then scripts
    console.log('Starting to dynamically load project assets');
    loadAssets(assetOrder,
        function(source, asset) {
            MyGame.assets[source.key] = asset;
        },
        function(error) {
            console.log(error);
        },
        function() {
            console.log('All game assets loaded');
            console.log('Starting to dynamically load project scripts');
            loadScripts(scriptOrder, mainComplete);
        }
    );

}());
