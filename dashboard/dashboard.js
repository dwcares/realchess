
(function () {
    
    WinJS.UI.processAll().then(function () {
      
      var socket = io();
      var games = {};
      var boards = {};
      var slides = ['img/slide1.jpg',
                    'img/slide2.jpg',
                    'img/slide4.jpg',
                    'img/slide3.jpg',
                    'img/slide5.jpg',
                    'img/slide6.jpg',
                    'img/slide8.jpg',
                    'img/slide9.jpg',
                    'img/slide10.jpg',
                    'img/slide11.jpg',
                    'img/slide12.jpg',
                    'img/slide13.jpg',
                    'img/slide14.jpg',
                    'img/githublink.gif',
                    'img/slide16.jpg',
                    'hide'];

      var slidesDiv = document.getElementById('slides');
      var slidesImg = document.getElementById('slidesImg');

      var currentSlide = 0;
      slidesImg.src = slides[currentSlide];

      window.addEventListener('keyup', function(e) {

            switch (e.key) {
                  case "Left":
                  case "Down":
                        currentSlide--
                        
                        if (currentSlide < 0) currentSlide = slides.length -1;   
                        slidesImg.src = slides[currentSlide];
                   
                  break;
                  default: 
                        currentSlide++;
                        
                        if (currentSlide >= slides.length) currentSlide = 0;
                        slidesImg.src = slides[currentSlide];

                        if (slides[currentSlide]=='hide')
                              slidesDiv.style.display = 'none';
                        else
                              slidesDiv.style.display = 'block';
            }  
      })
           
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

