module.exports = class Player {

    constructor (connection, WorldServer, id) {
        this.connection = connection;
        this.world = WorldServer;
        this.x = 0;
        this.y = 0;
        this.dir = "";
        this.id = id;
        this.sendOtherPlayersData();
        this.sendMyDataToOther();
        connection.on("message", (msg) => {
            msg = JSON.parse(msg);
            this.x = msg.x;
            this.y = msg.y;
            this.dir = msg.dir;
            this.moveMe();
        });
        connection.on("close", () => {
            this.world.removePlayer(this.id);
        });
    }

    moveMe () {
        this.world.wss.clients.forEach((client) => {
            if (client != this.connection) {
                client.send(JSON.stringify({
                    "action": "moveOther",
                    "data": {
                        "id": this.id,
                        "x": this.x,
                        "y": this.y,
                        "dir": this.dir
                    }
                }));
            }
        });
    }

    sendMyDataToOther () {
        this.world.wss.clients.forEach((client) => {
            if (client != this.connection) {
                client.send(JSON.stringify({
                    "action": "newOther",
                    "data": this.id
                }));
            }
        });
    }

    sendOtherPlayersData () {
        let players = [];
        for (let i = 0; i < this.world.players.length; i++) {
            players.push({
                "id": this.world.players[i].id,
                "x": this.world.players[i].x,
                "y": this.world.players[i].y
            });
        }
        this.connection.send(JSON.stringify({
            "action": "loadOther",
            "data": players
        }));
    }
    
}