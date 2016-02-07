import socket from 'socket.io';
import _ from 'lodash';

let io;

const sockets = {}; // Indexed by socket id

function Messenger () {

  this.register = (listener) => {

    io = require('socket.io')(listener);

    io.on('connection', function(socket){
      console.log('a user connected', socket.id);
      sockets[socket.id] = socket;
      _.assign(socket, {
        name: 'Anonymous',
        ready: false,
        loser: false,
        room: false
      });

      socket.on('disconnect', function(){
        console.log('user disconnected', socket.id);
        socket.leave(socket.room);
        console.log('Currently in room:', socketsInRoom(socket.room, true))

        sendUpdate(socket);
      });

      socket.on('join', function(data){
        if (socket.lastRoom) {
          socket.leave(socket.lastRoom);
          socket.lastRoom = null;
        }
        _.assign(socket, data);
        socket.join(socket.room);
        socket.lastRoom = socket.room;

        sendUpdate(socket);
      });

      socket.on('leave', function(data){
        socket.leave(socket.room);
        socket.ready = false;

        sendUpdate(socket);
      });

      socket.on('ready', function(data){
        if (data.name && data.name !== 'Anonymous') {
          socket.name = data.name;
        }
        socket.ready = true;

        const allPlayers = socketsInRoom(socket.room)

        const readyPlayers = allPlayers.filter(i => i.ready);

        sendUpdate(socket);

        console.log('readyPlayers:', readyPlayers.map(i => i.name));
        console.log(readyPlayers.length, allPlayers.length)
        if (readyPlayers.length === allPlayers.length) {
          console.log('STARTING', socket.room)
          io.sockets.in(socket.room)
            .emit('start', 'YEAH');
        }
      });

      socket.on('loser', function(){
        console.log('user lost', socket.name, socket.id);
        socket.loser = true;
        checkWinner();
      });

      function checkWinner() {
        const allPlayers = socketsInRoom(socket.room);
        const stillStanding = allPlayers.filter(i => !i.loser);
        if (stillStanding.length === 1) {
          console.log('we have a winner!')
          io.sockets.in(socket.room)
            .emit('gameover', {
              winner: reduceSocketInfo(stillStanding[0])
            });
        }
      }


    });

  }

};

function sendUpdate(socket) {
  const others = socketsInRoom(socket.room, true)
  console.log('Currently in room:', socket.room, others)
  io.sockets.in(socket.room)
    .emit('room-update', others)
}

function socketsInRoom(roomId, reduced) {
  const res = [];
  roomId = roomId;
  const room = io.sockets.adapter.rooms[roomId];
  if (room) {
    for (var id in room) {
      res.push(io.sockets.adapter.nsp.connected[id]);
    }
  }
  if (reduced) {
    return reduceSocketInfo(res)
  }
  return res;
}

function reduceSocketInfo(arr) {
  if (!arr.length) {
    arr = [arr];
  }
  return arr.map(i => { 
      return {
        name: i.name, 
        ready: i.ready,
        id: i.id
      }
    });
}

function broadcastTo(roomId, event, data) {
  io.sockets.in(roomId).emit(event, data);
}

function getSocket (id) {
  return sockets[id];
}

const messenger = new Messenger();

export {messenger as default, getSocket, broadcastTo, socketsInRoom };