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
                        // TODO: Handle death and score
                        target.health = 100;
                        target.x = Math.random() * 800 + 100; // instant respawn for now
                        target.y = Math.random() * 600 + 100;
                    }
                    break;
                }
            }
            
            // Check collisions with mechs/robots...

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
