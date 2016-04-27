'use strict';

var socket = io.connect();
var rate = 10;
var room = location.search.split('?')[1];
var counter = 0;

window.addEventListener('deviceorientation', listener, false);

socket.emit('join', room);

function listener(ev) {
  if (counter % rate === 0) counter = 0;else return;

  var e = {
    alpha: Math.round(ev.alpha),
    beta: Math.round(ev.beta),
    gamma: Math.round(ev.gamma),
    room: room
  };

  var str = '';
  for (var i in e) {
    str += '<p>' + i + ': ' + e[i] + '</p>';
  }
  document.getElementById('console').innerHTML = str;
  socket.emit('movement', e);
}

//# sourceMappingURL=client.js.map