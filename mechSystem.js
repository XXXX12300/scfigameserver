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
            state: 'falling', // falling from orbit
            owner: null // pilot
        });
    }

    update(dt) {
        // Handle landing shockwaves, etc.
    }

    getState() {
        return this.mechs;
    }
}

module.exports = MechSystem;
