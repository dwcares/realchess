
(function () {
    
    WinJS.UI.processAll().then(function () {
      
      var socket = io();
      var games = {};
      var boards = {};


      //////////////////////////////
      // Socket.io handlers
      ////////////////////////////// 
      
      socket.emit('dashboardlogin');
      socket.on('dashboardlogin', function(msg) {
            createGamesList(msg.games);
      });
     
      
      socket.on('gameadd', function(msg) {
            initGame(msg.gameId, msg.gameState)
      });

      socket.on('resign', function(msg) {
            var gameToRemove = document.getElementById('game-board'+msg.gameId);
            gameToRemove.parentElement.removeChild(gameToRemove);
      });
                         
      socket.on('move', function (msg) {
           games[msg.gameId].move(msg.move);
           boards[msg.gameId].position(games[msg.gameId].fen());
        
      });
     
                 
      //////////////////////////////
      // Chess Games
      ////////////////////////////// 
      
    var createGamesList = function(serverGames) {
          Object.keys(serverGames).forEach(function(gameId) {
                initGame(gameId, serverGames[gameId]);
          });
      };
      
      var initGame = function (gameId, serverGame) {
            
          var cfg = {
            draggable: false,
            showNotation: false,
            orientation: 'white',
            pieceTheme: '../img/chesspieces/wikipedia/{piece}.png',
            position: serverGame.board ? serverGame.board : 'start',
          };
         
          // create the game parent div 
          $('#games').append($('<div id="game-board'+gameId+'" class="gameboard"></div>'));
          
          // create the game     
          var game = serverGame.board ? new Chess(serverGame.board) : new Chess();
          games[gameId] = game;
          
          var board = new ChessBoard('game-board' + gameId, cfg);
          boards[gameId] = board;
      }
    });
})();

