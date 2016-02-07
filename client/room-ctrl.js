app.controller('roomCtrl', 
  ($scope, $state, $location, $stateParams, socket, roomJoined, Player, apiService, $sce) => {

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
      $state.go('base.room.play')
    })

    $scope.ready = () => {
      if (Player.name && $scope.roomJoined) {
        Player.saveName();
        socket.emit('ready', {
          roomId: $scope.roomJoined,
          name: Player.name
        });
      } else {
        alert('You have no name? How can you win if you have no name??');
      }
    };

    $scope.svgQR = '';

    $scope.getQR = () => {
      console.log('getting QR');
      apiService.send('/qr', {
        url: $location.absUrl()
      }).then(svg => {
        console.log(svg)
        $scope.svgQR = $sce.trustAsHtml(svg);
      })
    }

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
