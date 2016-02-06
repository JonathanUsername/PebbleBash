'use strict';

var LIMIT = 5;

var socket = io();
var out = $('#console')[0];
var bg = $('#background');

if (!window.DeviceMotionEvent) {
  alert('Device motion is not supported! You can\'t have any fun, sorry.');
}

if (localStorage.gameName) {
  $('gameId').val(localStorage.gameName);
}

$('#newGame').click(newGame);
$('#joinGame').click(joinGame);
$('#startGame').click(startGame);
$('#lose').click(lose);

function send(url, data) {
  var params = data ? data : {};
  params.playerId = socket.id;
  return $.ajax(url, {
    method: 'POST',
    data: params
  });
}

function newGame() {
  var url = '/room/new';
  send(url).done(function (data) {
    $('.starting-info').hide();
    $('#console').text('Your game name is: ' + data.roomId);
    localStorage.gameName = data.roomId;
    $('#startGame').show();
  });
}

function joinGame() {
  var url = '/room/' + $('#gameId').val();
  send(url).done(function (data) {
    if (data.error) {
      alert(room.error);
    } else {
      $('.starting-info').hide();
      $('#console').text('Your game name is: ' + data.roomId);
      localStorage.gameName = data.roomId;
      $('#startGame').show();
    }
  });
  $('gameId').val();
}

function startGame() {

  // const name = $('#name').val();

  // if (!name) return alert('You must tell me who you are!');

  window.addEventListener('devicemotion', listener, false);

  bg.addClass('alive').show();

  socket.on('gameover', function (data) {
    window.removeEventListener('devicemotion', listener, false);
    alert('game over!', JSON.stringify(data));
  });
}

function listener(ev) {
  if (!ev.acceleration) return;
  var acc = ev.acceleration;
  jogHandler(acc.x, acc.y, acc.z);
}

function jogHandler(x, y, z) {
  var arr = [x, y, z];
  if (arr.filter(overTheLimit).length > 0) {
    lose(listener);
  }
}

function overTheLimit(coord) {
  if (coord > LIMIT) {
    return true;
  }
  return false;
}

function lose() {
  window.removeEventListener('devicemotion', listener, false);
  bg.removeClass('alive').addClass('loser').text('LOSER');
  socket.emit('loser', {
    id: socket.id
  });
  window.navigator.vibrate(500);
}
//# sourceMappingURL=client.js.map