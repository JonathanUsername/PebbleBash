app.controller('waitingCtrl', 
  ($scope, $rootScope, $state, $stateParams, socket, apiService, roomJoined, Player) => {

    console.log('starting waiting controller')

    // Update room if new
    $scope.roomJoined = roomJoined.roomId;
    $state.go('.', {
      roomId: $scope.roomJoined
    }, {reload: false})

    console.log($stateParams)

    $scope.something = 'yeah';


    $scope.goBack = () => {
      $state.go('base');
    };

    $scope.ready = () => {
      if (Player.name && $scope.roomJoined) {
        socket.emit('ready', {
          roomId: $scope.roomJoined
        })
      } else {
        alert('You have no name? How can you win if you have no name??')
      }
    };

    // $scope.newGame = function() {
    //   const url = '/room/new';
    //   apiService.send(url)
    //     .then(data => {
    //       if (data.error) {
    //         return alert(data.error)
    //       }

    //       alert('success!', JSON.stringify(data))
    //     })
    // }

    // $scope.$on('$stateChangeStart', function(event, toState, toParams, fromState, fromParams){ 
    //   console.log('in $stateChangeStart'); 
    // })
    // $scope.$on('$stateChangeSuccess', function(event, toState, toParams, fromState, fromParams){ 
    //   console.log('in $stateChangeSuccess'); 
    // })
    // $scope.$on('$stateChangeError', function(event, toState, toParams, fromState, fromParams){ 
    //   console.log('in $stateChangeError'); 
    // })

    // $rootScope.playerName = localStorage.name || '';
    // $rootScope.playerId = 'Connecting to server...';
    // $rootScope.testing = 'rootScope visible';

    // socket.on('connect', () => {
    //   console.log('connected');
    //   $rootScope.playerId = socket.getId();
    // })

  })

angular.module('pebble-bash').config(function (
  $stateProvider
) {

  $stateProvider
    .state('base.waiting', {
        url: ':roomId/waiting/',
        controller: 'waitingCtrl',
        templateUrl: 'waiting.html',
        resolve: {
          roomJoined: ($stateParams, apiService, socketConnected, Player) => {
            return apiService.send(`/room/${$stateParams.roomId}`, {
              playerId: Player.id,
              name: Player.name || 'Anonymous'
            })
          }
        }
      });

});
