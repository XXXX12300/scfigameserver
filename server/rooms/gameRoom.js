const PlayerManager = require('../playerManager');
const MechSystem = require('../mechSystem');
const RobotSystem = require('../robotSystem');
const WeaponSystem = require('../weaponSystem');
const ProjectileSystem = require('../projectileSystem');
const ScoreSystem = require('../scoreSystem');

class GameRoom {
    constructor(id) {
        this.id = id;
        this.playerManager = new PlayerManager(this);
        this.mechSystem = new MechSystem();
        this.robotSystem = new RobotSystem();
        this.weaponSystem = new WeaponSystem();
        this.projectileSystem = new ProjectileSystem();
        this.scoreSystem = new ScoreSystem();
        this.state = 'waiting'; // waiting, playing, ended
    }

    initMatch() {
        this.state = 'playing';
        console.log(`Room ${this.id} match started`);
        // Assign teams
        let i = 0;
        for (let player of this.playerManager.getPlayers()) {
            player.team = i % 2 === 0 ? 'blue' : 'red';
            // Send initial state message
            player.ws.send(JSON.stringify({
                type: 'match_start',
                team: player.team,
                playerId: player.id
            }));
            i++;
        }
    }

    addPlayer(ws, id) {
        this.playerManager.addPlayer(ws, id);
        ws.on('message', (msg) => {
            const data = JSON.parse(msg);
            if (data.type === 'input') {
                this.playerManager.handleInput(id, data.input);
            }
        });
    }

    removePlayer(ws) {
        this.playerManager.removePlayerByWs(ws);
        if (this.getPlayersCount() === 0) {
            this.state = 'ended';
        }
    }

    getPlayersCount() {
        return this.playerManager.getPlayers().length;
    }

    update(dt) {
        if (this.state !== 'playing') return;

        this.playerManager.update(dt);
        this.projectileSystem.update(dt, this.playerManager, this.mechSystem, this.robotSystem);
        this.mechSystem.update(dt);
        this.robotSystem.update(dt);
        
        const stateSync = this.generateState();
        this.broadcastState(stateSync);
    }

    generateState() {
        return {
            type: 'gameState',
            players: this.playerManager.getState(),
            projectiles: this.projectileSystem.getState(),
            mechs: this.mechSystem.getState(),
            robots: this.robotSystem.getState()
        };
    }

    broadcastState(stateObj) {
        const msg = JSON.stringify(stateObj);
        for (let player of this.playerManager.getPlayers()) {
            if(player.ws.readyState === 1) { // OPEN
                player.ws.send(msg);
            }
        }
    }
}

module.exports = GameRoom;
