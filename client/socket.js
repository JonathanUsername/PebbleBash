app.factory('socket', function ($rootScope) {
  var socket = io.connect();

  socket.on('disconnect', () => {
    console.log('DISCONNECTED FROM SOCKET')
  })

  socket.on('message', (data) => {
    console.log('message:', data)
  })

  return {
    on: function (eventName, callback) {
      console.log('registering', eventName)
      socket.on(eventName, function () {  
        var args = arguments;
        $rootScope.$apply(function () {
          callback.apply(socket, args);
        });
      });
    },
    emit: function (eventName, data, callback) {
      socket.emit(eventName, data, function () {
        var args = arguments;
        $rootScope.$apply(function () {
          if (callback) {
            callback.apply(socket, args);
          }
        });
      })
    },
    getId: function() {
      return socket.id;
    }
  };
});