//All the functions for the movement of the player character and checking for death from crushing by blocks or touching lava
function Ship() {
    this.slideLeft = false;
    this.slideRight = false;
    this.topHit = false;
    this.bottomHit = false;
    this.dead = false;
    this.pos = createVector(width / 2, height / 2);
    this.r = floor(width / 12);
    this.maxSpeed = width / 250;
    this.maxSpeedY = width / 150;
    this.maxSpeedYSliding = width / 200;
    this.vel = createVector(0, 0);

    //updates the position of the player
    this.update = function () {
        if (ship.hitGround()) {
            this.vel.y = 0;
            this.pos.y = (height * 3 / 4) - this.r;
            this.pos.x += this.vel.x;
        } else {
            ship.movesY();
        }
        ship.edges();
        ship.movesX();

        this.pos.add(this.vel);
    };

    //checks if the player hit the ground
    this.hitGround = function () {
        if (this.pos.y + this.r >= height * 3 / 4 && this.vel.y !== 0) {
            this.bottomHit = true;
            return true;
        }
        return false;
    };

    //makes the player wrap around the game screen if the go off the edge
    this.edges = function () {
        if (this.pos.x> width + this.r) {
            this.pos.x = -this.r;
        } else if (this.pos.x < -this.r) {
            this.pos.x = width;
        }
    };


    //moves the character left and right if the button is the left or right arrows are help down
    this.movesX = function () {
        this.slideLeft = false;
        this.slideRight = false;
        if (keyIsDown(RIGHT_ARROW) && !keyIsDown(LEFT_ARROW)) {
            ship.pos.x - 1;
            ship.boost(1);
            return;
        }
        if (keyIsDown(LEFT_ARROW) && !keyIsDown(RIGHT_ARROW)) {
            ship.pos.x + 1;
            ship.boost(-1);
            return;
        }

        ship.slowDownX();
    };

    //moves the character up and down, they can only go up if they are on the ground, the top of a box, or sliding on the side of a box
    this.movesY = function (movingUp) {
        this.topHit = false;
        this.bottomHit = false;
        if (keyIsDown(UP_ARROW) && (this.vel.y === 0 || this.slideLeft || this.slideRight)) {
            ship.jump();
        }
        ship.slowDownY(movingUp);
    };

    //applies 'gravity' to the character
    this.slowDownY = function (movingUp) {
        if ((this.slideLeft || this.slideRight)) {
            if (this.vel.y > this.maxSpeedYSliding) {
                this.vel.y = this.maxSpeedYSliding;
            } else {
                this.vel.y = this.vel.y;
            }
            
        } else if(this.vel.y > this.maxSpeedY){
            this.vel.y = this.maxSpeedY;
        }else {
            this.vel.y = this.vel.y + height / 3000;
        }
    };

    //najes the character jump
    this.jump = function () {
        this.pos.y--;
        this.vel.y = -(this.maxSpeedY * 2);
    };

    //increases the x velocity to a maximum for the character
    this.boost = function (direction) {
        if (this.vel.x >= this.maxSpeed) {
            this.vel.x = this.maxSpeed;
        } else if (this.vel.x <= -this.maxSpeed) {
            this.vel.x = -this.maxSpeed;
        } else {
            if (this.vel.x * direction < 0) {
                this.vel.x = 0;
            }
            this.vel.x += direction;
        }
    };

    //applies friction to stop when not moving side to side
    this.slowDownX = function () {
        this.vel.x = this.vel.x / 1.1;
    };

    //draws the character
    this.render = function () {
        push();
        fill('white');
        translate(this.pos.x, this.pos.y);
        rect(0, 0, this.r / 1.618, this.r, this.r / 12);
        pop();
    };

    //checks if the character is hitting a block
    this.hit = function (blockHitting) {
        ship.hitSide(blockHitting);
        ship.hitTop(blockHitting);
        ship.hitBottom(blockHitting);

    };

    //checks if the character died, they die if they are crushed by a block or touched by lava
    this.died = function (lava) {
        if (this.hitGeneral(lava) || this.dead) {
            return true;
        }
        return false;
    };

    //checks if the character hit the side of a block, stopping x movement and reducing y speed
    this.hitSide = function (blockHitting) {
        if (this.collideY(this.pos.y, this.r, blockHitting.pos.y, blockHitting.side)) {
            if (this.collideX(this.pos.x + this.r / 1.618, 0, blockHitting.pos.x, blockHitting.side / 15)) {
                this.pos.x = blockHitting.pos.x - this.r / 1.618 - 1;
                if (this.vel.x > 0)
                    this.vel.x = 0;
                this.slideLeft = true;
            } else if (this.collideX(this.pos.x, 0, (blockHitting.pos.x + blockHitting.side * 14 / 15), blockHitting.side / 15)) {
                this.pos.x = blockHitting.pos.x + blockHitting.side + 1;
                if (this.vel.x < 0)
                    this.vel.x = 0;
                this.slideRight = true;
            } else {

            }
        }
    };

    //check if the character hit the top of a box, stopping a fall, if it is also hitting the bottom of a box it dies
    this.hitTop = function (blockHitting) {
        if (this.collideX(this.pos.x, this.r / 1.618, blockHitting.pos.x, blockHitting.side)) {
            if (this.collideY(this.pos.y, this.r, blockHitting.pos.y, blockHitting.side / 10)) {
                this.topHit = true;
                this.pos.y = blockHitting.pos.y - this.r;
                this.vel.y = this.maxSpeedY;
                if (ship.hitGround() || this.bottomHit) {
                    this.dead = true;
                }
            }
        }
    };

    //checks if a character hit the bottom of a box, stopping upward movement, if it is also hitting the top of a box or the ground it dies
    this.hitBottom = function (blockHitting) {
        if (this.collideX(this.pos.x, this.r / 1.618, blockHitting.pos.x, blockHitting.side)) {
            if (this.collideY(this.pos.y, 0, blockHitting.pos.y + blockHitting.side * 14 / 15, blockHitting.side / 15)) {
                this.pos.y = blockHitting.pos.y + blockHitting.side + 1;
                this.vel.y = 1;
                this.bottomHit = true;
                if (this.pos.y + this.r >= height * 3 / 4 || this.topHit) {
                    this.dead = true;
                }
            }
        }
    };

    //checks if a character hit any part of an object, used for testing and lava.
    this.hitGeneral = function (blockHitting) {
        if (this.collideX(this.pos.x, this.r / 1.618, blockHitting.pos.x, blockHitting.side)) {
            if (!this.collideY(this.pos.y, this.r, blockHitting.pos.y, blockHitting.side)) {
                return false;
            } else {
                return true;
            }
        }
    };

    //checks to see if x demintions of two objects intersect
    this.collideX = function (x, w, x2, w2) {
        //2d
        //add in a thing to detect rectMode CENTER
        if ((x + w >= x2 && x + w <= x2 + w2) || // r1 right edge past r2 left
                (x <= x2 + w2 && x >= x2)) {    // r1 bottom edge past r2 top
            return true;
        }
        return false;
    };

    //checks to see if y demintions of two objects intersect
    this.collideY = function (y, h, y2, h2) {
        if ((y + h >= y2 && y + h <= y2 + h2)) {
            return true;
        }
        return false;
    };
}