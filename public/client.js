'use strict';

var app = angular.module('pebble-bash', ['ui.router']);

app.run(function ($rootScope, $state, $window, $log, $stateParams, $q) {
  $rootScope.$on('$stateChangeError', $log.log.bind($log));

  $rootScope.$state = $state;
  $rootScope.$stateParams = $stateParams;

  console.log('starting module');
});
'use strict';

app.controller('baseCtrl', function ($scope, $rootScope, $state, $stateParams, socket, apiService, Player, loading) {

  console.log('starting base controller');

  $scope.player = Player;

  loading.start();

  console.log($state.current.name);

  $scope.newGame = function () {
    $state.go('base.waiting', {
      roomId: 'new'
    }, {
      reload: true
    });
  };
});

angular.module('pebble-bash').config(function ($stateProvider, $urlRouterProvider) {

  // Default route is base
  $urlRouterProvider.otherwise('/');

  $stateProvider.state('base', {
    url: '/',
    controller: 'baseCtrl',
    templateUrl: 'base.html',
    resolve: {
      socketConnected: function socketConnected(Player) {
        return Player.connected();
      }
    }
  });
});
// const LIMIT = 5;

// const socket = io();
// const indicator = $('#indicator');

// if (!window.DeviceMotionEvent) {
//   alert('Device motion is not supported! You can\'t have any fun, sorry.');
// }

// if (localStorage.name) {
//   $('#name').val(localStorage.name);
// }

// $('#newGame').click(newGame);
// $('#joinGame').click(joinGame);
// $('#startGame').click(startGame);
// $('#lose').click(lose);
// // $('.playAgain').click(playAgain);

// function send (url, data) {
//   const params = data ? data : {};

//   const name = $('#name').val();
//   localStorage.name = name;

//   params.name = name;
//   params.playerId = socket.id;

//   return $.ajax(url, {
//     method: 'POST',
//     data: params
//   });
// }

// function newGame () {
//   const url = '/room/new';
//   send(url)
//     .done(data => {
//       $('.starting-info').hide();
//       $('#gameName').text(`Your game name is: ${data.roomId}`)
//       localStorage.gameName = data.roomId;
//       $('.waiting').show();
//     })
// }

// function joinGame () {
//   const url = '/room/' + $('#gameId').val();
//   send(url)
//     .done(data => {
//       if (data.error) {
//         alert(room.error)
//       } else {
//         $('.starting-info').hide();
//         $('#gameName').text(`Your game name is: ${data.roomId}`)
//         localStorage.gameName = data.roomId;
//         $('.waiting').show();
//       }
//     })
//   $('gameId').val();
// }

// function changeState (nextState) {

// }

// let currentState;
// currentState = 'initial';

// const state = {
//   initial: () => {
//     $('.starting-info').show();
//     $('#win-screen').hide();
//     $('#lose-screen').hide();
//     $('#gameName').text('');
//     $('.waiting').hide();
//   },
//   waitingRoom: () => {
//     $('.starting-info').hide();
//     $('#gameName').text(`Your game name is: ${data.roomId}`)
//     $('.waiting').show();
//   },
//   playing: () => {

//   },
//   won: () => {

//   },
//   lost: () => {

//   }
// }

// function startGame () {

//   // const name = $('#name').val();

//   // if (!name) return alert('You must tell me who you are!');

//   window.addEventListener('devicemotion', listener, false);

//   indicator.addClass('alive').show();

//   socket.on('gameover', data => {
//     window.removeEventListener('devicemotion', listener, false)
//     console.log(data)
//     console.log(socket.id)
//     var winner = data.winner;
//     var won = isWinner(data);
//     if (won) {
//       winner = 'YOU';
//       $('#win-screen').show();
//     } else {
//       $('#lose-screen').show();
//     }
//     indicator.removeClass('alive')
//       .removeClass('loser')
//       .text('')
//       .hide();
//   })
// }

// function isWinner(data) {
//   return data.winnerId === socket.id
// }

// function listener(ev) {
//   if (!ev.acceleration) return;
//   const acc = ev.acceleration;
//   jogHandler(acc.x, acc.y, acc.z);
// }

// function jogHandler(x, y, z) {
//   const arr = [x, y, z]
//   if (arr.filter(overTheLimit).length > 0) {
//     lose(listener);
//   }
// }

// function overTheLimit(coord) {
//   if (coord > LIMIT) {
//       return true;
//   }
//   return false;
// }

// function lose() {
//   window.removeEventListener('devicemotion', listener, false);
//   indicator.removeClass('alive').addClass('loser').text('LOSER');
//   socket.emit('loser', {
//     id: socket.id
//   })
//   window.navigator.vibrate(500);
// }
"use strict";
'use strict';

app.factory('loading', function () {
  var loading = false;
  return {
    isLoading: function isLoading() {
      return loading;
    },
    start: function start() {
      loading = true;
    },
    finish: function finish() {
      loading = false;
    }
  };
});
'use strict';

app.factory('Player', function ($http, $q, $log, $rootScope, socket, loading) {
  var _this = this;

  var Player = {
    id: '',
    name: localStorage.playerName || ''
  };

  var connectedPromise = $q.defer();

  Player.connected = function () {
    return connectedPromise.promise;
  };

  socket.on('connect', function () {
    console.log('socket connected');
    Player.id = socket.getId();
    loading.finish();
    connectedPromise.resolve(Player.id);
  });

  Player.getId = function () {
    return _this.id;
  };
  Player.getName = function () {
    return _this.name;
  };

  return Player;
});
'use strict';

app.factory('apiService', function ($http, $q, $log, $rootScope, socket, loading, Player) {

  return {
    send: function send(url, data) {

      var deferred = $q.defer();

      loading.start();

      var params = data ? data : {};

      params.name = params.name || Player.name;
      params.playerId = params.playerId || Player.id;

      localStorage.playerName = Player.name;

      console.log(params);

      $http.post(url, params).then(function (resp) {
        loading.finish();
        deferred.resolve(resp.data);
      }, function (err) {
        loading.finish();
        alert(err.data.message);
        deferred.reject();
      });

      return deferred.promise;
    }
  };
});
'use strict';

app.factory('socket', function ($rootScope) {
  var socket = io.connect();

  socket.on('disconnect', function () {
    console.log('DISCONNECTED FROM SOCKET');
  });

  socket.on('player-joined', function (name) {
    console.log('Player joined: ', name);
  });

  return {
    on: function on(eventName, callback) {
      socket.on(eventName, function () {
        var args = arguments;
        $rootScope.$apply(function () {
          callback.apply(socket, args);
        });
      });
    },
    emit: function emit(eventName, data, callback) {
      socket.emit(eventName, data, function () {
        var args = arguments;
        $rootScope.$apply(function () {
          if (callback) {
            callback.apply(socket, args);
          }
        });
      });
    },
    getId: function getId() {
      return socket.id;
    }
  };
});
'use strict';

app.controller('waitingCtrl', function ($scope, $rootScope, $state, $stateParams, socket, apiService, roomJoined, Player) {

  console.log('starting waiting controller');

  // Update room if new
  $scope.roomJoined = roomJoined.roomId;
  $state.go('.', {
    roomId: $scope.roomJoined
  }, { reload: false });

  console.log($stateParams);

  $scope.something = 'yeah';

  $scope.goBack = function () {
    $state.go('base');
  };

  $scope.ready = function () {
    if (Player.name && $scope.roomJoined) {
      socket.emit('ready', {
        roomId: $scope.roomJoined
      });
    } else {
      alert('You have no name? How can you win if you have no name??');
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
});

angular.module('pebble-bash').config(function ($stateProvider) {

  $stateProvider.state('base.waiting', {
    url: ':roomId/waiting/',
    controller: 'waitingCtrl',
    templateUrl: 'waiting.html',
    resolve: {
      roomJoined: function roomJoined($stateParams, apiService, socketConnected, Player) {
        return apiService.send('/room/' + $stateParams.roomId, {
          playerId: Player.id,
          name: Player.name || 'Anonymous'
        });
      }
    }
  });
});

//# sourceMappingURL=client.js.map