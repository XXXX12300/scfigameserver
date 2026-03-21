class WeaponSystem {
    constructor() {
        this.weapons = {
            // -- ASSAULT RIFLES (Weight: 0.15) --
            'm4a1': { name: 'M4A1', type: 'assault', category: 'Assault Rifles', damage: 22, fireRate: 700, speed: 900, weight: 0.15, projectileType: 'bullet', muzzleType: 'blue', magSize: 30, reloadTime: 1.5, spread: 0.04, recoil: 5, sprite: 'ERA RIFLE 1.png' },
            'scar_h': { name: 'SCAR-H', type: 'assault', category: 'Assault Rifles', damage: 28, fireRate: 600, speed: 850, weight: 0.18, projectileType: 'bullet', muzzleType: 'orange', magSize: 20, reloadTime: 1.8, spread: 0.05, recoil: 8, sprite: 'ERA RIFLE 2.png' },
            'aug_a3': { name: 'AUG A3', type: 'assault', category: 'Assault Rifles', damage: 20, fireRate: 750, speed: 950, weight: 0.14, projectileType: 'bullet', muzzleType: 'blue', magSize: 30, reloadTime: 1.6, spread: 0.03, recoil: 4, sprite: 'ERA RIFLE 3.png' },
            'p90': { name: 'P90', type: 'smg', category: 'Submachine Guns', damage: 15, fireRate: 900, speed: 750, weight: 0.10, projectileType: 'bullet', muzzleType: 'cyan', magSize: 50, reloadTime: 2.0, spread: 0.08, recoil: 3, sprite: 'ERA SMG 1.png' },
            'vector': { name: 'Kriss Vector', type: 'smg', category: 'Submachine Guns', damage: 18, fireRate: 1100, speed: 700, weight: 0.08, projectileType: 'bullet', muzzleType: 'white', magSize: 30, reloadTime: 1.2, spread: 0.10, recoil: 2, sprite: 'ERA SMG 2.png' },

            // -- SNIPER RIFLES (Weight: 0.25) --
            'l115a3': { name: 'L115A3 Sniper', type: 'sniper', category: 'Sniper Rifles', damage: 115, fireRate: 40, speed: 2000, weight: 0.25, projectileType: 'bullet', muzzleType: 'white', magSize: 5, reloadTime: 3.0, spread: 0.0, recoil: 20, knockback: 10, sprite: 'ERA SNIPER.png' },
            'barrett': { name: 'M82 Barrett', type: 'sniper', category: 'Sniper Rifles', damage: 350, fireRate: 30, speed: 2500, weight: 0.35, projectileType: 'bullet', muzzleType: 'red', magSize: 1, reloadTime: 4.5, spread: 0.0, recoil: 40, knockback: 25, sprite: 'ERA HEAVY SNIPER.png' },

            // -- SHOTGUNS (Weight: 0.20) --
            'remington': { name: 'Remington 870', type: 'shotgun', category: 'Shotguns', damage: 15, fireRate: 60, speed: 600, weight: 0.20, pellets: 8, projectileType: 'bullet', muzzleType: 'white', magSize: 6, reloadTime: 2.5, spread: 0.2, recoil: 15, knockback: 15, sprite: 'ERA SHOTGUN.png' },
            'spas12': { name: 'Spas-12', type: 'shotgun', category: 'Shotguns', damage: 14, fireRate: 90, speed: 550, weight: 0.22, pellets: 7, projectileType: 'bullet', muzzleType: 'white', magSize: 8, reloadTime: 3.0, spread: 0.25, recoil: 18, knockback: 12, sprite: 'ERA MEGA SHOTGUN.png' },
            'aa12': { name: 'AA-12 Auto', type: 'shotgun', category: 'Shotguns', damage: 10, fireRate: 300, speed: 650, weight: 0.28, pellets: 5, projectileType: 'bullet', muzzleType: 'cyan', magSize: 20, reloadTime: 4.0, spread: 0.35, recoil: 10, knockback: 8, sprite: 'ERA AUTOMATIC SHOTGUN.png' },

            // -- HEAVY WEAPONS (Weight: 0.40) --
            'rpg7': { name: 'RPG-7', type: 'heavy', category: 'Heavy Weapons', damage: 150, fireRate: 20, speed: 400, weight: 0.45, isExplosive: true, isBazooka: true, projectileType: 'rocket', muzzleType: 'orange', magSize: 1, reloadTime: 5.0, spread: 0.0, recoil: 30, knockback: 50, sprite: 'ERA RPG.png' },
            'minigun': { name: 'M134 Minigun', type: 'heavy', category: 'Heavy Weapons', damage: 14, fireRate: 1500, speed: 850, weight: 0.50, projectileType: 'bullet', muzzleType: 'blue', magSize: 200, reloadTime: 7.0, spread: 0.25, recoil: 2, knockback: 1, sprite: 'ERA MINIGUN.png' },
            'mega_bazooka': { name: 'Mega Bazooka', type: 'heavy', category: 'Killstreaks', damage: 300, fireRate: 60, speed: 600, weight: 0.60, isExplosive: true, isBazooka: true, projectileType: 'rocket', muzzleType: 'orange', magSize: 3, reloadTime: 99.0, spread: 0.0, recoil: 50, knockback: 100, sprite: 'ERA SEMI RPG.png' },

            // -- TANK TURRETS (Infinite Ammo, No Weight) --
            'tank_1_turret': { id: 'tank_1_turret', name: 'Light Tank MG', type: 'heavy', category: 'Vehicles', damage: 18, fireRate: 600, speed: 1000, weight: 0.0, projectileType: 'bullet', muzzleType: 'orange', magSize: 999, reloadTime: 0.1, spread: 0.05, recoil: 5, sprite: 'none' },
            'tank_2_turret': { id: 'tank_2_turret', name: 'Medium Tank Twin', type: 'heavy', category: 'Vehicles', damage: 45, fireRate: 200, speed: 1200, weight: 0.0, projectileType: 'heavy_shell', muzzleType: 'red', magSize: 999, reloadTime: 0.1, spread: 0.02, recoil: 10, offsetShots: 2, sprite: 'none' },
            'tank_3_turret': { id: 'tank_3_turret', name: 'Heavy Tank Cannon', type: 'heavy', category: 'Vehicles', damage: 120, fireRate: 40, speed: 800, weight: 0.0, projectileType: 'heavy_shell', muzzleType: 'orange', magSize: 999, reloadTime: 0.1, spread: 0.01, recoil: 30, isExplosive: true, knockback: 30, sprite: 'none' },

            // -- SIDEARMS (Weight: 0.05) --
            'm1911': { name: 'M1911', type: 'sidearm', category: 'Sidearms', damage: 25, fireRate: 300, speed: 800, weight: 0.05, projectileType: 'bullet', muzzleType: 'orange', magSize: 7, reloadTime: 1.0, spread: 0.04, recoil: 5, sprite: 'ERA PISTOL.png' },
            'glock18': { name: 'Glock 18', type: 'sidearm', category: 'Sidearms', damage: 12, fireRate: 1200, speed: 700, weight: 0.04, projectileType: 'bullet', muzzleType: 'blue', magSize: 33, reloadTime: 1.2, spread: 0.12, recoil: 3, sprite: 'ERA PISTOL 2.png' },

            // -- MELEE (Weight: 0.00) --
            'katana': { name: 'Katana', type: 'melee', category: 'Melee', damage: 60, fireRate: 120, speed: 200, weight: 0.00, isMelee: true, projectileType: 'none', muzzleType: 'none', magSize: 1, reloadTime: 0.1, spread: 0.0, recoil: 0, sprite: 'ERA SWORD.png' },
            'laser_blade': { name: 'Laser Blade', type: 'melee', category: 'Melee', damage: 85, fireRate: 150, speed: 250, weight: 0.00, isMelee: true, projectileType: 'none', muzzleType: 'none', magSize: 1, reloadTime: 0.1, spread: 0.0, recoil: 0, sprite: 'ERA LASER SWORD.png' },
            'chainsaw': { name: 'Chainsaw', type: 'melee', category: 'Melee', damage: 15, fireRate: 3000, speed: 100, weight: 0.10, isMelee: true, projectileType: 'none', muzzleType: 'none', magSize: 1, reloadTime: 0.1, spread: 0.5, recoil: 0, sprite: 'ERA CHAINSAW.png' }
        };
    }

    tryFire(player, projectileSystem) {
        if (player.isDead) return;

        let activeWeaponId = player.currentWeapon;
        let isMechWeapon = false;

        // Override weapon if inside a Mech
        if (player.inMech && player.gameRoom && player.gameRoom.mechSystem) {
            const mech = player.gameRoom.mechSystem.mechs.find(m => m.id === player.inMech);
            if (mech && mech.type.startsWith('tank')) {
                activeWeaponId = `${mech.type}_turret`;
                isMechWeapon = true;
            }
        }

        if (!activeWeaponId || player.isReloading) return;

        const weapon = this.weapons[activeWeaponId];
        if (!weapon) return;
        weapon.id = activeWeaponId; // Ensure ID is accessible for projectiles

        // Initialize ammo if not set or if weapon changed (Mechs have infinite ammo via reset)
        if (player.ammo === undefined || player.lastWeapon !== activeWeaponId) {
            player.ammo = weapon.magSize;
            player.maxAmmo = weapon.magSize;
            player.lastWeapon = activeWeaponId;
        }

        if (isMechWeapon) player.ammo = weapon.magSize; // Mechs don't need to reload

        const now = Date.now();
        const cooldownMs = 60000 / weapon.fireRate;

        // Handle active burst
        if (player.burstRemaining > 0) {
            if (now - player.lastBurstTime >= (weapon.burstDelay || 50)) {
                player.burstRemaining--;
                player.lastBurstTime = now;
                this.fireProjectile(player, weapon, projectileSystem);

                // Final shot in burst or empty mag
                if (player.burstRemaining === 0 || player.ammo <= 0) {
                    player.burstRemaining = 0;
                    if (player.ammo <= 0) this.startReload(player, weapon);
                }
            }
            return;
        }

        if (now - player.lastFireTime >= cooldownMs) {
            if (player.ammo <= 0) {
                this.startReload(player, weapon);
                return;
            }

            player.lastFireTime = now;

            if (weapon.burstCount > 1) {
                player.burstRemaining = weapon.burstCount;
                player.lastBurstTime = 0; // Trigger first shot immediately in next check or now
                // Trigger first shot immediately
                player.burstRemaining--;
                player.lastBurstTime = now;
                this.fireProjectile(player, weapon, projectileSystem);
            } else {
                this.fireProjectile(player, weapon, projectileSystem);
            }

            // Auto-reload if empty
            if (player.ammo <= 0 && player.burstRemaining === 0) {
                this.startReload(player, weapon);
            }
        }
    }

    fireProjectile(player, weapon, projectileSystem) {
        player.muzzleFlash = 0.1;
        player.fireCount++;

        if (weapon.isMelee) {
            projectileSystem.meleeAttack(player, weapon, player.gameRoom.playerManager);
            return;
        }

        player.ammo--;

        const baseRot = player.rotation;

        // Apply knockback
        if (weapon.knockback) {
            let newX = player.x - Math.cos(baseRot) * weapon.knockback;
            let newY = player.y - Math.sin(baseRot) * weapon.knockback;
            if (typeof player.moveWithCollision === 'function') {
                player.moveWithCollision(newX, newY, null);
            } else {
                player.x = newX;
                player.y = newY;
            }
        }

        const spawnProj = (rot, offsetDist = 0) => {
            const spread = weapon.spread ? (Math.random() - 0.5) * weapon.spread : 0;
            const finalRot = rot + spread;
            const vx = Math.cos(finalRot) * weapon.speed;
            const vy = Math.sin(finalRot) * weapon.speed;

            const spawnBaseDist = 30;

            // Calculate offset perpendicular to aim direction for twin turrets
            const offsetAngle = rot + (Math.PI / 2);
            const px = player.x + Math.cos(baseRot) * spawnBaseDist + Math.cos(offsetAngle) * offsetDist;
            const py = player.y + Math.sin(baseRot) * spawnBaseDist + Math.sin(offsetAngle) * offsetDist;

            const projWeaponId = weapon.id || player.currentWeapon;
            const proj = projectileSystem.spawnProjectile(px, py, vx, vy, projWeaponId, player.id, player.team, weapon.damage);
            if (proj) {
                if (weapon.isExplosive || weapon.isBazooka) proj.isExplosive = true;
                if (weapon.isHoming) proj.isHoming = true;
            }
        };

        if (weapon.pellets) {
            for (let i = 0; i < weapon.pellets; i++) spawnProj(baseRot);
        } else if (weapon.offsetShots === 2) {
            spawnProj(baseRot, 12); // Right barrel
            spawnProj(baseRot, -12); // Left barrel
        } else {
            spawnProj(baseRot);
        }

        // Mega Bazooka auto-revert logic
        if (player.isMegaBazookaActive && player.ammo <= 0) {
            player.isMegaBazookaActive = false;
            player.currentWeapon = player.previousWeapon || 'm4a1';

            const prevWeaponData = this.weapons[player.currentWeapon];
            if (prevWeaponData) {
                player.ammo = player.previousAmmo !== undefined ? player.previousAmmo : prevWeaponData.magSize;
                player.maxAmmo = prevWeaponData.magSize;
            } else {
                player.currentWeapon = 'm4a1';
                player.ammo = 30;
                player.maxAmmo = 30;
            }
            player.lastWeapon = player.currentWeapon;
        }
    }

    startReload(player, weapon) {
        if (player.isReloading) return;
        player.isReloading = true;
        player.reloadTimer = weapon.reloadTime;
        player.maxReloadTime = weapon.reloadTime;
    }
}

module.exports = WeaponSystem;
