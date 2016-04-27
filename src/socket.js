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
      logger.debug('user connected', socket.id)

      const roomNumber = ~~(Math.random() * 9999)
      socket.join(roomNumber)
      socket.emit('joined', roomNumber)

      socket.on('join', r => {
        socket.join(r)
        io.to(r).emit('start')
      })

      socket.on('movement', o => {
        console.log(o)
        io.to(o.room).emit('orientate', o)
      })

    });

  }

};

const messenger = new Messenger();

export {messenger as default};