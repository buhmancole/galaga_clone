// This file contains the lander object, which the player controls

let GameModel = function(keyboard, controls, scores, ps, assets, auto) {
    let that = {};
    let coordW = document.getElementById('canvas').width;
    let coordH = document.getElementById('canvas').height;
    
    that.player = new Player(assets, auto);
    that.enemies = [];
    that.gameTime = 0;
    that.lastTime = 0;
    that.level = 0;
    that.score = 0;
    that.paused = 0;
    that.enemyNum = 0;
    that.over = false;
    
    let specs = [];
    let patterns = [
        [[.55, 0], [[[.2, .45], [.5, .2]], [[.25, .6], [.1, .525]], [[.42, .47], [.35, .6]]]],
        [[0, .85], [[[.42, .67], [.15, .8]], [[.3, .55], [.5, .5]], [[.42, .67], [.25, .7]]]],
        [[.45, 0], [[[.65, .77], [.4, .5]], [[.85, .8], [.7, .85]], [[.8, .65], [.9, .7]], [[0, .4], [0, .4]]]],
        [[0, .85], [[[.62, .65], [.35, .87]], [[.58, .35], [.7, .45]], [[.58, .65], [.45, .45]], [[1, .25], [1, .25]]]]
    ]
    let enemySets = [[{
            form: [34, 14, 35, 15, 44, 24, 45, 25],
            type: '1bee,butterfly' // enemy type (#:mirrored, $:pairs)
        }, {
            form: [3, 13, 4, 23, 5, 16, 6, 26],
            type: '0boss,butterfly'
        }, {
            form: [18, 17, 28, 27, 11, 12, 21, 22],
            type: '0butterfly'
        }, {
            form: [37, 36, 47, 46, 32, 33, 42, 43],
            type: '0bee'
        }, {
            form: [30, 31, 40, 41, 38, 39, 48, 49],
            type: '0bee'
        }], [{
            form: [14, 34, 15, 35, 24, 44, 25, 45],
            type: '1butterfly,bee'
        }, {
            form: [13, 3, 23, 4, 16, 5, 26, 6],
            type: '2butterfly,boss'
        }, {
            form: [18, 17, 28, 27, 11, 12, 21, 22],
            type: '2butterfly'
        }, {
            form: [37, 36, 47, 46, 32, 33, 42, 43],
            type: '2bee'
        }, {
            form: [30, 31, 40, 41, 38, 39, 48, 49],
            type: '2bee'
        }], [{
            type: '1bee'
        }, {
            type: '0boss,bee'
        }, {
            type: '0bee,dragonfly'
        }, {
            type: '0bee,satellite'
        }, {
            type: '0bee,enterprise'
        }]
    ];
    let scoreTable = {
        'bee': [50, 100],
        'butterfly': [80, 160],
        'boss': [150, 400],
        'dragonfly': [200],
        'satellite': [200],
        'enterprise': [200]
    }

    keyboard.registerCommand(controls.shoot, that.player.shoot);
    keyboard.registerCommand(controls.left, that.player.moveLeft);
    keyboard.registerCommand(controls.right, that.player.moveRight);
    
    function pattReverse(patt) {
        let arr = [[1-patt[0][0], patt[0][1]], []];
        for (let x of patt[1]) {
            arr[1].push([[1-x[0][0], x[0][1]], [1-x[1][0], x[1][1]]]);
        }
        return arr;
    }
    function getPattern(i) {
        let patternNum = 0;
        if (i == 1 || i == 2) {
            patternNum += 1;
        }
        if (that.level % 3 == 2) {
            patternNum += 2;
        }
        return (i == 2 || i == 4 ? pattReverse(patterns[patternNum]) : patterns[patternNum]);
    }
    that.getCurveCoords = function(pos1, pos2, ctrl, percent) {
        let x = Math.pow(1-percent,2) * pos1[0] + 2 * (1-percent) * percent * ctrl[0] + Math.pow(percent,2) * pos2[0]; 
        let y = Math.pow(1-percent,2) * pos1[1] + 2 * (1-percent) * percent * ctrl[1] + Math.pow(percent,2) * pos2[1]; 
        return([x, y]);
    }
    that.genCurve = function(first, arr) {
        let patt = [];
        for (let i in arr) {
            let curve = arr[i];
            let prev = first;
            if (i > 0) {
                prev = arr[i-1][0];
            }
            for (let j = 0; j < 6; ++j) {
                let temp = that.getCurveCoords(prev, curve[0], curve[1], (j+1)/6);
                temp[0] *= coordW;
                temp[1] *= coordH;
                patt.push(temp);
            }
        }
        return patt;
    }
    that.randCurve = function() {
        let offset = Math.random() * .8 + .1;
        let start = [offset, .3];
        let curve = [[[0, .5], [.1, .4]], [[0,.7], [-.1, .6]], [[0, .9], [.1, .8]], [[0, 1.1], [-.1, 1]]];
        for (let x of curve) {
            x[0][0] += offset;
            x[1][0] += offset;
        }
        return that.genCurve(start, curve);
    }
    that.testDistance = function (e1, e2) {
        let xdiff = e1.center.x - e2.center.x;
        let ydiff = e1.center.y - e2.center.y;
        return xdiff*xdiff + ydiff*ydiff;
    }
    that.testCollision = function(e1, e2) {
        let xdiff = e1.center.x - e2.center.x;
        let ydiff = e1.center.y - e2.center.y;
        let rad = e1.radius + e2.radius;
        return (xdiff*xdiff + ydiff*ydiff) < rad*rad;
    }

    that.makeSpecs = function(sets) {
        for (let i in sets) {
            let arr = sets[i];
            let alt = parseInt(arr.type[0]);
            let img = arr.type.substring(1);
            let curve = getPattern(i);
            let start = curve[0];
            let patt = that.genCurve(start, curve[1]);
            patt.push(0);
            for (let j = 0; j < 8; ++j) {
                let spec = {
                    image: assets[(img.includes(',') ? img.split(',')[j%2] : img)],
                    center: { x: coordW*start[0], y: coordH*start[1] },
                    formId: (arr.form == null ? null : arr.form[j]),
                    formTime: 1000 + 3000*i + (alt == 2 ? Math.floor(j/2) : j)*80,
                    pattern: patt.concat(that.randCurve()),
                    alt: (j%2 ? alt : 0),
                    toShoot: (that.level == 1 && Math.random() < .5)
                }
                specs.push(spec);
            }
        }
    }
    that.makeSpecs(enemySets[0]);

    that.destroyPlayer = function() {
        ps.emitExplode(20, that.player.center);
        that.player.enabled = false;
        that.player.shown = false;
        that.player.bullets = [];
        that.player.center.x = coordW/2;
        --that.player.lives;
        assets.explosion.currentTime = 0;
        assets.explosion.volume = .2
        assets.explosion.play();
        if (that.player.lives == 0) {
            that.over = true;
            scores.push(that.score);
            scores.sort(function(a, b) { return b - a; });
            scores = scores.slice(0, 10);
        } else {
            that.paused = 3000;
        }
    }
    
    that.update = function(elapsedTime) {
        if (!that.over && that.paused == 0) {
            that.gameTime += elapsedTime;
            if (specs.length > 0) {
                if (that.gameTime > specs[0].formTime) {
                    let enemySpec = specs.shift();
                    let enemy = new Enemy(enemySpec, assets);
                    that.enemies.unshift(enemy);
                }
            }
            that.player.update(elapsedTime);
            that.enemies = that.enemies.filter(enemy => enemy.enabled);
            if (specs.length == 0) {
                if (that.enemies.length == 0) {
                    if (++that.level == enemySets.length) {
                        that.level = 0;
                    }
                    that.paused = 3000;
                    that.gameTime = 0;
                    that.makeSpecs(enemySets[that.level]);
                } else if (that.gameTime > 1000 + 3000*5) {
                    let atk = 0;
                    for (let enemy of that.enemies) {
                        if (enemy.formStage == 2) {
                            ++atk;
                        }
                    }
                    if (atk < 2) {
                        while (true) {
                            if (that.enemyNum >= that.enemies.length) {
                                that.enemyNum = 0;
                                break;
                            }
                            let enemy = that.enemies[that.enemyNum++];
                            if (enemy.formStage == 1) {
                                enemy.formStage = 2;
                                enemy.toShoot = Math.random() < (that.level+1)*.4;
                                break;
                            }
                        }
                    }
                }
            }
            that.player.danger = 0;
            for (let enemy of that.enemies) {
                if (enemy.formStage == 2 && that.testDistance(that.player, enemy) < coordW*.1) {
                    that.player.danger += (that.player.center.x < enemy.center.x ? 10 : -10);
                } else {
                    that.player.danger -= (that.player.center.x < enemy.center.x ? 1 : -1);
                }
                if (!that.paused) {
                    enemy.update(elapsedTime);
                }
                for (let bullet of that.player.bullets) {
                    if (that.testCollision(enemy, bullet)) {
                        bullet.enabled = false;
                        ps.emitExplode(20, enemy.center);
                        enemy.enabled = false;
                        assets.explosion2.currentTime = 0;
                        assets.explosion2.volume = .2
                        assets.explosion2.play();
                        ++that.player.hits;
                        Object.getOwnPropertyNames(scoreTable).forEach(val => {
                            if (enemy.image == assets[val]) {
                                that.score += scoreTable[val][(enemy.formStage == 2 ? 1 : 0)];
                            }
                        });
                    }
                }
                for (let bullet of enemy.bullets) {
                    if (that.testCollision(bullet, that.player)) {
                        bullet.enabled = false;
                        that.destroyPlayer();
                    }
                }
                if (that.testCollision(enemy, that.player)) {
                    enemy.enabled = false;
                    that.destroyPlayer();
                }
            }
        } else {
            if (that.paused != 0) {
                that.paused -= elapsedTime;
                if (that.paused < 0) {
                    that.paused = 0;
                    that.player.enabled = true;
                    that.player.shown = true;
                }
            }
        }
    }

    return that;
}
