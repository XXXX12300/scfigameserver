class RobotSystem {
    constructor() {
        this.robots = [];
    }

    spawnRobot(x, y, type, team) {
        // Types: drone, turret, walker, suicide
        this.robots.push({
            id: Math.random().toString(36).substr(2, 9),
            x, y,
            type,
            team,
            health: 100
        });
    }

    update(dt) {
        // Handle AI updates delegation
    }

    getState() {
        return this.robots;
    }
}

module.exports = RobotSystem;
