// This file contains the lander object, which the player controls

let Bullet = function(spec) {
    let that = {};
    let coordW = document.getElementById('canvas').width;
    let coordH = document.getElementById('canvas').height;

    that.image = MyGame.assets['bullet'];
    that.moveRate = spec.moveRate;
    that.center = spec.center;
    that.angle = spec.angle;
    that.radius = 5;
    that.enabled = true;
    
    that.update = function(elapsedTime) {
        if (that.center.x < 0 || that.center.x > coordW || that.center.y < 0 || that.center.y > coordH) {
            that.enabled = false;
        }
        that.center.y -= that.moveRate * elapsedTime * Math.cos(that.angle);
        that.center.x += that.moveRate * elapsedTime * Math.sin(that.angle);
    }
    that.setEnabled = function(enabled) {
        that.enabled = enabled;
    }
    that.getAngle = function() {
        return Math.round(that.rotation*180/Math.PI);
    }
    that.draw = function(context) {
        context.drawImage(that.image, that.center.x - that.radius, that.center.y - that.radius, that.radius*2, that.radius*2);
    }

    return that;
}
