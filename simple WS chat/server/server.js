var WebSocket =  require("ws");
var http = require("http");

let messagesBuffer = [];

let httpServer = http.createServer();
let wss = new WebSocket.Server({ 
    server: httpServer 
});

function sanit (str) {
    return str.replace(/[^a-z0-9 ]/gi, '');
}

wss.on("connection", function (ws, req) {
    console.log((new Date()) + ' Connection accepted. Users online: ' + wss.clients.size);
    ws.clientData = {};

    ws.on('message', function incoming(message) {
        let data = JSON.parse(message);

        switch (data.action) {
            case "sendMessage":
                let msg = sanit(data.message);
                var pass = true;
                var errorMsg = "";

                if (msg.length < 1) {
                    pass = false;
                    errorMsg = "Your message is too short. Minimum 1 characters.";
                } else if (msg.length > 1000) {
                    pass = false;
                    errorMsg = "Your message is too long. Max 1000 characters.";
                }

                if (!pass) {
                    ws.send(JSON.stringify({
                        action: "messageSendError",
                        errorMsg: errorMsg
                    }));
                    break;
                }

                msg = "<" + ws.clientData.nick + "> " + msg;
                messagesBuffer.push(msg);

                if (messagesBuffer.length > 100) {
                    messagesBuffer.shift();
                }

                wss.clients.forEach((client) => {
                    client.send(JSON.stringify({
                        action: "newMessage",
                        message: msg
                    }))
                });
            break;
            case "setNickName":
                let nick = sanit(data.nick);
                var pass = true;
                var errorMsg = "";

                if (nick.length < 4) {
                    pass = false;
                    errorMsg = "Your nick is too short. Minimum 4 characters.";
                } else if (nick.length > 15) {
                    pass = false;
                    errorMsg = "Your nick is too long. Max 15 characters.";
                }
                var hui = false;
                wss.clients.forEach((client) => {
                    if (client !== ws) {
                        if (client.clientData.nick == nick) {
                            pass = false;
                            errorMsg = "This nick has been taken.";
                        }
                    }
                });

                if (!pass) {
                    ws.send(JSON.stringify({
                        action: "loginNickError",
                        errorMsg: errorMsg
                    }));
                    break;
                }

                ws.clientData.nick = nick;
                ws.send(JSON.stringify({
                    action: "showChat"
                }));
                if (messagesBuffer.length > 0) {
                    ws.send(JSON.stringify({
                        action: "loadOldMessages",
                        messages: messagesBuffer
                    }))
                }
            break;
        }

        console.log('received: %s', JSON.parse(message).action);
        //ws.send('dupa');
    });
});

httpServer.listen(80);
console.log("Server started.");