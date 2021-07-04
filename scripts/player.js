// This file contains the lander object, which the player controls

let Player = function(assets, auto) {
    let that = {};
    let coordW = document.getElementById('canvas').width;
    let coordH = document.getElementById('canvas').height;

    that.image = assets['player'];
    that.center = { x: coordW*.5, y: coordH*.9 };
    that.radius = 20;
    that.moveRate = .5;
    that.enabled = true;
    that.shown = true;
    that.bullets = [];
    that.sinceBullet = 0;
    that.lives = 3;
    that.shots = 0;
    that.hits = 0;
    that.auto = auto;
    that.autoDir = 0;
    that.danger = 0;
    
    that.update = function(elapsedTime) {
        that.sinceBullet += elapsedTime;
        that.bullets = that.bullets.filter(bullet => bullet.enabled);
        for (let bullet of that.bullets) {
            bullet.update(elapsedTime);
        }
        if (that.auto) {
            if (Math.abs(that.danger) > 4 || Math.random() < .1) {
                that.autoDir = Math.random() * 3 - 1.5 - that.danger/10;
            }
            if (that.autoDir < -.5) {
                that.moveLeft(elapsedTime);
            } else if (that.autoDir > .5) {
                that.moveRight(elapsedTime);
            }
            that.shoot(elapsedTime);
        }
    }
    that.shoot = function(elapsedTime) {
        if (that.enabled && that.sinceBullet > 300) {
            that.bullets.push(new Bullet({
                image: assets['bullet'],
                moveRate: 1,
                center: { x: that.center.x, y: that.center.y - that.radius },
                angle: 0
            }));
            ++that.shots;
            that.sinceBullet = 0;
            assets.laser.currentTime = 0;
            assets.laser.volume = .5;
            assets.laser.play();
        }
    }
    that.moveRight = function(elapsedTime) {
        let temp = that.center.x + that.moveRate*elapsedTime;
        if (that.enabled && temp < coordW - that.radius*2) {
            that.center.x = temp;
        }
    }
    that.moveLeft = function(elapsedTime) {
        let temp = that.center.x - that.moveRate*elapsedTime;
        if (that.enabled && temp > 0 + that.radius*2) {
            that.center.x = temp;
        }
    }
    that.draw = function(context) {
        if (that.shown) {
            context.drawImage(that.image, that.center.x - that.radius, that.center.y - that.radius, that.radius*2, that.radius*2);
        }
    }

    return that;
}
