const TurretAI = require('./ai/turretAI');
const RobotAI = require('./ai/robotAI');

class RobotSystem {
    constructor(gameRoom) {
        this.gameRoom = gameRoom;
        this.robots = [];
        this.turretAI = new TurretAI();
        this.robotAI = new RobotAI();
    }

    spawnRobot(x, y, type, team, ownerId, forceId = null) {
        // Types: drone, turret_1, turret_2, turret_3, bot
        const weapons = ['m4a1', 'scar_h', 'aug_a3', 'p90', 'vector', 'remington', 'spas12', 'ak47', 'm16', 'uzi', 'mp5', 'lmg', 'minigun'];
        const randomWeapon = weapons[Math.floor(Math.random() * weapons.length)];

        let health = 200;
        if (type === 'turret_1') health = 250;
        if (type === 'turret_2') health = 450;
        if (type === 'turret_3') health = 700;

        this.robots.push({
            id: forceId || Math.random().toString(36).substr(2, 9),
            x, y,
            rotation: 0,
            type,
            team,
            ownerId,
            health: health,
            currentWeapon: randomWeapon,
            spawnBuildingId: this.gameRoom.mapSystem.getBuildingId(x, y, this.gameRoom.mapId)
        });
    }

    update(dt) {
        const dtSec = dt / 1000;
        for (let i = this.robots.length - 1; i >= 0; i--) {
            let robot = this.robots[i];

            if (robot.isDead) {
                robot.deathTimer -= dtSec;
                if (robot.deathTimer <= 0) {
                    if (robot.type === 'bot') {
                        // Respawn the bot instead of deleting it
                        const spawn = this.gameRoom.mapSystem.getRandomSpawn(this.gameRoom.mapId, robot.team);
                        robot.x = spawn.x;
                        robot.y = spawn.y;
                        robot.health = 200;
                        robot.isDead = false;
                    } else {
                        this.robots.splice(i, 1);
                    }
                }
                continue;
            }

            if (robot.health <= 0) {
                robot.isDead = true;
                if (robot.type === 'remote_drone') {
                    const owner = this.gameRoom.playerManager.players.get(robot.ownerId);
                    if (owner && owner.controlledDroneId === robot.id) owner.controlledDroneId = null;
                    this.robots.splice(i, 1);
                } else {
                    robot.deathTimer = 5.0; // Stay for 5 seconds
                }
                continue;
            }

            if (robot.type.startsWith('turret')) {
                this.turretAI.update(robot, dt, this.gameRoom);
            } else if (robot.type === 'remote_drone') {
                if (!robot.spawnTime) robot.spawnTime = Date.now();

                const owner = this.gameRoom.playerManager.players.get(robot.ownerId);
                if (owner && owner.controlledDroneId === robot.id) {
                    let dx = 0; let dy = 0;
                    if (owner.inputs.up) dy -= 1;
                    if (owner.inputs.down) dy += 1;
                    if (owner.inputs.left) dx -= 1;
                    if (owner.inputs.right) dx += 1;

                    if (dx !== 0 || dy !== 0) {
                        const len = Math.sqrt(dx * dx + dy * dy);
                        const moveSpeed = 700;
                        const nextX = robot.x + (dx / len) * moveSpeed * dtSec;
                        const nextY = robot.y + (dy / len) * moveSpeed * dtSec;

                        // Check if the next position is in a different "layer" (different building or transitioning in/out)
                        const nextBuildingId = this.gameRoom.mapSystem.getBuildingId(nextX, nextY, this.gameRoom.mapId);

                        // Strict boundary: if spawned outside, stay outside. If spawned inside, stay inside.
                        if (nextBuildingId === robot.spawnBuildingId) {
                            robot.x = nextX;
                            robot.y = nextY;
                        } else {
                            // Blocked by building wall/boundary
                        }
                    }

                    if (owner.inputs.mouse) {
                        robot.rotation = Math.atan2(owner.inputs.mouse.worldY - robot.y, owner.inputs.mouse.worldX - robot.x);

                        if (owner.inputs.mouse.leftDown) {
                            if (!robot.lastFireTime) robot.lastFireTime = 0;
                            const now = Date.now();
                            if (now - robot.lastFireTime > 150) {
                                robot.lastFireTime = now;
                                console.log(`[DRONE] ${robot.id} firing Laser Sniper`);
                                const fvx = Math.cos(robot.rotation) * 1500;
                                const fvy = Math.sin(robot.rotation) * 1500;
                                this.gameRoom.projectileSystem.spawnProjectile(
                                    robot.x, robot.y, fvx, fvy, 'laser_sniper', robot.ownerId, robot.team, 15
                                );
                            }
                        }
                    }

                    if (owner.inputs.interact) robot.health = 0;
                } else {
                    robot.health = 0;
                }

                if (Date.now() - robot.spawnTime > 60000) robot.health = 0;
            } else {
                this.robotAI.update(robot, dt, this.gameRoom);
            }
        }
    }

    getState() {
        return this.robots.map(r => ({
            id: r.id,
            x: Math.round(r.x * 10) / 10,
            y: Math.round(r.y * 10) / 10,
            rotation: Math.round(r.rotation * 100) / 100,
            type: r.type,
            team: r.team,
            health: r.health,
            isDead: !!r.isDead,
            currentWeapon: r.currentWeapon,
            ownerId: r.ownerId
        }));
    }
}

module.exports = RobotSystem;
