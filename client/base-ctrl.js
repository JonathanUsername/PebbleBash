app.controller('baseCtrl', 
  ($scope, $rootScope, $state, $stateParams, socket, apiService, Player, loading) => {

    console.log('starting controller')

    $scope.newGame = function() {
      const url = '/room/new';
      apiService.send(url)
        .then(data => {
          if (data.error) {
            return alert(data.error)
          }
          $state.go('waiting', data)
        })
    }

    $scope.player = Player;

    loading.start();
    socket.on('connect', () => {
      console.log('socket connected');
      Player.id = socket.getId();
      loading.finish();
    })

  })

angular.module('pebble-bash').config(function (
  $stateProvider,
  $urlRouterProvider
) {

  // Default route is base
  $urlRouterProvider.otherwise('/');

  $stateProvider
    .state('base', {
      url: '/',
      controller: 'baseCtrl',
      templateUrl: 'base.html'
    });
});
