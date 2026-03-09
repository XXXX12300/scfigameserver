import { Network } from './network.js';
import { Renderer } from './renderer.js';
import { Input } from './input.js';

class GameClient {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        
        this.resizeCanvas();
        window.addEventListener('resize', () => this.resizeCanvas());

        this.input = new Input(this.canvas);
        this.renderer = new Renderer(this.ctx);
        this.network = new Network();

        this.gameState = null;
        this.lastTime = 0;
        this.network.connect();
        this.network.on('gameState', (state) => {
            this.gameState = state;
        });
        this.network.on('match_start', (data) => {
            this.localPlayerId = data.playerId;
            console.log(`Match started! I am player ${this.localPlayerId} on team ${data.team}`);
        });

        requestAnimationFrame((t) => this.loop(t));
    }

    resizeCanvas() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    loop(timestamp) {
        const dt = timestamp - this.lastTime;
        this.lastTime = timestamp;

        this.update(dt);
        this.renderer.render(this.gameState, this.canvas.width, this.canvas.height, this.localPlayerId);

        requestAnimationFrame((t) => this.loop(t));
    }

    update(dt) {
        // Prepare local inputs
        const currentInput = this.input.getInputs();
        
        // Compute World Mouse Coordinates
        if (this.localPlayerId && this.gameState && this.gameState.players && this.gameState.players[this.localPlayerId]) {
            const localPlayer = this.gameState.players[this.localPlayerId];
            const offsetX = (this.canvas.width / 2) - localPlayer.x;
            const offsetY = (this.canvas.height / 2) - localPlayer.y;
            currentInput.mouse.worldX = currentInput.mouse.x - offsetX;
            currentInput.mouse.worldY = currentInput.mouse.y - offsetY;
        }
        
        // Send to server
        if (this.network.isConnected) {
            this.network.sendInput(currentInput);
        }
    }
}

window.onload = () => {
    new GameClient();
};
