class WeaponSystem {
    constructor() {
        this.weapons = {
            'plasma_rifle': { type: 'primary', damage: 15, fireRate: 200, speed: 600 },
            'pulse_smg': { type: 'primary', damage: 8, fireRate: 80, speed: 500 },
            'laser_sniper': { type: 'primary', damage: 70, fireRate: 1000, speed: 1200 },
            'ion_shotgun': { type: 'primary', damage: 10, fireRate: 800, speed: 400, pellets: 8 },
            'energy_pistol': { type: 'secondary', damage: 12, fireRate: 300, speed: 450 },
            'rocket_launcher': { type: 'heavy', damage: 100, fireRate: 1500, speed: 300, explosive: true },
            'railgun': { type: 'heavy', damage: 150, fireRate: 2000, speed: 2000, pierce: true }
        };
    }

    tryFire(player, projectileSystem) {
        if (!player.currentWeapon) return;

        const weapon = this.weapons[player.currentWeapon];
        if (!weapon) return;

        const now = Date.now();
        // Fire rate is per minute? Wait, usually fire rate is rounds per minute. Let's assume fireRate in JSON is RPM.
        // MS per shot = 60000 / fireRate. Ex: 600 RPM = 100ms
        const cooldownMs = 60000 / weapon.fireRate;

        if (now - player.lastFireTime >= cooldownMs) {
            player.lastFireTime = now;
            
            // Calculate velocity vector based on player rotation
            const vx = Math.cos(player.rotation) * weapon.speed;
            const vy = Math.sin(player.rotation) * weapon.speed;

            // Spawn projectile just slightly in front of player
            const spawnDist = 20;
            const px = player.x + Math.cos(player.rotation) * spawnDist;
            const py = player.y + Math.sin(player.rotation) * spawnDist;

            if (weapon.pellets) {
                 // Shotgun spread logic
                 for (let i = 0; i < weapon.pellets; i++) {
                     const spread = (Math.random() - 0.5) * 0.4; // +/- 0.2 radians spread
                     const spreadVx = Math.cos(player.rotation + spread) * weapon.speed;
                     const spreadVy = Math.sin(player.rotation + spread) * weapon.speed;
                     projectileSystem.spawnProjectile(px, py, spreadVx, spreadVy, player.currentWeapon, player.id, player.team, weapon.damage);
                 }
            } else {
                 projectileSystem.spawnProjectile(px, py, vx, vy, player.currentWeapon, player.id, player.team, weapon.damage);
            }
        }
    }
}

module.exports = WeaponSystem;
