import socket from 'socket.io';
import { Player, getPlayer } from './player.js'
import { getRoom } from './room.js'

let io;

const sockets = {}; // Indexed by socket id

function Messenger () {

  this.register = (listener) => {

    io = require('socket.io')(listener);

    io.on('connection', function(socket){
      console.log('a user connected', socket.id);
      sockets[socket.id] = socket;

      const player = new Player({
        id: socket.id,
        socket: socket
      })

      socket.on('disconnect', function(){
        console.log('user disconnected');
        const player = getPlayer(socket.id)
        if (player) {
          player.remove();
        }
      });

      socket.on('loser', function(data){
        if (!player.lost) {
          console.log('user lost', data.id);
          player.lose()
        }
      });

      socket.on('join', function(data){
        player.add(data.room)
      });
    });

  }

  this.getSocket = (id) => {
    return sockets[id];
  }

  // this.send = (data) => {
  //   const id = clients[data.socketId];
  //   console.log('Emitting to client', JSON.stringify(data));
  //   if (sockid) {
  //     sockets[id].emit(data.type, data);
  //   }
  // }

};

const messenger = new Messenger();

export default messenger;