const PlayerManager = require('../playerManager');
const ProjectileSystem = require('../projectileSystem');
const WeaponSystem = require('../weaponSystem');
const MechSystem = require('../mechSystem');
const RobotSystem = require('../robotSystem');
const ScoreSystem = require('../scoreSystem');
const MapSystem = require('../mapSystem');

class GameRoom {
    constructor(id, name, mapId, addBots) {
        this.id = id;
        this.name = name || id;
        this.mapId = mapId || 'neon_grid';
        this.addBots = addBots || false;
        this.maxPlayers = 16;
        
        this.mapSystem = new MapSystem();
        this.mapData = this.mapSystem.getMap(this.mapId);

        this.playerManager = new PlayerManager(this);
        this.projectileSystem = new ProjectileSystem();
        this.weaponSystem = new WeaponSystem();
        this.mechSystem = new MechSystem(this);
        this.robotSystem = new RobotSystem(this);
        this.scoreSystem = new ScoreSystem(this);
        
        this.teams = { blue: 0, red: 0 };
        
        // Add bots if requested
        if (this.addBots) {
            for(let i=0; i<8; i++) {
                const team = i % 2 === 0 ? 'blue' : 'red';
                const spawn = this.mapSystem.getRandomSpawn(this.mapId, team);
                this.robotSystem.spawnRobot(spawn.x, spawn.y, 'drone', team, 'bot');
            }
        }
    }

    addPlayer(ws, id, playerName) {
        const team = this.teams.blue <= this.teams.red ? 'blue' : 'red';
        this.teams[team]++;
        
        // Assign Custom Spawn
        const spawn = this.mapSystem.getRandomSpawn(this.mapId, team);
        this.playerManager.addPlayer(ws, id, playerName, spawn.x, spawn.y);
        this.playerManager.players.get(id).team = team;

        // Immediately start match for this player
        ws.send(JSON.stringify({
            type: 'match_start',
            roomId: this.id,
            playerId: id,
            team: team,
            mapData: this.mapData
        }));
    }

    handleMessage(ws, data) {
        if (data.type === 'input') {
            // Find player ID for this socket
            for (let [id, p] of this.playerManager.players) {
                if (p.ws === ws) {
                    this.playerManager.handleInput(id, data.input);
                    break;
                }
            }
        }
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
        // Update Mechs and Robots
        this.mechSystem.update(dt);
        this.robotSystem.update(dt);
        
        this.broadcastState();
    }

    broadcastState() {
        const state = {
            type: 'gameState',
            mapId: this.mapId,
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
