const Matchmaking = require('./matchmaking');
const PlayerManager = require('./playerManager');
const RobotSystem = require('./robotSystem');
const MechSystem = require('./mechSystem');

class GameServer {
    constructor(io) {
        this.io = io;
        this.matchmaking = new Matchmaking();
        this.tickRate = 60; // 60 updates per second for smooth gameplay
        this.tickMs = 1000 / this.tickRate;
        this.lastUpdateTime = Date.now();
        this.isRunning = false;

        this.io.on('connection', (socket) => {
            this.handleConnection(socket);
        });
    }

    handleConnection(socket) {
        console.log('New client connected:', socket.id);
        
        // Add backwards-compatible .send() so existing room code works unchanged
        socket.send = (jsonStr) => {
            socket.emit('data', jsonStr);
        };
        // Socket.io sockets are always "open" while connected, so add readyState compat
        Object.defineProperty(socket, 'readyState', {
            get() { return socket.connected ? 1 : 3; }
        });

        this.matchmaking.addPlayer(socket);

        socket.on('data', (message) => {
            try {
                const data = JSON.parse(message);
                
                if (socket.roomId && this.matchmaking.getRoom(socket.roomId)) {
                    this.matchmaking.getRoom(socket.roomId).handleMessage(socket, data);
                } else {
                    this.matchmaking.handleMessage(socket, data);
                }
            } catch (e) {
                console.error('Invalid message', e);
            }
        });

        socket.on('disconnect', () => {
            if (socket.roomId && this.matchmaking.getRoom(socket.roomId)) {
                this.matchmaking.getRoom(socket.roomId).removePlayer(socket);
            }
            this.matchmaking.removePlayer(socket);
        });
    }

    start() {
        this.isRunning = true;
        this.lastUpdateTime = Date.now();
        this.loop();
    }

    stop() {
        this.isRunning = false;
    }

    loop() {
        if (!this.isRunning) return;

        const now = Date.now();
        const deltaTime = now - this.lastUpdateTime;

        if (deltaTime >= this.tickMs) {
            this.update(deltaTime);
            this.lastUpdateTime = now;
        }

        setTimeout(() => this.loop(), Math.max(0, this.tickMs - (Date.now() - now)));
    }

    update(dt) {
        this.matchmaking.updateRooms(dt);
    }
}

module.exports = GameServer;
