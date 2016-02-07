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
    name: ''
  };

  Player.getId = () => this.id;
  Player.getName = () => this.name;

  return Player
})