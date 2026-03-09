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
        this.canvas.style.borderRadius = '50%';
        this.canvas.style.background = 'rgba(0, 0, 0, 0.5)';
        this.canvas.style.boxShadow = '0 0 15px rgba(0, 255, 255, 0.3)';
        this.ctx = this.canvas.getContext('2d');
        this.container.appendChild(this.canvas);
        
        // Map size assumption
        this.mapWidth = 2000;
        this.mapHeight = 2000;
    }

    update(gameState, localPlayerId) {
        if (!gameState || !gameState.players) return;

        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw players
        for (let pId in gameState.players) {
            const p = gameState.players[pId];
            const isLocal = pId === localPlayerId;
            
            // Map world coords to minimap coords
            const mx = (p.x / this.mapWidth) * this.canvas.width;
            const my = (p.y / this.mapHeight) * this.canvas.height;
            
            this.ctx.beginPath();
            this.ctx.arc(mx, my, isLocal ? 4 : 3, 0, Math.PI * 2);
            
            if (isLocal) {
                this.ctx.fillStyle = '#fff';
            } else if (p.team === 'blue') {
                this.ctx.fillStyle = '#4a90e2';
            } else {
                this.ctx.fillStyle = '#e24a4a';
            }
            this.ctx.fill();
        }
    }
}
