class MechSystem {
    constructor() {
        this.mechs = [];
    }

    spawnMech(x, y, type, team) {
        let health = 1000;
        if (type === 'titan') health = 2000;
        else if (type === 'tank_1') health = 800;
        else if (type === 'tank_2') health = 1500;
        else if (type === 'tank_3') health = 2500;

        this.mechs.push({
            id: Math.random().toString(36).substr(2, 9),
            x, y,
            type,
            team,
            health: health,
            state: 'falling', // falling -> idle -> piloted
            owner: null, // pilot id
            fallProgress: 1.0 // 1.0 down to 0.0
        });
    }

    update(dt) {
        const dtSec = dt / 1000;
        for (let i = this.mechs.length - 1; i >= 0; i--) {
            let mech = this.mechs[i];

            if (mech.health <= 0) {
                this.mechs.splice(i, 1);
                // TODO: Explosion event
                continue;
            }

            if (mech.state === 'falling') {
                mech.fallProgress -= dtSec; // Takes 1 second to fall
                if (mech.fallProgress <= 0) {
                    mech.fallProgress = 0;
                    mech.state = 'idle';
                    // Landing shockwave could deal damage here
                }
            }
        }
    }

    tryEnterMech(player) {
        // Player tries to enter a nearby idle mech
        for (let mech of this.mechs) {
            if (mech.state === 'idle' && mech.team === player.team) {
                const dx = player.x - mech.x;
                const dy = player.y - mech.y;
                if (dx * dx + dy * dy < 50 * 50) { // Within 50 pixels
                    mech.state = 'piloted';
                    mech.owner = player.id;

                    // Save original loadout
                    player.previousWeapon = player.currentWeapon;
                    player.previousAmmo = player.ammo;

                    // Modify player stats corresponding to mech
                    player.inMech = mech.id;
                    player.health = mech.health;
                    player.maxHealth = mech.health;

                    if (mech.type === 'titan') {
                        player.speed = 100;
                        player.currentWeapon = 'minigun'; // Temp heavy weapon override
                    } else if (mech.type === 'tank_1') {
                        player.speed = 120;
                        player.currentWeapon = 'tank_1_turret';
                    } else if (mech.type === 'tank_2') {
                        player.speed = 90;
                        player.currentWeapon = 'tank_2_turret';
                    } else if (mech.type === 'tank_3') {
                        player.speed = 70;
                        player.currentWeapon = 'tank_3_turret';
                    }

                    // Fill Ammo to max instantly when entering
                    if (player.gameRoom && player.gameRoom.weaponSystem && player.gameRoom.weaponSystem.weapons[player.currentWeapon]) {
                        player.ammo = player.gameRoom.weaponSystem.weapons[player.currentWeapon].magSize;
                        player.maxAmmo = player.ammo;
                    }

                    return true;
                }
            }
        }
        return false;
    }

    getState() {
        return this.mechs.map(m => ({
            id: m.id,
            x: Math.round(m.x * 10) / 10,
            y: Math.round(m.y * 10) / 10,
            type: m.type,
            team: m.team,
            health: m.health,
            state: m.state,
            owner: m.owner,
            hullRot: m.hullRot !== undefined ? Math.round(m.hullRot * 100) / 100 : 0,
            turretRot: m.turretRot !== undefined ? Math.round(m.turretRot * 100) / 100 : 0,
            fallProgress: Math.round(m.fallProgress * 100) / 100
        }));
    }
}

module.exports = MechSystem;
