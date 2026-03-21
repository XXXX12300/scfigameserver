class ProjectileSystem {
    constructor() {
        this.projectiles = [];
        this.grenades = [];
    }

    spawnProjectile(x, y, vx, vy, weaponType, ownerId, team, damage) {
        const p = {
            id: Math.random().toString(36).substr(2, 9),
            x, y,
            vx, vy,
            weaponType,
            ownerId,
            team,
            damage,
            life: 2.0 // seconds until despawn
        };
        this.projectiles.push(p);
        return p;
    }

    addGrenade(owner, targetX, targetY) {
        const dx = targetX - owner.x;
        const dy = targetY - owner.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        let vx = 0; let vy = 0;
        if (dist > 0) {
            // Throw speed ~ 400px/s, max distance bounded by fuse time
            const speed = Math.min(dist * 2.5, 500);
            vx = (dx / dist) * speed;
            vy = (dy / dist) * speed;
        }

        const grenade = {
            id: Math.random().toString(36).substr(2, 9),
            x: owner.x,
            y: owner.y,
            vx: vx,
            vy: vy,
            ownerId: owner.id,
            team: owner.team,
            damage: 200, // Very high damage to one-shot at point blank
            life: 1.5, // 1.5 second fuse
            friction: 0.95 // slows down over time
        };

        this.grenades.push(grenade);
    }

    update(dt, playerManager, mechSystem, robotSystem) {
        const dtSec = dt / 1000;
        for (let i = this.projectiles.length - 1; i >= 0; i--) {
            let p = this.projectiles[i];
            p.x += p.vx * dtSec;
            p.y += p.vy * dtSec;
            p.life -= dtSec;

            let hit = false;

            // Homing Logic
            if (p.isHoming) {
                let bestDist = 400 * 400; // max range 400px
                let bestTarget = null;
                const players = playerManager.getPlayers();

                // Find nearest player
                for (let target of players) {
                    if (target.id === p.ownerId || target.team === p.team || target.isDead) continue;
                    const dx = target.x - p.x;
                    const dy = target.y - p.y;
                    const distSq = dx * dx + dy * dy;
                    if (distSq < bestDist) {
                        bestDist = distSq;
                        bestTarget = target;
                    }
                }

                // Find nearest bot if no player or closer
                if (playerManager.gameRoom && playerManager.gameRoom.robotSystem) {
                    const robots = playerManager.gameRoom.robotSystem.robots;
                    for (let robot of robots) {
                        if (robot.team === p.team) continue;
                        const dx = robot.x - p.x;
                        const dy = robot.y - p.y;
                        const distSq = dx * dx + dy * dy;
                        if (distSq < bestDist) {
                            bestDist = distSq;
                            bestTarget = robot;
                        }
                    }
                }

                // Steer towards target
                if (bestTarget) {
                    const dx = bestTarget.x - p.x;
                    const dy = bestTarget.y - p.y;
                    const targetAngle = Math.atan2(dy, dx);
                    const currentAngle = Math.atan2(p.vy, p.vx);

                    // Smooth rotation
                    let angleDiff = targetAngle - currentAngle;
                    // Normalize angle to -PI to PI
                    while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
                    while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;

                    const maxTurn = 3.0 * dtSec; // Radians per second turn rate
                    if (angleDiff > maxTurn) angleDiff = maxTurn;
                    if (angleDiff < -maxTurn) angleDiff = -maxTurn;

                    const newAngle = currentAngle + angleDiff;
                    const speed = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
                    p.vx = Math.cos(newAngle) * speed;
                    p.vy = Math.sin(newAngle) * speed;
                }
            }

            // Store old position for continuous collision detection (CCD)
            const oldX = p.x - p.vx * dtSec;
            const oldY = p.y - p.vy * dtSec;

            // Helper for Segment-Circle Intersection
            const checkCircleSegmentIntersect = (x1, y1, x2, y2, cx, cy, r) => {
                const dx = x2 - x1;
                const dy = y2 - y1;
                const l2 = dx * dx + dy * dy;
                let t = 0;
                if (l2 > 0) {
                    t = Math.max(0, Math.min(1, ((cx - x1) * dx + (cy - y1) * dy) / l2));
                }
                const pX = x1 + t * dx;
                const pY = y1 + t * dy;
                const distSq = (pX - cx) * (pX - cx) + (pY - cy) * (pY - cy);
                return distSq < (r * r);
            };

            // Check collisions with players
            const players = playerManager.getPlayers();
            for (let target of players) {
                // Ignore friendly fire, own bullets, and already dead players
                if (target.id === p.ownerId || target.team === p.team || target.isDead) continue;

                // Continuous Collision Circle check (radius 16)
                if (checkCircleSegmentIntersect(oldX, oldY, p.x, p.y, target.x, target.y, 16)) {
                    target.health -= p.damage;
                    hit = true;

                    // Hitmarker
                    if (playerManager.gameRoom) {
                        playerManager.gameRoom.broadcastEventToPlayer(p.ownerId, 'hit', { victimId: target.id });

                        // Blood cloud
                        playerManager.gameRoom.broadcastEvent('blood_impact', {
                            x: p.x, y: p.y,
                            vx: p.vx * 0.1, vy: p.vy * 0.1,
                            type: 'blood_cloud'
                        });

                        // Gore ground decal
                        const goreType = Math.random() > 0.5 ? 'blood_gore_1' : 'blood_gore_2';
                        playerManager.gameRoom.addDecal(goreType, target.x, target.y);
                    }

                    if (target.health <= 0) {
                        // Grant score to killer
                        if (playerManager.gameRoom) {
                            if (playerManager.gameRoom.scoreSystem && playerManager.gameRoom.gameMode === 'tdm') {
                                playerManager.gameRoom.scoreSystem.addScore(p.ownerId, 100, p.team);
                            }
                            const killer = playerManager.players.get(p.ownerId);
                            if (killer) killer.currentStreak++;
                            playerManager.gameRoom.broadcastEvent('kill', {
                                killerId: p.ownerId,
                                victimId: target.id,
                                killerTeam: p.team,
                                weapon: p.weaponType
                            });
                        }

                        target.die();
                    }
                    break;
                }
            }

            // CCD against map obstacles

            // Check collisions with map obstacles (buildings, walls, unwalkable terrain)
            const isFlying = p.weaponType === 'laser_sniper';
            if (!hit && !isFlying && playerManager.gameRoom && playerManager.gameRoom.mapSystem && playerManager.gameRoom.mapData) {
                const physObs = playerManager.gameRoom.mapSystem.getPhysicalObstacles(playerManager.gameRoom.mapId);
                for (let obs of physObs) {
                    // Continuous Collision Detection (Line Segment vs AABB)
                    // Check if the line segment from (oldX, oldY) to (p.x, p.y) intersects the AABB (obs.x, obs.y, obs.w, obs.h)
                    // We expand the AABB slightly by the projectile radius (approx 2px)
                    const expand = 2;
                    const minX = obs.x - expand;
                    const maxX = obs.x + obs.w + expand;
                    const minY = obs.y - expand;
                    const maxY = obs.y + obs.h + expand;

                    // 1. Point inside AABB (classic check)
                    if (p.x >= minX && p.x <= maxX && p.y >= minY && p.y <= maxY) {
                        hit = true;
                        break;
                    }

                    // 2. Line intersection with AABB walls
                    // Helper to check line segment intersection
                    const checkLineIntersect = (x1, y1, x2, y2, x3, y3, x4, y4) => {
                        const den = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4);
                        if (den === 0) return false;
                        const t = ((x1 - x3) * (y3 - y4) - (y1 - y3) * (x3 - x4)) / den;
                        const u = -((x1 - x2) * (y1 - y3) - (y1 - y2) * (x1 - x3)) / den;
                        return t >= 0 && t <= 1 && u >= 0 && u <= 1;
                    };

                    // Check all 4 edges of the AABB
                    if (checkLineIntersect(oldX, oldY, p.x, p.y, minX, minY, maxX, minY) || // Top
                        checkLineIntersect(oldX, oldY, p.x, p.y, minX, maxY, maxX, maxY) || // Bottom
                        checkLineIntersect(oldX, oldY, p.x, p.y, minX, minY, minX, maxY) || // Left
                        checkLineIntersect(oldX, oldY, p.x, p.y, maxX, minY, maxX, maxY)) { // Right
                        hit = true;
                        break;
                    }
                }
            }

            // Check collisions with mechs
            if (!hit && playerManager.gameRoom && playerManager.gameRoom.mechSystem) {
                const mechs = playerManager.gameRoom.mechSystem.mechs; // Use actual array
                for (let mech of mechs) {
                    if (mech.state === 'falling') continue;
                    if (mech.team === p.team) continue;

                    const radius = mech.type === 'titan' ? 35 : 28; // Slightly larger hitbox for mechs
                    if (checkCircleSegmentIntersect(oldX, oldY, p.x, p.y, mech.x, mech.y, radius)) {
                        mech.health -= p.damage;
                        hit = true;

                        // Hitmarker
                        playerManager.gameRoom.broadcastEventToPlayer(p.ownerId, 'hit', { victimId: mech.id });

                        if (mech.health <= 0) {
                            if (playerManager.gameRoom.scoreSystem && playerManager.gameRoom.gameMode === 'tdm') {
                                playerManager.gameRoom.scoreSystem.addScore(p.ownerId, 500, p.team);
                            }
                            const killer = playerManager.players.get(p.ownerId);
                            if (killer) killer.currentStreak++;
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
                const robots = playerManager.gameRoom.robotSystem.robots; // Use actual array
                for (let robot of robots) {
                    if (robot.isDead || robot.team === p.team) continue;

                    if (checkCircleSegmentIntersect(oldX, oldY, p.x, p.y, robot.x, robot.y, 18)) { // Increased hitbox for bots
                        robot.health -= p.damage;
                        hit = true;

                        if (playerManager.gameRoom) {
                            // Hitmarker
                            playerManager.gameRoom.broadcastEventToPlayer(p.ownerId, 'hit', { victimId: robot.id });

                            // Blood cloud
                            playerManager.gameRoom.broadcastEvent('blood_impact', {
                                x: p.x, y: p.y,
                                vx: p.vx * 0.1, vy: p.vy * 0.1,
                                type: 'blood_cloud'
                            });

                            // Gore ground decal
                            const goreType = Math.random() > 0.5 ? 'blood_gore_1' : 'blood_gore_2';
                            playerManager.gameRoom.addDecal(goreType, robot.x, robot.y);
                        }

                        if (robot.health <= 0) {
                            if (playerManager.gameRoom.scoreSystem && playerManager.gameRoom.gameMode === 'tdm') {
                                playerManager.gameRoom.scoreSystem.addScore(p.ownerId, 100, p.team);
                            }
                            const killer = playerManager.players.get(p.ownerId);
                            if (killer) killer.currentStreak++;
                            playerManager.gameRoom.broadcastEvent('kill', {
                                killerId: p.ownerId,
                                victimId: 'AUTOMATON-' + robot.id.substr(0, 4),
                                killerTeam: p.team,
                                weapon: p.weaponType
                            });
                        }
                        break;
                    }
                }
            }

            if (p.life <= 0 || hit) {
                if (p.isExplosive) {
                    this.handleExplosion(p, playerManager);
                }
                this.projectiles.splice(i, 1);
            }
        }

        this.updateGrenades(dtSec, playerManager);
    }

    updateGrenades(dtSec, playerManager) {
        for (let i = this.grenades.length - 1; i >= 0; i--) {
            let g = this.grenades[i];

            // Move with friction
            g.x += g.vx * dtSec;
            g.y += g.vy * dtSec;
            g.vx *= g.friction;
            g.vy *= g.friction;
            g.life -= dtSec;

            // Simple bounce off world bounds
            const mapW = playerManager.gameRoom && playerManager.gameRoom.mapData ? playerManager.gameRoom.mapData.width : 4000;
            const mapH = playerManager.gameRoom && playerManager.gameRoom.mapData ? playerManager.gameRoom.mapData.height : 4000;

            const radius = 8;
            if (g.x < radius || g.x > mapW - radius) { g.vx *= -0.6; g.x = Math.max(radius, Math.min(g.x, mapW - radius)); }
            if (g.y < radius || g.y > mapH - radius) { g.vy *= -0.6; g.y = Math.max(radius, Math.min(g.y, mapH - radius)); }

            // Bounce off walls
            if (playerManager.gameRoom && playerManager.gameRoom.mapSystem) {
                const physObs = playerManager.gameRoom.mapSystem.getPhysicalObstacles(playerManager.gameRoom.mapId);
                for (let obs of physObs) {
                    if (g.x + radius > obs.x && g.x - radius < obs.x + obs.w &&
                        g.y + radius > obs.y && g.y - radius < obs.y + obs.h) {

                        // Determine which axis to bounce
                        const objCX = obs.x + obs.w / 2;
                        const objCY = obs.y + obs.h / 2;
                        const dx = g.x - objCX;
                        const dy = g.y - objCY;

                        if (Math.abs(dx) / obs.w > Math.abs(dy) / obs.h) {
                            g.vx *= -0.5;
                            g.x += dx > 0 ? 2 : -2;
                        } else {
                            g.vy *= -0.5;
                            g.y += dy > 0 ? 2 : -2;
                        }
                    }
                }
            }

            // Blow up when fuse expires
            if (g.life <= 0) {
                // Borrow the existing explosion logic
                const pMock = {
                    x: g.x,
                    y: g.y,
                    damage: g.damage,
                    ownerId: g.ownerId,
                    team: g.team
                };
                this.handleExplosion(pMock, playerManager);
                this.grenades.splice(i, 1);
            }
        }
    }

    handleExplosion(projectile, playerManager) {
        const explosionRadius = 80;
        const explosionDamage = projectile.damage;

        if (playerManager.gameRoom) {
            playerManager.gameRoom.broadcastEvent('explosion', {
                x: projectile.x,
                y: projectile.y,
                radius: explosionRadius
            });
        }

        // Damage players in radius
        const players = playerManager.getPlayers();
        for (let target of players) {
            if (target.isDead) continue;
            const dx = target.x - projectile.x;
            const dy = target.y - projectile.y;
            const distSq = dx * dx + dy * dy;
            if (distSq < explosionRadius * explosionRadius) {
                const dist = Math.sqrt(distSq);
                const falloff = 1 - (dist / explosionRadius);
                target.health -= explosionDamage * falloff;

                // Trigger blood decal from explosion
                if (playerManager.gameRoom) {
                    playerManager.gameRoom.addDecal('blood', target.x, target.y);
                }

                if (target.health <= 0) {
                    if (playerManager.gameRoom) {
                        if (playerManager.gameRoom.scoreSystem && playerManager.gameRoom.gameMode === 'tdm') {
                            playerManager.gameRoom.scoreSystem.addScore(projectile.ownerId, 100, projectile.team);
                        }
                        const killer = playerManager.players.get(projectile.ownerId);
                        if (killer) killer.currentStreak++;
                        playerManager.gameRoom.broadcastEvent('kill', {
                            killerId: projectile.ownerId,
                            victimId: target.id,
                            killerTeam: projectile.team,
                            weapon: projectile.weaponType + ' (Explosion)'
                        });
                    }
                    target.die();
                }
            }
        }

        // Damage mechs in radius
        if (playerManager.gameRoom && playerManager.gameRoom.mechSystem) {
            const mechs = playerManager.gameRoom.mechSystem.mechs;
            for (let mech of mechs) {
                const dx = mech.x - projectile.x;
                const dy = mech.y - projectile.y;
                const distSq = dx * dx + dy * dy;
                if (distSq < explosionRadius * explosionRadius) {
                    mech.health -= explosionDamage * 0.5; // Half damage to mechs from explosion

                    if (mech.owner && playerManager.gameRoom) {
                        playerManager.gameRoom.addDecal('blood', mech.x, mech.y);
                    }
                }
            }
        }

        // Damage robots/bots in radius
        if (playerManager.gameRoom && playerManager.gameRoom.robotSystem) {
            const robots = playerManager.gameRoom.robotSystem.robots;
            for (let robot of robots) {
                if (robot.isDead || robot.team === projectile.team) continue;

                const dx = robot.x - projectile.x;
                const dy = robot.y - projectile.y;
                const distSq = dx * dx + dy * dy;

                if (distSq < explosionRadius * explosionRadius) {
                    const dist = Math.sqrt(distSq);
                    const falloff = 1 - (dist / explosionRadius);
                    robot.health -= explosionDamage * falloff;

                    if (playerManager.gameRoom) {
                        const goreType = Math.random() > 0.5 ? 'blood_gore_1' : 'blood_gore_2';
                        playerManager.gameRoom.addDecal(goreType, robot.x, robot.y);
                    }

                    if (robot.health <= 0) {
                        if (playerManager.gameRoom.scoreSystem && playerManager.gameRoom.gameMode === 'tdm') {
                            playerManager.gameRoom.scoreSystem.addScore(projectile.ownerId, 100, projectile.team);
                        }
                        const killer = playerManager.players.get(projectile.ownerId);
                        if (killer) killer.currentStreak++;
                        if (playerManager.gameRoom) {
                            playerManager.gameRoom.broadcastEvent('kill', {
                                killerId: projectile.ownerId,
                                victimId: 'AUTOMATON-' + robot.id.substr(0, 4),
                                killerTeam: projectile.team,
                                weapon: projectile.weaponType + ' (Explosion)'
                            });
                        }
                    }
                }
            }
        }
    }

    meleeAttack(player, weapon, playerManager) {
        const meleeRange = 80;
        const meleeDamage = weapon.damage || 50;
        const arc = Math.PI / 2; // 90 degree arc in front

        // Damage players
        const players = playerManager.getPlayers();
        for (let target of players) {
            if (target.id === player.id || target.isDead) continue;

            const dx = target.x - player.x;
            const dy = target.y - player.y;
            const distSq = dx * dx + dy * dy;

            if (distSq < meleeRange * meleeRange) {
                const angleToTarget = Math.atan2(dy, dx);
                let diff = angleToTarget - player.rotation;
                while (diff < -Math.PI) diff += Math.PI * 2;
                while (diff > Math.PI) diff -= Math.PI * 2;

                if (Math.abs(diff) < arc / 2) {
                    target.health -= meleeDamage;

                    if (player.gameRoom) {
                        // Hitmarker
                        player.gameRoom.broadcastEventToPlayer(player.id, 'hit', { victimId: target.id });

                        // Blood cloud
                        player.gameRoom.broadcastEvent('blood_impact', {
                            x: target.x, y: target.y,
                            vx: Math.cos(player.rotation) * 2, vy: Math.sin(player.rotation) * 2,
                            type: 'blood_cloud'
                        });

                        const goreType = Math.random() > 0.5 ? 'blood_gore_1' : 'blood_gore_2';
                        player.gameRoom.addDecal(goreType, target.x, target.y);
                    }

                    if (target.health <= 0) {
                        if (player.gameRoom) {
                            if (player.gameRoom.scoreSystem && player.gameRoom.gameMode === 'tdm') {
                                player.gameRoom.scoreSystem.addScore(player.id, 100, player.team);
                            }
                            const killer = playerManager.players.get(player.id);
                            if (killer) killer.currentStreak++;
                            player.gameRoom.broadcastEvent('kill', {
                                killerId: player.id,
                                victimId: target.id,
                                killerTeam: player.team,
                                weapon: weapon.name
                            });
                        }
                        target.die();
                    }
                }
            }
        }

        // Damage bots
        if (player.gameRoom && player.gameRoom.robotSystem) {
            const robots = player.gameRoom.robotSystem.robots;
            for (let robot of robots) {
                if (robot.team === player.team) continue;
                const dx = robot.x - player.x;
                const dy = robot.y - player.y;
                const distSq = dx * dx + dy * dy;

                if (distSq < meleeRange * meleeRange) {
                    const angleToTarget = Math.atan2(dy, dx);
                    let diff = angleToTarget - player.rotation;
                    while (diff < -Math.PI) diff += Math.PI * 2;
                    while (diff > Math.PI) diff -= Math.PI * 2;

                    if (Math.abs(diff) < arc / 2) {
                        robot.health -= meleeDamage;

                        if (player.gameRoom) {
                            // Hitmarker
                            player.gameRoom.broadcastEventToPlayer(player.id, 'hit', { victimId: robot.id });

                            // Blood cloud
                            player.gameRoom.broadcastEvent('blood_impact', {
                                x: robot.x, y: robot.y,
                                vx: Math.cos(player.rotation) * 2, vy: Math.sin(player.rotation) * 2,
                                type: 'blood_cloud'
                            });

                            const goreType = Math.random() > 0.5 ? 'blood_gore_1' : 'blood_gore_2';
                            player.gameRoom.addDecal(goreType, robot.x, robot.y);
                        }

                        if (robot.health <= 0) {
                            if (player.gameRoom) {
                                if (player.gameRoom.scoreSystem && player.gameRoom.gameMode === 'tdm') {
                                    player.gameRoom.scoreSystem.addScore(player.id, 100, player.team);
                                }
                                const killer = playerManager.players.get(player.id);
                                if (killer) killer.currentStreak++;
                                player.gameRoom.broadcastEvent('kill', {
                                    killerId: player.id,
                                    victimId: 'AUTOMATON-' + robot.id.substr(0, 4),
                                    killerTeam: player.team,
                                    weapon: weapon.name
                                });
                            }
                            robot.isDead = true;
                        }
                    }
                }
            }
        }
    }

    getState() {
        return {
            projectiles: this.projectiles.map(p => ({
                ...p,
                x: Math.round(p.x * 10) / 10,
                y: Math.round(p.y * 10) / 10,
                vx: Math.round(p.vx * 10) / 10,
                vy: Math.round(p.vy * 10) / 10,
                distanceTraveled: Math.round(p.distanceTraveled)
            })),
            grenades: this.grenades.map(g => ({
                ...g,
                x: Math.round(g.x * 10) / 10,
                y: Math.round(g.y * 10) / 10,
                vx: Math.round(g.vx * 10) / 10,
                vy: Math.round(g.vy * 10) / 10,
                timer: Math.round(g.timer * 10) / 10
            }))
        };
    }
}

module.exports = ProjectileSystem;
