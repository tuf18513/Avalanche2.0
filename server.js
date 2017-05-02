var express = require('express');
var fs = require('fs');

var app = express();
var server = app.listen(3000);
var players = 0;
var game = 0;
var data = fs.readFileSync('users.json');
var scores = JSON.parse(data);
console.log(scores);

app.use(express.static('public'));

console.log("open");

var socket = require('socket.io');

var io = socket(server);

var numUsers = 0;

app.get('/search/:player', sendScore);
function sendScore(request, response) {
    var data = request.params;
    var reply;
    if (scores[data.player]) {
        reply = { score : scores[data.player] };
    } else {
        reply = {score : 0};
    }
    response.send(reply);
}

app.get('/add/:name/:score', addScore);
function addScore(request, response) {
    var data = request.params;
    var reply = { msg: "inserted." };
    var name = data.name;
    var score = Number(data.score);
    if (score < scores[name]) {
        score = scores[name];
    } else {
        scores[name] = score;
        var scoresJson = JSON.stringify(scores, null, 2);
        fs.writeFile('users.json', scoresJson, finished);
    }
    function finished(err) {
        console.log('updated');
    }
    response.send(reply);
    
}
io.sockets.on('connection', newConnection);

function newConnection(socket) {
    console.log('new connection: ' + socket.id);
    console.log(players);
    socket.on('ship', shipMsg);
    socket.on('leftGame', leftMsg);
    players++;

    var addedUser = false;

    //coped from socket.io chat example https://github.com/socketio/socket.io/tree/master/examples/chat
    // when the client emits 'new message', this listens and executes
    socket.on('new message', function (data) {
        // we tell the client to execute 'new message'
        socket.broadcast.emit('new message', {
            username: socket.username,
            message: data
        });
    });

    // when the client emits 'add user', this listens and executes
    socket.on('add user', function (username) {
        if (addedUser) return;

        // we store the username in the socket session for this client
        socket.username = username;
        ++numUsers;
        addedUser = true;
        socket.emit('login', {
            numUsers: numUsers
        });
        // echo globally (all clients) that a person has connected
        socket.broadcast.emit('user joined', {
            username: socket.username,
            numUsers: numUsers
        });
    });

    // when the client emits 'typing', we broadcast it to others
    socket.on('typing', function () {
        socket.broadcast.emit('typing', {
            username: socket.username
        });
    });

    // when the client emits 'stop typing', we broadcast it to others
    socket.on('stop typing', function () {
        socket.broadcast.emit('stop typing', {
            username: socket.username
        });
    });

    // when the user disconnects.. perform this
    socket.on('disconnect', function () {
        if (addedUser) {
            --numUsers;

            // echo globally that this client has left
            socket.broadcast.emit('user left', {
                username: socket.username,
                numUsers: numUsers
            });
        }
    });
    //end copy

    socket.on('scoreRequest', function (name) {
        var list = {
            score: 0
        };
        if (scores[name.playerName]) {
            list.score = scores[name.playerName];
        }
        socket.broadcast.emit('scoreResponse', list);
    });
    socket.on('restart', function () {
        players++; var x = createBlockList();
        if (players === 4) {
            game++;
            var list = {
                blockList: x,
                gameId: game
            }
            io.emit('blocks', list);
            players = 0;
        }
    });
    function shipMsg(position) {
        socket.broadcast.emit('ship', position);
    }
    function leftMsg(gameId) {
        socket.broadcast.emit('ship', gameId);
    }
    var x = createBlockList();
    if (players === 4) {
        game++;
        var list = {
            blockList: x,
            gameId: game
        }
        io.emit('blocks', list);
        players = 0;
    }

    function addScore(request, response) {

    }



}

function createBlockList() {
    var list = [];
    for (var i = 0; i < 500; i++) {
        list.push({
            posX: Math.floor(Math.random() * 800) + 1,
            side: Math.floor(Math.random() * (800 / 12 - 800 / 5 + 1) + 800 / 5)
        });
    }
    return list;
}