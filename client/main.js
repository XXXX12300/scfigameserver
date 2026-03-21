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

        this.hud.onWeaponSelect = (id) => {
            this.selectedWeapon = id;
            localStorage.setItem('tdm_weapon', id);
            if (this.network.isConnected && this.state === 'PLAYING') {
                this.network.ws.send(JSON.stringify({ type: 'select_weapon', weaponId: id }));
            }
        };

        this.hud.onKillstreakSelect = (id) => {
            this.selectedKillstreak = id;
            localStorage.setItem('tdm_killstreak', id);
            if (this.network.isConnected && this.state === 'PLAYING') {
                this.network.ws.send(JSON.stringify({ type: 'select_streak', streakId: id }));
            }
        };

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

        // Loadout UI elements
        this.openLoadoutBtn = document.getElementById('openLoadoutBtn');
        this.openEditorBtn = document.getElementById('openEditorBtn');

        this.mapGrid = document.getElementById('mapGrid');
        this.mapDropdownContainer = document.getElementById('mapDropdownContainer');
        this.toggleMapDropdownBtn = document.getElementById('toggleMapDropdownBtn');
        this.mapSelectedText = document.getElementById('mapSelectedText');
        const closeMapModalBtn = document.getElementById('closeMapModalBtn');

        if (this.toggleMapDropdownBtn && this.mapDropdownContainer) {
            this.toggleMapDropdownBtn.addEventListener('click', () => {
                this.mapDropdownContainer.style.display = 'flex';
            });
        }
        
        if (closeMapModalBtn && this.mapDropdownContainer) {
            closeMapModalBtn.addEventListener('click', () => {
                this.mapDropdownContainer.style.display = 'none';
            });
        }
        
        if (this.mapDropdownContainer) {
            this.mapDropdownContainer.addEventListener('click', (e) => {
                if (e.target === this.mapDropdownContainer) {
                    this.mapDropdownContainer.style.display = 'none';
                }
            });
        }

        if (this.mapGrid) {
            this.mapGrid.addEventListener('click', (e) => {
                const opt = e.target.closest('.map-option');
                if (opt) {
                    // Update hidden input
                    const mapVal = opt.getAttribute('data-value');
                    const mapName = opt.getAttribute('data-name');
                    if (this.mapSelect) {
                        this.mapSelect.value = mapVal;
                    }
                    if (this.mapSelectedText && mapName) {
                        this.mapSelectedText.innerText = mapName;
                    }
                    if (this.mapDropdownContainer) {
                        this.mapDropdownContainer.style.display = 'none';
                    }
                    // Update visuals
                    const options = this.mapGrid.querySelectorAll('.map-option');
                    options.forEach(o => o.classList.remove('selected'));
                    opt.classList.add('selected');
                }
            });
        }

        this.selectedWeapon = localStorage.getItem('tdm_weapon') || 'm4a1';
        this.selectedKillstreak = localStorage.getItem('tdm_killstreak') || 'turret_1';

        if (this.playerNameInput) {
            const savedName = localStorage.getItem('tdm_name');
            if (savedName) this.playerNameInput.value = savedName;
            this.playerNameInput.addEventListener('change', () => {
                localStorage.setItem('tdm_name', this.playerNameInput.value);
            });
        }

        // Fetch custom maps
        fetch('/api/maps').then(r => r.json()).then(maps => {
            maps.forEach(m => {
                const mapNameStr = m.name || m.id;
                const optStr = document.createElement('div');
                optStr.className = 'map-option';
                optStr.setAttribute('data-value', m.id);
                optStr.setAttribute('data-name', '[Custom] ' + mapNameStr);
                optStr.innerHTML = `
                    <div class="map-img-placeholder" style="background-color: #354;">🛠️</div>
                    <div class="map-name">[Custom] ${mapNameStr}</div>
                `;
                if (this.mapGrid) {
                    this.mapGrid.appendChild(optStr);
                } else if (this.mapSelect) {
                    const fallbackOpt = document.createElement('option');
                    fallbackOpt.value = m.id;
                    fallbackOpt.innerText = '[Custom] ' + mapNameStr;
                    this.mapSelect.appendChild(fallbackOpt);
                }
            });
        }).catch(e => console.error('Failed to load custom maps', e));

        // Connect initially to get Server Browser data
        this.network.connect();

        this.network.on('connect_success', () => {
            this.statusText.innerText = 'Connected! Select a room.';
            this.network.sendInput({ type: 'get_rooms' }); // Custom generic send hack
            
            // Check if we are coming from the Editor "Play Offline" button
            const forceMap = localStorage.getItem('editor_force_map');
            if (forceMap) {
                localStorage.removeItem('editor_force_map'); // Clear it so it only runs once
                setTimeout(() => {
                    this.statusText.innerText = 'Starting Editor Testing Mode...';
                    this.network.ws.send(JSON.stringify({
                        type: 'create_room',
                        playerName: 'Editor_Tester',
                        roomName: 'Testing ' + forceMap,
                        mapId: forceMap,
                        gameMode: 'tdm',
                        addBots: false, // Default to no bots for offline testing
                        weaponId: this.selectedWeapon,
                        killstreakId: this.selectedKillstreak
                    }));
                }, 500); // Wait half a second for rooms to sync just in case
            }
        });

        this.openLoadoutBtn.addEventListener('click', () => {
            if (this.hud) this.hud.showWeaponMenu();
        });

        if (this.openEditorBtn) {
            this.openEditorBtn.addEventListener('click', () => {
                window.open('/editor.html', '_blank');
            });
        }

        this.createRoomBtn.addEventListener('click', () => {
            if (!this.network.isConnected) return;
            const name = this.playerNameInput.value || 'Pilot';
            this.statusText.innerText = 'Creating operation...';
            const gm = document.getElementById('gameModeSelect');
            this.network.ws.send(JSON.stringify({
                type: 'create_room',
                playerName: name,
                roomName: this.roomNameInput.value || 'Server',
                mapId: this.mapSelect.value,
                gameMode: gm ? gm.value : 'tdm',
                addBots: this.addBotsInput.checked,
                weaponId: this.selectedWeapon,
                killstreakId: this.selectedKillstreak
            }));
        });

        this.refreshRoomsBtn.addEventListener('click', () => {
            if (this.network.isConnected) {
                this.network.ws.send(JSON.stringify({ type: 'get_rooms' }));
                this.statusText.innerText = 'Refreshing...';
            }
        });

        this.network.on('room_list', (data) => {
            const rooms = data.rooms || [];
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
                    this.network.ws.send(JSON.stringify({ type: 'join_room', roomId: room.id, playerName: pname, weaponId: this.selectedWeapon, killstreakId: this.selectedKillstreak }));
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
            if (this.stateBuffer.length > 8) {
                this.stateBuffer.shift();
            }
        });
        this.network.on('match_start', (data) => {
            this.state = 'PLAYING';
            this.mainMenu.style.display = 'none';
            this.localPlayerId = data.playerId;
            this.mapData = data.mapData;

            // Setup Game Mode HUD
            const modeHud = document.getElementById('hud-game-mode');
            if (modeHud && data.gameMode) {
                modeHud.style.display = 'block';
                const label = data.gameMode === 'tdm' ? 'TDM' : 'CONTROL ZONE';
                const limit = data.scoreLimit;
                modeHud.innerText = `${label} - ${limit} TO WIN`;
            }

            this.hud.show();

            console.log(`Match started! I am player ${this.localPlayerId} on team ${data.team}`);
            this.addKillfeedMessage('SYSTEM', `Match Started! You are on team ${data.team.toUpperCase()}`, data.team);
        });

        this.network.on('kill', (data) => {
            let killerName = data.killerId === this.localPlayerId ? 'You' : `Player ${data.killerId.substr(0, 4)}`;
            let victimName = data.victimId === this.localPlayerId ? 'You' : `Player ${data.victimId.substr(0, 4)}`;
            this.addKillfeedMessage(killerName, `[${data.weapon}] killed ${victimName}`, data.killerTeam);
        });

        this.network.on('hit', (data) => {
            this.renderer.triggerHitmarker();
        });

        this.network.on('blood_impact', (data) => {
            this.renderer.addBloodCloud(data.x, data.y, data.vx, data.vy);
        });

        this.network.on('explosion', (data) => {
            this.renderer.explosions.push({
                x: data.x,
                y: data.y,
                radius: data.radius,
                life: 1.0
            });

            // Add camera shake based on distance to explosion
            if (this.localPlayerId && this.gameState && this.gameState.players && this.gameState.players[this.localPlayerId]) {
                const lp = this.gameState.players[this.localPlayerId];
                const dx = lp.x - data.x;
                const dy = lp.y - data.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < 500) {
                    const shakeAmount = (1 - dist / 500) * 20;
                    this.renderer.addShake(shakeAmount);
                }
            }
        });

        requestAnimationFrame((t) => this.loop(t));
    }

    resizeCanvas() {
        // Support browser zoom for "more detail" without changing game FOV
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;

        this.logicalHeight = 1000;
        this.renderScale = this.canvas.height / this.logicalHeight;
        this.logicalWidth = this.canvas.width / this.renderScale;

        // Reset the default transform to the new scale so all subsequent ctx draws are scaled
        this.ctx.setTransform(this.renderScale, 0, 0, this.renderScale, 0, 0);
    }

    loop(timestamp) {
        const dt = timestamp - this.lastTime;
        this.lastTime = timestamp;

        this.update(dt);
        // We pass logical dimensions to renderer so FOV never changes regardless of screen size/zoom
        this.renderer.render(this.gameState, this.logicalWidth, this.logicalHeight, this.localPlayerId, this.mapData);

        if (this.gameState && this.localPlayerId && this.gameState.players && this.gameState.players[this.localPlayerId]) {
            this.hud.update(this.gameState.players[this.localPlayerId]);
            this.minimap.update(this.gameState, this.localPlayerId, this.mapData);
        }

        requestAnimationFrame((t) => this.loop(t));
    }

    update(dt) {
        // Interpolate Game State
        const now = Date.now();
        const renderTime = now - 50; // 50ms interpolation delay (tuned for 60Hz server)

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

        // Prepare local inputs scaled from physical to logical pixels
        const currentInput = this.input.getInputs();
        currentInput.mouse.x /= this.renderScale;
        currentInput.mouse.y /= this.renderScale;

        this.renderer.mouseX = currentInput.mouse.x;
        this.renderer.mouseY = currentInput.mouse.y;
        this.renderer.isShiftHeld = currentInput.sprint;

        // Client-Side Prediction for Local Player to eliminate lag and jitter
        if (this.gameState && this.localPlayerId && this.stateBuffer.length > 0) {
            const latestState = this.stateBuffer[this.stateBuffer.length - 1];
            const p = latestState.players[this.localPlayerId];
            if (p) {
                if (!this.predictedPlayer) {
                    this.predictedPlayer = { x: p.x, y: p.y };
                }

                // Correct drift
                const diffX = p.x - this.predictedPlayer.x;
                const diffY = p.y - this.predictedPlayer.y;
                const distSq = diffX * diffX + diffY * diffY;

                if (distSq > 150 * 150) {
                    // Snap if too far (e.g. teleport, spawn)
                    this.predictedPlayer.x = p.x;
                    this.predictedPlayer.y = p.y;
                } else if (distSq > 10 * 10) {
                    // Smoothly correct 
                    this.predictedPlayer.x += diffX * 0.1;
                    this.predictedPlayer.y += diffY * 0.1;
                }

                // Compute local precise rotation based on mouse FIRST so movement can use it
                const offsetX = (this.logicalWidth / 2) - this.renderer.cameraX;
                const offsetY = (this.logicalHeight / 2) - this.renderer.cameraY;
                const wx = currentInput.mouse.x - offsetX;
                const wy = currentInput.mouse.y - offsetY;
                const targetRot = Math.atan2(wy - this.predictedPlayer.y, wx - this.predictedPlayer.x);

                let isTank = p.inMech && this.gameState.mechs && this.gameState.mechs.find(m => m.id === p.inMech && m.type.startsWith('tank'));
                let dx = 0; let dy = 0;
                let computedRot = p.rotation;
                let isTankMovedLocally = false;

                // Initialize local prediction velocity if not present
                if (this.predictedPlayer.vx === undefined) this.predictedPlayer.vx = 0;
                if (this.predictedPlayer.vy === undefined) this.predictedPlayer.vy = 0;

                if (isTank) {
                    if (this.predictedPlayer.hullRotation === undefined) {
                        this.predictedPlayer.hullRotation = p.hullRotation !== undefined ? p.hullRotation : (p.rotation || 0);
                    }

                    const dtSec = dt / 1000;
                    let turnSpeed = 3.5;
                    let moveForce = 0.80; // CodePen mult(0.80)
                    let reverseForce = -2.2; // CodePen mult(-2.2)
                    let friction = 0.80; // CodePen vel.mult(0.80)

                    let mechData = null;
                    if (this.gameState.mechs) {
                        mechData = this.gameState.mechs.find(m => m.id === p.inMech);
                        if (mechData) {
                            if (mechData.type === 'tank_1') { turnSpeed = 4.0; moveForce = 0.90; reverseForce = -0.65; friction = 0.84; }
                            if (mechData.type === 'tank_2') { turnSpeed = 3.4; moveForce = 0.82; reverseForce = -0.75; friction = 0.86; }
                            if (mechData.type === 'tank_3') { turnSpeed = 2.6; moveForce = 0.68; reverseForce = -0.50; friction = 0.88; }
                        }
                    }

                    if (this.predictedPlayer.isRev === undefined) this.predictedPlayer.isRev = false;

                    const rotateVal = 0.0566;
                    if (this.predictedPlayer.isRev === false) {
                        if (currentInput.left) this.predictedPlayer.hullRotation -= rotateVal;
                        if (currentInput.right) this.predictedPlayer.hullRotation += rotateVal;
                    } else {
                        if (currentInput.left) this.predictedPlayer.hullRotation += rotateVal;
                        if (currentInput.right) this.predictedPlayer.hullRotation -= rotateVal;
                    }

                    let isBoosting = false;
                    if (currentInput.up) {
                        // REDUCED FORCE (0.20)
                        this.predictedPlayer.vx += Math.cos(this.predictedPlayer.hullRotation) * 0.20;
                        this.predictedPlayer.vy += Math.sin(this.predictedPlayer.hullRotation) * 0.20;
                        this.predictedPlayer.isRev = false;
                        isBoosting = true;
                    }
                    if (currentInput.down) {
                        // REDUCED FORCE (-0.5)
                        this.predictedPlayer.vx += Math.cos(this.predictedPlayer.hullRotation) * -0.5;
                        this.predictedPlayer.vy += Math.sin(this.predictedPlayer.hullRotation) * -0.5;
                        this.predictedPlayer.isRev = true;
                        isBoosting = true;
                    }

                    // CodePen: if (tank.isBoosting) this.boost('up');
                    if (isBoosting && currentInput.up) {
                        this.predictedPlayer.vx += Math.cos(this.predictedPlayer.hullRotation) * 0.20;
                        this.predictedPlayer.vy += Math.sin(this.predictedPlayer.hullRotation) * 0.20;
                    }

                    // Apply velocities
                    dx = this.predictedPlayer.vx;
                    dy = this.predictedPlayer.vy;

                    // Friction: tank.vel.mult(0.80);
                    this.predictedPlayer.vx *= 0.80;
                    this.predictedPlayer.vy *= 0.80;

                    if (mechData) {
                        mechData.x = this.predictedPlayer.x;
                        mechData.y = this.predictedPlayer.y;
                        mechData.hullRot = this.predictedPlayer.hullRotation;
                        mechData.turretRot = targetRot;
                    }

                    this.predictedPlayer.rotation = targetRot;
                    computedRot = this.predictedPlayer.rotation;
                } else {
                    // Reset prediction momentum when not in tank
                    this.predictedPlayer.vx = 0;
                    this.predictedPlayer.vy = 0;

                    if (currentInput.up) dy -= 1;
                    if (currentInput.down) dy += 1;
                    if (currentInput.left) dx -= 1;
                    if (currentInput.right) dx += 1;

                    if (dx !== 0 && dy !== 0) {
                        const len = Math.sqrt(dx * dx + dy * dy);
                        dx /= len; dy /= len;
                    }
                    this.predictedPlayer.rotation = targetRot;
                    this.predictedPlayer.hullRotation = targetRot || p.rotation;
                    computedRot = this.predictedPlayer.rotation;
                }

                let speedScale = 200; // Default human speed
                if (currentInput.sprint && p.stamina > 0 && !p.inMech) speedScale *= 1.6;
                if (p.inMech) speedScale = 100;

                const dtSecMain = dt / 1000;
                let newX, newY;

                if (isTank) {
                    newX = this.predictedPlayer.x + dx;
                    newY = this.predictedPlayer.y + dy;
                    if (mechData) {
                        mechData.x = newX;
                        mechData.y = newY;
                    }
                } else {
                    newX = this.predictedPlayer.x + dx * speedScale * dtSecMain;
                    newY = this.predictedPlayer.y + dy * speedScale * dtSecMain;
                }

                // Client-side AABB Collision prediction
                if (this.mapData) {
                    const radius = isTank ? 32 : 16;
                    newX = Math.max(radius, Math.min(newX, this.mapData.width - radius));
                    newY = Math.max(radius, Math.min(newY, this.mapData.height - radius));

                    if (this.mapData.obstacles) {
                        for (let obs of this.mapData.obstacles) {
                            if (newX + radius > obs.x && newX - radius < obs.x + obs.w &&
                                this.predictedPlayer.y + radius > obs.y && this.predictedPlayer.y - radius < obs.y + obs.h) {
                                newX = this.predictedPlayer.x;
                            }
                            if (this.predictedPlayer.x + radius > obs.x && this.predictedPlayer.x - radius < obs.x + obs.w &&
                                newY + radius > obs.y && newY - radius < obs.y + obs.h) {
                                newY = this.predictedPlayer.y;
                            }
                        }
                    }
                }

                this.predictedPlayer.x = newX;
                this.predictedPlayer.y = newY;

                this.gameState.players[this.localPlayerId] = {
                    ...p,
                    ...this.predictedPlayer,
                    rotation: computedRot
                };

                // Apply Recoil if fireCount changed
                if (this.lastFireCount !== undefined && p.fireCount > this.lastFireCount) {
                    const recoilAmount = p.inMech ? 2 : 10; // basic recoil
                    this.renderer.addRecoil(computedRot, recoilAmount);
                    this.renderer.addShake(p.inMech ? 1 : 3);
                }
                this.lastFireCount = p.fireCount;

                // Apply prediction to the mech if piloted
                if (p.inMech && this.gameState.mechs) {
                    const myMech = this.gameState.mechs.find(m => m.owner === this.localPlayerId);
                    if (myMech) {
                        myMech.x = this.predictedPlayer.x;
                        myMech.y = this.predictedPlayer.y;
                        myMech.rotation = this.predictedPlayer.hullRotation;
                        myMech.turretRotation = computedRot;
                    }
                }
            }
        }

        // Toggle Weapon Menu
        if (currentInput.menu && !this.menuLock) {
            this.hud.toggleWeaponMenu();
            this.menuLock = true;
        }
        if (!currentInput.menu) this.menuLock = false;

        // Update Scoreboard UI
        this.updateScoreboard(currentInput.tab);

        // Compute World Mouse Coordinates
        if (this.localPlayerId && this.gameState && this.gameState.players && this.gameState.players[this.localPlayerId]) {
            const offsetX = (this.logicalWidth / 2) - this.renderer.cameraX;
            const offsetY = (this.logicalHeight / 2) - this.renderer.cameraY;
            currentInput.mouse.worldX = currentInput.mouse.x - offsetX;
            currentInput.mouse.worldY = currentInput.mouse.y - offsetY;
        }

        // Send to server
        if (this.network.isConnected) {
            // Throttle input sending to 60hz (every ~16ms) to match server tick rate
            if (!this.lastNetworkTick || Date.now() - this.lastNetworkTick >= 16) {
                this.network.sendInput(currentInput);
                this.lastNetworkTick = Date.now();
            }

            // Send selected weapon update if we are already in-game
            if (this.state === 'PLAYING' && this.lastSentWeapon !== this.selectedWeapon) {
                this.network.ws.send(JSON.stringify({ type: 'select_weapon', weaponId: this.selectedWeapon }));
                this.lastSentWeapon = this.selectedWeapon;
            }
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

        // Add bots to scoreboard
        if (this.gameState.robots) {
            for (let r of this.gameState.robots) {
                // clone to void modifying global state repeatedly
                let botClone = { ...r };
                botClone._id = 'BOT-' + r.id;
                botClone.score = this.gameState.score ? (this.gameState.score[r.id] || 0) : 0;
                botClone.isBot = true;
                if (r.team === 'blue') bluePlayers.push(botClone);
                if (r.team === 'red') redPlayers.push(botClone);
            }
        }

        // Sort by score
        bluePlayers.sort((a, b) => b.score - a.score);
        redPlayers.sort((a, b) => b.score - a.score);

        // Render Blue
        this.sbBlue.innerHTML = '<h3 class="team-title-blue">Blue Team</h3>';
        bluePlayers.forEach(p => {
            const row = document.createElement('div');
            row.className = 'player-row';
            const name = p._id === this.localPlayerId ? 'You' : (p.isBot ? `Bot 🤖 ${p._id.substr(4, 4)}` : `Player ${p._id.substr(0, 4)}`);
            row.innerHTML = `<span>${name}</span> <span>${p.score || 0}</span>`;
            this.sbBlue.appendChild(row);
        });

        // Render Red
        this.sbRed.innerHTML = '<h3 class="team-title-red">Red Team</h3>';
        redPlayers.forEach(p => {
            const row = document.createElement('div');
            row.className = 'player-row';
            const name = p._id === this.localPlayerId ? 'You' : (p.isBot ? `Bot 🤖 ${p._id.substr(4, 4)}` : `Player ${p._id.substr(0, 4)}`);
            row.innerHTML = `<span>${name}</span> <span>${p.score || 0}</span>`;
            this.sbRed.appendChild(row);
        });
    }

    interpolateState(s0, s1, t) {
        const interpolated = {
            mapId: s1.mapId,
            gameMode: s1.gameMode,
            players: {},
            projectiles: [],
            grenades: s1.grenades,
            mechs: s1.mechs,
            robots: [],
            score: s1.score,
            teamScores: s1.teamScores,
            decals: s1.decals,
            controlZones: s1.controlZones
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
                    rotation: this.lerpAngle(p0.rotation, p1.rotation, t),
                    hullRotation: (p0.hullRotation !== undefined && p1.hullRotation !== undefined) ? this.lerpAngle(p0.hullRotation, p1.hullRotation, t) : this.lerpAngle(p0.rotation, p1.rotation, t)
                };
            } else {
                interpolated.players[id] = p1;
            }
        }

        // Interpolate projectiles (the key fix for smooth bullets)
        if (s1.projectiles && s1.projectiles.length > 0) {
            const p0Map = new Map();
            if (s0.projectiles) s0.projectiles.forEach(p => p0Map.set(p.id, p));

            for (const p1 of s1.projectiles) {
                const p0 = p0Map.get(p1.id);
                if (p0) {
                    interpolated.projectiles.push({
                        ...p1,
                        x: p0.x + (p1.x - p0.x) * t,
                        y: p0.y + (p1.y - p0.y) * t
                    });
                } else {
                    // New projectile, just show at current position
                    interpolated.projectiles.push(p1);
                }
            }
        }

        // Interpolate robots
        if (s1.robots && s1.robots.length > 0) {
            const r0Map = new Map();
            if (s0.robots) s0.robots.forEach(r => r0Map.set(r.id, r));

            for (const r1 of s1.robots) {
                const r0 = r0Map.get(r1.id);
                if (r0) {
                    interpolated.robots.push({
                        ...r1,
                        x: r0.x + (r1.x - r0.x) * t,
                        y: r0.y + (r1.y - r0.y) * t,
                        rotation: this.lerpAngle(r0.rotation || 0, r1.rotation || 0, t)
                    });
                } else {
                    interpolated.robots.push(r1);
                }
            }
        } else {
            interpolated.robots = s1.robots;
        }

        // Interpolate Mechs
        const interpolatedMechs = [];
        const m1Map = new Map();
        if (s1.mechs) s1.mechs.forEach(m => m1Map.set(m.id, m));

        if (s0.mechs) {
            s0.mechs.forEach(m0 => {
                const m1 = m1Map.get(m0.id);
                if (m1) {
                    interpolatedMechs.push({
                        ...m1,
                        x: m0.x + (m1.x - m0.x) * t,
                        y: m0.y + (m1.y - m0.y) * t,
                        rotation: this.lerpAngle(m0.rotation || 0, m1.rotation || 0, t),
                        turretRotation: this.lerpAngle(m0.turretRotation || 0, m1.turretRotation || 0, t)
                    });
                } else {
                    interpolatedMechs.push(m0);
                }
            });
            s1.mechs.forEach(m1 => {
                if (!s0.mechs.find(m => m.id === m1.id)) interpolatedMechs.push(m1);
            });
            interpolated.mechs = interpolatedMechs;
        } else {
            interpolated.mechs = s1.mechs;
        }

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
