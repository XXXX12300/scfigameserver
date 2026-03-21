const MathUtils = require('../utils/math');

class TurretAI {
    update(turret, dt, gameRoom) {
        if (!turret || !gameRoom) return;

        // Turret stats scaling
        let range = 400;
        let fireRate = 500; // RPM
        let projSpeed = 800;
        let damage = 10;
        let projType = 'turret_laser';

        if (turret.type === 'turret_1') {
            range = 400; fireRate = 500; projSpeed = 800; damage = 10; projType = 'turret_laser';
        } else if (turret.type === 'turret_2') {
            range = 550; fireRate = 300; projSpeed = 1000; damage = 25; projType = 'plasma_rifle';
        } else if (turret.type === 'turret_3') {
            range = 750; fireRate = 180; projSpeed = 1200; damage = 50; projType = 'railgun';
        }

        const cooldownMs = 60000 / fireRate;

        // Find closest enemy player
        let closestTarget = null;
        let minSqDist = range * range;

        for (let [id, p] of gameRoom.playerManager.players) {
            if (p.team === turret.team || p.health <= 0 || p.isDead) continue;

            const distSq = Math.pow(p.x - turret.x, 2) + Math.pow(p.y - turret.y, 2);
            if (distSq < minSqDist) {
                minSqDist = distSq;
                closestTarget = p;
            }
        }

        // Also check enemy robots
        for (let r of gameRoom.robotSystem.robots) {
            if (r.id === turret.id || r.team === turret.team || r.health <= 0 || r.isDead) continue;
            const distSq = Math.pow(r.x - turret.x, 2) + Math.pow(r.y - turret.y, 2);
            if (distSq < minSqDist) {
                minSqDist = distSq;
                closestTarget = r;
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
                    px, py, vx, vy, projType, turret.ownerId, turret.team, damage
                );
            }
        }
    }
}
module.exports = TurretAI;
