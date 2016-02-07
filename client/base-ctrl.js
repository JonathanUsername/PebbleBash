app.controller('baseCtrl', 
  ($scope, $rootScope, $state, $stateParams, socket, apiService, Player, loading) => {

    console.log('starting base controller')

    $scope.player = Player;

    loading.start();

    console.log($state.current.name)

    $scope.newGame = function() {
      $state.go('base.waiting', {
        roomId: 'new'
      }, {
        reload: true
      })
    }

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
      templateUrl: 'base.html',
      resolve: {
        socketConnected: (Player) => {
          return Player.connected();
        }
      }
    });
});
