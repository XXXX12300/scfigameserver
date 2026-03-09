const Matchmaking = require('./matchmaking');
const PlayerManager = require('./playerManager');
const RobotSystem = require('./robotSystem');
const MechSystem = require('./mechSystem');

class GameServer {
    constructor(wss) {
        this.wss = wss;
        this.matchmaking = new Matchmaking();
        this.tickRate = 30; // 30 updates per second
        this.tickMs = 1000 / this.tickRate;
        this.lastUpdateTime = Date.now();
        this.isRunning = false;

        this.wss.on('connection', (ws) => {
            this.handleConnection(ws);
        });
    }

    handleConnection(ws) {
        console.log('New client connected');
        // Let matchmaking handle this socket initially
        this.matchmaking.addPlayer(ws);

        ws.on('message', (message) => {
            try {
                const data = JSON.parse(message);
                
                // If the socket has an active room assigned, route to the room
                if (ws.roomId && this.matchmaking.getRoom(ws.roomId)) {
                    this.matchmaking.getRoom(ws.roomId).handleMessage(ws, data);
                } else {
                    // Otherwise it's handled by matchmaking (Lobby)
                    this.matchmaking.handleMessage(ws, data);
                }
            } catch (e) {
                console.error('Invalid message', e);
            }
        });

        ws.on('close', () => {
            if (ws.roomId && this.matchmaking.getRoom(ws.roomId)) {
                this.matchmaking.getRoom(ws.roomId).removePlayer(ws);
            }
            this.matchmaking.removePlayer(ws);
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

        // Schedule next tick using setImmediate to unblock event loop
        setTimeout(() => this.loop(), Math.max(0, this.tickMs - (Date.now() - now)));
    }

    update(dt) {
        // Update all rooms
        this.matchmaking.updateRooms(dt);
    }
}

module.exports = GameServer;
