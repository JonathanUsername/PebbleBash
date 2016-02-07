import socket from 'socket.io';
import { Player, getPlayer, createPlayer } from './player.js'
import { getRoom } from './room.js'

let io;

const sockets = {}; // Indexed by socket id

function Messenger () {

  this.register = (listener) => {

    io = require('socket.io')(listener);

    io.on('connection', function(socket){
      console.log('a user connected', socket.id);
      sockets[socket.id] = socket;

      const player = createPlayer({
        id: socket.id,
        socket: socket
      })

      socket.on('disconnect', function(){
        console.log('user disconnected');
        const player = getPlayer(socket.id);
        if (player) {
          player.remove();
        }
      });

      socket.on('loser', function(data){
        if (!player.lost) {
          console.log('user lost', data.id);
          player.lose();
        }
      });

      socket.on('join', function(data){
        if (data.name && data.name !== 'Anonymous') {
          player.name = data.name;
        }
        socket.join(data.room);
        player.add(data.room);
      });

      socket.on('ready', function(data){
        if (data.name && data.name !== 'Anonymous') {
          player.name = data.name;
        }
        getRoom(data.roomId).ready(getPlayer(data.playerId));
      });

    });

  }

};

function broadcastTo(roomId, event, data) {
  io.sockets.in(roomId).emit(event, data);
}

function getSocket (id) {
  return sockets[id];
}

const messenger = new Messenger();

export {messenger as default, getSocket, broadcastTo };