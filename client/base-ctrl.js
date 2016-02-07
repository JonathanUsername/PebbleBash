app.controller('baseCtrl', 
  ($scope, $rootScope, $state, $stateParams, socket, apiService, Player, loading) => {

    console.log('starting base controller')

    $scope.player = Player;

    console.log($state.current.name)


    $scope.newGame = function() {
      $state.go('base.room', {
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
        leaveRooms: (socket) => {
          // Make sure we're not in a room
          console.log('resolving leave')
          socket.emit('leave');
        },
        socketConnected: (Player) => {
          return Player.resolveConnect();
        }
      }
    });
});
