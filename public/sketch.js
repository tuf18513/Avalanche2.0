//game variable
var ship;
var ground;
var lava;
var timer = 0;
var waitTime = 50;
//server dependent variable
var blocks = [];
var blockList = [];
var enemies = [];
var Alldead = false;
var dead = false;
var won = false;
var haveList = false;
var gameId = 0;
var socket;
var score = 0;
var i = 0;
var myBest = 0;
function setup() {
    createCanvas(800, 1000);
    if(i ===0){
        ship = new Ship();
        lava = new Lava();
        ground = new Ground();
        i++;
    }
    socket = io.connect('http://localhost:3000');
    socket.on('ship', updateEnemies);
    socket.on('blocks', setBlocks);
    socket.on('leftGame', checkPlayer);
    var name = {
        playerName: $('<div/>').text(($('.usernameInput').val().trim())).text()
    }
    socket.emit('scoreRequest', name);
    socket.on('scoreResponse', setScore);

    
}
function setScore(list) {
    myBest = list.score;
}
function checkPlayer(id) {
    if (id === gameId) {
        won = true;
    }
}
function updateEnemies(position){
    var found = false;
    for(var i = 0; i < enemies.length; i++){
        if(position.id === enemies[i].id){
            enemies[i].x = position.x;
            enemies[i].y = position.y;
            found = true;
        }
    }
    if(!found && enemies.length < 2 && position.inGame === haveList && position.gameId != 0 && position.gameId === gameId){
        enemies.push({
            id: position.id,
            x: position.x,
            y: position.y
        });
    }
}
function addScore() {
    var x = 0;
    var y = 0;
    fill('white');
    textSize(32);
    text(myBest, x, y);
    console.log(myBest);
}
function drawEnemies() {
    var bodyCount = 0;
    for (var i = 0; i < enemies.length; i++) {
        if (enemies[i].x == -100 && enemies[i].y == -100) {
            bodyCount++;
        }
        push();
        noStroke();
        fill(255, 0, 100);
        translate(enemies[i].x, enemies[i].y);
        rect(0, 0, width / 12 / 1.618, width / 12, width / 12 / 12);
        pop();
    }
    if (bodyCount === enemies.length && bodyCount != 0 && !won && !dead) {
        won = true;
        alert("you won! Your score was " + score);
        loadJSON('add/' + $('<div/>').text(($('.usernameInput').val().trim())).text() + '/' + score, sentData);
        var r = confirm("Play Again?");
        playAgain(r);
    }
}
function sentData() {
    console.log($('<div/>').text(($('.usernameInput').val().trim())).text() + " " + score);
}

function draw() {
    
    background(0);
    addScore();
    drawEnemies();

    if(haveList){
        newBlocks();
        lava.update();

    }
    ground.render();


    for (var i = 0; i < blocks.length; i++) {
        blocks[i].render();
        blocks[i].update();
        ship.hit(blocks[i]);
        if (blocks[i].stopped) {
            if (i+1 > score) {
                score = i+1;
            }
        }
        if (blocks[i].vel.y !== 0) {
            for (var j = 0; j < i; j++) {
                blocks[i].hitBlock(blocks[j]);
            }
        }
    }
    lava.render();

    if (!dead && !won) {
        ship.update();
        ship.render();
        var position = {
            inGame: haveList,
            gameId: gameId,
            id: socket.id,
            x: ship.pos.x,
            y: ship.pos.y 
        }
        socket.emit('ship', position);
    }
    if (ship.died(lava) && !dead && !won) {
        alert("you died. Your score was " + score);
        loadJSON('add/' + $('<div/>').text(($('.usernameInput').val().trim())).text() + '/' + score, sentData);
        var r = confirm("Play Again?");
        playAgain(r);
        dead = true;
        var position = {
            inGame: haveList,
            gameId: gameId,
            id: socket.id,
            x: -100,
            y: -100
        }
        socket.emit('ship', position);
        if (r) { dead = false;}
    }
}

function newBlocks() {
    if (timer === waitTime) {
        blocks.push(new Block(blockList[blocks.length], blocks.length));
        timer = 0;
        if (waitTime !== 10) {
            waitTime--;
        }
    }
    timer++;
}

function setBlocks(list) {
    if (!haveList) {
        haveList = true;
        blockList = list.blockList;
        gameId = list.gameId;
    }
}

function playAgain(r) {
    if (r) {
        socket.emit('leftGame', gameId);
        blocks = [];
        blockList = [];
        enemies = [];
        Alldead = false;
        won = false;
        haveList = false;
        gameId = 0;
        score = 0;
        i = 0;
        timer = 0;
        waitTime = 50;
        ship = new Ship();
        i++;
        socket.emit('restart');
        socket.emit('restart');
        lava = new Lava();
    }
}