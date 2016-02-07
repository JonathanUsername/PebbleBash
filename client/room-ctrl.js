app.controller('roomCtrl', 
  ($scope, $rootScope, $state, $location, $stateParams, socket, apiService, roomJoined, Player) => {

    console.log('starting room controller')

    $scope.others = [];


    $scope.others = $scope.others.concat(roomJoined.others)

    // Update room if new
    $scope.roomJoined = roomJoined.roomId;
    $state.go('.', {
      roomId: $scope.roomJoined
    }, {reload: false})

    $scope.something = 'yeah';
    $scope.url = $location.absUrl();


    socket.on('room-update', (others) => {
      console.log('Room update: ', others)
      $scope.others = others;
    })

    console.log('joining room')
    Player.joinRoom($stateParams.roomId);

    $scope.goBack = () => {
      socket.emit('leave');
      $state.go('base');
    };

    socket.on('start', (msg) => {
      console.log('STARTING!', msg)
      $state.go('base.')
    })

    $scope.ready = () => {
      if (Player.name && $scope.roomJoined) {
        socket.emit('ready', {
          roomId: $scope.roomJoined,
          name: Player.name
        })
      } else {
        alert('You have no name? How can you win if you have no name??')
      }
    };

  })

angular.module('pebble-bash').config(function (
  $stateProvider
) {

  $stateProvider
    .state('base.room', {
        url: 'room/:roomId/',
        controller: 'roomCtrl',
        templateUrl: 'room.html',
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
