class Game {

    constructor (windowWidth, windowHeight) {
        this.windowWidth = windowWidth;
        this.windowHeight = windowHeight;
        this.canvas = document.getElementById("game");
        this.canvas.width = windowWidth;
        this.canvas.height = windowHeight;
        this.ctx = this.canvas.getContext("2d");
        this.mapImgPath = "images/stare-siolo.png";
        this.outfitImgPath = "images/3378f.gif";
        this.entities = [];
        this.players = [];
        this.map = new Map(this);
        this.keyboard = new Keyboard();
        this.pixelsShift = 2;
        this.hero = new Hero(this);
        this.ws = new WebSocket("ws://127.0.0.1:21337");
        this.ws.onmessage = (msg) => this.wsResParser(msg.data);
        this.ws.onerror = () => {
            alert("We are sorry, but server not responding.");
        }

        this.gameLoop();
    }

    render () {
        for (var i = 0; i < this.entities.length; i++) {
            this.entities[i].render();
        }
    }

    update () {
        for (var i = 0; i < this.entities.length; i++) {
            this.entities[i].update();
        }
    }

    clearCanvas () {
        this.ctx.clearRect(0, 0, this.windowWidth, this.windowHeight);
    }

    gameLoop () {
        this.clearCanvas();
        this.update();
        this.render();
        window.requestAnimationFrame(this.gameLoop.bind(this));
    }

    wsResParser (msg) {
        msg = JSON.parse(msg);
        switch (msg.action) {
            case "loadOther":
                for (let i = 0; i < msg.data.length; i++) {
                    let other = new Entity(this, msg.data[i].x, msg.data[i].y);
                    other.id = msg.data[i].id;
                    this.players.push(other);
                }
            break;
            case "newOther":
                let other = new Entity(this);
                other.id = msg.data;
                this.players.push(other);
            break;
            case "moveOther":
                for (let i = 0; i < this.players.length; i++) {
                    if (this.players[i].id == msg.data.id) {
                        this.players[i].currentState = msg.data.dir;
                        this.players[i].deltaX = msg.data.x;
                        this.players[i].deltaY = msg.data.y;
                    }
                }
            break;
        }
    }

}

class Map {

    constructor (game) {
        this.game = game;
        this.game.entities.push(this);
        this.img = new Image();
        this.img.src = this.game.mapImgPath;
    }

    render () {
        this.game.ctx.drawImage(
            this.img, 0, 0,
            this.img.width,
            this.img.height
        )
    }

    update () {}
}

class Entity {

    constructor (game, x = 0, y = 0) {
        this.game = game;
        this.img = new Image();
        this.img.src = game.outfitImgPath;
        this.id = 0;
        this.width = 32;
        this.height = 48;
        this.x = x;
        this.y = y;
        this.deltaX = this.x;
        this.deltaY = this.y;
        this.state = {
            "top": {fx: 0, fy: 144, frames: 4},
            "bot": {fx: 0, fy: 0, frames: 4},
            "left" : {fx: 0, fy: 48, frames: 4},
            "right": {fx: 0, fy: 96, frames: 4}
        }
        this.currentState = "bot";
        this.isMoving = false;
        this.currentFrame = 0;
        this.maxFrameDelay = 5;
        this.currentDelayIteration = 0;
        this.game.entities.push(this);
    }

    render () {
        if (this.isMoving) {
            if (this.currentDelayIteration > this.maxFrameDelay) {
                this.currentDelayIteration = 0;
                this.currentFrame = this.currentFrame + 1 == this.state[this.currentState].frames ? 0 : this.currentFrame + 1;
            } else {
                this.currentDelayIteration++;
            }
        } else {
            this.currentFrame = 0;
        }

        this.game.ctx.drawImage(
            this.img, 
            this.state[this.currentState].fx + this.currentFrame * this.width, 
            this.state[this.currentState].fy,
            this.width,
            this.height, 
            this.x, this.y,
            this.width,
            this.height
        )
    }

    move () {
        if (this.deltaX != this.x ||
            this.deltaY != this.y) {
            this.isMoving = true;
            if (this.deltaX > this.x) {
                this.x = this.x + this.game.pixelsShift;
            } else if (this.deltaX < this.x) {
                this.x = this.x - this.game.pixelsShift;
            } else if (this.deltaY > this.y) {
                this.y = this.y + this.game.pixelsShift;
            } else if (this.deltaY < this.y) {
                this.y = this.y - this.game.pixelsShift;
            }
        } else {
            this.isMoving = false;
        }
    }

    update () {
        this.move();
    }

}

class Hero extends Entity {
    constructor (game) {
        super(game);
        this.game = game;
    }

    controll () {
        if (this.game.keyboard.use.W.pressed) {
            this.currentState = "top";
            this.deltaY = this.deltaY - this.game.pixelsShift;
        } else if (this.game.keyboard.use.S.pressed) {
            this.currentState = "bot";
            this.deltaY = this.deltaY + this.game.pixelsShift;
        } else if (this.game.keyboard.use.D.pressed) {
            this.currentState = "right";
            this.deltaX = this.deltaX + this.game.pixelsShift;
        } else if (this.game.keyboard.use.A.pressed) {
            this.currentState = "left";
            this.deltaX = this.deltaX - this.game.pixelsShift;
        }
    }

    update () {
        this.controll();
        this.move();
        if (this.isMoving) {
            this.game.ws.send(JSON.stringify({
                "x": this.deltaX,
                "y": this.deltaY,
                "dir": this.currentState
            }));
        }
    }
}

class Keyboard {

    constructor () {
        this.lastKeyCode = null;
        this.hold = false;
        this.use = {
            'W': {
                hold: false,
                pressed: false,
                name: "W"
            },
            'S': {
                hold: false,
                pressed: false,
                name: "S"
            },
            'A': {
                hold: false,
                pressed: false,
                name: "A"
            },
            'D': {
                hold: false,
                pressed: false,
                name: "D"
            }
        }
        this.keys = {
            '87': 'W',
            '83': 'S',
            '65': 'A',
            '68': 'D'
        }
        this.initialize();
    }

    initialize () {
        window.document.addEventListener("keydown", (e) => this.keyDown(e));
        window.document.addEventListener("keyup", (e) => this.keyUp(e));
    }

    keyDown (e) {
    	const code = e.which || e.keyCode;
    	const key = this.getKeyByCode(e, code);

    	if (!this.use[key]) {
    		return false;
    	}

    	if (this.lastKeyCode === code) {
    		this.use[key].hold = true;
    		return;
    	}

        this.hold = true;
    	this.lastKeyCode = code;
    	this.use[key].pressed = true;
    }

    keyUp (e) {
    	const code = e.which || e.keyCode;
    	const key = this.getKeyByCode(e, code);
    	this.hold = false;
    	this.lastKeyCode = null;

    	if (this.use[key] && this.use[key].pressed) {
    		this.use[key].pressed = false;
    		this.use[key].hold = false;
    	}
    }

    getKeyByCode (e, code) {
    	if (this.keys[code]) {
    		e.preventDefault();
    		return this.keys[code];
    	} else {
    		return;
    	}
    }
}

$(document).ready(function () {
    let game = new Game(700, 700);
});
