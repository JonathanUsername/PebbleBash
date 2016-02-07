app.controller('baseCtrl', 
  ($scope, $state, Player) => {

    console.log('starting base controller')

    $scope.player = Player;

    $scope.newGame = function() {
      $state.go('base.room', {
        roomId: 'new'
      }, {
        reload: true, // Not sure this is needed
        location: false
      })
    }

  })

angular.module('pebble-bash').config(function (
  $stateProvider,
  $urlRouterProvider,
  $urlMatcherFactoryProvider
) {

  // Default route is base
  $urlRouterProvider.otherwise('/');

  // Allow no trailing slash
  $urlMatcherFactoryProvider.strictMode(false)

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
