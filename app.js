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
    console.log('new connection');
     
    socket.on('login', function(msg) {
        socket.username = msg.username;
        console.log(socket.username + ' connected');
        
        if (waitingUsers.length > 0) {
            var opponent = waitingUsers.pop();
            var game = {
                id: Math.floor((Math.random() * 100) + 1),
                players: [opponent.username, socket.username],
                board: null
            };
            
            socket.gameId = game.id;
            opponent.gameId = game.id;
      
            console.log('starting game: ' + game.id);
            opponent.emit('join', {game: game, color: 'white'});
            socket.emit('join', {game: game, color: 'black'});
            
            games.push(game);
            
        } else {
            console.log(socket.username + ' joining lobby');
            waitingUsers.push(socket);
        }
    });
    
    socket.on('move', function(msg) {
        socket.broadcast.emit('move', msg);
        console.log(msg);
    });

    socket.on('disconnect', function() {
        console.log(socket.username + ' disconnected');
        
      removeGame(socket.gameId);

      socket.broadcast.emit('leave', {
        username: socket.username,
        gameId: socket.gameId
      });
    });
    
    
    var removeGame = function(id) {
        console.log("removing game: " + id);
        
        for (var i = 0; i<games.length; i++) {
            if (games[i].id === id) {
                games.splice(i,1);
                console.log("removed it.")
            }
        }
    }
});

http.listen(port, function() {
    console.log('listening on *: ' + port);
});