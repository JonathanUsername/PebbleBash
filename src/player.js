import * as _ from 'lodash';
import socket, { getSocket } from './socket.js';

const players = [];

function getPlayer (id) {
  const finds = players.filter(i => i.id === id);
  if (finds.length < 1) {
    console.log('Cannot find player', id)
    return false
  }
  return finds[0];
}

function createPlayer (id) {
  return new Player({
    id: id,
    socket: getSocket[id]
  })
}

class Player {
  constructor (args) {
    if (!args.id) {
      throw new Error('Error! No id when creating player.')
    }

    _.assign(this, args);

    this.lost = false;

    players.push(this);

    return this;
  }

  add(room) {
    room.addPlayer(this);
    return this;
  }

  remove(room) {
    if (!this || !room) {
      console.log('no this', this)
      return;
    }
    room.removePlayer(this);
    return this;
  }

  tell(data) {
    console.log(data.type, this.name)
    this.socket.emit(data.type, data);
    return this;
  }

  win() {
    return this.tell({
      type: 'win'
    });
  }

  lose() {
    this.lost = true;
    this.room.playerLost(this);
    return this.tell({
      type: 'lose'
    });
  }

}

export {getPlayer, Player, createPlayer};