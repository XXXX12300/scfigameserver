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

    // Will handle logic for firing, ammo, reload
}

module.exports = WeaponSystem;
