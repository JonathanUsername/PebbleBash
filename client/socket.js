
const socket = io.connect();
const rate = 10
const room = location.search.split('?')[1];
let counter = 0

window.addEventListener('deviceorientation', listener, false);

socket.emit('join', room)

function listener(ev) {
  if (counter % rate === 0) 
    counter = 0;
  else 
    return;

  const e = {
    alpha: Math.round(ev.alpha),
    beta: Math.round(ev.beta),
    gamma: Math.round(ev.gamma),
    room
  }

  let str = '';
  for (var i in e) {
    str += `<p>${i}: ${e[i]}</p>`
  }
  document.getElementById('console').innerHTML = str
  socket.emit('movement', e);
}
