const MathUtils = require('../utils/math');

class TurretAI {
    update(turret, dt, gameRoom) {
        if (!turret || !gameRoom) return;

        // Turret stats
        const range = 400;
        const fireRate = 500; // RPM
        const projSpeed = 800;
        const damage = 10;
        const cooldownMs = 60000 / fireRate;

        // Find closest enemy player
        let closestTarget = null;
        let minSqDist = range * range;

        for (let [id, p] of gameRoom.playerManager.players) {
            if (p.team === turret.team || p.health <= 0) continue;

            const distSq = Math.pow(p.x - turret.x, 2) + Math.pow(p.y - turret.y, 2);
            if (distSq < minSqDist) {
                minSqDist = distSq;
                closestTarget = p;
            }
        }

        const now = Date.now();
        if (closestTarget) {
            // Aim at target
            turret.rotation = Math.atan2(closestTarget.y - turret.y, closestTarget.x - turret.x);

            // Fire
            if (!turret.lastFireTime) turret.lastFireTime = 0;
            if (now - turret.lastFireTime >= cooldownMs) {
                turret.lastFireTime = now;
                
                const vx = Math.cos(turret.rotation) * projSpeed;
                const vy = Math.sin(turret.rotation) * projSpeed;
                const px = turret.x + Math.cos(turret.rotation) * 20;
                const py = turret.y + Math.sin(turret.rotation) * 20;

                gameRoom.projectileSystem.spawnProjectile(
                    px, py, vx, vy, 'turret_laser', turret.ownerId, turret.team, damage
                );
            }
        }
    }
}
module.exports = TurretAI;
