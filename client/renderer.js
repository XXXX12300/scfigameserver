export class Renderer {
    constructor(ctx) {
        this.ctx = ctx;
        
        // Load sprites
        this.sprites = {
            pistol: new Image(),
            smg: new Image()
        };
        this.sprites.pistol.src = '/Sprites/character/character pistol.png';
        this.sprites.smg.src = '/Sprites/character/character smg.png';
    }

    render(gameState, width, height, localPlayerId, mapData) {
        if (!gameState) {
            this.ctx.fillStyle = '#111';
            this.ctx.fillRect(0, 0, width, height);
            this.drawWaitingScreen(width, height);
            return;
        }

        const mapId = gameState.mapId || 'neon_grid';
        let bgColor = '#111';
        let gridColor = '#222';
        let lineWidth = 1;

        if (mapId === 'cyber_facility') {
            bgColor = '#1f1e24';
            gridColor = '#ff6b0033'; // orange transparent
            lineWidth = 2;
        } else if (mapId === 'wasteland') {
            bgColor = '#2a1a10';
            gridColor = '#3a2a20'; // dark brown
            lineWidth = 1;
        }

        // Clear canvas
        this.ctx.fillStyle = bgColor;
        this.ctx.fillRect(0, 0, width, height);

        // Find local player to act as camera focal point
        // Camera state members
        if (this.cameraX === undefined) this.cameraX = 0;
        if (this.cameraY === undefined) this.cameraY = 0;

        if (localPlayerId && gameState.players && gameState.players[localPlayerId]) {
            const targetX = gameState.players[localPlayerId].x;
            const targetY = gameState.players[localPlayerId].y;
            
            // Smooth Camera Lerp (10% per frame)
            this.cameraX += (targetX - this.cameraX) * 0.1;
            this.cameraY += (targetY - this.cameraY) * 0.1;
            
            // Background grid drawing relative to camera
            this.ctx.save();
            const offsetX = (width / 2) - this.cameraX;
            const offsetY = (height / 2) - this.cameraY;
            
            // Draw a subtle grid
            this.ctx.strokeStyle = gridColor;
            this.ctx.lineWidth = lineWidth;
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
            this.ctx.translate((width / 2) - this.cameraX, (height / 2) - this.cameraY);

            // Draw Map Boundaries and Obstacles
            if (mapData) {
                // Map Bounds (Outer walls)
                this.ctx.strokeStyle = mapId === 'neon_grid' ? '#0ff' : (mapId === 'cyber_facility' ? '#f90' : '#854');
                this.ctx.lineWidth = 4;
                this.ctx.strokeRect(0, 0, mapData.width, mapData.height);
                
                // Obstacles
                if (mapData.obstacles) {
                    for (let obs of mapData.obstacles) {
                        if (obs.type === 'building' || obs.type === 'wall' || obs.type === 'core') {
                            this.ctx.fillStyle = mapId === 'neon_grid' ? '#1a1a2e' : (mapId === 'cyber_facility' ? '#2d3436' : '#2d3436');
                            this.ctx.strokeStyle = mapId === 'neon_grid' ? '#00f3ff' : (mapId === 'cyber_facility' ? '#ff6b00' : '#d63031');
                        } else if (obs.type === 'ruins') {
                            this.ctx.fillStyle = '#3a2a20';
                            this.ctx.strokeStyle = '#634b35';
                        }
                        
                        this.ctx.lineWidth = 2;
                        this.ctx.fillRect(obs.x, obs.y, obs.w, obs.h);
                        this.ctx.strokeRect(obs.x, obs.y, obs.w, obs.h);
                        
                        // Add some inner detail to make it look like a structure
                        this.ctx.strokeStyle = 'rgba(255,255,255,0.1)';
                        this.ctx.strokeRect(obs.x + 10, obs.y + 10, obs.w - 20, obs.h - 20);
                    }
                }
            }
        }

        // Draw players
        if (gameState.players) {
            for (let pId in gameState.players) {
                const player = gameState.players[pId];
                if (!player.inMech) {
                    this.drawPlayer(player, pId === localPlayerId);
                }
            }
        }

        // Draw mechs
        if (gameState.mechs) {
            for (let mech of gameState.mechs) {
                this.drawMech(mech, mech.owner === localPlayerId);
            }
        }

        // Draw robots (turrets, drones, etc)
        if (gameState.robots) {
            for (let robot of gameState.robots) {
                this.drawRobot(robot);
            }
        }

        // Draw projectiles
        if (gameState.projectiles) {
            for (let p of gameState.projectiles) {
                this.drawProjectile(p);
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
            this.ctx.shadowBlur = 15;
            this.ctx.shadowColor = '#fff';
        }
        
        // Health Bar
        this.ctx.fillStyle = '#f00';
        this.ctx.fillRect(-20, -30, 40, 6);
        this.ctx.fillStyle = '#0f0';
        const hpPercent = Math.max(0, player.health) / 100;
        this.ctx.fillRect(-20, -30, 40 * hpPercent, 6);
        
        // Name
        this.ctx.fillStyle = '#fff';
        this.ctx.font = '12px Courier New';
        this.ctx.textAlign = 'center';
        this.ctx.fillText(player.name || 'Pilot', 0, -35);

        // Draw character sprite instead of shapes
        this.ctx.save();
        this.ctx.rotate(player.rotation);
        
        // Map weapon type to sprite
        let sprite = this.sprites.pistol;
        if (player.currentWeapon && player.currentWeapon === 'smg') {
            sprite = this.sprites.smg;
        } else if (player.currentWeapon === 'plasma_rifle') {
            sprite = this.sprites.smg; // Fallback to SMG for rifle until we have more sprites
        }

        // The images look like they have guns pointing to the right (assuming 0 rad rotation)
        // If the sprite native orientation is different, adjust the rotation here.
        // Also adjust the dimension and offset based on actual image bounds
        if (sprite.complete && sprite.naturalWidth > 0) {
            // Draw image centered. We draw it slightly smaller or scaled as needed
            // Assume the character needs to fit roughly within 48x48 bounds
            const drawSize = 48; 
            // The characters might face "down" or "right" in the image. We assume "right" (0 angle)
            this.ctx.drawImage(sprite, -drawSize/2, -drawSize/2, drawSize, drawSize);
            
            // Optional: Draw a subtle team-colored ring underneath to show the team if the sprite doesn't show it well
            if (!this.sprites.skipTeamRing) {
                this.ctx.strokeStyle = player.team === 'blue' ? '#4a90e2' : '#e24a4a';
                this.ctx.lineWidth = 2;
                this.ctx.beginPath();
                this.ctx.arc(0, 0, drawSize / 2, 0, Math.PI * 2);
                this.ctx.stroke();
            }
        } else {
            // Fallback to geometric shapes if image isn't loaded yet
            this.ctx.fillStyle = '#888';
            this.ctx.fillRect(0, -4, 28, 8); // Gun barrel
    
            this.ctx.fillStyle = player.team === 'blue' ? '#4a90e2' : '#e24a4a';
            this.ctx.strokeStyle = '#fff';
            this.ctx.lineWidth = 2;
            this.ctx.beginPath();
            this.ctx.arc(0, 0, 16, 0, Math.PI * 2);
            this.ctx.fill();
            if (isLocal) this.ctx.stroke();
        }

        this.ctx.restore();

        this.ctx.restore();
    }

    drawProjectile(p) {
        this.ctx.save();
        this.ctx.translate(p.x, p.y);
        
        // Draw based on weapon type/team
        this.ctx.fillStyle = p.team === 'blue' ? '#74b9ff' : '#ff7675';
        this.ctx.shadowBlur = 15;
        this.ctx.shadowColor = this.ctx.fillStyle;

        this.ctx.rotate(Math.atan2(p.vy, p.vx));
        
        if (p.weaponType === 'laser_sniper' || p.weaponType === 'railgun') {
            this.ctx.fillRect(0, -2, 30, 4);
        } else if (p.weaponType === 'plasma_rifle') {
            this.ctx.fillRect(0, -4, 16, 8);
        } else {
            this.ctx.fillRect(0, -3, 10, 6);
        }

        this.ctx.restore();
    }

    drawRobot(robot) {
        this.ctx.save();
        this.ctx.translate(robot.x, robot.y);
        
        // Base
        this.ctx.fillStyle = '#333';
        this.ctx.beginPath();
        this.ctx.arc(0, 0, 12, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Team Outline
        this.ctx.strokeStyle = robot.team === 'blue' ? '#4a90e2' : '#e24a4a';
        this.ctx.lineWidth = 2;
        this.ctx.stroke();

        // Health Bar
        if (robot.health < 150) {
            this.ctx.fillStyle = '#f00';
            this.ctx.fillRect(-15, -20, 30, 4);
            this.ctx.fillStyle = '#0f0';
            const hpPercent = Math.max(0, robot.health) / 150;
            this.ctx.fillRect(-15, -20, 30 * hpPercent, 4);
        }

        // Gun Barrel
        this.ctx.rotate(robot.rotation);
        this.ctx.fillStyle = '#777';
        this.ctx.fillRect(0, -3, 20, 6);

        this.ctx.restore();
    }

    drawMech(mech, isLocal) {
        this.ctx.save();
        this.ctx.translate(mech.x, mech.y);
        
        let scale = 1;
        if (mech.state === 'falling') {
            // Simulate dropping from sky
            scale = 1 + mech.fallProgress * 3;
            this.ctx.globalAlpha = 1 - mech.fallProgress * 0.5;
        }
        this.ctx.scale(scale, scale);

        if (isLocal) {
            this.ctx.shadowBlur = 20;
            this.ctx.shadowColor = '#fff';
        }

        const maxHealth = mech.type === 'titan' ? 2000 : 1000;
        
        // Draw Health Bar
        if (mech.state !== 'falling') {
            this.ctx.fillStyle = '#f00';
            this.ctx.fillRect(-30, -50, 60, 8);
            this.ctx.fillStyle = '#0f0';
            const hpPercent = Math.max(0, mech.health) / maxHealth;
            this.ctx.fillRect(-30, -50, 60 * hpPercent, 8);
        }

        // Target angle indicator
        this.ctx.save();
        this.ctx.rotate(mech.rotation || 0);
        this.ctx.fillStyle = '#555';
        
        // Heavy weapons depending on state
        if (mech.type === 'titan') {
            this.ctx.fillRect(-10, -25, 40, 15); // Left cannon
            this.ctx.fillRect(-10, 10, 40, 15);  // Right cannon
        } else {
            this.ctx.fillRect(0, -8, 35, 16); // Center heavy cannon
        }
        this.ctx.restore();

        // Mech Body
        this.ctx.fillStyle = mech.team === 'blue' ? '#2c3e50' : '#341f1f'; // Darker base
        this.ctx.strokeStyle = mech.team === 'blue' ? '#4a90e2' : '#e24a4a';
        this.ctx.lineWidth = 4;
        
        this.ctx.beginPath();
        if (mech.type === 'titan') {
            // Hexagon for titan
            for (let i = 0; i < 6; i++) {
                this.ctx.lineTo(30 * Math.cos(i * Math.PI / 3), 30 * Math.sin(i * Math.PI / 3));
            }
        } else {
            // Square for standard mech
            this.ctx.rect(-25, -25, 50, 50);
        }
        this.ctx.closePath();
        this.ctx.fill();
        this.ctx.stroke();

        this.ctx.restore();
    }
}
