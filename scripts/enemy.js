// This file contains the lander object, which the player controls

let Enemy = function(spec, assets) {
    let that = {};
    let coordW = document.getElementById('canvas').width;
    let coordH = document.getElementById('canvas').height;

    that.image = spec.image;
    that.center = spec.center;
    that.formId = spec.formId;
    that.formTime = spec.formTime;
    that.pattern = spec.pattern;
    that.alt = spec.alt;
    that.toShoot = spec.toShoot;
    that.altSide = that.center.x < .5;
    if (that.center.y == 0) that.altSide = !that.altSide;
    if (that.alt == 1) that.center.x = coordW - that.center.x;
    that.bullets = [];
    that.moveRate = 40;
    that.radius = 12;
    that.patternStage = 0;
    that.enabled = true;
    that.formStage = 0;
    that.formSize = 10;
    that.formSpace = 2.4*that.radius;
    that.centerTemp = { x: that.center.x, y: that.center.y };

    that.moveTo = function(x, y, elapsedTime) {
        let xdiff = x - that.centerTemp.x;
        let ydiff = y - that.centerTemp.y;
        let dist = Math.sqrt(xdiff*xdiff + ydiff*ydiff);
        that.rotation = (ydiff > 0 ? Math.PI : 0) - Math.atan(xdiff/ydiff);
        if (dist > 0) {
            that.centerTemp.x += xdiff * that.moveRate/dist * elapsedTime/100;
            that.centerTemp.y += ydiff * that.moveRate/dist * elapsedTime/100;
            that.center.x = that.centerTemp.x;
            that.center.y = that.centerTemp.y;
            if (that.alt == 2 && that.formStage == 0) {
                that.center.x += (that.altSide ? 1 : -1) * 2.5*that.radius*Math.cos(that.rotation);
                that.center.y += (that.altSide ? 1 : -1) * 2.5*that.radius*Math.sin(that.rotation);
            }
            if (that.toShoot && that.center.y > coordH/2 && Math.random() < .1 && Math.abs(Math.PI - that.rotation) < Math.PI/6) {
                that.toShoot = false;
                that.shoot(elapsedTime);
            }
        }
        return dist < 5;
    }

    that.formX = function() {
        let foffset = (coordW - that.formSize*that.formSpace);
        let fx = that.formSpace * ((that.formId % that.formSize) - that.formSize/2) + that.formSpace/2;
        let flim = 8000;
        let fprog = that.formTime % flim;
        let tempX = (fprog < flim/2 ? fprog : flim - fprog) / (flim/2);
        return fx + foffset/2 + tempX*(coordW - foffset);
    }
    that.formY = function() {
        let fy = that.formSpace * Math.floor(that.formId / that.formSize) - that.formSpace/2;
        return fy + .15*coordH;
    }
    
    that.update = function(elapsedTime) {
        if (that.enabled) {
            that.formTime += elapsedTime;
            if (that.formStage == 1) {
                that.rotation = Math.PI;
                if (that.center.y == that.formY()) {
                    that.center.x = that.formX();
                } else {
                    let arrived = that.moveTo(that.formX(), that.formY(), elapsedTime);
                    if (arrived) {
                        that.center.y = that.formY();
                    }
                }
            } else {
                let nextLoc = that.pattern[that.patternStage];
                let arrived = that.moveTo((that.alt == 1 ? coordW - nextLoc[0] : nextLoc[0]), nextLoc[1], elapsedTime);
                if (arrived) {
                    ++that.patternStage;
                    if (that.patternStage == that.pattern.length) {
                        that.patternStage = 0;
                        that.formStage = 1;
                        that.centerTemp.y = 0;
                    } else if (that.pattern[that.patternStage] == 0) {
                        if (that.formId == null) that.enabled = false;
                        that.pattern = that.pattern.slice(that.patternStage + 1);
                        that.patternStage = 0;
                        that.formStage = 1;
                        that.centerTemp.x = that.center.x;
                        that.centerTemp.y = that.center.y;
                    }
                }
            }
            for (let bullet of that.bullets) {
                bullet.update(elapsedTime);
            }
        }
    }
    that.shoot = function(elapsedTime) {
        if (that.enabled) {
            that.bullets.push(new Bullet({
                image: assets['bullet'],
                moveRate: .3,
                center: { x: that.center.x, y: that.center.y - that.radius },
                angle: that.rotation
            }));
            assets.laser2.currentTime = 0;
            assets.laser2.volume = .5;
            assets.laser2.play();
        }
    }
    that.setEnabled = function(enabled) {
        that.enabled = enabled;
    }
    that.getAngle = function() {
        return Math.round(that.rotation*180/Math.PI);
    }
    that.draw = function(context) {
        context.save();
        context.translate(that.center.x, that.center.y);
        context.rotate(that.rotation);
        context.translate(-that.center.x, -that.center.y);
        
        context.drawImage(that.image, that.center.x - that.radius, that.center.y - that.radius, 2*that.radius, 2*that.radius);
        context.restore();
    }

    return that;
}
