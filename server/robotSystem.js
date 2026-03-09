const TurretAI = require('./ai/turretAI');

class RobotSystem {
    constructor(gameRoom) {
        this.gameRoom = gameRoom;
        this.robots = [];
        this.turretAI = new TurretAI();
    }

    spawnRobot(x, y, type, team, ownerId) {
        // Types: drone, turret, walker, suicide
        this.robots.push({
            id: Math.random().toString(36).substr(2, 9),
            x, y,
            rotation: 0,
            type,
            team,
            ownerId,
            health: 150
        });
    }

    update(dt) {
        for (let i = this.robots.length - 1; i >= 0; i--) {
            let robot = this.robots[i];

            if (robot.health <= 0) {
                this.robots.splice(i, 1);
                continue;
            }

            if (robot.type === 'turret') {
                this.turretAI.update(robot, dt, this.gameRoom);
            }
        }
    }

    getState() {
        return this.robots;
    }
}

module.exports = RobotSystem;
