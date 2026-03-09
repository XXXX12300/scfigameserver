const MathUtils = require('../utils/math');

class RobotAI {
    update(robot, dt, gameRoom) {
        if (!robot || !gameRoom) return;

        const speed = 100;
        const range = 500;
        const fireRate = 400; // RPM
        const cooldownMs = 60000 / fireRate;
        const dtSec = dt / 1000;

        // Initialize state
        if (!robot.state) {
            robot.state = 'wander';
            robot.wanderAngle = Math.random() * Math.PI * 2;
            robot.wanderTimer = 0;
        }

        let closestTarget = null;
        let minSqDist = range * range;

        // Find enemies
        for (let [id, p] of gameRoom.playerManager.players) {
            if (p.team === robot.team || p.health <= 0) continue;

            const distSq = Math.pow(p.x - robot.x, 2) + Math.pow(p.y - robot.y, 2);
            if (distSq < minSqDist) {
                minSqDist = distSq;
                closestTarget = p;
            }
        }
        
        // Also check enemy mechs
        for (let m of gameRoom.mechSystem.mechs) {
            if (m.team === robot.team || m.health <= 0) continue;
            const distSq = Math.pow(m.x - robot.x, 2) + Math.pow(m.y - robot.y, 2);
            if (distSq < minSqDist) {
                minSqDist = distSq;
                closestTarget = m;
            }
        }

        if (closestTarget) {
            robot.state = 'attack';
            const dx = closestTarget.x - robot.x;
            const dy = closestTarget.y - robot.y;
            robot.rotation = Math.atan2(dy, dx);
            
            // Move towards target if too far, or back away if too close
            const dist = Math.sqrt(minSqDist);
            let moveDir = 0;
            if (dist > 250) moveDir = 1; // Chase
            else if (dist < 150) moveDir = -1; // Back away

            robot.x += Math.cos(robot.rotation) * speed * moveDir * dtSec;
            robot.y += Math.sin(robot.rotation) * speed * moveDir * dtSec;

            // Fire
            const now = Date.now();
            if (!robot.lastFireTime) robot.lastFireTime = 0;
            if (now - robot.lastFireTime >= cooldownMs) {
                robot.lastFireTime = now;
                const projSpeed = 600;
                const vx = Math.cos(robot.rotation) * projSpeed;
                const vy = Math.sin(robot.rotation) * projSpeed;
                const px = robot.x + Math.cos(robot.rotation) * 20;
                const py = robot.y + Math.sin(robot.rotation) * 20;

                gameRoom.projectileSystem.spawnProjectile(
                    px, py, vx, vy, 'pulse_smg', robot.ownerId, robot.team, 8
                );
            }
        } else {
            // Wander
            robot.state = 'wander';
            robot.wanderTimer -= dtSec;
            if (robot.wanderTimer <= 0) {
                robot.wanderAngle = Math.random() * Math.PI * 2;
                robot.wanderTimer = 2 + Math.random() * 3;
            }
            robot.rotation = robot.wanderAngle;
            robot.x += Math.cos(robot.rotation) * (speed * 0.5) * dtSec;
            robot.y += Math.sin(robot.rotation) * (speed * 0.5) * dtSec;
            
            // Keep roughly inside bounds
            if (robot.x < 0) { robot.x = 0; robot.wanderAngle = 0; }
            if (robot.x > 2000) { robot.x = 2000; robot.wanderAngle = Math.PI; }
            if (robot.y < 0) { robot.y = 0; robot.wanderAngle = Math.PI / 2; }
            if (robot.y > 2000) { robot.y = 2000; robot.wanderAngle = -Math.PI / 2; }
        }
    }
}
module.exports = RobotAI;
