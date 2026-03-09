class Player {
    constructor(ws, id, name, x = 500, y = 500) {
        this.ws = ws;
        this.id = id;
        this.name = name || 'Pilot';
        this.x = x;
        this.y = y;
        this.rotation = 0;
        this.speed = 200; // pixels per second
        this.team = 'none';
        this.health = 100;
        this.inputs = { up: false, down: false, left: false, right: false, mouse: {x: 0, y: 0, buttons: {left: false}} };
        this.currentWeapon = 'plasma_rifle';
        this.lastFireTime = 0;
    }

    update(dt, mapData) {
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
        
        // Tentative movement
        const radius = 16;
        let newX = this.x + dx * this.speed * dtSec;
        let newY = this.y + dy * this.speed * dtSec;
        
        if (mapData) {
            // Keep inside map bounds
            newX = Math.max(radius, Math.min(newX, mapData.width - radius));
            newY = Math.max(radius, Math.min(newY, mapData.height - radius));
            
            // Obstacle collision (AABB vs Circle approximation)
            if (mapData.obstacles) {
                for (let obs of mapData.obstacles) {
                    // Check X axis
                    if (newX + radius > obs.x && newX - radius < obs.x + obs.w &&
                        this.y + radius > obs.y && this.y - radius < obs.y + obs.h) {
                        newX = this.x; // Block X movement
                    }
                    // Check Y axis
                    if (this.x + radius > obs.x && this.x - radius < obs.x + obs.w &&
                        newY + radius > obs.y && newY - radius < obs.y + obs.h) {
                        newY = this.y; // Block Y movement
                    }
                }
            }
        }

        this.x = newX;
        this.y = newY;
        
        // Calculate rotation based on world-space mouse pos
        const wx = this.inputs.mouse.worldX;
        const wy = this.inputs.mouse.worldY;
        if (wx !== undefined && wy !== undefined) {
             this.rotation = Math.atan2(wy - this.y, wx - this.x);
        }
    }
}

class PlayerManager {
    constructor(gameRoom) {
        this.gameRoom = gameRoom;
        this.players = new Map();
    }

    addPlayer(ws, id, name, x, y) {
        this.players.set(id, new Player(ws, id, name, x, y));
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
            p.update(dt, this.gameRoom.mapData);
            
            // Handle shooting
            if (p.inputs.mouse && p.inputs.mouse.leftDown) {
                this.gameRoom.weaponSystem.tryFire(p, this.gameRoom.projectileSystem);
            }

            // Handle Deployables
            const scores = this.gameRoom.scoreSystem.scores;
            const playerScore = scores[p.id] || 0;

            if (p.inputs.deploy1 && !p.deploy1Lock) {
                p.deploy1Lock = true;
                if (playerScore >= 100) {
                    this.gameRoom.robotSystem.spawnRobot(p.x, p.y, 'turret', p.team, p.id);
                    this.gameRoom.scoreSystem.addScore(p.id, -100, null);
                }
            }
            if (!p.inputs.deploy1) p.deploy1Lock = false;

            if (p.inputs.deployTitan && !p.deployTLock) {
                p.deployTLock = true;
                if (playerScore >= 500 && !p.inMech) {
                    this.gameRoom.mechSystem.spawnMech(p.inputs.mouse.worldX, p.inputs.mouse.worldY, 'titan', p.team);
                    this.gameRoom.scoreSystem.addScore(p.id, -500, null);
                }
            }
            if (!p.inputs.deployTitan) p.deployTLock = false;

            // Handle Interact (Enter / Exit Mech)
            if (p.inputs.interact && !p.interactLock) {
                p.interactLock = true;
                
                if (p.inMech) {
                    // Exit mech
                    const mech = this.gameRoom.mechSystem.mechs.find(m => m.id === p.inMech);
                    if (mech) {
                        mech.state = 'idle';
                        mech.owner = null;
                        mech.health = p.health; // Save health state back to mech
                    }
                    
                    p.inMech = false;
                    p.health = 100;
                    p.maxHealth = 100;
                    p.speed = 200;
                    p.currentWeapon = 'plasma_rifle';
                } else {
                    // Enter mech
                    this.gameRoom.mechSystem.tryEnterMech(p);
                }
            }
            if (!p.inputs.interact) p.interactLock = false;

            // Sync Mech Position if Piloting
            if (p.inMech) {
                const mech = this.gameRoom.mechSystem.mechs.find(m => m.id === p.inMech);
                if (mech) {
                    mech.x = p.x;
                    mech.y = p.y;
                    mech.rotation = p.rotation;
                    
                    // If mech is destroyed while piloting
                    if (mech.health <= 0) {
                        p.inMech = false;
                        p.health = 0; // Player dies too
                    } else {
                         // Keep player health synchronized with mech health
                         mech.health = p.health;
                    }
                } else {
                    p.inMech = false;
                }
            }
        }
    }

    getState() {
        const state = {};
        const scores = this.gameRoom.scoreSystem ? this.gameRoom.scoreSystem.scores : {};
        
        for (let [id, p] of this.players) {
            state[id] = { 
                name: p.name,
                x: p.x, y: p.y, 
                rotation: p.rotation, 
                team: p.team, 
                health: p.health,
                inMech: !!p.inMech,
                score: scores[id] || 0
            };
        }
        return state;
    }
}

module.exports = PlayerManager;
