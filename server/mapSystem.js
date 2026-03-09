class MapSystem {
    constructor() {
        this.maps = {
            'neon_grid': {
                width: 2000,
                height: 2000,
                spawnPoints: {
                    blue: [{x: 200, y: 200}, {x: 200, y: 1800}],
                    red: [{x: 1800, y: 200}, {x: 1800, y: 1800}]
                },
                obstacles: [
                    { x: 800, y: 800, w: 400, h: 400, type: 'building' },
                    { x: 300, y: 900, w: 200, h: 200, type: 'building' },
                    { x: 1500, y: 900, w: 200, h: 200, type: 'building' },
                    { x: 900, y: 300, w: 200, h: 200, type: 'building' },
                    { x: 900, y: 1500, w: 200, h: 200, type: 'building' },
                ]
            },
            'cyber_facility': {
                width: 3000,
                height: 2000,
                spawnPoints: {
                    blue: [{x: 300, y: 1000}],
                    red: [{x: 2700, y: 1000}]
                },
                obstacles: [
                    { x: 1000, y: 500, w: 200, h: 1000, type: 'wall' },
                    { x: 1800, y: 500, w: 200, h: 1000, type: 'wall' },
                    { x: 1300, y: 900, w: 400, h: 200, type: 'core' },
                ]
            },
            'wasteland': {
                width: 2500,
                height: 2500,
                spawnPoints: {
                    blue: [{x: 200, y: 200}, {x: 200, y: 2300}],
                    red: [{x: 2300, y: 200}, {x: 2300, y: 2300}]
                },
                obstacles: [
                    { x: 1000, y: 1000, w: 500, h: 500, type: 'ruins' },
                    { x: 500, y: 500, w: 300, h: 300, type: 'ruins' },
                    { x: 1700, y: 1700, w: 300, h: 300, type: 'ruins' },
                    { x: 1700, y: 500, w: 300, h: 300, type: 'ruins' },
                    { x: 500, y: 1700, w: 300, h: 300, type: 'ruins' },
                ]
            }
        };
    }

    getMap(id) {
        return this.maps[id] || this.maps['neon_grid'];
    }

    getRandomSpawn(mapId, team) {
        const map = this.getMap(mapId);
        const spawns = map.spawnPoints[team] || [{x: 100, y: 100}];
        const spawnCenter = spawns[Math.floor(Math.random() * spawns.length)];
        
        // Add tiny random offset so they don't spawn exactly on top of each other
        return {
            x: spawnCenter.x + (Math.random() * 100 - 50),
            y: spawnCenter.y + (Math.random() * 100 - 50)
        };
    }
}

module.exports = MapSystem;
