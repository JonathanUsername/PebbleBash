import * as _ from 'lodash';
import Path from 'path';
import ejs from 'ejs';
import Hapi from 'hapi';
import logger from 'winston';
import Boom from 'boom';
import socket, { getSocket, socketsInRoom } from './socket.js';
import Moniker from 'moniker';
import qr from 'qr-image';

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
    path: '/qr',
    handler: function (request, reply) {
      const url = request.payload.url;
      logger.info(`Creating SVG sync for ${url}`)
      reply(qr.imageSync(url, { type: 'svg' }))
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
      if (missing.length > 0) {
        return reply(Boom.badRequest(`Missing required options: ${missing.map(i => i.name).join(', ')}`));
      }

      const gameName = request.params.gameName.toLowerCase().trim();
      const playerName = request.params.name;
      const playerId = request.params.playerId;

      let roomId;
      let others;

      if (gameName === 'new') {
        roomId = Moniker.choose();
        others = [];
      } else {
        roomId = gameName;
        others = socketsInRoom(gameName, true)
      }

      const knownSocket = getSocket(playerId);

      if (knownSocket) {
        const socket = getSocket[playerId]
        socket.join(gameName);
      }

      return reply({
        roomId: roomId,
        others: others
      });
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
