import { Network } from './network.js';
import { Renderer } from './renderer.js';
import { Input } from './input.js';
import { HUD } from './ui/hud.js';
import { Minimap } from './ui/minimap.js';

class GameClient {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.uiLayer = document.getElementById('uiLayer');
        
        this.resizeCanvas();
        window.addEventListener('resize', () => this.resizeCanvas());

        this.input = new Input(this.canvas);
        this.renderer = new Renderer(this.ctx);
        this.hud = new HUD(this.uiLayer);
        this.minimap = new Minimap(this.uiLayer);
        
        this.network = new Network();

        this.state = 'MENU'; // MENU, LOBBY, PLAYING
        this.mainMenu = document.getElementById('mainMenu');
        this.playButton = document.getElementById('playButton');
        this.statusText = document.getElementById('statusText');
        this.killfeed = document.getElementById('killfeed');
        
        this.playButton.addEventListener('click', () => {
            this.playButton.style.display = 'none';
            this.statusText.innerText = 'Connecting...';
            this.network.connect();
        });

        this.network.on('lobby', (data) => {
            this.state = 'LOBBY';
            this.statusText.innerText = `Waiting for players... ${data.playersJoined}/${data.playersNeeded}`;
        });

        this.network.on('gameState', (state) => {
            this.gameState = state;
        });
        this.network.on('match_start', (data) => {
            this.state = 'PLAYING';
            this.mainMenu.style.display = 'none';
            this.localPlayerId = data.playerId;
            console.log(`Match started! I am player ${this.localPlayerId} on team ${data.team}`);
            this.addKillfeedMessage('SYSTEM', `Match Started! You are on team ${data.team.toUpperCase()}`, data.team);
        });

        this.network.on('kill', (data) => {
            let killerName = data.killerId === this.localPlayerId ? 'You' : `Player ${data.killerId.substr(0,4)}`;
            let victimName = data.victimId === this.localPlayerId ? 'You' : `Player ${data.victimId.substr(0,4)}`;
            this.addKillfeedMessage(killerName, `[${data.weapon}] killed ${victimName}`, data.killerTeam);
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
        
        if (this.gameState && this.localPlayerId && this.gameState.players && this.gameState.players[this.localPlayerId]) {
            this.hud.update(this.gameState.players[this.localPlayerId]);
            this.minimap.update(this.gameState, this.localPlayerId);
        }

        requestAnimationFrame((t) => this.loop(t));
    }

    update(dt) {
        // Prepare local inputs
        const currentInput = this.input.getInputs();
        
        // Compute World Mouse Coordinates
        if (this.localPlayerId && this.gameState && this.gameState.players && this.gameState.players[this.localPlayerId]) {
            const offsetX = (this.canvas.width / 2) - this.renderer.cameraX;
            const offsetY = (this.canvas.height / 2) - this.renderer.cameraY;
            currentInput.mouse.worldX = currentInput.mouse.x - offsetX;
            currentInput.mouse.worldY = currentInput.mouse.y - offsetY;
        }
        
        // Send to server
        if (this.network.isConnected) {
            this.network.sendInput(currentInput);
        }
    }

    addKillfeedMessage(killer, text, teamClass) {
        const item = document.createElement('div');
        item.className = `feed-item feed-${teamClass}`;
        item.innerHTML = `<span>${killer}</span> ${text}`;
        this.killfeed.appendChild(item);
        
        setTimeout(() => {
            if (this.killfeed.contains(item)) {
                this.killfeed.removeChild(item);
            }
        }, 4000);
    }
}

window.onload = () => {
    new GameClient();
};
