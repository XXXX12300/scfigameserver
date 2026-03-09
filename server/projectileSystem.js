class ProjectileSystem {
    constructor() {
        this.projectiles = [];
    }

    spawnProjectile(x, y, vx, vy, weaponType, ownerId, team) {
        this.projectiles.push({
            id: Math.random().toString(36).substr(2, 9),
            x, y,
            vx, vy,
            weaponType,
            ownerId,
            team,
            life: 2.0 // seconds until despawn
        });
    }

    update(dt) {
        const dtSec = dt / 1000;
        for (let i = this.projectiles.length - 1; i >= 0; i--) {
            let p = this.projectiles[i];
            p.x += p.vx * dtSec;
            p.y += p.vy * dtSec;
            p.life -= dtSec;

            if (p.life <= 0) {
                this.projectiles.splice(i, 1);
            }
            // Add collision detection with players/mechs/robots here
        }
    }

    getState() {
        return this.projectiles;
    }
}

module.exports = ProjectileSystem;
