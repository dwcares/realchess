var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var port = process.env.PORT || 3000;

app.get('/', function(req, res) {
 res.sendFile(__dirname + '/index.html');
});

io.on('connection', function(socket) {
    console.log('a user is connected');

    socket.on('button', function(msg) {
        console.log("got button message");
       console.log(msg); 
    });

    socket.on('disconnect', function() {
        console.log('a user is disconnected');
    })
})

http.listen(port, function() {
    console.log('listening on *: ' + port);
})