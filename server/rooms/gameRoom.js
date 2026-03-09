const PlayerManager = require('../playerManager');
const ProjectileSystem = require('../projectileSystem');
const WeaponSystem = require('../weaponSystem');
const MechSystem = require('../mechSystem');
const RobotSystem = require('../robotSystem');
const ScoreSystem = require('../scoreSystem');

class GameRoom {
    constructor(id) {
        this.id = id;
        
        this.playerManager = new PlayerManager(this);
        this.projectileSystem = new ProjectileSystem();
        this.weaponSystem = new WeaponSystem();
        this.mechSystem = new MechSystem(this);
        this.robotSystem = new RobotSystem(this);
        this.scoreSystem = new ScoreSystem(this);
        
        this.teams = { blue: 0, red: 0 };
    }

    addPlayer(ws, id) {
        const team = this.teams.blue <= this.teams.red ? 'blue' : 'red';
        this.teams[team]++;
        
        this.playerManager.addPlayer(ws, id);
        this.playerManager.players.get(id).team = team;

        ws.on('message', (message) => {
            try {
                const data = JSON.parse(message);
                if (data.type === 'input') {
                    this.playerManager.handleInput(id, data.input);
                }
            } catch (e) {
                console.error('Invalid message', e);
            }
        });
    }

    removePlayer(ws) {
        for (let [id, p] of this.playerManager.players) {
            if (p.ws === ws) {
                this.teams[p.team]--;
                break;
            }
        }
        this.playerManager.removePlayerByWs(ws);
    }

    getPlayersCount() {
        return this.playerManager.players.size;
    }

    initMatch() {
        console.log(`Room ${this.id} match starting!`);
        for (let [id, p] of this.playerManager.players) {
            p.ws.send(JSON.stringify({
                type: 'match_start',
                roomId: this.id,
                playerId: id,
                team: p.team
            }));
        }
    }

    update(dt) {
        this.playerManager.update(dt);
        // Update projectiles
        this.projectileSystem.update(dt, this.playerManager);
        
        this.broadcastState();
    }

    broadcastState() {
        const state = {
            type: 'gameState',
            players: this.playerManager.getState(),
            projectiles: this.projectileSystem.getState(),
            mechs: this.mechSystem.getState(),
            robots: this.robotSystem.getState(),
            score: this.scoreSystem.scores
        };
        const stateStr = JSON.stringify(state);
        
        for (let [id, p] of this.playerManager.players) {
            if(p.ws.readyState === 1) { // WebSocket.OPEN
                p.ws.send(stateStr);
            }
        }
    }

    broadcastEvent(type, data) {
        const eventStr = JSON.stringify({ type, ...data });
        for (let [id, p] of this.playerManager.players) {
            if(p.ws.readyState === 1) {
                p.ws.send(eventStr);
            }
        }
    }
}

module.exports = GameRoom;
