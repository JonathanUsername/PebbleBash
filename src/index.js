import * as _ from 'lodash';
import Path from 'path';
import ejs from 'ejs';
import Hapi from 'hapi';
import logger from 'winston';
import socket from './socket.js'
import {getPlayer, Player} from './player.js'
import {getRoom, Room} from './room.js'

const server = new Hapi.Server();

server.connection({ 
  port: process.env.PORT || 5000 
});

socket.register(server.listener)

server.register(require('inert'), (err) => {

  server.route({
    method: 'GET',
    path: '/',
    handler: function (request, reply) {
      reply.file('public/index.html');
    }
  });

  server.route({
    method: 'POST',
    path: '/room/{gameName}',
    handler: function (request, reply) {
      const gameName = request.params.gameName;
      const playerId = request.payload.playerId

      logger.info(`Requested game ${playerId}`);
      const player = getPlayer(playerId)

      if (gameName === 'new') {
        const room = new Room().addPlayer(player)
        console.log(room)
        return reply({
          roomId: room.id
        });
      }

      const existingRoom = getRoom(gameName);
      if (existingRoom) {
        existingRoom.addPlayer(player);
        return reply({
          roomId: existingRoom.id
        })
      } else {
        return reply({ 
          error: `Could not find room with name "${gameName}"`
        });
      }
    }
  });

  server.route({
    method: 'GET',
    path: '/{file*}',
    config: {
      handler: {
        directory: {
          path:  'public',
          listing: false
        }
      }
    }
  });

  server.start((err) => {
    if (err) throw err;
    console.log('Server running at:', server.info.uri);
  });

});
