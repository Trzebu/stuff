if (!window.WebSocket) {
    $("#content").html($("p", {
        text: "We are sorry, but your browser dosent support WebSocket."
    }));
}

var connection = new WebSocket("ws://127.0.0.1");

connection.onerror = () => {
    $("#content").html($("p", {
        text: "We are sorry, but server not responding."
    }));
}

$("#loginButton").mousedown(() => {
    connection.send(JSON.stringify({
        action: "setNickName",
        nick: $("#nickName").val()
    }))
});

connection.onmessage = function (message) {
    try {
        var data = JSON.parse(message.data);
    } catch (e) {
        console.log('Invalid JSON: ', message.data);
        return;
    }

    switch (data.action) {
        case "loginNickError": chat.interface.nickNameInputErrorShow(data.errorMsg); break;
        case "messageSendError": chat.interface.messageAreaErrorShow(data.errorMsg); break;
        case "newMessage": chat.interface.newMessage(data.message); break;
        case "showChat":
            chat.interface.hideLogin();
            chat.interface.showChatContainer();
        break;
        case "loadOldMessages":
            for (let i = 0; i < data.messages.length; i++) {
                chat.interface.newMessage(data.messages[i]);
            }
        break;
    }
}

class Chat {
    constructor() {
        this.interface = new Interface();
    }
}

class Interface {

    constructor () {
        $("#message").keydown(function (e) {
            if (e.keyCode === 13) {
                connection.send(JSON.stringify({
                    action: "sendMessage",
                    message: $(this).val()
                }));
                $(this).val("");
            }
        });
    }

    nickNameInputErrorShow (msg) {
        $("#login > .form-group > .invalid-feedback").text(msg);
        $("#login > .form-group > input").addClass("is-invalid");
    }

    messageAreaErrorShow (msg) {
        $("#textarea-form > .invalid-feedback").text(msg);
        $("#textarea-form > textarea").addClass("is-invalid");
    }

    newMessage (msg) {
        $("#messages").append(
            $("<div></div>").addClass(
                "row"
            ).text(
                msg
            )
        )
    }

    hideLogin () { $("#login").hide(); }

    showChatContainer () { $("#chat").show(); }

}

var chat = new Chat();