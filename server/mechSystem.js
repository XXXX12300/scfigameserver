class MechSystem {
    constructor() {
        this.mechs = [];
    }

    spawnMech(x, y, type, team) {
        this.mechs.push({
            id: Math.random().toString(36).substr(2, 9),
            x, y,
            type,
            team,
            health: type === 'titan' ? 2000 : 1000,
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
                if (dx*dx + dy*dy < 50*50) { // Within 50 pixels
                    mech.state = 'piloted';
                    mech.owner = player.id;
                    
                    // Modify player stats
                    player.inMech = mech.id;
                    player.health = mech.health; 
                    player.maxHealth = mech.health;
                    player.speed = 100; // Slower
                    player.currentWeapon = 'rocket_launcher'; // Temp heavy weapon override
                    
                    // Hide player visually? Easiest is to sync mech position strictly to player position while piloted
                    return true;
                }
            }
        }
        return false;
    }

    getState() {
        return this.mechs;
    }
}

module.exports = MechSystem;
