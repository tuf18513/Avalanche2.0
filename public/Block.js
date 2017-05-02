function Block(blockInfo, evenHigher) {
    this.pos = createVector(blockInfo.posX, -height / 4 * (evenHigher + 1));
    this.side = blockInfo.side;
    this.vel = createVector(0, 1);
    this.stopped = false;
    this.r = random(255);
    this.g = random(255);
    this.b = random(255);


    this.update = function () {
 
            if (this.pos.y + this.side <= height * 3 / 4 && !this.stopped) {
                this.pos.add(this.vel);
            }
    }

    this.render = function () {
        push();
        translate(this.pos.x, this.pos.y);
        fill(this.r, this.g, this.b);
        rect(0, 0, this.side, this.side, this.side / 12);
        pop();
    };

    this.setPos = function (x, y) {
        this.pos.x = x;
        this.pos.y = y;
    }

    this.hitBlock = function (blockHitting) {
        if (this.collideRectRect(this.pos.x, this.side, blockHitting.pos.x, blockHitting.side)) {
            if (this.pos.y + this.side <= blockHitting.pos.y) {
            } else {
                this.stopped = true;
            }
        }
    }

    this.collideRectRect = function (x, w, x2, w2) {
        //2d
        //add in a thing to detect rectMode CENTER
        if ((x + w >= x2 && x + w <= x2 + w2) || // r1 right edge past r2 left
                (x <= x2 + w2 && x >= x2)) {    // r1 bottom edge past r2 top
            return true;
        }
        return false;
    };

}

