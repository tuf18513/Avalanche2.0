/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
function Ground() {
    this.pos = createVector(0, height * 3 / 4);
    this.vel = createVector(0, 1);
    this.side = height;
    this.r = 255;
    this.g = 0;
    this.b = 0;

    this.render = function () {
        push();
        translate(this.pos.x, this.pos.y);
        fill('rgba(139,69,19, .75)');
        rect(0, 0, width, this.side);
        pop();
    };
    this.update = function(){
        this.pos.add(this.vel);
    }
}