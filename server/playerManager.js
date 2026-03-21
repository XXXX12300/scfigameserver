const TankPhysics = require('./tankPhysics');

class Player {
    constructor(ws, id, name, gameRoom, x = 500, y = 500, weaponId = 'm4a1') {
        this.ws = ws;
        this.id = id;
        this.name = name || 'Pilot';
        this.gameRoom = gameRoom;
        this.x = x;
        this.y = y;
        this.rotation = 0;
        this.speed = 200; // pixels per second
        this.team = 'none';
        this.health = 100;
        this.maxHealth = 100; // Added maxHealth based on snippet
        this.stamina = 100;
        this.maxStamina = 100;
        this.vx = 0;
        this.vy = 0;
        this.hullRotation = 0;
        this.grenades = 2; // Initialized grenades
        this.lastGrenadeTime = 0; // Initialized lastGrenadeTime for cooldown
        this.inputs = { up: false, down: false, left: false, right: false, sprint: false, mouse: { x: 0, y: 0, buttons: { left: false } } };
        // Weapon State
        this.currentWeapon = weaponId;
        const weaponData = gameRoom && gameRoom.weaponSystem ? gameRoom.weaponSystem.weapons[weaponId] : null;
        this.ammo = weaponData ? (weaponData.magSize || 30) : 30;
        this.maxAmmo = weaponData ? (weaponData.magSize || 30) : 30;
        this.isReloading = false;
        this.reloadTimer = 0;
        this.burstRemaining = 0;
        this.lastBurstTime = 0;
        this.fireCount = 0;
        this.lastFireTime = 0;
        this.muzzleFlash = 0;
        this.isDead = false;
        this.respawnTimer = 0;
        this.vx = 0; // Momentum for tanks
        this.vy = 0;
        this.hullRotation = 0; // Fixed: Explicit hull rotation
    }

    update(dt, mapData) {
        const dtSec = dt / 1000;

        if (this.isDead) {
            this.respawnTimer -= dtSec;
            if (this.respawnTimer <= 0) {
                this.respawn();
            }
            return;
        }

        if (this.muzzleFlash > 0) {
            this.muzzleFlash -= dtSec;
        }

        if (this.isReloading) {
            this.reloadTimer -= dtSec;
            if (this.reloadTimer <= 0) {
                this.isReloading = false;
                this.ammo = this.maxAmmo;
            }
        }

        if (this.controlledDroneId) return; // Immerse inputs entirely into the drone

        let dx = 0; let dy = 0;
        let effectiveSpeed = this.speed;
        let sprintMultiplier = 1.0;

        let isTank = false;
        if (this.inMech && this.gameRoom && this.gameRoom.mechSystem) {
            const mech = this.gameRoom.mechSystem.mechs.find(m => m.id === this.inMech);
            if (mech && mech.type.startsWith('tank')) isTank = true;
        }

        if (isTank) {
            const physicsResult = TankPhysics.update(this, this.inputs, dtSec);
            dx = physicsResult.dx;
            dy = physicsResult.dy;

            // Use a fixed scale for CodePen pixel-based velocity
            effectiveSpeed = 60;
            sprintMultiplier = 1.0;
        } else {
            // Reset momentum when not in tank
            this.vx = 0;
            this.vy = 0;

            if (this.inputs.up) dy -= 1;
            if (this.inputs.down) dy += 1;
            if (this.inputs.left) dx -= 1;
            if (this.inputs.right) dx += 1;

            if (dx !== 0 && dy !== 0) {
                const len = Math.sqrt(dx * dx + dy * dy);
                dx /= len; dy /= len;
            }
            this.hullRotation = this.rotation; // Sync when not in tank
        }

        // Immobilize player if controlling a drone
        if (this.controlledDroneId) {
            dx = 0;
            dy = 0;
        }

        // Tentative movement - Dynamic radius for larger tanks
        const radius = isTank ? 32 : 16;

        // Stamina logic
        let isMoving = dx !== 0 || dy !== 0;

        if (isMoving && this.inputs.sprint && this.stamina > 0 && !this.inMech) {
            this.stamina -= 30 * dtSec; // deplete 30 per sec (~3.3 seconds to empty)
            if (this.stamina < 0) this.stamina = 0;
            if (this.stamina > 0) sprintMultiplier = 1.6; // 60% speed boost
        } else {
            this.stamina += 15 * dtSec; // regenerate 15 per sec (~6.6 seconds from 0 to 100)
            if (this.stamina > this.maxStamina) this.stamina = this.maxStamina;
        }

        let weightPenalty = 0;
        if (!isTank && this.currentWeapon && this.gameRoom && this.gameRoom.weaponSystem) {
            const weapon = this.gameRoom.weaponSystem.weapons[this.currentWeapon];
            if (weapon) {
                weightPenalty = weapon.weight || 0;
            }
        }

        if (!isTank) {
            effectiveSpeed = this.speed * (1 - weightPenalty);
        }

        // Final movement application
        let newX, newY;
        if (isTank) {
            // Literal CodePen position update (per tick)
            newX = this.x + dx;
            newY = this.y + dy;
        } else {
            newX = this.x + dx * effectiveSpeed * sprintMultiplier * dtSec;
            newY = this.y + dy * effectiveSpeed * sprintMultiplier * dtSec;
        }

        this.moveWithCollision(newX, newY, mapData);

        // Calculate rotation based on world-space mouse pos
        const wx = this.inputs.mouse.worldX;
        const wy = this.inputs.mouse.worldY;
        if (wx !== undefined && wy !== undefined && !this.controlledDroneId) {
            const targetRot = Math.atan2(wy - this.y, wx - this.x);
            // Torret rotation always snaps to exact mouse pointer (no lerp)
            this.rotation = targetRot;
        }

        // Sync Mech Position to Server Array so remote clients see it move
        if (this.inMech && this.gameRoom && this.gameRoom.mechSystem) {
            const myMech = this.gameRoom.mechSystem.mechs.find(m => m.id === this.inMech);
            if (myMech) {
                myMech.x = this.x;
                myMech.y = this.y;
                // STICT ISOLATION: Hull is hullRotation, Turret is player.rotation
                myMech.hullRot = this.hullRotation;
                myMech.turretRot = this.rotation;
                // Sync legacy rotation for old code
                myMech.rotation = this.hullRotation;
                myMech.turretRotation = this.rotation;
            }
        }
    }

    moveWithCollision(newX, newY, mapData) {
        const radius = 32; // Increased radius for larger sprite and better hit registration
        if (!mapData && this.gameRoom && this.gameRoom.mapSystem) {
            // Re-fetch mapData if not explicitly provided but we have gameRoom
            mapData = this.gameRoom.mapSystem.getMap(this.gameRoom.mapId);
        }

        if (mapData) {
            // Keep inside map bounds
            newX = Math.max(radius, Math.min(newX, mapData.width - radius));
            newY = Math.max(radius, Math.min(newY, mapData.height - radius));

            // Obstacle collision (AABB vs Circle approximation)
            let physObs = [];
            if (this.gameRoom && this.gameRoom.mapSystem) {
                physObs = this.gameRoom.mapSystem.getPhysicalObstacles(this.gameRoom.mapId);
            } else if (mapData.obstacles) {
                physObs = mapData.obstacles;
            }

            if (physObs) {
                for (let obs of physObs) {
                    // Check X axis against current Y
                    if (newX + radius > obs.x && newX - radius < obs.x + obs.w &&
                        this.y + radius > obs.y && this.y - radius < obs.y + obs.h) {
                        newX = this.x; // Block X movement
                    }
                    // Check Y axis against new X (to allow sliding)
                    if (newX + radius > obs.x && newX - radius < obs.x + obs.w &&
                        newY + radius > obs.y && newY - radius < obs.y + obs.h) {
                        newY = this.y; // Block Y movement
                    }
                }
            }
        }

        this.x = newX;
        this.y = newY;
    }

    die() {
        this.isDead = true;
        this.respawnTimer = 10;
        this.health = 0;
        this.controlledDroneId = null; // Exit drone on death
        this.deploy1Lock = false; // Reset lock
        // this.currentStreak = 0; // Streak persists through death now
    }

    respawn() {
        this.isDead = false;
        this.health = 100;

        // Reposition at spawn
        if (this.gameRoom) {
            const spawn = this.gameRoom.mapSystem.getRandomSpawn(this.gameRoom.mapId, this.team);
            this.x = spawn.x;
            this.y = spawn.y;
            this.grenades = 2;

            // Reset weapon state
            const weapon = this.gameRoom.weaponSystem.weapons[this.currentWeapon];
            if (weapon) {
                this.ammo = weapon.magSize;
                this.maxAmmo = weapon.magSize;
                this.isReloading = false;
                this.burstRemaining = 0;
            }
        }
    }
}

class PlayerManager {
    constructor(gameRoom) {
        this.gameRoom = gameRoom;
        this.players = new Map();
    }

    addPlayer(ws, id, name, x, y, weaponId, killstreakId) {
        const player = new Player(ws, id, name, this.gameRoom, x, y, weaponId || 'm4a1');
        player.selectedKillstreak = killstreakId || 'turret_1';
        player.currentStreak = 0;
        this.players.set(id, player);
        return player;
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
            if (p.inputs.mouse && p.inputs.mouse.leftDown && !p.isDead && !p.controlledDroneId) {
                this.gameRoom.weaponSystem.tryFire(p, this.gameRoom.projectileSystem);
            }

            // Handle manual reload
            if (p.inputs.reload && !p.isDead && !p.isReloading && p.currentWeapon && !p.controlledDroneId) {
                const weapon = this.gameRoom.weaponSystem.weapons[p.currentWeapon];
                if (weapon && p.ammo !== undefined && p.ammo < weapon.magSize) {
                    this.gameRoom.weaponSystem.startReload(p, weapon);
                }
            }

            // Developer Cheat XP (Press K)
            if (p.inputs.cheatXP && !p.cheatXPLock) {
                p.cheatXPLock = true;
                p.currentStreak += 15; // Instantly max most streaks
            }
            if (!p.inputs.cheatXP) {
                p.cheatXPLock = false;
            }

            // Handle Deployables
            const scores = this.gameRoom.scoreSystem.scores;
            const playerScore = scores[p.id] || 0;

            if (p.inputs.deploy1 && !p.deploy1Lock) {
                p.deploy1Lock = true;

                let requiredKills = 3;
                if (p.selectedKillstreak === 'turret_1') requiredKills = 3;
                else if (p.selectedKillstreak === 'turret_2') requiredKills = 5;
                else if (p.selectedKillstreak === 'turret_3') requiredKills = 7;
                else if (p.selectedKillstreak === 'tank_1') requiredKills = 5;
                else if (p.selectedKillstreak === 'tank_2') requiredKills = 8;
                else if (p.selectedKillstreak === 'tank_3') requiredKills = 12;
                else if (p.selectedKillstreak === 'mega_bazooka') requiredKills = 5;
                else if (p.selectedKillstreak === 'remote_drone') requiredKills = 6;

                if (p.currentStreak >= requiredKills) {
                    p.currentStreak -= requiredKills;

                    if (p.selectedKillstreak.startsWith('turret')) {
                        this.gameRoom.robotSystem.spawnRobot(p.x, p.y, p.selectedKillstreak, p.team, p.id);
                    } else if (p.selectedKillstreak.startsWith('tank')) {
                        const spawnX = (p.inputs.mouse && p.inputs.mouse.worldX) ? p.inputs.mouse.worldX : p.x;
                        const spawnY = (p.inputs.mouse && p.inputs.mouse.worldY) ? p.inputs.mouse.worldY : p.y;
                        this.gameRoom.mechSystem.spawnMech(spawnX, spawnY, p.selectedKillstreak, p.team);
                    } else if (p.selectedKillstreak === 'mega_bazooka') {
                        if (!p.isMegaBazookaActive && p.currentWeapon !== 'mega_bazooka') {
                            p.previousWeapon = p.currentWeapon;
                            p.previousAmmo = p.ammo;
                            p.isMegaBazookaActive = true;
                            p.currentWeapon = 'mega_bazooka';
                            p.ammo = 3;
                            p.maxAmmo = 3;
                            p.lastWeapon = 'mega_bazooka';
                            p.isReloading = false;
                        } else {
                            // Already active, refund streak
                            p.currentStreak += requiredKills;
                        }
                    } else if (p.selectedKillstreak === 'remote_drone') {
                        // Check if player is outside
                        const currentBuilding = this.gameRoom.mapSystem.getBuildingId(p.x, p.y, this.gameRoom.mapId);
                        if (currentBuilding) {
                            console.log(`[STREAT] Player ${p.name} cannot spawn drone INSIDE building ${currentBuilding}`);
                            p.deploy1Lock = false; // Reset lock so they can try again once outside
                            return;
                        }

                        // Spawn drone at player position
                        const droneId = Math.random().toString(36).substr(2, 9);
                        console.log(`[STREAK] Player ${p.name} (${p.id}) spawning REMOTE DRONE ${droneId}`);
                        this.gameRoom.robotSystem.spawnRobot(p.x, p.y, 'remote_drone', p.team, p.id, droneId);
                        p.controlledDroneId = droneId;
                    }
                } else {
                    console.log(`[STREAK] Player ${p.name} failed activation: streak ${p.currentStreak} < required ${requiredKills} for ${p.selectedKillstreak}`);
                }
            }
            if (!p.inputs.deploy1) p.deploy1Lock = false;

            // Optional: still support legacy Titan key if user presses T
            if (p.inputs.deployTitan && !p.deployTLock) {
                p.deployTLock = true;
                if (playerScore >= 500 && !p.inMech) {
                    this.gameRoom.mechSystem.spawnMech(p.inputs.mouse.worldX, p.inputs.mouse.worldY, 'titan', p.team);
                    this.gameRoom.scoreSystem.addScore(p.id, -500, null);
                }
            }
            if (!p.inputs.deployTitan) p.deployTLock = false;

            if (p.inputs.cheatXP && !p.cheatXPLock) {
                p.cheatXPLock = true;
                this.gameRoom.scoreSystem.addScore(p.id, 100, null); // Cheat XP
            }
            if (!p.inputs.cheatXP) p.cheatXPLock = false;

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
                    p.currentWeapon = p.previousWeapon || 'm4a1';
                    p.ammo = p.previousAmmo !== undefined ? p.previousAmmo : 30;
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

            // Handle throwing grenade
            if (p.inputs.throwGrenade && !p.isDead && p.grenades > 0 && !p.controlledDroneId) {
                const now = Date.now();
                if (now - p.lastGrenadeTime > 1500) { // 1.5 second cooldown between throws
                    p.grenades--;
                    p.lastGrenadeTime = now;

                    // Tell projectileSystem to spawn a grenade
                    if (this.gameRoom.projectileSystem) {
                        this.gameRoom.projectileSystem.addGrenade(p, p.inputs.mouse.worldX, p.inputs.mouse.worldY);
                    }
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
                x: Math.round(p.x * 10) / 10,
                y: Math.round(p.y * 10) / 10,
                rotation: Math.round(p.rotation * 100) / 100,
                vx: Math.round(p.vx * 10) / 10,
                vy: Math.round(p.vy * 10) / 10,
                team: p.team,
                health: p.health,
                inMech: !!p.inMech,
                currentWeapon: p.currentWeapon,
                weaponType: p.gameRoom && p.gameRoom.weaponSystem && p.gameRoom.weaponSystem.weapons[p.currentWeapon] ? p.gameRoom.weaponSystem.weapons[p.currentWeapon].type : 'pistol',
                muzzleFlash: p.muzzleFlash > 0,
                score: scores[id] || 0,
                isDead: p.isDead,
                ammo: p.ammo,
                maxAmmo: p.maxAmmo,
                isReloading: p.isReloading,
                reloadTimer: p.reloadTimer || 0,
                maxReloadTime: p.maxReloadTime || 60,
                fireCount: p.fireCount,
                stamina: p.stamina,
                maxStamina: p.maxStamina,
                selectedKillstreak: p.selectedKillstreak,
                currentStreak: p.currentStreak || 0,
                controlledDroneId: p.controlledDroneId || null,
                hullRot: p.hullRotation !== undefined ? Math.round(p.hullRotation * 100) / 100 : undefined,
                turretRot: Math.round(p.rotation * 100) / 100
            };
        }
        return state;
    }
}

module.exports = PlayerManager;
