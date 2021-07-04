// This file contains all render functionality

MyGame.renderer = (function() {
    'use strict';
    let canvas = document.getElementById('canvas');
    let context = canvas.getContext('2d');

    function drawTexture(image, center, rotation, size) {
        context.save();
        context.translate(center.x, center.y);
        context.rotate(rotation);
        context.translate(-center.x, -center.y);

        context.drawImage(image, center.x - size.x / 2, center.y - size.y / 2, size.x, size.y);
        context.restore();
    }

    function renderPlayer(game) {
        if (!game.over) {
            for (let bullet of game.player.bullets) {
                bullet.draw(context);
            }
        }
        game.player.draw(context);
    }

    function renderEnemies(game) {
        if (!game.over) {
            for (let enemy of game.enemies) {
                enemy.draw(context);
                for (let bullet of enemy.bullets) {
                    bullet.draw(context);
                }
            }
        }
    }

    function renderText(text, size, y) {
        context.font = '' + size + 'px arial';
        let x = canvas.width/2 - context.measureText(text).width/2;
        context.fillStyle = 'rgb(255, 255, 255)';
        context.fillText(text, x, y);
    }

    function renderParticle(ps, assets) {
        Object.getOwnPropertyNames(ps.particles).forEach( function(value) {
            let particle = ps.particles[value];
            context.save();

            context.translate(particle.center.x, particle.center.y);
            context.rotate(particle.rotation);
            context.translate(-particle.center.x, -particle.center.y);

            context.drawImage(assets['fire'],
                particle.center.x - particle.size.x / 2,
                particle.center.y - particle.size.y / 2,
                particle.size.x, particle.size.y);

            context.restore();
        });
    }

    function renderStatus(game, assets) {
        for (let i = 1; i < game.player.lives; ++i) {
            context.drawImage(assets['player'], i*40 - 35, canvas.height - 40, 35, 35);
        }
        renderText('Score: ' + game.score, 20, 30);
        if (game.over) {
            renderText('Game Over', 40, 300);
            renderText('Score: ' + game.score, 20, 330);
            renderText('Shots: ' + game.player.shots, 20, 358);
            renderText('Hits: ' + game.player.hits, 20, 386);
            renderText('Ratio: ' + (game.player.hits / game.player.shots).toFixed(2), 20, 414);
        }
        if (game.paused > 0) {
            if (game.player.enabled) {
                renderText('Level Complete', 20, 400);
            } else {
                renderText('You Died', 20, 400);
            }
        }
    }

    function render(game, ps, assets) {
        context.clearRect(0, 0, canvas.width, canvas.height);
        context.drawImage(assets['background'], 0, 0, canvas.width, canvas.height);
        renderPlayer(game);
        renderEnemies(game);
        renderParticle(ps, assets);
        renderStatus(game, assets);
    }
    
    return {
        render: render,
        drawTexture: drawTexture
    };
}());
