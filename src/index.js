import * as _ from 'lodash';
import Path from 'path';
import ejs from 'ejs';
import Hapi from 'hapi';
import logger from 'winston';
import Boom from 'boom';
import socket from './socket.js'
import {getPlayer, Player, createPlayer} from './player.js'
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
      const mustHaves = [{ name: 'Game name', item: request.params.gameName }, 
                        { name: 'Player ID', item: request.payload.playerId },
                        { name: 'Player Name', item: request.payload.name }];

      const missing = mustHaves.filter(i => !i.item);
      console.log(mustHaves.map(i => i.item))
      if (missing.length > 0) {
        return reply(Boom.badRequest(`Missing required options: ${missing.map(i => i.name).join(', ')}`));
      }

      const gameName = request.params.gameName.toLowerCase().trim();
      const playerId = request.payload.playerId
      const playerName = request.payload.name

      if (!request.params.gameName || request.payload.playerId || request.payload.name)

      logger.info(`Requested player ${playerId}`);

      const foundPlayer = getPlayer(playerId);
      const player = foundPlayer ? foundPlayer : createPlayer(playerId);

      player.name = playerName;

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
        const room = new Room({
          id: gameName
        }).addPlayer(player)
        console.log(room)
        return reply({
          roomId: room.id
        });
        // return reply(Boom.badRequest(`Cannot find room by that name! Has it closed/emptied already?`));
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
