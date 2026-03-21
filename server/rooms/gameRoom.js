const PlayerManager = require('../playerManager');
const ProjectileSystem = require('../projectileSystem');
const WeaponSystem = require('../weaponSystem');
const MechSystem = require('../mechSystem');
const RobotSystem = require('../robotSystem');
const ScoreSystem = require('../scoreSystem');
const MapSystem = require('../mapSystem');

class GameRoom {
    constructor(id, name, mapId, addBots, gameMode) {
        this.id = id;
        this.name = name || id;
        this.mapId = mapId || 'neon_grid';
        this.addBots = addBots || false;
        this.maxPlayers = 16;

        // Mode Configuration
        this.gameMode = gameMode || 'tdm'; // 'tdm' or 'control_zone'
        this.scoreLimit = this.gameMode === 'tdm' ? 50 : 1000;
        this.matchStatus = 'PLAYING'; // PLAYING, ENDED

        this.mapSystem = new MapSystem();
        this.mapData = this.mapSystem.getMap(this.mapId);

        this.playerManager = new PlayerManager(this);
        this.projectileSystem = new ProjectileSystem();
        this.weaponSystem = new WeaponSystem();
        this.mechSystem = new MechSystem(this);
        this.robotSystem = new RobotSystem(this);
        this.scoreSystem = new ScoreSystem(this);

        this.teams = { blue: 0, red: 0 };
        this.decals = [];

        // Add bots if requested
        if (this.addBots) {
            for (let i = 0; i < 8; i++) {
                const team = i % 2 === 0 ? 'blue' : 'red';
                const spawn = this.mapSystem.getRandomSpawn(this.mapId, team);
                this.robotSystem.spawnRobot(spawn.x, spawn.y, 'bot', team, 'bot');
            }
        }
    }

    addDecal(type, x, y) {
        this.decals.push({
            id: Math.random().toString(36).substr(2, 9),
            type, x, y,
            rotation: Math.random() * Math.PI * 2,
            life: 15.0
        });
    }

    updateDecals(dt) {
        const dtSec = dt / 1000;
        for (let i = this.decals.length - 1; i >= 0; i--) {
            this.decals[i].life -= dtSec;
            if (this.decals[i].life <= 0) this.decals.splice(i, 1);
        }
    }

    addPlayer(ws, id, playerName, weaponId, killstreakId) {
        const team = this.teams.blue <= this.teams.red ? 'blue' : 'red';
        this.teams[team]++;

        // Assign Custom Spawn
        const spawn = this.mapSystem.getRandomSpawn(this.mapId, team);
        this.playerManager.addPlayer(ws, id, playerName, spawn.x, spawn.y, weaponId, killstreakId);

        const player = this.playerManager.players.get(id);
        player.team = team;

        // Ensure ammo is initialized for the starting weapon
        const weaponData = this.weaponSystem.weapons[player.currentWeapon];
        if (weaponData) {
            player.ammo = weaponData.magSize || 30;
            player.maxAmmo = weaponData.magSize || 30;
        } else {
            // Fallback for new ERA weapons
            player.currentWeapon = 'm4a1';
            player.ammo = 30;
            player.maxAmmo = 30;
        }

        // Immediately start match for this player
        ws.send(JSON.stringify({
            type: 'match_start',
            roomId: this.id,
            playerId: id,
            team: team,
            mapData: this.mapData,
            gameMode: this.gameMode,
            scoreLimit: this.scoreLimit
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
        } else if (data.type === 'select_weapon') {
            const playerId = Array.from(this.playerManager.players.entries()).find(([id, p]) => p.ws === ws)?.[0];
            if (playerId) {
                const player = this.playerManager.players.get(playerId);
                if (player && this.weaponSystem.weapons[data.weaponId]) {
                    if (player.currentWeapon !== data.weaponId) {
                        player.currentWeapon = data.weaponId;
                        // Reset ammo for the new weapon
                        const weaponData = this.weaponSystem.weapons[data.weaponId];
                        player.ammo = weaponData.magSize || 30;
                        player.reloadTimer = 0;
                        player.isReloading = false;
                    }
                }
            }
        } else if (data.type === 'select_streak') {
            const playerId = Array.from(this.playerManager.players.entries()).find(([id, p]) => p.ws === ws)?.[0];
            if (playerId) {
                const player = this.playerManager.players.get(playerId);
                if (player) {
                    player.selectedKillstreak = data.streakId;
                }
            }
        } else if (data.type === 'switch_team') {
            const playerId = Array.from(this.playerManager.players.entries()).find(([id, p]) => p.ws === ws)?.[0];
            if (playerId) {
                const player = this.playerManager.players.get(playerId);
                if (player) {
                    this.teams[player.team]--;
                    player.team = player.team === 'blue' ? 'red' : 'blue';
                    this.teams[player.team]++;
                    
                    // Kill the player when they switch teams so they respawn
                    player.hp = 0;
                    player.isDead = true;
                    player.deathTime = Date.now();
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
        if (this.matchStatus === 'ENDED') return;

        this.playerManager.update(dt);
        // Update projectiles
        this.projectileSystem.update(dt, this.playerManager);
        // Update Mechs and Robots
        this.mechSystem.update(dt);
        this.robotSystem.update(dt);
        this.updateDecals(dt);

        this.updateGameMode(dt);

        this.broadcastState();
    }

    updateGameMode(dt) {
        if (this.gameMode !== 'control_zone' || !this.mapData.controlZones) return;

        const dtSec = dt / 1000;

        for (let zone of this.mapData.controlZones) {
            // Count players inside zone
            let blueCount = 0;
            let redCount = 0;

            for (let [id, p] of this.playerManager.players) {
                if (p.isDead) continue;
                const dx = p.x - zone.x;
                const dy = p.y - zone.y;
                if (Math.sqrt(dx * dx + dy * dy) <= zone.radius + 32) {
                    if (p.team === 'blue') blueCount++;
                    if (p.team === 'red') redCount++;
                }
            }

            // Include Bots
            if (this.robotSystem) {
                for (let r of this.robotSystem.robots) {
                    if (r.isDead) continue;
                    const dx = r.x - zone.x;
                    const dy = r.y - zone.y;
                    if (Math.sqrt(dx * dx + dy * dy) <= zone.radius + 24) {
                        if (r.team === 'blue') blueCount++;
                        if (r.team === 'red') redCount++;
                    }
                }
            }

            // Determine capture direction
            let capturingTeam = null;
            if (blueCount > 0 && redCount === 0) capturingTeam = 'blue';
            else if (redCount > 0 && blueCount === 0) capturingTeam = 'red';

            // Progress Capture
            const captureSpeed = 15; // pct per second
            if (blueCount === 0 && redCount === 0) {
                // Instantly revert to neutral if empty
                zone.owner = null;
                zone.capturingTeam = null;
                zone.progress = 0;
            } else if (capturingTeam) {
                if (zone.owner === null) {
                    // Capturing neutral zone
                    if (zone.capturingTeam !== capturingTeam) {
                        // Someone else was capturing it, reduce their progress first
                        zone.progress -= captureSpeed * dtSec;
                        if (zone.progress <= 0) {
                            zone.progress = 0;
                            zone.capturingTeam = capturingTeam;
                        }
                    } else {
                        // We are capturing it
                        zone.progress += captureSpeed * dtSec;
                        if (zone.progress >= 100) {
                            zone.progress = 100;
                            zone.owner = capturingTeam;
                            zone.capturingTeam = null; // fully owned
                        }
                    }
                } else if (zone.owner !== capturingTeam) {
                    // Contesting enemy zone
                    zone.progress -= captureSpeed * dtSec;
                    if (zone.progress <= 0) {
                        // Neutralized
                        zone.owner = null;
                        zone.progress = 0;
                        zone.capturingTeam = capturingTeam;
                    }
                } else {
                    // Securing own zone
                    zone.progress += captureSpeed * dtSec;
                    if (zone.progress > 100) zone.progress = 100;
                }
            }

            // Instant Control Zone Points: award simply for having players in the zone and being uncontested
            if (blueCount > 0 && redCount === 0) {
                const pts = dtSec * 1; // 1 point per second purely for occupying
                this.scoreSystem.addScore('ZONE_' + zone.id, pts, 'blue');
            } else if (redCount > 0 && blueCount === 0) {
                const pts = dtSec * 1;
                this.scoreSystem.addScore('ZONE_' + zone.id, pts, 'red');
            }
        }
    }

    endMatch(winningTeam) {
        if (this.matchStatus === 'ENDED') return;
        this.matchStatus = 'ENDED';

        const eventStr = JSON.stringify({ type: 'match_end', winner: winningTeam });
        for (let [id, p] of this.playerManager.players) {
            if (p.ws) {
                p.ws.send(eventStr);
            }
        }

        console.log(`[MATCH END] Team ${winningTeam} won Room: ${this.id}`);
        // In a real scenario, we might want to shut down the room or return players to lobby
        // For now, we just halt the update loop and force clients to handle the UI.
    }

    broadcastState() {
        const projState = this.projectileSystem.getState();
        const playersState = this.playerManager.getState();
        const mechsState = this.mechSystem.getState();
        const robotsState = this.robotSystem.getState();

        const baseState = {
            type: 'gameState',
            mapId: this.mapId,
            gameMode: this.gameMode,
            score: this.scoreSystem.scores,
            teamScores: this.scoreSystem.teamScores,
            controlZones: this.gameMode === 'control_zone' ? (this.mapData.controlZones || []) : []
        };

        const distSq = (o1, o2) => {
            const dx = (o1.x || 0) - (o2.x || 0);
            const dy = (o1.y || 0) - (o2.y || 0);
            return dx*dx + dy*dy;
        };

        // Network Optimization: Send only what the player can see
        const CULL_RADIUS = 3000; // Screen is ~1920x1080 max usually, 3000 leaves room for camera smoothing and high aspect ratios
        const CULL_RADIUS_SQ = CULL_RADIUS * CULL_RADIUS;

        for (let [id, p] of this.playerManager.players) {
            if (p.ws && p.ws.connected !== false) { 
                const playerPos = { x: p.x || 0, y: p.y || 0 };

                // Build filtered state for this specific player
                const filteredPlayers = {};
                for (let pid in playersState) {
                    if (pid === id || distSq(playerPos, playersState[pid]) < CULL_RADIUS_SQ) {
                        filteredPlayers[pid] = playersState[pid];
                    }
                }

                const playerStateObj = {
                    ...baseState,
                    players: filteredPlayers,
                    projectiles: projState.projectiles.filter(proj => distSq(playerPos, proj) < CULL_RADIUS_SQ),
                    grenades: projState.grenades.filter(g => distSq(playerPos, g) < CULL_RADIUS_SQ),
                    mechs: mechsState.filter(m => distSq(playerPos, m) < CULL_RADIUS_SQ),
                    robots: robotsState.filter(r => distSq(playerPos, r) < CULL_RADIUS_SQ),
                    decals: this.decals.filter(d => distSq(playerPos, d) < CULL_RADIUS_SQ)
                };

                // Network optimization: Round all floats to 1 decimal place to massively shrink JSON string size
                const stateStr = JSON.stringify(playerStateObj, (k, v) => 
                    typeof v === 'number' ? Math.round(v * 10) / 10 : v
                );

                // Use volatile emit - drops frame if client is behind instead of queuing
                if (p.ws.volatile) {
                    p.ws.volatile.emit('data', stateStr);
                } else {
                    p.ws.send(stateStr);
                }
            }
        }
    }

    broadcastEvent(type, data) {
        const eventStr = JSON.stringify({ type, ...data });
        for (let [id, p] of this.playerManager.players) {
            if (p.ws) {
                p.ws.send(eventStr);
            }
        }
    }

    broadcastEventToPlayer(playerId, type, data) {
        const p = this.playerManager.players.get(playerId);
        if (p && p.ws) {
            p.ws.send(JSON.stringify({ type, ...data }));
        }
    }
}

module.exports = GameRoom;
