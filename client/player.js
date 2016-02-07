app.factory('Player', function (
  $http,
  $q,
  $log,
  $rootScope,
  socket,
  $stateParams
) {

  const Player = {
    id: '',
    name: localStorage.playerName || ''
  };

  const connectedPromise = $q.defer();

  Player.resolveConnect = () => {
    return connectedPromise.promise;
  };

  Player.joinRoom = (roomId) => {
    console.log('emitting join', roomId)
    Player.room = roomId;
    socket.emit('join', Player)
  };

  Player.saveName = () => {
    localStorage.playerName = Player.name;
  };

  socket.on('connect', () => {
    console.log('socket connected');
    Player.id = socket.getId();
    if ($stateParams.roomId) {
      console.log('stateparams exists so joining');
      Player.joinRoom($stateParams.roomId);
    }
    connectedPromise.resolve(Player.id);
  })

  Player.getId = () => this.id;
  Player.getName = () => this.name;

  return Player
})