import _ from 'lodash';
import Moniker from 'moniker';
import { broadcastTo } from './socket.js';

const rooms = [];

function getRoom (id) {
  const finds = rooms.filter(i => i.id === id);
  if (finds.length < 1) {
    console.log('Cannot find room', id)
    return false
  }
  return finds[0];
}

class Room {
  constructor (args) {
    _.assign(this, args);

    if (!this.id) {
      this.id = Moniker.choose();
    }

    this.players = [];

    console.log('adding room to rooms')
    rooms.push(this);

    return this;
  }

  getPlayers() {
    return this.players.map(i => i.name);
  }

  addPlayer(player) {
    console.log('adding player to room')
    this.players.push(player)
    player.room = this;
    console.log(`Players currently in room: ${this.getPlayers()}`)
    broadcastTo(this.id, 'player-joined', player.name)
    return this;
  }

  removePlayer(player) {
    console.log(`removing player ${player.id}`)
    const newArray = this.players.filter(i => i.id !== player.id)
    this.players = newArray;
    player.room = false;
    return this;
  }

  playerLost(player) {
    console.log('Room knows player lost')
    const winners = this.players.filter(i => !i.lost)
    if (winners.length === 1) {
      const winner = winners[0];
      console.log(`${winner.name} won!`)
      winner.win();
      this.stop({
        winner: winner
      });
    } else if (winners.length === 0) {
      console.log('Nobody won!')
      this.stop({
        winner: 'Nobody'
      })
    }
    return this;
  }

  start(data) {
    _.each(this.players, player => {
      player.tell({
        type: 'start',
        roomId: this.roomId,
        players: this.players
      })
      player.lost = false;
    })
    this.started = true;
    return this;
  }

  stop(data) {
    _.each(this.players, player => {
      console.log(`Telling ${player.id} it's gameover`)
      
      // Be careful not to emit circular objects
      player.tell({
        type: 'gameover',
        roomId: this.roomId,
        players: this.players.map(p => p.id),
        winner: data.winner.name,
        winnerId: data.winner.id
      })
    })
    this.started = false;
    console.log(`Finished telling everyone it's gameover`)
    return this;
  }
}


export {Room, getRoom};