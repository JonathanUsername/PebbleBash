'use strict';

var app = angular.module('pebble-bash', ['ui.router']);

app.run(function ($rootScope, $state, $log, $stateParams, loading) {
  $rootScope.$on('$stateChangeError', $log.log.bind($log));
  $rootScope.$on('$stateChangeStart', function () {
    loading.start();
  });
  $rootScope.$on('$stateChangeSuccess', function () {
    loading.finish();
  });

  $rootScope.$state = $state;
  $rootScope.$stateParams = $stateParams;

  console.log('starting module');
});
'use strict';

app.controller('baseCtrl', function ($scope, $state, Player) {

  console.log('starting base controller');

  $scope.player = Player;

  $scope.newGame = function () {
    $state.go('base.room', {
      roomId: 'new'
    }, {
      reload: true, // Not sure this is needed
      location: false
    });
  };
});

angular.module('pebble-bash').config(function ($stateProvider, $urlRouterProvider, $urlMatcherFactoryProvider) {

  // Default route is base
  $urlRouterProvider.otherwise('/');

  // Allow no trailing slash
  $urlMatcherFactoryProvider.strictMode(false);

  $stateProvider.state('base', {
    url: '/',
    controller: 'baseCtrl',
    templateUrl: 'base.html',
    resolve: {
      leaveRooms: function leaveRooms(socket) {
        // Make sure we're not in a room
        console.log('resolving leave');
        socket.emit('leave');
      },
      socketConnected: function socketConnected(Player) {
        return Player.resolveConnect();
      }
    }
  });
});
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

app.controller('playCtrl', function ($scope, $state, socket, Player, $location) {

  console.log('starting play controller');

  // Limit for sharp movement
  var LIMIT = 5;

  // CHANGEME
  $scope.dev = $location.host() === 'localhost';

  $scope.lose = lose;
  $scope.playState = 'alive';

  window.addEventListener('devicemotion', listener, false);

  socket.on('gameover', function (data) {
    window.removeEventListener('devicemotion', listener, false);
    if (data.draw) {
      console.log('you... draw?');
      return $state.go('base.room.draw');
    }
    if (data.winner.id === Player.id) {
      console.log('you win!');
      $state.go('base.room.win');
    } else {
      console.log('you lose!');
      $state.go('base.room.lose');
    }
  });

  function isWinner(data) {
    return data.winnerId === Player.id;
  }

  function listener(ev) {
    if (!ev.acceleration) return;
    var acc = ev.acceleration;
    jogHandler(acc.x, acc.y, acc.z);
  }

  function jogHandler(x, y, z) {
    var arr = [x, y, z];
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

  function lose() {
    $scope.playState = 'dead';
    window.removeEventListener('devicemotion', listener, false);
    window.navigator.vibrate(2000);
    socket.emit('loser');
    console.log('you lost');
  }
});

app.controller('endCtrl', function ($scope, $state, $stateParams, socket) {

  $scope.outcome = $stateParams.outcome;
  $scope.text = $stateParams.text;

  $scope.playAgain = function () {
    socket.emit('play-again');
    $state.go('base.room');
  };
});

angular.module('pebble-bash').config(function ($stateProvider) {

  $stateProvider.state('base.room.play', {
    controller: 'playCtrl',
    templateUrl: 'play.html'
  }).state('base.room.win', {
    controller: 'endCtrl',
    params: {
      outcome: 'win',
      text: 'WINNAH'
    },
    templateUrl: 'end.html'
  }).state('base.room.lose', {
    controller: 'endCtrl',
    params: {
      outcome: 'lose',
      text: 'LOOZAH'
    },
    templateUrl: 'end.html'
  }).state('base.room.draw', {
    controller: 'endCtrl',
    params: {
      outcome: 'draw',
      text: 'It\'s a... draw?'
    },
    templateUrl: 'end.html'
  });
});
'use strict';

app.factory('Player', function ($http, $q, $log, $rootScope, socket, $stateParams) {
  var _this = this;

  var Player = {
    id: '',
    name: localStorage.playerName || ''
  };

  var connectedPromise = $q.defer();

  Player.resolveConnect = function () {
    return connectedPromise.promise;
  };

  Player.joinRoom = function (roomId) {
    console.log('emitting join', roomId);
    Player.room = roomId;
    socket.emit('join', Player);
  };

  Player.saveName = function () {
    localStorage.playerName = Player.name;
  };

  socket.on('connect', function () {
    console.log('socket connected');
    Player.id = socket.getId();
    if ($stateParams.roomId) {
      console.log('stateparams exists so joining');
      Player.joinRoom($stateParams.roomId);
    }
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

app.controller('roomCtrl', function ($scope, $state, $location, $stateParams, socket, roomJoined, Player) {

  console.log('starting room controller');

  $scope.others = [];

  $scope.others = $scope.others.concat(roomJoined.others);

  // Update room if new
  $scope.roomJoined = roomJoined.roomId;
  $state.go('.', {
    roomId: $scope.roomJoined
  }, { reload: false });

  $scope.something = 'yeah';
  $scope.url = $location.absUrl();

  socket.on('room-update', function (others) {
    console.log('Room update: ', others);
    $scope.others = others;
  });

  console.log('joining room');
  Player.joinRoom($stateParams.roomId);

  $scope.goBack = function () {
    socket.emit('leave');
    $state.go('base');
  };

  socket.on('start', function (msg) {
    console.log('STARTING!', msg);
    $state.go('base.room.play');
  });

  $scope.ready = function () {
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
});

angular.module('pebble-bash').config(function ($stateProvider) {

  $stateProvider.state('base.room', {
    url: 'room/:roomId/',
    controller: 'roomCtrl',
    templateUrl: 'room.html',
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

  socket.on('message', function (data) {
    console.log('message:', data);
  });

  return {
    on: function on(eventName, callback) {
      console.log('registering', eventName);
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

//# sourceMappingURL=client.js.map