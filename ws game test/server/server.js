let WebSocket =  require("ws");
let http = require("http");
let WorldServer = require("./world");
let Player = require("./Player");

function main () {
    const PORT = 21337;
    let httpServer = http.createServer();
    let wss = new WebSocket.Server({ 
        server: httpServer 
    });
    let world = new WorldServer(wss);

    wss.on("connection", (ws, req) => {
        world.addPlayer(
            new Player(
                ws, world, 
                world.players.length + 1
            )
        );
    });

    httpServer.listen(PORT);
    console.log("Server started.");
}

main();