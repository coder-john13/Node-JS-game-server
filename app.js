var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var crypto = require("crypto");


app.get('/', function(req, res) {
   res.sendfile('index.html');
});

roomCodes = []; //a list of all the current room Codes - helpful when checking if a game exsits
codePlayers={}; //a dictionary when the keys are the room codes and the values are dictionarys of {socket.id:username}

io.on('connection',function(socket){


    console.log('A user has connected to the system');

    socket.on('sendCode',function(inCode,inUser){
          console.log('Inside of send code');
          console.log('inCode:'+inCode);
          console.log('inUser:'+inUser);
          console.log(roomCodes.indexOf(inCode))
          if(roomCodes.indexOf(inCode) > -1){
              socket.join(inCode);
              console.log(codePlayers)
              socket.to(inCode).emit('userAddedToRoom', inUser);
              var tempDic = codePlayers[inCode]; //tempDic is now the dictionary of {socket.id:username} for each player in room
              tempDic[socket.id] = inUser
              codePlayers[inCode] = tempDic;

              //tempArr.push(socket.id); //add socket.id maybe //maybe inUser
              //codePlayers[inCode] = tempArr;
              console.log(codePlayers)

              //get the array of users that are playing
              var tempArr = [];
              for (var key in tempDic) {
                    // check if the property/key is defined in the object itself, not in parent
                    if (tempDic.hasOwnProperty(key)) {
                        tempArr.push(tempDic[key])
                    }
              }
              console.log('tempArr:')
              console.log(tempArr)

              //returns an array of each player
              socket.emit('roomFound','Congrats! That room does exist, adding you to the room...',tempArr); //codePlayers[inCode]
          }

          if(roomCodes.indexOf(inCode) == -1){
              socket.emit('roomNotFound', 'Sorry, but the room code you entered does not exist');
              console.log('room not found. inCode:' + inCode);
          }
    });

    socket.on('createCode',function(inUser){
          console.log("creating code...")
          console.log('inUser:'+inUser);
          var code = crypto.randomBytes(3).toString('hex');
          code = code.toUpperCase();
          roomCodes.push(code);
          console.log("generated code is:"+ code);
          socket.emit('roomCreated',code);
          socket.join(code);
          var temp = socket.id;
          console.log('socket.id:' + socket.id);
          var tempDic = {};
          tempDic[socket.id] = inUser;

          codePlayers[code] = tempDic; //add socket.id //maybe inUser
    });

    socket.on('roomComplete',function(inCode){
          io.in(inCode).emit('BeginSelectingGame');
    });

    ///////////////////////////////////////////////////////////////////////////////////////////////////
    //PLAYING THE GAMES--------------------------------------------------------------------------------
    ///////////////////////////////////////////////////////////////////////////////////////////////////


    ///////////////////////////////////////OTRIO///////////////////////////////////////////////////////
    socket.on('playOtrio',function(roomCode){
      console.log('in Play otrio fcn');
      var userIdDictionary = codePlayers[roomCode]; //dictionary of all players -> {socket.id : username}
      var playerArr = []; //an array of the player usernames
      var playerIds = []; //an array of the player socketIDs
      for (var key in userIdDictionary) {
            // check if the property/key is defined in the object itself, not in parent
            if (userIdDictionary.hasOwnProperty(key)) {
                playerArr.push(userIdDictionary[key]);
                playerIds.push(key);
            }
      }
      console.log('player Array: ')
      console.log(playerArr);
      console.log("Player ID array: ");
      console.log(playerIds);

      gameDictionary = {

        groupCode:roomCode,
        Players: 0,
        game: 'Otio',
        PlayerTurn: 0,
        NumberPlayers: playerIds.length,


      }




    });



    socket.on('disconnect', function() {
              console.log('A user has disconnected');
    });


});




http.listen(3000, function() {
   console.log('listening on localhost:3000');
});
