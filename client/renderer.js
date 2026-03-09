export class Renderer {
    constructor(ctx) {
        this.ctx = ctx;
    }

    render(gameState, width, height, localPlayerId) {
        // Clear canvas
        this.ctx.fillStyle = '#111';
        this.ctx.fillRect(0, 0, width, height);

        if (!gameState) {
            this.drawWaitingScreen(width, height);
            return;
        }

        // Find local player to act as camera focal point
        let cameraX = 0;
        let cameraY = 0;
        if (localPlayerId && gameState.players && gameState.players[localPlayerId]) {
            cameraX = gameState.players[localPlayerId].x;
            cameraY = gameState.players[localPlayerId].y;
            
            // Background grid drawing relative to camera
            this.ctx.save();
            const offsetX = (width / 2) - cameraX;
            const offsetY = (height / 2) - cameraY;
            
            // Draw a subtle grid
            this.ctx.strokeStyle = '#222';
            this.ctx.lineWidth = 1;
            const gridSize = 100;
            const startX = Math.floor(-offsetX / gridSize) * gridSize - gridSize;
            const startY = Math.floor(-offsetY / gridSize) * gridSize - gridSize;
            const endX = startX + width + gridSize * 2;
            const endY = startY + height + gridSize * 2;
            
            this.ctx.beginPath();
            for(let x=startX; x<=endX; x+=gridSize) {
                this.ctx.moveTo(x + offsetX, 0);
                this.ctx.lineTo(x + offsetX, height);
            }
            for(let y=startY; y<=endY; y+=gridSize) {
                this.ctx.moveTo(0, y + offsetY);
                this.ctx.lineTo(width, y + offsetY);
            }
            this.ctx.stroke();
            this.ctx.restore();
            
            // Apply camera transform to all entities
            this.ctx.translate((width / 2) - cameraX, (height / 2) - cameraY);
        }

        // Draw players
        if (gameState.players) {
            for (let pId in gameState.players) {
                const player = gameState.players[pId];
                this.drawPlayer(player, pId === localPlayerId);
            }
        }
        
        if (localPlayerId) {
             this.ctx.resetTransform();
        }
    }

    drawWaitingScreen(width, height) {
        this.ctx.fillStyle = '#fff';
        this.ctx.font = '24px sans-serif';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('Connecting to server / Waiting for match...', width / 2, height / 2);
    }

    drawPlayer(player, isLocal) {
        this.ctx.save();
        this.ctx.translate(player.x, player.y);
        
        // Draw glow if local player
        if (isLocal) {
            this.ctx.shadowBlur = 10;
            this.ctx.shadowColor = '#fff';
        }
        
        // Draw team color ring
        this.ctx.strokeStyle = player.team === 'blue' ? '#4a90e2' : '#e24a4a';
        this.ctx.lineWidth = 3;
        this.ctx.beginPath();
        this.ctx.arc(0, 0, 16, 0, Math.PI * 2);
        this.ctx.stroke();

        // Target angle indicator
        this.ctx.rotate(player.rotation);
        this.ctx.fillStyle = '#666';
        this.ctx.fillRect(0, -4, 24, 8); // Gun barrel

        this.ctx.restore();
    }
}
