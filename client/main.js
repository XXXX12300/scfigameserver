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
        this.statusText = document.getElementById('statusText');
        this.killfeed = document.getElementById('killfeed');
        this.scoreboard = document.getElementById('scoreboard');
        this.sbBlue = document.getElementById('sb-blue');
        this.sbRed = document.getElementById('sb-red');
        
        // Lobby UI elements
        this.playerNameInput = document.getElementById('playerNameInput');
        this.roomNameInput = document.getElementById('roomNameInput');
        this.mapSelect = document.getElementById('mapSelect');
        this.addBotsInput = document.getElementById('addBotsInput');
        this.createRoomBtn = document.getElementById('createRoomBtn');
        this.roomListDOM = document.getElementById('roomList');
        this.refreshRoomsBtn = document.getElementById('refreshRoomsBtn');

        // Connect initially to get Server Browser data
        this.network.connect();
        
        this.network.on('connect_success', () => {
             this.statusText.innerText = 'Connected! Select a room.';
             this.network.sendInput({ type: 'get_rooms' }); // Custom generic send hack
        });

        this.createRoomBtn.addEventListener('click', () => {
            if (!this.network.isConnected) return;
            const name = this.playerNameInput.value || 'Pilot';
            this.statusText.innerText = 'Creating room...';
            this.network.ws.send(JSON.stringify({
                type: 'create_room',
                playerName: name,
                roomName: this.roomNameInput.value || 'Server',
                mapId: this.mapSelect.value,
                addBots: this.addBotsInput.checked
            }));
        });

        this.refreshRoomsBtn.addEventListener('click', () => {
             if (this.network.isConnected) {
                 this.network.ws.send(JSON.stringify({ type: 'get_rooms' }));
                 this.statusText.innerText = 'Refreshing...';
             }
        });

        this.network.on('room_list', (rooms) => {
            this.statusText.innerText = 'Connected! Select a room.';
            this.roomListDOM.innerHTML = '';
            if (rooms.length === 0) {
                 this.roomListDOM.innerHTML = '<div style="text-align:center; color:#aaa; margin-top:50px;">No Active Servers Found. Host one!</div>';
                 return;
            }

            rooms.forEach(room => {
                const item = document.createElement('div');
                item.className = 'room-item';
                item.innerHTML = `
                    <div class="room-info">
                        <strong>${room.name}</strong>
                        <span>Map: ${room.map.toUpperCase()} | Players: ${room.players}/${room.maxPlayers}</span>
                    </div>
                    <button class="join-btn">JOIN</button>
                `;
                item.querySelector('.join-btn').addEventListener('click', () => {
                    const pname = this.playerNameInput.value || 'Pilot';
                    this.network.ws.send(JSON.stringify({ type: 'join_room', roomId: room.id, playerName: pname }));
                    this.statusText.innerText = 'Joining...';
                });
                this.roomListDOM.appendChild(item);
            });
        });

        this.stateBuffer = [];

        this.network.on('gameState', (state) => {
            state.timestamp = Date.now();
            this.stateBuffer.push(state);
            
            // Keep buffer small
            if (this.stateBuffer.length > 5) {
                this.stateBuffer.shift();
            }
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
        // Interpolate Game State
        const now = Date.now();
        const renderTime = now - 100; // 100ms interpolation delay

        // Find the two states to interpolate between
        let state0 = null;
        let state1 = null;

        for (let i = 0; i < this.stateBuffer.length; i++) {
            if (this.stateBuffer[i].timestamp <= renderTime) {
                state0 = this.stateBuffer[i];
                state1 = this.stateBuffer[i + 1]; // Might be undefined
            }
        }

        if (state0 && state1) {
            const t = (renderTime - state0.timestamp) / (state1.timestamp - state0.timestamp);
            this.gameState = this.interpolateState(state0, state1, t);
        } else if (state0) {
            this.gameState = state0;
        }

        // Override local player to use the absolute latest server state (remove 100ms lag)
        if (this.gameState && this.localPlayerId && this.stateBuffer.length > 0) {
            const latestState = this.stateBuffer[this.stateBuffer.length - 1];
            if (latestState.players[this.localPlayerId]) {
                this.gameState.players[this.localPlayerId] = { ...latestState.players[this.localPlayerId] };
            }
        }

        // Prepare local inputs
        const currentInput = this.input.getInputs();
        
        // Update Scoreboard UI
        this.updateScoreboard(currentInput.tab);

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

    updateScoreboard(show) {
        if (!show || !this.gameState) {
            this.scoreboard.style.display = 'none';
            return;
        }

        this.scoreboard.style.display = 'flex';
        
        let bluePlayers = [];
        let redPlayers = [];

        // Distribute to teams
        for (let id in this.gameState.players) {
            const p = this.gameState.players[id];
            p._id = id; // attach id temporarily for render
            if (p.team === 'blue') bluePlayers.push(p);
            if (p.team === 'red') redPlayers.push(p);
        }

        // Sort by score
        bluePlayers.sort((a, b) => b.score - a.score);
        redPlayers.sort((a, b) => b.score - a.score);

        // Render Blue
        this.sbBlue.innerHTML = '<h3 class="team-title-blue">Blue Team</h3>';
        bluePlayers.forEach(p => {
            const row = document.createElement('div');
            row.className = 'player-row';
            const name = p._id === this.localPlayerId ? 'You' : `Player ${p._id.substr(0,4)}`;
            row.innerHTML = `<span>${name}</span> <span>${p.score}</span>`;
            this.sbBlue.appendChild(row);
        });

        // Render Red
        this.sbRed.innerHTML = '<h3 class="team-title-red">Red Team</h3>';
        redPlayers.forEach(p => {
            const row = document.createElement('div');
            row.className = 'player-row';
            const name = p._id === this.localPlayerId ? 'You' : `Player ${p._id.substr(0,4)}`;
            row.innerHTML = `<span>${name}</span> <span>${p.score}</span>`;
            this.sbRed.appendChild(row);
        });
    }

    interpolateState(s0, s1, t) {
        const interpolated = {
            players: {},
            projectiles: s1.projectiles, // Don't snap projectiles, let them snap or extrapolate
            mechs: s1.mechs,
            robots: s1.robots,
            score: s1.score
        };

        // Interpolate players
        for (let id in s1.players) {
            const p1 = s1.players[id];
            const p0 = s0.players[id];
            
            if (p0) {
                interpolated.players[id] = {
                    ...p1,
                    x: p0.x + (p1.x - p0.x) * t,
                    y: p0.y + (p1.y - p0.y) * t,
                    // Rotation interpolation (shortest path)
                    rotation: this.lerpAngle(p0.rotation, p1.rotation, t)
                };
            } else {
                interpolated.players[id] = p1;
            }
        }
        
        // Interpolate Mechs and Robots similarly if needed, but keeping it simple for now
        return interpolated;
    }

    lerpAngle(a, b, t) {
        const CS = (1 - t) * Math.cos(a) + t * Math.cos(b);
        const SN = (1 - t) * Math.sin(a) + t * Math.sin(b);
        return Math.atan2(SN, CS);
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
