app.controller('playCtrl', 
  ($scope, $state, $stateParams, socket, Player) => {

    console.log('starting play controller')

    // Limit for sharp movement
    const LIMIT = 5;

    // CHANGEME
    $scope.dev = true;

    $scope.lose = lose;
    $scope.playState = 'alive';

    window.addEventListener('devicemotion', listener, false);

    socket.on('gameover', data => {
      window.removeEventListener('devicemotion', listener, false)
      console.log('winner id vs yours', data.winner.id, Player.id)
      if (data.winner.id === Player.id) {
        console.log('you win!')
        $state.go('base.room.win')
      } else {
        console.log('you lose!')
        $state.go('base.room.lose')
      }
    })

    function isWinner(data) {
      return data.winnerId === Player.id
    }

    function listener(ev) {
      if (!ev.acceleration) return;
      const acc = ev.acceleration;
      jogHandler(acc.x, acc.y, acc.z);
    }

    function jogHandler(x, y, z) {
      const arr = [x, y, z]
      if (arr.filter(overTheLimit).length > 0) {
        lose();
      }
    }

    function overTheLimit(coord) {
      if (coord > LIMIT) {
          return true;
      }
      return false;
    }


    // For DEV only
    function lose() {
      $scope.playState = 'dead';
      window.removeEventListener('devicemotion', listener, false);
      window.navigator.vibrate(500);
      socket.emit('loser')
      console.log('lost')
    }

  })

app.controller('endCtrl', 
  ($scope, $state, $stateParams, socket) => {

    $scope.outcome = $stateParams.outcome;

    $scope.playAgain = function() {
      socket.emit('play-again');
      $state.go('base.room');
    };

  })


angular.module('pebble-bash').config(function (
  $stateProvider
) {

  $stateProvider
    .state('base.room.play', {
        controller: 'playCtrl',
        templateUrl: 'play.html'
      })
    .state('base.room.win', {
        controller: 'endCtrl',
        params: {
          outcome: 'win'
        },
        templateUrl: 'end.html'
      })
    .state('base.room.lose', {
        controller: 'endCtrl',
        params: {
          outcome: 'lose'
        },
        templateUrl: 'end.html'
      });

});
