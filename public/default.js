var game, board, socket, playerColor;

window.init = function () {    
    socket = io();
    
    socket.on('join', function(msg) {
      console.log("joined as " + msg.color );
      playerColor = msg.color;
      initGame();
    });
    
    socket.on('user joined', function (msg) {
      console.log(msg.name + " joined as " + msg.color );
    });

    socket.on('move', function (msg) {
      game.move(msg);
      board.position(game.fen());
    });
};

var initGame = function () {
 
    var cfg = {
      draggable: true,
      showNotation: false,
      orientation: playerColor,
      position: 'start',
      onDragStart: onDragStart,
      onDrop: onDrop,
      onSnapEnd: onSnapEnd
    };

    game = new Chess();
    board = new ChessBoard('board', cfg);
}



// do not pick up pieces if the game is over
// only pick up pieces for the side to move
var onDragStart = function(source, piece, position, orientation) {
  if (game.game_over() === true ||
      (game.turn() === 'w' && piece.search(/^b/) !== -1) ||
      (game.turn() === 'b' && piece.search(/^w/) !== -1)) {
    return false;
  }
};

var onDrop = function(source, target) {
  // see if the move is legal
  var move = game.move({
    from: source,
    to: target,
    promotion: 'q' // NOTE: always promote to a queen for example simplicity
  });

  // illegal move
  if (move === null) { 
    return 'snapback';
  } else {
     socket.emit('move', move);
  }

};

// update the board position after the piece snap 
// for castling, en passant, pawn promotion
var onSnapEnd = function() {
  board.position(game.fen());
};


