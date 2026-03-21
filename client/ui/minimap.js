export class Minimap {
    constructor(container) {
        this.container = container;
        this.canvas = document.createElement('canvas');
        this.canvas.width = 200;
        this.canvas.height = 200;
        this.canvas.style.position = 'absolute';
        this.canvas.style.top = '20px';
        this.canvas.style.right = '20px';
        this.canvas.style.border = '2px solid #0ff';
        this.canvas.style.borderRadius = '10px';
        this.canvas.style.background = 'rgba(0, 0, 0, 0.5)';
        this.canvas.style.boxShadow = '0 0 15px rgba(0, 255, 255, 0.3)';
        this.ctx = this.canvas.getContext('2d');
        this.container.appendChild(this.canvas);

        // Map size assumption
        this.mapWidth = 2000;
        this.mapHeight = 2000;
    }

    update(gameState, localPlayerId, mapData) {
        if (!gameState || !gameState.players || !localPlayerId) {
            this.canvas.style.display = 'none';
            return;
        }
        this.canvas.style.display = 'block';

        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Update map bounds from mapData if available
        if (mapData) {
            if (mapData.width) this.mapWidth = mapData.width;
            if (mapData.height) this.mapHeight = mapData.height;

            // Draw Terrain Regions
            if (mapData.terrainRegions) {
                for (let tr of mapData.terrainRegions) {
                    const tx = (tr.x / this.mapWidth) * this.canvas.width;
                    const ty = (tr.y / this.mapHeight) * this.canvas.height;
                    const tw = (tr.w / this.mapWidth) * this.canvas.width;
                    const th = (tr.h / this.mapHeight) * this.canvas.height;

                    if (tr.texture === 'WATER.png') this.ctx.fillStyle = 'rgba(0, 50, 150, 0.4)';
                    else if (tr.texture === 'GRASS.png') this.ctx.fillStyle = 'rgba(50, 150, 50, 0.4)';
                    else this.ctx.fillStyle = 'rgba(100, 100, 100, 0.2)'; // Dirt/etc

                    this.ctx.fillRect(tx, ty, tw, th);
                }
            }

            // Draw Buildings
            if (mapData.buildings) {
                this.ctx.fillStyle = 'rgba(100, 100, 100, 0.5)';
                for (let b of mapData.buildings) {
                    const bx = (b.bounds.x / this.mapWidth) * this.canvas.width;
                    const by = (b.bounds.y / this.mapHeight) * this.canvas.height;
                    const bw = (b.bounds.w / this.mapWidth) * this.canvas.width;
                    const bh = (b.bounds.h / this.mapHeight) * this.canvas.height;
                    this.ctx.fillRect(bx, by, bw, bh);
                }
            }

            // Draw Obstacles
            if (mapData.obstacles) {
                this.ctx.fillStyle = 'rgba(150, 150, 150, 0.6)';
                for (let obs of mapData.obstacles) {
                    const ox = (obs.x / this.mapWidth) * this.canvas.width;
                    const oy = (obs.y / this.mapHeight) * this.canvas.height;
                    const ow = (obs.w / this.mapWidth) * this.canvas.width;
                    const oh = (obs.h / this.mapHeight) * this.canvas.height;
                    this.ctx.fillRect(ox, oy, ow, oh);
                }
            }
        }

        // Draw projectiles (Bullets as red dots)
        if (gameState.projectiles) {
            this.ctx.fillStyle = 'rgba(255, 0, 0, 0.8)';
            for (let p of gameState.projectiles) {
                const px = (p.x / this.mapWidth) * this.canvas.width;
                const py = (p.y / this.mapHeight) * this.canvas.height;
                this.ctx.beginPath();
                this.ctx.arc(px, py, 1.5, 0, Math.PI * 2);
                this.ctx.fill();
            }
        }

        // Draw Live Players
        for (let pId in gameState.players) {
            const p = gameState.players[pId];
            if (p.isDead) continue; // Don't track dead bodies on radar

            const isLocal = pId === localPlayerId;

            // Map world coords to minimap coords
            const mx = (p.x / this.mapWidth) * this.canvas.width;
            const my = (p.y / this.mapHeight) * this.canvas.height;

            this.ctx.beginPath();
            this.ctx.arc(mx, my, isLocal ? 4 : 3, 0, Math.PI * 2);

            if (isLocal) {
                this.ctx.fillStyle = '#fff'; // You are white
            } else if (p.team === 'blue') {
                this.ctx.fillStyle = '#4a90e2';
            } else {
                this.ctx.fillStyle = '#e24a4a';
            }
            this.ctx.fill();
        }
    }
}
