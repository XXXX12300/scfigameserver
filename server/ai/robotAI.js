const MathUtils = require('../utils/math');

class RobotAI {
    update(robot, dt, gameRoom) {
        if (!robot || !gameRoom) return;

        const speed = robot.type === 'walker' ? 120 : 100;
        const range = 700;
        const fireRate = 450;
        const cooldownMs = 60000 / fireRate;
        const dtSec = dt / 1000;

        // Initialize state
        if (!robot.aiState) {
            robot.aiState = {
                mode: 'wander',
                wanderAngle: Math.random() * Math.PI * 2,
                wanderTimer: 0,
                targetId: null,
                squadTargetId: null,
                strafeTimer: 0,
                strafeDir: (Math.random() > 0.5 ? 1 : -1),
                grenadeCooldown: Date.now() + Math.random() * 5000 + 5000, // First grenade timer
                lastKnownTargetPos: null
            };
        }
        const ai = robot.aiState;

        let closestTarget = null;
        let minSqDist = range * range;

        // --- Targeting logic (Players, Mechs, and OTHER BOTS) ---
        // 1. Check Players
        for (let [id, p] of gameRoom.playerManager.players) {
            if (p.team === robot.team || p.health <= 0 || p.isDead) continue;
            const distSq = Math.pow(p.x - robot.x, 2) + Math.pow(p.y - robot.y, 2);
            if (distSq < minSqDist) {
                // Check LoS
                if (this.checkLineOfSight(robot.x, robot.y, p.x, p.y, gameRoom)) {
                    minSqDist = distSq;
                    closestTarget = p;
                }
            }
        }
        // 2. Check Mechs
        for (let m of gameRoom.mechSystem.mechs) {
            if (m.team === robot.team || m.health <= 0) continue;
            const distSq = Math.pow(m.x - robot.x, 2) + Math.pow(m.y - robot.y, 2);
            if (distSq < minSqDist) {
                if (this.checkLineOfSight(robot.x, robot.y, m.x, m.y, gameRoom)) {
                    minSqDist = distSq;
                    closestTarget = m;
                }
            }
        }
        // 3. Check other Robots
        for (let r of gameRoom.robotSystem.robots) {
            if (r.id === robot.id || r.team === robot.team || r.health <= 0 || r.isDead) continue;
            const distSq = Math.pow(r.x - robot.x, 2) + Math.pow(r.y - robot.y, 2);
            if (distSq < minSqDist) {
                if (this.checkLineOfSight(robot.x, robot.y, r.x, r.y, gameRoom)) {
                    minSqDist = distSq;
                    closestTarget = r;
                }
            }
        }

        const now = Date.now();
        let targetX = null;
        let targetY = null;
        let desiredMoveAngle = ai.wanderAngle;
        let moveIntensity = 0; // 0 to 1

        if (closestTarget) {
            ai.lastKnownTargetPos = { x: closestTarget.x, y: closestTarget.y };
            ai.mode = robot.health < 30 ? 'flee' : 'attack';

            targetX = closestTarget.x;
            targetY = closestTarget.y;
            const dist = Math.sqrt(minSqDist);
            const angleToTarget = Math.atan2(targetY - robot.y, targetX - robot.x);
            robot.rotation = angleToTarget;

            if (ai.mode === 'flee') {
                // Flee in opposite direction, add slight jitter to avoid straight lines
                desiredMoveAngle = angleToTarget + Math.PI + (Math.random() * 0.5 - 0.25);
                moveIntensity = 1.2; // sprint away
            } else {
                // Attack logic with strafing and flanking
                ai.strafeTimer -= dtSec;
                if (ai.strafeTimer <= 0) {
                    ai.strafeDir = Math.random() > 0.5 ? 1 : -1;
                    ai.strafeTimer = 1 + Math.random() * 2;
                }

                if (dist > 400) {
                    // Chase directly but weave slightly (flanking)
                    desiredMoveAngle = angleToTarget + (0.3 * ai.strafeDir);
                    moveIntensity = 1.0;
                } else if (dist < 250) {
                    // Back away while strafing
                    desiredMoveAngle = angleToTarget + Math.PI + (0.5 * ai.strafeDir);
                    moveIntensity = 0.8;
                } else {
                    // Just strafe
                    desiredMoveAngle = angleToTarget + (Math.PI / 2 * ai.strafeDir);
                    moveIntensity = 0.6;
                }

                // Fire Logic
                if (!robot.lastFireTime) robot.lastFireTime = 0;
                if (now - robot.lastFireTime >= cooldownMs) {
                    // Add slight inaccuracy 
                    const inaccuracy = (Math.random() - 0.5) * 0.1;
                    const aimAngle = robot.rotation + inaccuracy;

                    const projSpeed = 700;
                    const vx = Math.cos(aimAngle) * projSpeed;
                    const vy = Math.sin(aimAngle) * projSpeed;
                    const px = robot.x + Math.cos(aimAngle) * 25;
                    const py = robot.y + Math.sin(aimAngle) * 25;

                    if (!robot.currentWeapon) robot.currentWeapon = 'ak47';
                    robot.lastFireTime = now;
                    gameRoom.projectileSystem.spawnProjectile(
                        px, py, vx, vy, robot.currentWeapon, robot.id, robot.team, 10
                    );
                }

                // Grenade Throwing
                if (now > ai.grenadeCooldown && dist > 150 && dist < 450) {
                    ai.grenadeCooldown = now + 12000 + Math.random() * 8000; // 12-20s cooldown
                    // Throw grenade at enemy expected position
                    gameRoom.projectileSystem.addGrenade(robot, targetX, targetY);
                }
            }

        } else if (ai.lastKnownTargetPos) {
            // Investigate last known location
            ai.mode = 'investigate';
            targetX = ai.lastKnownTargetPos.x;
            targetY = ai.lastKnownTargetPos.y;
            const dist = Math.sqrt(Math.pow(targetX - robot.x, 2) + Math.pow(targetY - robot.y, 2));

            if (dist < 50) {
                // Arrived at last known, clear it
                ai.lastKnownTargetPos = null;
                ai.mode = 'wander';
            } else {
                desiredMoveAngle = Math.atan2(targetY - robot.y, targetX - robot.x);
                robot.rotation = desiredMoveAngle;
                moveIntensity = 0.8;
            }
        } else {
            // Objective or Wander logic
            let targetZone = null;
            if (gameRoom.gameMode === 'control_zone' && gameRoom.mapData && gameRoom.mapData.controlZones) {
                let minZoneDist = 9999999;
                for (let z of gameRoom.mapData.controlZones) {
                    if (z.owner === robot.team && z.progress === 100) continue; // skip fully owned
                    const zDist = Math.pow(z.x - robot.x, 2) + Math.pow(z.y - robot.y, 2);
                    if (zDist < minZoneDist) {
                        minZoneDist = zDist;
                        targetZone = z;
                    }
                }
            }

            if (targetZone) {
                ai.mode = 'objective';
                const distToZone = Math.sqrt(Math.pow(targetZone.x - robot.x, 2) + Math.pow(targetZone.y - robot.y, 2));

                if (distToZone > targetZone.radius * 0.4) {
                    desiredMoveAngle = Math.atan2(targetZone.y - robot.y, targetZone.x - robot.x);
                    robot.rotation = desiredMoveAngle;
                    moveIntensity = 1.0;
                } else {
                    // Inside zone, wander randomly
                    ai.wanderTimer -= dtSec;
                    if (ai.wanderTimer <= 0) {
                        ai.wanderAngle = Math.random() * Math.PI * 2;
                        ai.wanderTimer = 1 + Math.random() * 2;
                    }
                    desiredMoveAngle = ai.wanderAngle;
                    robot.rotation = desiredMoveAngle;
                    moveIntensity = 0.4;
                }
            } else {
                // Hunt towards center / enemy side instead of wandering aimlessly
                ai.mode = 'hunt';
                ai.wanderTimer -= dtSec;

                let mapW = gameRoom.mapData ? gameRoom.mapData.width : 2000;
                let mapH = gameRoom.mapData ? gameRoom.mapData.height : 2000;

                let huntTargetX = mapW / 2;
                let huntTargetY = mapH / 2;

                // Slight randomness to target to spread them out
                if (ai.wanderTimer <= 0) {
                    ai.wanderTimer = 3 + Math.random() * 4;
                    ai.huntOffsetX = (Math.random() - 0.5) * 600;
                    ai.huntOffsetY = (Math.random() - 0.5) * 600;
                }

                huntTargetX += (ai.huntOffsetX || 0);
                huntTargetY += (ai.huntOffsetY || 0);

                // Keep target inside the arena
                huntTargetX = Math.max(100, Math.min(mapW - 100, huntTargetX));
                huntTargetY = Math.max(100, Math.min(mapH - 100, huntTargetY));

                desiredMoveAngle = Math.atan2(huntTargetY - robot.y, huntTargetX - robot.x);
                robot.rotation = desiredMoveAngle;
                moveIntensity = 0.8; // Move purposefully, but not full sprint
            }
        }

        // --- Movement and Smart Wall Blocking ---
        const radius = 18;

        // Use whiskering/steering behaviors to avoid walls
        let finalMoveAngle = this.findClearPath(robot.x, robot.y, desiredMoveAngle, radius, Math.max(speed * moveIntensity * dtSec * 3, 40), gameRoom);
        ai.wanderAngle = finalMoveAngle; // Update wander angle to follow the cleared path

        let newX = robot.x + Math.cos(finalMoveAngle) * speed * moveIntensity * dtSec;
        let newY = robot.y + Math.sin(finalMoveAngle) * speed * moveIntensity * dtSec;

        // Apply slide-collision physically to prevent creeping through
        const mapW = gameRoom.mapData ? gameRoom.mapData.width : 2000;
        const mapH = gameRoom.mapData ? gameRoom.mapData.height : 2000;

        if (newX < radius) newX = radius;
        if (newX > mapW - radius) newX = mapW - radius;
        if (newY < radius) newY = radius;
        if (newY > mapH - radius) newY = mapH - radius;

        if (gameRoom.mapSystem) {
            const physObs = gameRoom.mapSystem.getPhysicalObstacles(gameRoom.mapId);
            for (let obs of physObs) {
                // X axis
                if (newX + radius > obs.x && newX - radius < obs.x + obs.w &&
                    robot.y + radius > obs.y && robot.y - radius < obs.y + obs.h) {
                    newX = robot.x;
                }
                // Y axis
                if (newX + radius > obs.x && newX - radius < obs.x + obs.w &&
                    newY + radius > obs.y && newY - radius < obs.y + obs.h) {
                    newY = robot.y;
                }
            }
        }

        robot.x = newX;
        robot.y = newY;
    }

    // Helper: Cast multiple rays to find an open path
    findClearPath(x, y, startAngle, radius, checkDist, gameRoom) {
        if (!this.isAngleBlocked(x, y, startAngle, radius, checkDist, gameRoom)) return startAngle;

        // Try angles in increasing increments (e.g. 15, -15, 30, -30 deg)
        const increments = [0.25, -0.25, 0.5, -0.5, 0.75, -0.75, 1.0, -1.0, 1.5, -1.5];
        for (let inc of increments) {
            const testAngle = startAngle + inc;
            if (!this.isAngleBlocked(x, y, testAngle, radius, checkDist, gameRoom)) {
                return testAngle;
            }
        }

        // Reversal if trapped
        return startAngle + Math.PI;
    }

    isAngleBlocked(x, y, angle, radius, checkDist, gameRoom) {
        const testX = x + Math.cos(angle) * checkDist;
        const testY = y + Math.sin(angle) * checkDist;
        return !this.checkLineOfSight(x, y, testX, testY, gameRoom, radius);
    }

    // Raycast Line of Sight against map obstacles
    checkLineOfSight(x1, y1, x2, y2, gameRoom, thickness = 2) {
        if (!gameRoom.mapSystem) return true;
        const physObs = gameRoom.mapSystem.getPhysicalObstacles(gameRoom.mapId);

        for (let obs of physObs) {
            const minX = obs.x - thickness;
            const maxX = obs.x + obs.w + thickness;
            const minY = obs.y - thickness;
            const maxY = obs.y + obs.h + thickness;

            if (this.lineIntersectRect(x1, y1, x2, y2, minX, minY, maxX, maxY)) {
                return false; // Blocked
            }
            // Check if points are completely inside
            if ((x1 >= minX && x1 <= maxX && y1 >= minY && y1 <= maxY) ||
                (x2 >= minX && x2 <= maxX && y2 >= minY && y2 <= maxY)) return false;
        }
        return true;
    }

    lineIntersectRect(x1, y1, x2, y2, rx1, ry1, rx2, ry2) {
        return this.lineIntersectLine(x1, y1, x2, y2, rx1, ry1, rx2, ry1) || // Top
            this.lineIntersectLine(x1, y1, x2, y2, rx1, ry2, rx2, ry2) || // Bottom
            this.lineIntersectLine(x1, y1, x2, y2, rx1, ry1, rx1, ry2) || // Left
            this.lineIntersectLine(x1, y1, x2, y2, rx2, ry1, rx2, ry2);   // Right
    }

    lineIntersectLine(x1, y1, x2, y2, x3, y3, x4, y4) {
        const den = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4);
        if (den === 0) return false;
        const t = ((x1 - x3) * (y3 - y4) - (y1 - y3) * (x3 - x4)) / den;
        const u = -((x1 - x2) * (y1 - y3) - (y1 - y2) * (x1 - x3)) / den;
        return t >= 0 && t <= 1 && u >= 0 && u <= 1;
    }
}

module.exports = RobotAI;
