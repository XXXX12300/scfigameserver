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
        // Let matchmaking handle this socket, assign to a room
        this.matchmaking.addPlayer(ws);

        ws.on('close', () => {
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
