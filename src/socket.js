import socket from 'socket.io';
import _ from 'lodash';
import logger from 'winston';

let io;

logger.level = 'debug'

const sockets = {}; // Indexed by socket id

function Messenger () {

  this.register = (listener) => {

    io = require('socket.io')(listener);

    io.on('connection', function(socket){
      logger.debug('user connected', socket.id);

      sockets[socket.id] = socket;
      _.assign(socket, {
        name: 'Anonymous',
        ready: false,
        loser: false,
        room: false
      });

      socket.on('disconnect', function(){

        socket.leave(socket.room);

        logger.debug('user disconnected', reduceSocketInfo(socket));
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

        logger.debug(`${socket.name} joined ${socket.room}`);
        sendUpdate(socket);
      });

      socket.on('leave', function(data){

        socket.leave(socket.room);
        socket.ready = false;

        logger.debug(`${socket.name} left ${socket.room}`);
        sendUpdate(socket);
      });

      socket.on('ready', function(data){

        if (data.name && data.name !== 'Anonymous') {
          socket.name = data.name;
        }
        socket.ready = true;

        const allPlayers = socketsInRoom(socket.room);

        const readyPlayers = allPlayers.filter(i => i.ready);

        logger.debug(`${socket.name} in ${socket.room} is ready`);
        sendUpdate(socket);

        if (readyPlayers.length === allPlayers.length) {
          logger.debug(`${socket.room} is starting a game`);

          io.sockets.in(socket.room)
            .emit('start', 'YEAH');
        }
      });

      socket.on('loser', function(){
        logger.debug(`${socket.name} in ${socket.room} has lost`);

        socket.loser = true;
        socket.ready = false;
        checkWinner();
      });

      socket.on('play-again', function(){
        logger.debug(`${socket.name} in ${socket.room} is playing again`);

        _.assign(socket, {
          ready: false,
          loser: false
        });

        sendUpdate(socket);
      });

      function checkWinner() {
        const allPlayers = socketsInRoom(socket.room);
        const stillStanding = allPlayers.filter(i => !i.loser);

        logger.debug(`${stillStanding} in ${socket.room} are left`);

        if (stillStanding.length === 1) {
          const winner = reduceSocketInfo(stillStanding[0])[0];
          logger.debug(`${winner.name} in ${socket.room} has won`);
          io.sockets.in(socket.room)
            .emit('gameover', {
              winner: winner
            })
        } else if (stillStanding.length === 0) {
          io.sockets.in(socket.room)
            .emit('gameover', {
              draw: true
            })
        }
        _.each(allPlayers, i => i.ready = false)
      }


    });

  }

};

function sendUpdate(socket) {
  const others = socketsInRoom(socket.room, true)
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
  const ret = arr.map(i => { 
      return {
        name: i.name, 
        ready: i.ready,
        id: i.id
      }
    });
  return ret
}

function broadcastTo(roomId, event, data) {
  io.sockets.in(roomId).emit(event, data);
}

function getSocket (id) {
  return sockets[id];
}

const messenger = new Messenger();

export {messenger as default, getSocket, broadcastTo, socketsInRoom };