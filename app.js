var express = require('express');
var app = express();
app.use(express.static('public'));
var http = require('http').Server(app);
var io = require('socket.io')(http);
var port = process.env.PORT || 3000;

var games = [];
var waitingUsers = [];

app.get('/', function(req, res) {
 res.sendFile(__dirname + '/public/index.html');
});

io.on('connection', function(socket) {
    
    socket.username =  "user" + Math.floor((Math.random() * 100) + 1);
    
    console.log(socket.username + ' connected');
    if (waitingUsers.length > 0) {
        var opponent = waitingUsers.pop();
        var game = {
            id: Math.floor((Math.random() * 100) + 1),
            players: [opponent.username, socket.username],
            board: null
        };
  
        console.log('starting game');
        opponent.emit('join', {game: game, color: 'white'});
        socket.emit('join', {game: game, color: 'black'});
        
        games.push(game);
        
    } else {
        console.log(socket.username + ' joining lobby');
        waitingUsers.push(socket);
    }
    
    socket.on('move', function(msg) {
        socket.broadcast.emit('move', msg);
        console.log(msg);
    });

    socket.on('disconnect', function() {
        console.log(socket.username + ' disconnected');

      socket.broadcast.emit('user left', {
        username: socket.username
      });
    });
});

http.listen(port, function() {
    console.log('listening on *: ' + port);
});