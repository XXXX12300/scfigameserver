class Player {
    constructor(ws, id) {
        this.ws = ws;
        this.id = id;
        this.x = Math.random() * 800 + 100; // placeholder spawn
        this.y = Math.random() * 600 + 100;
        this.rotation = 0;
        this.speed = 200; // pixels per second
        this.team = 'none';
        this.health = 100;
        this.inputs = { up: false, down: false, left: false, right: false, mouse: {x: 0, y: 0} };
    }

    update(dt) {
        const dtSec = dt / 1000;
        let dx = 0; let dy = 0;
        
        if (this.inputs.up) dy -= 1;
        if (this.inputs.down) dy += 1;
        if (this.inputs.left) dx -= 1;
        if (this.inputs.right) dx += 1;

        // normalize
        if (dx !== 0 && dy !== 0) {
            const len = Math.sqrt(dx*dx + dy*dy);
            dx /= len;
            dy /= len;
        }

        this.x += dx * this.speed * dtSec;
        this.y += dy * this.speed * dtSec;
        
        // Simple rotation based on mouse pos
        // For actual gameplay, client sends world-space aim coords
    }
}

class PlayerManager {
    constructor() {
        this.players = new Map();
    }

    addPlayer(ws, id) {
        this.players.set(id, new Player(ws, id));
    }

    removePlayerByWs(ws) {
        for (let [id, player] of this.players) {
            if (player.ws === ws) {
                this.players.delete(id);
                break;
            }
        }
    }

    getPlayers() {
        return Array.from(this.players.values());
    }

    handleInput(id, input) {
        const p = this.players.get(id);
        if (p) {
            p.inputs = input;
        }
    }

    update(dt) {
        for (let p of this.players.values()) {
            p.update(dt);
        }
    }

    getState() {
        const state = {};
        for (let [id, p] of this.players) {
            state[id] = { x: p.x, y: p.y, rotation: p.rotation, team: p.team, health: p.health };
        }
        return state;
    }
}

module.exports = PlayerManager;
