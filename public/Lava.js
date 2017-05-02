/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
function Lava() {
    this.pos = createVector(0, height*3);
    this.vel = createVector(0, -1);
    this.side = height;
    this.r = 255;
    this.g = 0;
    this.b = 0;


    this.update = function () {
        this.pos.add(this.vel);
        this.side ++;
    };

    this.render = function () {
        push();
        translate(this.pos.x, this.pos.y);
        fill('rgba(100%,0%,0%,0.5)');
        rect(0, 0, width, this.side);
        pop();
    };
    
    this.hitGround = function() {
        if(this.pos.y <= height * 3 / 4){
            return true;
        }
        return false;
    }
}
