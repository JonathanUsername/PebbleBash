app.factory('Player', function (
  $http,
  $q,
  $log,
  $rootScope,
  socket,
  loading
) {

  const Player = {
    id: '',
    name: localStorage.playerName || ''
  };

  const connectedPromise = $q.defer();

  Player.connected = () => {
    return connectedPromise.promise;
  };

  socket.on('connect', () => {
    console.log('socket connected');
    Player.id = socket.getId();
    loading.finish();
    connectedPromise.resolve(Player.id);
  })

  Player.getId = () => this.id;
  Player.getName = () => this.name;

  return Player
})