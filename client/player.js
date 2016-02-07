app.factory('Player', function (
  $http,
  $q,
  $log,
  $rootScope,
  socket,
  loading,
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
    Player.room = roomId;
    console.log('emitting join', roomId)
    socket.emit('join', Player)
  }

  socket.on('connect', () => {
    console.log('socket connected');
    Player.id = socket.getId();
    loading.finish();
    if ($stateParams.roomId) {
      console.log('stateparams exists so joining')
      Player.joinRoom($stateParams.roomId);
    }
    connectedPromise.resolve(Player.id);
  })

  Player.getId = () => this.id;
  Player.getName = () => this.name;

  return Player
})