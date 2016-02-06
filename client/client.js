const LIMIT = 5;

const socket = io();
const out = $('#console')[0];
const indicator = $('#indicator');

if (!window.DeviceMotionEvent) {
  alert('Device motion is not supported! You can\'t have any fun, sorry.');
}

if (localStorage.name) {
  $('#name').val(localStorage.name);
}

$('#newGame').click(newGame);
$('#joinGame').click(joinGame);
$('#startGame').click(startGame);
$('#lose').click(lose);
$('.playAgain').click(playAgain);

function send (url, data) {
  const params = data ? data : {};

  const name = $('#name').val();
  localStorage.name = name;

  params.name = name;
  params.playerId = socket.id;

  return $.ajax(url, {
    method: 'POST',
    data: params
  });
}

function newGame () {
  const url = '/room/new';
  send(url)
    .done(data => {
      $('.starting-info').hide();
      $('#console').text(`Your game name is: ${data.roomId}`)
      localStorage.gameName = data.roomId;
      $('#startGame').show();
    })
}

function joinGame () {
  const url = '/room/' + $('#gameId').val();
  send(url)
    .done(data => {
      if (data.error) {
        alert(room.error)
      } else {
        $('.starting-info').hide();
        $('#console').text(`Your game name is: ${data.roomId}`)
        localStorage.gameName = data.roomId;
        $('#startGame').show();
      }
    })
  $('gameId').val();
}

function playAgain () {
  $('.starting-info').show();
  $('#win-screen').hide();
  $('#lose-screen').hide();
}

function startGame () {

  // const name = $('#name').val();

  // if (!name) return alert('You must tell me who you are!');

  window.addEventListener('devicemotion', listener, false);

  indicator.addClass('alive').show();

  socket.on('gameover', data => {
    window.removeEventListener('devicemotion', listener, false)
    console.log(data)
    console.log(socket.id)
    var winner = data.winner;
    var won = isWinner(data);
    if (won) {
      winner = 'YOU';
      $('#win-screen').show();
    } else {
      $('#lose-screen').show();
    }
    indicator.removeClass('alive')
      .removeClass('loser')
      .text('')
      .hide();
  })
}

function isWinner(data) {
  return data.winnerId === socket.id
}


function listener(ev) {
  if (!ev.acceleration) return;
  const acc = ev.acceleration;
  jogHandler(acc.x, acc.y, acc.z);
}

function jogHandler(x, y, z) {
  const arr = [x, y, z]
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
  indicator.removeClass('alive').addClass('loser').text('LOSER');
  socket.emit('loser', {
    id: socket.id
  })
  window.navigator.vibrate(500);
}