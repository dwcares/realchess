var express = require('express');
var app = express();
app.use(express.static('public'));
var http = require('http').Server(app);
var io = require('socket.io')(http);
var port = process.env.PORT || 3000;

var games = [];
var waitingUsers = [];
var lobbyUsers = {};
var users = {};
var activeGames = {};

app.get('/', function(req, res) {
 res.sendFile(__dirname + '/public/index.html');
});

io.on('connection', function(socket) {
    console.log('new connection');
     
    socket.on('login', function(msg) {
        console.log(msg + ' joining lobby');
        socket.username = msg;  
        socket.emit('login', Object.keys(lobbyUsers));
        
       
        users[socket.username] = socket;
        lobbyUsers[socket.username] = socket;
        
        socket.broadcast.emit('joinlobby', socket.username);
    });
    
    socket.on('invite', function(msg) {
        console.log('got an invite from: ' + msg);
        
        socket.broadcast.emit('leavelobby', socket.username);
        socket.broadcast.emit('leavelobby', msg);
        
        delete lobbyUsers[socket.username];
        delete lobbyUsers[msg];
       
        var game = {
            id: Math.floor((Math.random() * 100) + 1),
            players: [socket.username, msg],
            board: null
        };
        
        socket.gameId = game.id;
        users[msg].gameId = game.id;
  
        console.log('starting game: ' + game.id);
        socket.emit('joingame', {game: game, color: 'white'});
        users[msg].emit('joingame', {game: game, color: 'black'});

        games.push(game);
    });
    
    socket.on('move', function(msg) {
        socket.broadcast.emit('move', msg);
        console.log(msg);
    });

    socket.on('disconnect', function() {
        console.log(socket.username + ' disconnected');
        
      removeGame(socket.gameId);
      
      socket.broadcast.emit('logout', {
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