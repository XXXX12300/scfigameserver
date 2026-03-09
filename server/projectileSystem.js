class ProjectileSystem {
    constructor() {
        this.projectiles = [];
    }

    spawnProjectile(x, y, vx, vy, weaponType, ownerId, team, damage) {
        this.projectiles.push({
            id: Math.random().toString(36).substr(2, 9),
            x, y,
            vx, vy,
            weaponType,
            ownerId,
            team,
            damage,
            life: 2.0 // seconds until despawn
        });
    }

    update(dt, playerManager, mechSystem, robotSystem) {
        const dtSec = dt / 1000;
        for (let i = this.projectiles.length - 1; i >= 0; i--) {
            let p = this.projectiles[i];
            p.x += p.vx * dtSec;
            p.y += p.vy * dtSec;
            p.life -= dtSec;

            let hit = false;

            // Check collisions with players
            const players = playerManager.getPlayers();
            for (let target of players) {
                // Ignore friendly fire and own bullets
                if (target.id === p.ownerId || target.team === p.team) continue;

                // Simple circle collision (radius 16)
                const dx = target.x - p.x;
                const dy = target.y - p.y;
                const distSq = dx*dx + dy*dy;
                if (distSq < 16 * 16) {
                    target.health -= p.damage;
                    hit = true;
                    if (target.health <= 0) {
                        // Grant score to killer
                        if (playerManager.gameRoom) {
                            if (playerManager.gameRoom.scoreSystem) {
                                playerManager.gameRoom.scoreSystem.addScore(p.ownerId, 100, p.team);
                            }
                            playerManager.gameRoom.broadcastEvent('kill', {
                                killerId: p.ownerId,
                                victimId: target.id,
                                killerTeam: p.team,
                                weapon: p.weaponType
                            });
                        }
                        
                        target.health = 100;
                        target.x = Math.random() * 800 + 100; // instant respawn for now
                        target.y = Math.random() * 600 + 100;
                    }
                    break;
                }
            }
            
            // Check collisions with mechs
            if (!hit && playerManager.gameRoom && playerManager.gameRoom.mechSystem) {
                const mechs = playerManager.gameRoom.mechSystem.getState();
                for (let mech of mechs) {
                    if (mech.state === 'falling') continue; // Invulnerable while falling
                    if (mech.team === p.team) continue;

                    const dx = mech.x - p.x;
                    const dy = mech.y - p.y;
                    const radius = mech.type === 'titan' ? 30 : 25;
                    if (dx*dx + dy*dy < radius * radius) {
                        mech.health -= p.damage;
                        hit = true;
                        if (mech.health <= 0) {
                            if (playerManager.gameRoom.scoreSystem) {
                                playerManager.gameRoom.scoreSystem.addScore(p.ownerId, 500, p.team); // Big score for mech kill
                            }
                            playerManager.gameRoom.broadcastEvent('kill', {
                                killerId: p.ownerId,
                                victimId: mech.owner ? mech.owner : 'Unpiloted ' + mech.type.toUpperCase(),
                                killerTeam: p.team,
                                weapon: p.weaponType
                            });
                        }
                        break;
                    }
                }
            }

            // Check collisions with robots
            if (!hit && playerManager.gameRoom && playerManager.gameRoom.robotSystem) {
                const robots = playerManager.gameRoom.robotSystem.getState();
                for (let robot of robots) {
                    if (robot.team === p.team) continue;

                    const dx = robot.x - p.x;
                    const dy = robot.y - p.y;
                    if (dx*dx + dy*dy < 12 * 12) {
                        robot.health -= p.damage;
                        hit = true;
                        if (robot.health <= 0) {
                            if (playerManager.gameRoom.scoreSystem) {
                                playerManager.gameRoom.scoreSystem.addScore(p.ownerId, 100, p.team); 
                            }
                        }
                        break;
                    }
                }
            }

            if (p.life <= 0 || hit) {
                this.projectiles.splice(i, 1);
            }
        }
    }

    getState() {
        return this.projectiles;
    }
}

module.exports = ProjectileSystem;
