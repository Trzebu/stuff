module.exports = class World {

    constructor (websocketServer) {
        this.wss = websocketServer;
        this.players = [];
    }

    addPlayer (player) { 
        this.players.push(player); 
    }

    removePlayer (playerId) {
        for (let i = 0; i < this.players.length; i++) {
            if (this.players[i].id == playerId) {
                this.players.splice(i, 1);
            }
        }
    }

}