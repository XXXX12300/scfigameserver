export class Renderer {
    constructor(ctx) {
        this.ctx = ctx;
        this.explosions = [];

        // Load sprites
        this.sprites = {
            charNoGun: new Image(),
            charDead: new Image(),
            blood: new Image(),
            weapons: {},
            muzzles: {},
            projectiles: {},
            turrets: {},
            tanks: {}
        };
        this.sprites.charNoGun.src = '/Sprites/Characters/character no gun.png';
        this.sprites.charDead.src = '/Sprites/Characters/dead character.png';
        this.sprites.blood.src = '/Sprites/Effects/blood.png';

        this.sprites.gore = {
            'blood_gore_1': new Image(),
            'blood_gore_2': new Image()
        };
        this.sprites.gore['blood_gore_1'].src = '/Sprites/MapTextures/Dec_Gore_Blood_1.png';
        this.sprites.gore['blood_gore_2'].src = '/Sprites/MapTextures/Dec_Gore_Blood_2.png';

        this.bloodClouds = [];
        this.hitmarkerTimer = 0;

        // Cache for weapon sprites
        this.weaponSpriteMap = {
            'm4a1': 'ERA RIFLE 1.png',
            'scar_h': 'ERA RIFLE 2.png',
            'aug_a3': 'ERA RIFLE 3.png',
            'p90': 'ERA SMG 1.png',
            'vector': 'ERA SMG 2.png',
            'l115a3': 'ERA SNIPER.png',
            'barrett': 'ERA HEAVY SNIPER.png',
            'remington': 'ERA SHOTGUN.png',
            'spas12': 'ERA MEGA SHOTGUN.png',
            'aa12': 'ERA AUTOMATIC SHOTGUN.png',
            'rpg7': 'ERA RPG.png',
            'minigun': 'ERA MINIGUN.png',
            'm1911': 'ERA PISTOL.png',
            'glock18': 'ERA PISTOL 2.png',
            'katana': 'ERA SWORD.png',
            'laser_blade': 'ERA LASER SWORD.png',
            'chainsaw': 'ERA CHAINSAW.png',
            'mega_bazooka': 'ERA SEMI RPG.png'
        };

        this.projectileSpriteMap = {
            'plasma': 'micro projectile (25).png',
            'bullet': 'micro projectile (4).png',
            'beam': 'micro projectile (10).png',
            'energy': 'micro projectile (23).png',
            'rocket': 'micro projectile (20).png',
            'rail': 'micro projectile (18).png'
        };

        this.muzzleSpriteMap = {
            'blue': 'micro muzzle (1).png',
            'cyan': 'micro muzzle (4).png',
            'red': 'micro muzzle (13).png',
            'green': 'micro muzzle (40).png',
            'orange': 'micro muzzle (39).png',
            'white': 'micro muzzle (33).png'
        };

        // Preload weapons
        for (let w in this.weaponSpriteMap) {
            this.sprites.weapons[w] = new Image();
            this.sprites.weapons[w].src = `/Sprites/Weapons/${this.weaponSpriteMap[w]}`;
        }
        // Preload projectiles
        for (let p in this.projectileSpriteMap) {
            this.sprites.projectiles[p] = new Image();
            this.sprites.projectiles[p].src = `/Sprites/Effects/${this.projectileSpriteMap[p]}`;
        }
        // Preload muzzles
        for (let m in this.muzzleSpriteMap) {
            this.sprites.muzzles[m] = new Image();
            this.sprites.muzzles[m].src = `/Sprites/Effects/${this.muzzleSpriteMap[m]}`;
        }

        // Preload grenade
        this.sprites.grenade = new Image();
        this.sprites.grenade.src = '/Sprites/Characters/granada.png';

        // Preload Turret Tiers
        this.sprites.turrets['turret_1'] = new Image();
        this.sprites.turrets['turret_1'].src = '/Sprites/Sci-Fi Turret Pack/autocannon/autocannon2.png';
        this.sprites.turrets['turret_1_barrel'] = new Image();
        this.sprites.turrets['turret_1_barrel'].src = '/Sprites/Sci-Fi Turret Pack/autocannon/autocannon_barrel.png';

        this.sprites.turrets['turret_2'] = new Image();
        this.sprites.turrets['turret_2'].src = '/Sprites/Sci-Fi Turret Pack/plasma_cannon/plasma_cannon.png';
        this.sprites.turrets['turret_2_barrel'] = new Image();
        this.sprites.turrets['turret_2_barrel'].src = '/Sprites/Sci-Fi Turret Pack/plasma_cannon/plasma_cannon_barrel.png';

        this.sprites.turrets['turret_3'] = new Image();
        this.sprites.turrets['turret_3'].src = '/Sprites/Sci-Fi Turret Pack/heavy_laser_cannon/heavy_laser_cannon.png';
        this.sprites.turrets['turret_3_barrel'] = new Image();
        this.sprites.turrets['turret_3_barrel'].src = '/Sprites/Sci-Fi Turret Pack/heavy_laser_cannon/heavy_laser_cannon_barrel.png';

        // Preload Tank Tiers
        this.sprites.tanks['tank_1_hull'] = new Image(); this.sprites.tanks['tank_1_hull'].src = '/Sprites/TANK/Hulls_Color_A/Hull_01.png';
        this.sprites.tanks['tank_1_gun'] = new Image(); this.sprites.tanks['tank_1_gun'].src = '/Sprites/TANK/Weapon_Color_A/Gun_01.png';
        this.sprites.tanks['tank_1_trackA'] = new Image(); this.sprites.tanks['tank_1_trackA'].src = '/Sprites/TANK/Tracks/Track_1_A.png';
        this.sprites.tanks['tank_1_trackB'] = new Image(); this.sprites.tanks['tank_1_trackB'].src = '/Sprites/TANK/Tracks/Track_1_B.png';

        this.sprites.tanks['tank_2_hull'] = new Image(); this.sprites.tanks['tank_2_hull'].src = '/Sprites/TANK/Hulls_Color_A/Hull_03.png';
        this.sprites.tanks['tank_2_gun'] = new Image(); this.sprites.tanks['tank_2_gun'].src = '/Sprites/TANK/Weapon_Color_A/Gun_03.png';
        this.sprites.tanks['tank_2_trackA'] = new Image(); this.sprites.tanks['tank_2_trackA'].src = '/Sprites/TANK/Tracks/Track_2_A.png';
        this.sprites.tanks['tank_2_trackB'] = new Image(); this.sprites.tanks['tank_2_trackB'].src = '/Sprites/TANK/Tracks/Track_2_B.png';

        this.sprites.tanks['tank_3_hull'] = new Image(); this.sprites.tanks['tank_3_hull'].src = '/Sprites/TANK/Hulls_Color_A/Hull_06.png';
        this.sprites.tanks['tank_3_gun'] = new Image(); this.sprites.tanks['tank_3_gun'].src = '/Sprites/TANK/Weapon_Color_A/Gun_06.png';
        this.sprites.tanks['tank_3_trackA'] = new Image(); this.sprites.tanks['tank_3_trackA'].src = '/Sprites/TANK/Tracks/Track_4_A.png';
        this.sprites.tanks['tank_3_trackB'] = new Image(); this.sprites.tanks['tank_3_trackB'].src = '/Sprites/TANK/Tracks/Track_4_B.png';

        this.sprites.projectiles['heavy_shell'] = new Image();
        this.sprites.projectiles['heavy_shell'].src = '/Sprites/heavy_shell.png';

        // Preload Drone
        this.sprites.remoteDrone = new Image();
        this.sprites.remoteDrone.src = '/Sprites/remoterobot.png';

        this.mapSprites = {};
        this.mapPatterns = {};

        // Initial essential preloads - Updated verified paths
        ['Concrete_01_Grey_1.png', 'Brick Plaster/Brick_Plaster_03_Red_1.png'].forEach(n => this.getMapSprite(n));

        this.shake = 0;
        this.recoilX = 0;
        this.recoilY = 0;
        this.cameraX = 0;
        this.cameraY = 0;

        // Track mouse position for crosshair
        this.mouseX = 0;
        this.mouseY = 0;
        if (this.ctx && this.ctx.canvas) {
            this.ctx.canvas.addEventListener('mousemove', (e) => {
                const rect = this.ctx.canvas.getBoundingClientRect();
                this.mouseX = e.clientX - rect.left;
                this.mouseY = e.clientY - rect.top;
            });
        }
    }

    addShake(amount) {
        this.shake = Math.max(this.shake, amount);
    }

    addRecoil(rotation, amount) {
        // Push camera in opposite direction of fire
        this.recoilX += -Math.cos(rotation) * amount;
        this.recoilY += -Math.sin(rotation) * amount;
    }

    addBloodCloud(x, y, vx, vy) {
        this.bloodClouds.push({
            x, y, vx, vy,
            life: 1.0,
            maxLife: 1.0,
            size: 20 + Math.random() * 20,
            rotation: Math.random() * Math.PI * 2
        });
    }

    triggerHitmarker() {
        this.hitmarkerTimer = 0.15; // Show for 150ms
    }

    getMapSprite(texturePath) {
        if (!texturePath) return null;
        if (!this.mapSprites[texturePath]) {
            this.mapSprites[texturePath] = new Image();
            if (texturePath.startsWith('Vehicles/')) {
                const basename = texturePath.split('/').pop();
                this.mapSprites[texturePath].src = `/Sprites/Vehicles/${basename}`;
            } else if (texturePath.startsWith('Furniture/') || texturePath.startsWith('Decor/') || texturePath.startsWith('Electronics/')) {
                this.mapSprites[texturePath].src = `/Sprites/${texturePath}`;
            } else {
                // Use the full texturePath which preserves subfolders like 'Concrete/'
                this.mapSprites[texturePath].src = `/Sprites/MapTextures/${texturePath}`;
            }
        }

        const img = this.mapSprites[texturePath];
        // If image is complete but width is 0, it 404'd or failed to decode
        if (img.complete && img.naturalWidth === 0) return null;
        return img;
    }

    getMapPattern(texturePath) {
        if (!texturePath) return null;
        if (this.mapPatterns[texturePath]) return this.mapPatterns[texturePath];

        const sprite = this.getMapSprite(texturePath);
        // Only trigger createPattern once the image is fully loaded and valid.
        if (sprite && sprite.complete && sprite.naturalWidth > 0) {
            this.mapPatterns[texturePath] = this.ctx.createPattern(sprite, 'repeat');
            return this.mapPatterns[texturePath];
        }
        return null;
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
            const lp = gameState.players[localPlayerId];
            let targetX = lp.x;
            let targetY = lp.y;

            if (lp.controlledDroneId && gameState.robots) {
                const drone = gameState.robots.find(r => r.id === lp.controlledDroneId);
                if (drone) {
                    targetX = drone.x;
                    targetY = drone.y;
                }
            }

            // Camera looking ahead / panning
            if (this.isShiftHeld) {
                const panDistance = 400; // max pan pixels
                const dx = (this.mouseX || width / 2) - (width / 2);
                const dy = (this.mouseY || height / 2) - (height / 2);

                // Fraction of screen -1 to 1 based on mouse distance from center
                const screenDistRatioX = dx / (width / 2);
                const screenDistRatioY = dy / (height / 2);

                targetX += screenDistRatioX * panDistance;
                targetY += screenDistRatioY * panDistance;
            }

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
            for (let x = startX; x <= endX; x += gridSize) {
                this.ctx.moveTo(x + offsetX, 0);
                this.ctx.lineTo(x + offsetX, height);
            }
            for (let y = startY; y <= endY; y += gridSize) {
                this.ctx.moveTo(0, y + offsetY);
                this.ctx.lineTo(width, y + offsetY);
            }
            this.ctx.stroke();
            this.ctx.restore();

            // Apply camera transform to all entities
            this.ctx.translate((width / 2) - this.cameraX + this.recoilX, (height / 2) - this.cameraY + this.recoilY);

            // Decay recoil faster for snappier feel
            this.recoilX *= 0.8;
            this.recoilY *= 0.8;
            if (Math.abs(this.recoilX) < 0.1) this.recoilX = 0;
            if (Math.abs(this.recoilY) < 0.1) this.recoilY = 0;

            // Apply camera shake if any
            if (this.shake > 0) {
                this.ctx.translate((Math.random() - 0.5) * this.shake, (Math.random() - 0.5) * this.shake);
                this.shake *= 0.9;
                if (this.shake < 0.1) this.shake = 0;
            }

            // Default to 'neon_grid' look if no map textures are defined
            this.ctx.strokeStyle = mapId === 'neon_grid' ? '#0ff' : '#f90';
            this.ctx.lineWidth = 4;
            this.ctx.strokeRect(0, 0, mapData.width || 2000, mapData.height || 2000);

            // Determine local player coordinates for occlusion checks
            let lpX = -1000, lpY = -1000;
            if (gameState.players && gameState.players[localPlayerId]) {
                lpX = gameState.players[localPlayerId].x;
                lpY = gameState.players[localPlayerId].y;
            }

            // Apply Line of Sight Clipping Mask AFTER map base and walls are drawn
            // (Moved to lower down in the render pipeline)

            // 1. Draw Map Base (Tiled or Solid) -> Inside the Vis Mask!
            if (mapData) {
                // Draw Default Ground
                if (mapData.baseTexture) {
                    const pat = this.getMapPattern(mapData.baseTexture);
                    if (pat) {
                        this.ctx.fillStyle = pat;
                        this.ctx.fillRect(0, 0, mapData.width, mapData.height);
                    } else {
                        this.ctx.fillStyle = gridColor;
                        this.ctx.fillRect(0, 0, mapData.width, mapData.height);
                    }
                } else {
                    this.ctx.fillStyle = '#111';
                    this.ctx.fillRect(0, 0, mapData.width || 2000, mapData.height || 2000);
                }
            }

            // 2. Draw Terrain Regions (Walkable/Unwalkable like water, grass)
            if (mapData.terrainRegions) {
                for (let tr of mapData.terrainRegions) {
                    if (tr.texture) {
                        const pat = this.getMapPattern(tr.texture);
                        if (pat) {
                            this.ctx.save();
                            this.ctx.translate(tr.x, tr.y);
                            this.ctx.fillStyle = pat;
                            this.ctx.fillRect(0, 0, tr.w, tr.h);
                            this.ctx.restore();
                        } else {
                            this.ctx.fillStyle = tr.type === 'walkable' ? '#445' : '#112';
                            this.ctx.fillRect(tr.x, tr.y, tr.w, tr.h);
                        }
                    } else {
                        // Fallback for terrain regions without a texture
                        this.ctx.fillStyle = tr.type === 'walkable' ? '#445' : '#112';
                        this.ctx.fillRect(tr.x, tr.y, tr.w, tr.h);
                    }
                }
            }

            // 3. Draw Buildings (Occlusion Logic)
            if (mapData.buildings) {
                for (let b of mapData.buildings) {
                    // Check if player is strictly inside building bounds
                    const isInside = (lpX > b.bounds.x && lpX < b.bounds.x + b.bounds.w &&
                        lpY > b.bounds.y && lpY < b.bounds.y + b.bounds.h);

                    // Draw Interior (Floor) or Exterior (Roof)
                    if (isInside) {
                        // Inside: Draw Floor
                        const pat = this.getMapPattern(b.floorTexture);
                        if (pat) {
                            this.ctx.save();
                            this.ctx.translate(b.bounds.x, b.bounds.y);
                            this.ctx.fillStyle = pat;
                            this.ctx.fillRect(0, 0, b.bounds.w, b.bounds.h);
                            this.ctx.restore();

                            // No inner shadow needed anymore with Fog of War
                        } else {
                            this.ctx.fillStyle = '#222';
                            this.ctx.fillRect(b.bounds.x, b.bounds.y, b.bounds.w, b.bounds.h);
                        }
                    } else {
                        // Outside: Draw Roof
                        const pat = this.getMapPattern(b.roofTexture);
                        if (pat) {
                            this.ctx.save();
                            this.ctx.translate(b.bounds.x, b.bounds.y);
                            this.ctx.fillStyle = pat;
                            this.ctx.fillRect(0, 0, b.bounds.w, b.bounds.h);
                            this.ctx.restore();
                        } else {
                            // Fallback colour for roof
                            this.ctx.fillStyle = '#111';
                            this.ctx.fillRect(b.bounds.x, b.bounds.y, b.bounds.w, b.bounds.h);
                        }
                    }

                    // Always Draw Walls
                    if (b.walls) {
                        for (let wall of b.walls) {
                            const pat = this.getMapPattern(b.wallTexture);
                            if (pat) {
                                this.ctx.save();
                                this.ctx.translate(wall.x, wall.y);
                                this.ctx.fillStyle = pat;
                                this.ctx.fillRect(0, 0, wall.w, wall.h);
                                this.ctx.restore();

                                // 3D edge effect
                                this.ctx.strokeStyle = 'rgba(0,0,0,0.5)';
                                this.ctx.lineWidth = 1;
                                this.ctx.strokeRect(wall.x, wall.y, wall.w, wall.h);
                            } else {
                                this.ctx.fillStyle = '#666';
                                this.ctx.fillRect(wall.x, wall.y, wall.w, wall.h);
                            }
                        }
                    }
                }
            }

            // 4. Draw standalone obstacles (applies to BOTH textured and untextured maps)
            if (mapData && mapData.obstacles) {
                for (let obs of mapData.obstacles) {
                    const obsSprite = this.getMapSprite(obs.texture);
                    if (obsSprite && obsSprite.complete) {
                        this.ctx.save();

                        // If it's a vehicle or a specific sprite-based obstacle, draw it direct. 
                        // Otherwise (like walls/buildings) we might still want patterns.
                        if (obs.texture && (obs.texture.startsWith('Vehicles/') || obs.type === 'building')) {
                            this.ctx.translate(obs.x + obs.w / 2, obs.y + obs.h / 2);
                            
                            // 1:1 WYSIWYG rendering, no scaling hacks just like the Editor
                            this.ctx.drawImage(obsSprite, -obs.w / 2, -obs.h / 2, obs.w, obs.h);
                        } else {
                            const pat = this.getMapPattern(obs.texture);
                            this.ctx.translate(obs.x, obs.y);
                            this.ctx.fillStyle = pat;
                            this.ctx.fillRect(0, 0, obs.w, obs.h);
                        }
                        this.ctx.restore();

                        // Debug/Collision Border (Removed as requested)
                        // this.ctx.strokeStyle = 'rgba(0,0,0,0.3)';
                        // this.ctx.lineWidth = 1;
                        // this.ctx.strokeRect(obs.x, obs.y, obs.w, obs.h);
                    } else {
                        // Fallback flat color drawing for old obstacles
                        if (obs.type === 'building' || obs.type === 'wall' || obs.type === 'core') {
                            this.ctx.fillStyle = mapId === 'neon_grid' ? '#1a1a2e' : '#2d3436';
                            this.ctx.strokeStyle = mapId === 'neon_grid' ? '#00f3ff' : '#ff6b00';
                        } else if (obs.type === 'ruins') {
                            this.ctx.fillStyle = '#3a2a20';
                            this.ctx.strokeStyle = '#634b35';
                        } else {
                            this.ctx.fillStyle = '#555';
                            this.ctx.strokeStyle = '#222';
                        }
                        this.ctx.lineWidth = 2;
                        this.ctx.fillRect(obs.x, obs.y, obs.w, obs.h);
                        this.ctx.strokeRect(obs.x, obs.y, obs.w, obs.h);
                        this.ctx.strokeStyle = 'rgba(255,255,255,0.1)';
                        this.ctx.strokeRect(obs.x + 10, obs.y + 10, obs.w - 20, obs.h - 20);
                    }
                }
            }
        }

        // --- Occlusion Logic ---
        let localBuildingId = null;
        if (localPlayerId && gameState.players && gameState.players[localPlayerId] && mapData && mapData.buildings) {
            const lp = gameState.players[localPlayerId];

            // If controlling a drone, use drone's building ID for occlusion culling
            let viewSource = lp;
            if (lp.controlledDroneId && gameState.robots) {
                const drone = gameState.robots.find(r => r.id === lp.controlledDroneId);
                if (drone) viewSource = drone;
            }

            for (let b of mapData.buildings) {
                if (viewSource.x > b.bounds.x && viewSource.x < b.bounds.x + b.bounds.w && viewSource.y > b.bounds.y && viewSource.y < b.bounds.y + b.bounds.h) {
                    localBuildingId = b.id;
                    break;
                }
            }
        }

        const getEntityBuildingId = (x, y) => {
            if (!mapData || !mapData.buildings) return null;
            for (let b of mapData.buildings) {
                if (x > b.bounds.x && x < b.bounds.x + b.bounds.w && y > b.bounds.y && y < b.bounds.y + b.bounds.h) return b.id;
            }
            return null;
        };

        // --- Apply Line of Sight Mask ---
        // This draws the dark overlay over unseen map parts, and sets up a clipping mask for entities.
        // if (localPlayerId && gameState.players && gameState.players[localPlayerId] && !gameState.players[localPlayerId].isDead) {
        //     this.applyVisibilityMask(gameState.players[localPlayerId], mapData);
        // }

        // Draw decals (blood, etc) under players
        if (gameState.decals) {
            for (let d of gameState.decals) {
                if (getEntityBuildingId(d.x, d.y) !== localBuildingId) continue;
                this.drawDecal(d);
            }
        }

        // --- Draw and Update Blood Clouds (Particles) ---
        for (let i = this.bloodClouds.length - 1; i >= 0; i--) {
            let bc = this.bloodClouds[i];
            bc.x += bc.vx;
            bc.y += bc.vy;
            bc.vx *= 0.95; bc.vy *= 0.95; // Friction
            bc.life -= 0.02;

            if (bc.life <= 0) {
                this.bloodClouds.splice(i, 1);
                continue;
            }

            this.ctx.save();
            this.ctx.translate(bc.x, bc.y);
            this.ctx.rotate(bc.rotation);
            // "Cloud" logic: scaling up while fading out
            const scale = 1.0 + (1.0 - bc.life) * 2.5;
            this.ctx.globalAlpha = bc.life * 0.7;

            // Draw a few overlapping blood circles or the blood sprite
            const size = bc.size * scale;
            this.ctx.drawImage(this.sprites.blood, -size / 2, -size / 2, size, size);
            this.ctx.restore();
        }

        // Draw DEAD players
        if (gameState.players) {
            for (let pId in gameState.players) {
                const player = gameState.players[pId];
                if (!player.inMech && player.isDead) { // Draw dead bodies first
                    if (pId !== localPlayerId && getEntityBuildingId(player.x, player.y) !== localBuildingId) continue;
                    this.drawPlayer(player, pId === localPlayerId);
                }
            }
        }

        // Draw LIVE players (on top of dead bodies)
        if (gameState.players) {
            const localP = gameState.players[localPlayerId];
            for (let pId in gameState.players) {
                const player = gameState.players[pId];
                if (!player.inMech && !player.isDead) { // Draw live players later
                    if (pId !== localPlayerId && getEntityBuildingId(player.x, player.y) !== localBuildingId) continue;
                    const isTeammate = localP && player.team === localP.team && player.team !== 'none';
                    this.drawPlayer(player, pId === localPlayerId, isTeammate);
                }
            }
        }

        // Draw Player UIs (Names and Health Bars) - Always on top of bodies
        if (gameState.players) {
            const localP = gameState.players[localPlayerId];
            for (let pId in gameState.players) {
                const player = gameState.players[pId];
                if (player.inMech && player.inMech !== 'false' && player.inMech !== false) continue;
                if (!player.isDead) {
                    if (pId !== localPlayerId && getEntityBuildingId(player.x, player.y) !== localBuildingId) continue;
                    const isTeammate = localP && player.team === localP.team && player.team !== 'none';
                    if (pId === localPlayerId || isTeammate) {
                        this.drawPlayerUI(player, pId === localPlayerId);
                    }
                }
            }
        }

        // Draw mechs
        if (gameState.mechs) {
            for (let mech of gameState.mechs) {
                if (getEntityBuildingId(mech.x, mech.y) !== localBuildingId) continue;
                this.drawMech(mech, mech.owner === localPlayerId, gameState);
            }
        }

        // Draw robots (turrets, drones, etc)
        if (gameState.robots) {
            const localP = gameState.players[localPlayerId];
            for (let robot of gameState.robots) {
                const isControlled = robot.id === localP?.controlledDroneId;
                if (!isControlled && getEntityBuildingId(robot.x, robot.y) !== localBuildingId) continue;
                this.drawRobot(robot, localP);
            }
        }

        // Draw and update Explosions
        for (let i = this.explosions.length - 1; i >= 0; i--) {
            let exp = this.explosions[i];
            if (getEntityBuildingId(exp.x, exp.y) !== localBuildingId) continue;

            exp.life -= 0.05; // Fade speed
            if (exp.life <= 0) {
                this.explosions.splice(i, 1);
                continue;
            }

            this.ctx.save();
            this.ctx.translate(exp.x, exp.y);

            // Outer heat distortion / glow
            this.ctx.globalAlpha = exp.life * 0.3;
            this.ctx.beginPath();
            this.ctx.arc(0, 0, exp.radius * (1 - Math.pow(exp.life, 2)) * 1.2, 0, Math.PI * 2);
            this.ctx.fillStyle = '#ffaa00';
            this.ctx.fill();

            // Main explosion ball
            this.ctx.globalAlpha = Math.max(0, exp.life);
            const currentRadius = exp.radius * (1 - Math.pow(exp.life, 3));

            this.ctx.beginPath();
            this.ctx.arc(0, 0, currentRadius, 0, Math.PI * 2);
            const grad = this.ctx.createRadialGradient(0, 0, 0, 0, 0, currentRadius);
            grad.addColorStop(0, '#fff');
            grad.addColorStop(0.2, '#ffcc00');
            grad.addColorStop(0.5, '#ff4400');
            grad.addColorStop(1, 'rgba(255, 0, 0, 0)');
            this.ctx.fillStyle = grad;
            this.ctx.fill();

            // Sparkles / Spiky bits for character
            this.ctx.strokeStyle = '#fff';
            this.ctx.lineWidth = 2;
            this.ctx.globalAlpha = exp.life * 0.8;
            for (let j = 0; j < 8; j++) {
                const ang = j * (Math.PI / 4) + exp.life;
                const d = currentRadius * 1.5;
                this.ctx.beginPath();
                this.ctx.moveTo(0, 0);
                this.ctx.lineTo(Math.cos(ang) * d, Math.sin(ang) * d);
                this.ctx.stroke();
            }

            this.ctx.restore();
        }

        // Draw projectiles
        if (gameState.projectiles) {
            for (let p of gameState.projectiles) {
                const isDroneBullet = p.weaponType === 'laser_sniper';
                if (!isDroneBullet && getEntityBuildingId(p.x, p.y) !== localBuildingId) continue;
                this.drawProjectile(p);
            }
        }

        // Draw grenades
        if (gameState.grenades) {
            for (let g of gameState.grenades) {
                if (getEntityBuildingId(g.x, g.y) !== localBuildingId) continue;
                this.ctx.save();
                this.ctx.translate(g.x, g.y);
                // Rotate based on time to simulate tumbling
                this.ctx.rotate((Date.now() / 150) % (Math.PI * 2));

                if (this.sprites.grenade && this.sprites.grenade.complete && this.sprites.grenade.naturalWidth > 0) {
                    this.ctx.drawImage(this.sprites.grenade, -12, -12, 24, 24);
                } else {
                    this.ctx.fillStyle = '#111';
                    this.ctx.beginPath();
                    this.ctx.arc(0, 0, 8, 0, Math.PI * 2);
                    this.ctx.fill();
                    this.ctx.strokeStyle = '#f00';
                    this.ctx.lineWidth = 2;
                    this.ctx.stroke();
                }
                this.ctx.restore();
            }
        }

        // Draw Control Zones
        if (gameState.controlZones) {
            for (let zone of gameState.controlZones) {
                if (getEntityBuildingId(zone.x, zone.y) !== localBuildingId) continue;
                this.ctx.save();
                this.ctx.translate(zone.x, zone.y);

                const cBase = 'rgba(200, 200, 200, 0.2)';
                let cTeam = 'rgba(255, 255, 255, 0.5)';
                const activeColorTeam = zone.owner || zone.capturingTeam;
                if (activeColorTeam === 'blue') cTeam = 'rgba(0, 150, 255, 0.5)';
                if (activeColorTeam === 'red') cTeam = 'rgba(255, 50, 50, 0.5)';

                // Draw Base Circle
                this.ctx.beginPath();
                this.ctx.arc(0, 0, zone.radius, 0, Math.PI * 2);
                this.ctx.fillStyle = cBase;
                this.ctx.fill();
                this.ctx.lineWidth = 2;
                this.ctx.strokeStyle = cTeam;
                this.ctx.stroke();

                // Draw Progress Arc
                if (zone.progress > 0) {
                    this.ctx.beginPath();
                    this.ctx.arc(0, 0, zone.radius, -Math.PI / 2, (-Math.PI / 2) + (Math.PI * 2 * (zone.progress / 100)));
                    this.ctx.lineWidth = 6;
                    this.ctx.strokeStyle = cTeam;
                    this.ctx.stroke();
                }

                // Draw Zone Icon / Label
                this.ctx.fillStyle = '#fff';
                this.ctx.font = 'bold 24px Courier New';
                this.ctx.textAlign = 'center';
                this.ctx.fillText(zone.id.toUpperCase(), 0, 8);

                this.ctx.restore();
            }
        }
        // Draw Roofs (Occluded) and Entrances ON TOP of everything
        if (mapData && mapData.buildings) {
            let lpX = -1000, lpY = -1000;
            if (localPlayerId && gameState.players && gameState.players[localPlayerId]) {
                lpX = gameState.players[localPlayerId].x;
                lpY = gameState.players[localPlayerId].y;
            }

            // First loop: Draw Roofs for buildings we are NOT inside
            for (let b of mapData.buildings) {
                const isInside = (lpX > b.bounds.x && lpX < b.bounds.x + b.bounds.w && lpY > b.bounds.y && lpY < b.bounds.y + b.bounds.h);
                if (!isInside) {
                    let roofPat = '#555';
                    const roofSprite = this.getMapSprite(b.roofTexture);
                    if (roofSprite && roofSprite.complete) {
                        roofPat = this.ctx.createPattern(roofSprite, 'repeat');
                    }

                    this.ctx.save();
                    this.ctx.translate(b.bounds.x, b.bounds.y);
                    this.ctx.fillStyle = roofPat;
                    this.ctx.fillRect(0, 0, b.bounds.w, b.bounds.h);
                    this.ctx.strokeStyle = 'rgba(0,0,0,0.8)';
                    this.ctx.lineWidth = 10;
                    this.ctx.strokeRect(0, 0, b.bounds.w, b.bounds.h);
                    this.ctx.restore();
                }
            }

            // Second loop: If we ARE inside a building, darken the outside world
            let activeBuilding = null;
            for (let b of mapData.buildings) {
                if (lpX > b.bounds.x && lpX < b.bounds.x + b.bounds.w && lpY > b.bounds.y && lpY < b.bounds.y + b.bounds.h) {
                    activeBuilding = b;
                    break;
                }
            }

            if (activeBuilding) {
                this.ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';
                const ax = activeBuilding.bounds.x;
                const ay = activeBuilding.bounds.y;
                const aw = activeBuilding.bounds.w;
                const ah = activeBuilding.bounds.h;

                // Top
                this.ctx.fillRect(0, 0, mapData.width, ay);
                // Bottom
                this.ctx.fillRect(0, ay + ah, mapData.width, mapData.height - (ay + ah));
                // Left
                this.ctx.fillRect(0, ay, ax, ah);
                // Right
                this.ctx.fillRect(ax + aw, ay, mapData.width - (ax + aw), ah);
            }

            // Draw Grenades on TOP of floors but BELOW UI
            if (gameState.grenades) {
                gameState.grenades.forEach(g => {
                    if (getEntityBuildingId(g.x, g.y) !== localBuildingId) return; // Skip if in different building
                    this.ctx.save();
                    this.ctx.translate(g.x, g.y);

                    // Spin dynamically based on fuse timer (life)
                    this.ctx.rotate(g.life * Math.PI * 4); // Fast spin

                    if (this.sprites.grenade && this.sprites.grenade.complete && this.sprites.grenade.naturalWidth > 0) {
                        const size = 32;
                        this.ctx.drawImage(this.sprites.grenade, -size / 2, -size / 2, size, size);
                    } else {
                        // Fallback bright circle if image fails to load
                        this.ctx.fillStyle = '#39ff14'; // Neon Green
                        this.ctx.beginPath();
                        this.ctx.arc(0, 0, 10, 0, Math.PI * 2);
                        this.ctx.fill();
                        this.ctx.strokeStyle = '#fff';
                        this.ctx.lineWidth = 2;
                        this.ctx.stroke();
                    }
                    this.ctx.restore();
                });
            }

            // Third loop: Draw visual markers for entrances (always visible from both sides)
            for (let b of mapData.buildings) {
                if (b.entrances) {
                    let floorPat = this.getMapPattern(b.floorTexture) || '#333';
                    for (let ent of b.entrances) {
                        this.ctx.save();
                        this.ctx.translate(b.bounds.x, b.bounds.y);
                        this.ctx.fillStyle = floorPat;
                        this.ctx.fillRect(ent.x - b.bounds.x, ent.y - b.bounds.y, ent.w, ent.h);
                        this.ctx.fillStyle = 'rgba(0, 255, 255, 0.1)'; // Subtle highlight
                        this.ctx.fillRect(ent.x - b.bounds.x, ent.y - b.bounds.y, ent.w, ent.h);
                        this.ctx.restore();

                        this.ctx.strokeStyle = 'rgba(0, 255, 255, 0.5)';
                        this.ctx.lineWidth = 2;
                        this.ctx.strokeRect(ent.x, ent.y, ent.w, ent.h);
                    }
                }
            }
        }

        // Remove Line of Sight Clipping Mask
        // if (localPlayerId && gameState.players && gameState.players[localPlayerId] && !gameState.players[localPlayerId].isDead) {
        //     this.ctx.restore(); // Restores from applyVisibilityMask's clip() save
        // }

        if (localPlayerId) {
            this.ctx.resetTransform();

            // Draw Global Team Scores
            this.drawTeamScores(gameState.teamScores, width, gameState.gameMode);

            // Darkening overlay if dead
            const localPlayer = gameState.players[localPlayerId];
            if (localPlayer) {
                // Sync Death Overlay HTML
                const deathOverlay = document.getElementById('deathOverlay');
                const respawnTimerText = document.getElementById('respawnTimer');

                if (localPlayer.isDead) {
                    if (deathOverlay) {
                        deathOverlay.style.display = 'flex';
                        deathOverlay.style.opacity = '1';
                    }
                    if (respawnTimerText) {
                        const time = Math.ceil(localPlayer.respawnTimer || 0);
                        respawnTimerText.innerText = `Respawning in ${time}s...`;
                    }

                    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
                    this.ctx.fillRect(0, 0, width, height);

                } else {
                    if (deathOverlay) {
                        deathOverlay.style.opacity = '0';
                        setTimeout(() => { if (!localPlayer.isDead) deathOverlay.style.display = 'none'; }, 300);
                    }

                    // Damage Flash Vignette
                    if (this.lastHealth !== undefined && localPlayer.health < this.lastHealth) {
                        this.damageFlashTimer = 1.0;
                    }
                    this.lastHealth = localPlayer.health;

                    if (this.damageFlashTimer > 0) {
                        this.damageFlashTimer -= 0.05; // Fade out

                        this.ctx.save();
                        this.ctx.globalAlpha = Math.max(0, this.damageFlashTimer);
                        const radius = Math.max(width, height) / 1.5;
                        const gradient = this.ctx.createRadialGradient(width / 2, height / 2, radius * 0.3, width / 2, height / 2, radius);
                        gradient.addColorStop(0, 'rgba(255, 0, 0, 0)');
                        gradient.addColorStop(0.8, 'rgba(255, 0, 0, 0.3)');
                        gradient.addColorStop(1, 'rgba(255, 0, 0, 0.7)');
                        this.ctx.fillStyle = gradient;
                        this.ctx.fillRect(0, 0, width, height);
                        this.ctx.restore();
                    }
                }
            }
        }

        // --- Crosshair and Reload UI ---
        if (this.ctx && this.ctx.canvas) {
            this.ctx.canvas.style.cursor = 'none'; // Hide default cursor
        }
        const lp = gameState.players && gameState.players[localPlayerId];

        if (lp) {
            // Draw Dynamic Crosshair
            // Base spread per weapon type (approximate visual rep)
            const spreads = {
                pistol: 5,
                dual_pistol: 8,
                smg: 12,
                carbine: 6,
                burst_carbine: 4,
                assault_rifle: 10,
                heavy_rifle: 15,
                laser_sniper: 2,
                ion_shotgun: 25,
                flamethrower: 30,
                rocket_launcher: 8,
                railgun: 1
            };

            let currentSpread = spreads[lp.weaponType] || 10;
            // Expand spread if moving
            if (Math.abs(lp.vx) > 0.5 || Math.abs(lp.vy) > 0.5) currentSpread += 10;
            // Expand when firing (using screen shake as proxy)
            if (this.shake > 0) currentSpread += this.shake * 2;

            const mX = this.mouseX;
            const mY = this.mouseY;

            this.ctx.strokeStyle = 'rgba(0, 255, 255, 0.8)'; // Cyan crosshair
            this.ctx.lineWidth = 2;

            this.ctx.beginPath();
            // Up
            this.ctx.moveTo(mX, mY - currentSpread - 4);
            this.ctx.lineTo(mX, mY - currentSpread - 12);
            // Down
            this.ctx.moveTo(mX, mY + currentSpread + 4);
            this.ctx.lineTo(mX, mY + currentSpread + 12);
            // Left
            this.ctx.moveTo(mX - currentSpread - 4, mY);
            this.ctx.lineTo(mX - currentSpread - 12, mY);
            // Right
            this.ctx.moveTo(mX + currentSpread + 4, mY);
            this.ctx.lineTo(mX + currentSpread + 12, mY);
            // Center dot
            this.ctx.fillRect(mX - 1, mY - 1, 2, 2);
            this.ctx.stroke();

            // Reload Indicator next to crosshair
            if (lp.reloadTimer > 0) {
                this.ctx.fillStyle = '#ff7675';
                this.ctx.font = 'bold 12px Arial';
                this.ctx.textAlign = 'center';
                this.ctx.fillText('RELOADING...', mX, mY + currentSpread + 25);

                // Progress arc around crosshair
                const progress = lp.reloadTimer / (lp.maxReloadTime || 60);
                this.ctx.beginPath();
                this.ctx.arc(mX, mY, currentSpread + 15, -Math.PI / 2, (-Math.PI / 2) + (Math.PI * 2 * (1 - progress)));
                this.ctx.strokeStyle = 'rgba(255, 118, 117, 0.5)';
                this.ctx.stroke();
            }

            // --- Draw Hitmarker ---
            if (this.hitmarkerTimer > 0) {
                this.hitmarkerTimer -= 0.016; // Approx 60fps

                this.ctx.save();
                this.ctx.translate(mX, mY);
                this.ctx.strokeStyle = '#fff';
                this.ctx.lineWidth = 3;
                this.ctx.lineCap = 'round';

                const hSize = 12;
                const hGap = 4;

                // Draw X
                this.ctx.beginPath();
                // Top Left
                this.ctx.moveTo(-hGap, -hGap);
                this.ctx.lineTo(-hGap - hSize, -hGap - hSize);
                // Top Right
                this.ctx.moveTo(hGap, -hGap);
                this.ctx.lineTo(hGap + hSize, -hGap - hSize);
                // Bottom Left
                this.ctx.moveTo(-hGap, hGap);
                this.ctx.lineTo(-hGap - hSize, hGap + hSize);
                // Bottom Right
                this.ctx.moveTo(hGap, hGap);
                this.ctx.lineTo(hGap + hSize, hGap + hSize);

                this.ctx.stroke();
                this.ctx.restore();
            }
        }
    }

    drawDecal_LEGACY(d) {
        if (d.type === 'blood') {
            const sprite = this.sprites.blood;
            if (sprite.complete) {
                this.ctx.save();
                this.ctx.translate(d.x, d.y);
                this.ctx.rotate(d.rotation);
                // Fade out based on life
                this.ctx.globalAlpha = Math.min(1, d.life / 2);
                const size = 32;
                this.ctx.drawImage(sprite, -size / 2, -size / 2, size, size);
                this.ctx.restore();
            }
        }
    }

    drawTeamScores(teamScores, width, gameMode) {
        if (!teamScores) return;
        this.ctx.save();
        this.ctx.font = 'bold 24px Courier New';
        this.ctx.textAlign = 'center';

        // Blue Team
        this.ctx.fillStyle = '#4a90e2';
        this.ctx.shadowBlur = 10;
        this.ctx.shadowColor = '#4a90e2';
        const blueScoreDisplay = gameMode === 'tdm' ? Math.floor((teamScores.blue || 0) / 100) : Math.floor(teamScores.blue || 0);
        this.ctx.fillText(blueScoreDisplay, width / 2 - 60, 40);

        // Separator
        this.ctx.fillStyle = '#fff';
        this.ctx.shadowBlur = 0;
        this.ctx.fillText('VS', width / 2, 40);

        // Mode Text
        this.ctx.font = 'bold 12px Courier New';
        const modeText = gameMode === 'control_zone' ? 'ZONE PTS' : 'KILLS';
        this.ctx.fillStyle = '#aaa';
        this.ctx.fillText(modeText, width / 2, 60);

        // Red Team
        this.ctx.font = 'bold 24px Courier New';
        this.ctx.fillStyle = '#e24a4a';
        this.ctx.shadowBlur = 10;
        this.ctx.shadowColor = '#e24a4a';
        const redScoreDisplay = gameMode === 'tdm' ? Math.floor((teamScores.red || 0) / 100) : Math.floor(teamScores.red || 0);
        this.ctx.fillText(redScoreDisplay, width / 2 + 60, 40);
        this.ctx.restore();
    }

    addExplosion(x, y, radius) {
        this.explosions.push({ x, y, radius, life: 1.0 });
        this.shake = 15; // Also trigger a big camera shake!
    }

    applyVisibilityMask(player, mapData) {
        // Collect all line segments that block vision
        const segments = [];

        // Map boundaries
        const mw = mapData.width || 2000;
        const mh = mapData.height || 2000;
        segments.push({ ax: 0, ay: 0, bx: mw, by: 0 });
        segments.push({ ax: mw, ay: 0, bx: mw, by: mh });
        segments.push({ ax: mw, ay: mh, bx: 0, by: mh });
        segments.push({ ax: 0, ay: mh, bx: 0, by: 0 });

        // Add all physical obstacles as vision blockers
        if (mapData.obstacles) {
            for (let obs of mapData.obstacles) {
                const ox = obs.x;
                const oy = obs.y;
                const ow = obs.w;
                const oh = obs.h;
                segments.push({ ax: ox, ay: oy, bx: ox + ow, by: oy });
                segments.push({ ax: ox + ow, ay: oy, bx: ox + ow, by: oy + oh });
                segments.push({ ax: ox + ow, ay: oy + oh, bx: ox, by: oy + oh });
                segments.push({ ax: ox, ay: oy + oh, bx: ox, by: oy });
            }
        }

        // Building Walls (using predefined walls from mapData)
        if (mapData.buildings) {
            for (let b of mapData.buildings) {
                if (b.walls) {
                    for (let w of b.walls) {
                        segments.push({ ax: w.x, ay: w.y, bx: w.x + w.w, by: w.y });           // Top
                        segments.push({ ax: w.x + w.w, ay: w.y, bx: w.x + w.w, by: w.y + w.h }); // Right
                        segments.push({ ax: w.x + w.w, ay: w.y + w.h, bx: w.x, by: w.y + w.h }); // Bottom
                        segments.push({ ax: w.x, ay: w.y + w.h, bx: w.x, by: w.y });           // Left
                    }
                } else {
                    // Fallback to bounds if walls aren't defined
                    const bx = b.bounds.x;
                    const by = b.bounds.y;
                    const bw = b.bounds.w;
                    const bh = b.bounds.h;
                    segments.push({ ax: bx, ay: by, bx: bx + bw, by: by });
                    segments.push({ ax: bx + bw, ay: by, bx: bx + bw, by: by + bh });
                    segments.push({ ax: bx + bw, ay: by + bh, bx: bx, by: by + bh });
                    segments.push({ ax: bx, ay: by + bh, bx: bx, by: by });
                }
            }
        }

        // Get all unique points
        const points = [];
        for (let seg of segments) {
            points.push({ x: seg.ax, y: seg.ay });
            points.push({ x: seg.bx, y: seg.by });
        }

        const normalizeAngle = (a) => {
            while (a < 0) a += Math.PI * 2;
            while (a >= Math.PI * 2) a -= Math.PI * 2;
            return a;
        };

        // Calculate unique angles (3 rays per corner to cleanly sweep edges)
        const uniqueAngles = [];
        for (let j = 0; j < points.length; j++) {
            const p = points[j];
            const angle = Math.atan2(p.y - player.y, p.x - player.x);
            uniqueAngles.push(normalizeAngle(angle - 0.0001));
            uniqueAngles.push(normalizeAngle(angle));
            uniqueAngles.push(normalizeAngle(angle + 0.0001));
        }

        const intersects = [];

        // Raycast logic
        const getIntersection = (angle, segment) => {
            const r_px = player.x;
            const r_py = player.y;
            const r_dx = Math.cos(angle);
            const r_dy = Math.sin(angle);

            const s_px = segment.ax;
            const s_py = segment.ay;
            const s_dx = segment.bx - segment.ax;
            const s_dy = segment.by - segment.ay;

            const T2 = r_dx * s_dy - r_dy * s_dx;
            if (Math.abs(T2) < 0.0001) return null; // Parallel

            const T1 = (s_px - r_px) * s_dy - (s_py - r_py) * s_dx;
            const U1 = (s_px - r_px) * r_dy - (s_py - r_py) * r_dx;

            const t = T1 / T2;
            const u = U1 / T2;

            // t < 0.1 ignores walls exactly clipping the player center to avoid divide-by-zero
            // and prevents rays from hitting walls you are technically standing 'inside' of
            if (t <= 0.1) return null;

            // u bounds slightly relaxed to prevent float precision misses at exact corners
            if (u >= -0.001 && u <= 1.001) {
                return {
                    x: r_px + r_dx * t,
                    y: r_py + r_dy * t,
                    param: t
                };
            }
            return null;
        };

        for (let i = 0; i < uniqueAngles.length; i++) {
            const angle = uniqueAngles[i];
            let closestIntersect = null;

            for (let j = 0; j < segments.length; j++) {
                const intersect = getIntersection(angle, segments[j]);
                if (intersect) {
                    if (!closestIntersect || intersect.param < closestIntersect.param) {
                        closestIntersect = intersect;
                    }
                }
            }

            if (closestIntersect) {
                closestIntersect.angle = angle;
                intersects.push(closestIntersect);
            } else {
                // If the ray completely misses all map bounds (should be impossible, but protects against gaps)
                intersects.push({
                    x: player.x + Math.cos(angle) * 5000,
                    y: player.y + Math.sin(angle) * 5000,
                    angle: angle,
                    param: 5000
                });
            }
        }

        // Sort intersects purely by angle to form the CCW polygon
        intersects.sort((a, b) => a.angle - b.angle);

        // --- 1. Draw the Fog of War shadow overlay ---
        this.ctx.save();

        // Fill the entire screen with the dark shadow overlay
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';
        this.ctx.fillRect(-5000, -5000, 10000, 10000);

        // Change blending mode to "erase" pixels
        this.ctx.globalCompositeOperation = 'destination-out';

        // Draw the vision polygon
        this.ctx.beginPath();
        if (intersects.length > 0) {
            this.ctx.moveTo(intersects[0].x, intersects[0].y);
            for (let i = 1; i < intersects.length; i++) {
                this.ctx.lineTo(intersects[i].x, intersects[i].y);
            }
        }
        this.ctx.closePath();

        // Fill the polygon to erase the shadow in the visible area
        this.ctx.fillStyle = '#fff'; // Color doesn't matter for destination-out
        this.ctx.fill();

        // Restore context to normal blending mode
        this.ctx.restore();

        // --- 2. Apply strict clipping for future drawing operations (Players/Entities) ---
        // We leave the save() open here so it affects subsequent draw calls until restore() is called in the main loop
        this.ctx.save();
        this.ctx.beginPath();
        if (intersects.length > 0) {
            this.ctx.moveTo(intersects[0].x, intersects[0].y);
            for (let i = 1; i < intersects.length; i++) {
                this.ctx.lineTo(intersects[i].x, intersects[i].y);
            }
        }
        this.ctx.closePath();
        this.ctx.clip(); // Restrict entities from rendering outside vision
    }

    drawWaitingScreen(width, height) {
        this.ctx.fillStyle = '#fff';
        this.ctx.font = '24px sans-serif';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('Connecting to server / Waiting for match...', width / 2, height / 2);
    }
    drawPlayerUI(player, isLocal) {
        this.ctx.save();
        this.ctx.translate(player.x, player.y);

        // Health Bar
        if (!player.isDead) {
            this.ctx.fillStyle = '#f00';
            this.ctx.fillRect(-25, -45, 50, 6);
            this.ctx.fillStyle = '#0f0';
            const hpPercent = Math.max(0, player.health) / 100;
            this.ctx.fillRect(-25, -45, 50 * hpPercent, 6);

            // Stamina Bar
            const maxStamina = player.maxStamina || 100;
            const stamina = player.stamina !== undefined ? player.stamina : 100;
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
            this.ctx.fillRect(-25, -36, 50, 4);
            this.ctx.fillStyle = '#ffaa00'; // Orange
            this.ctx.fillRect(-25, -36, 50 * (Math.max(0, stamina) / maxStamina), 4);
        }

        // Name
        this.ctx.fillStyle = player.team === 'blue' ? '#4a90e2' : '#e24a4a';
        if (isLocal) this.ctx.fillStyle = '#fff';
        this.ctx.font = 'bold 14px Courier New';
        this.ctx.textAlign = 'center';
        this.ctx.shadowBlur = 4;
        this.ctx.shadowColor = '#000';
        const displayName = isLocal ? 'YOU' : (player.name || 'Pilot');
        this.ctx.fillText(displayName, 0, -52);
        this.ctx.shadowBlur = 0;

        this.ctx.restore();
    }

    drawPlayer(player, isLocal, isTeammate) {
        this.ctx.save();
        this.ctx.translate(player.x, player.y);

        // Teammate Glow / Highlight
        if (isTeammate && !isLocal && !player.isDead) {
            this.ctx.beginPath();
            this.ctx.arc(0, 0, 26, 0, Math.PI * 2);
            this.ctx.fillStyle = 'rgba(74, 144, 226, 0.15)'; // Subtler glow
            this.ctx.fill();
            // Removed stroke outline as requested
        }

        // Rotation offset to make it face the mouse correctly
        this.ctx.rotate(player.rotation - Math.PI / 2);

        let sprite = player.isDead ? this.sprites.charDead : this.sprites.charNoGun;
        const drawSize = player.isDead ? 128 : 96; // Larger size for dead body

        if (sprite.complete && sprite.naturalWidth > 0) {
            // Draw current weapon if alive BEFORE player sprite (so it is underneath)
            if (!player.isDead && player.currentWeapon) {
                const weaponSprite = this.sprites.weapons[player.currentWeapon];
                if (weaponSprite && weaponSprite.complete) {
                    this.ctx.save();
                    // The character faces "UP" (-Y direction) in local space
                    let swingOffset = 0;
                    const isMelee = ['katana', 'laser_blade', 'chainsaw'].includes(player.currentWeapon);
                    const isChainsaw = player.currentWeapon === 'chainsaw';

                    if (isMelee && player.muzzleFlash && !isChainsaw) {
                        // Use muzzleFlash state (which triggers on fire) to simulate a swing
                        swingOffset = -Math.PI / 3; // 60 degree swing
                    }

                    this.ctx.rotate(Math.PI / 2 + swingOffset);

                    // Weapon specific sizing - scaled up 30% per user request
                    const wType = player.currentWeapon.toLowerCase();
                    let wWidth = 85;
                    let wHeight = 39;

                    if (wType.includes('pistol')) {
                        wWidth = 50; wHeight = 34;
                    } else if (wType.includes('smg') || wType.includes('uzi') || wType.includes('vector') || wType.includes('p90')) {
                        wWidth = 62; wHeight = 36;
                    } else if (wType.includes('sniper') || wType.includes('barrett') || wType.includes('l115')) {
                        wWidth = 127; wHeight = 44;
                    } else if (wType.includes('rifle') || wType.includes('m16') || wType.includes('ak47') || wType.includes('aug') || wType.includes('scar')) {
                        wWidth = 101; wHeight = 44;
                    } else if (wType.includes('shotgun') || wType.includes('spas') || wType.includes('remington')) {
                        wWidth = 94; wHeight = 42;
                    } else if (wType.includes('rpg') || wType.includes('launcher') || wType.includes('bazooka')) {
                        wWidth = 114; wHeight = 55;
                    } else if (wType.includes('minigun') || wType.includes('lmg')) {
                        wWidth = 110; wHeight = 57;
                    } else if (isMelee) {
                        wWidth = 107; wHeight = 49;
                    }

                    let reloadShift = 0;
                    if (player.reloadTimer > 0 && player.maxReloadTime > 0) {
                        const fraction = player.reloadTimer / player.maxReloadTime;
                        reloadShift = -18 * Math.pow(fraction, 3);
                    }

                    // Adjust offset based on size so it stays aligned with hands - moved significantly back per user feedback
                    const weaponOffsetX = (isMelee ? 2 : 6) + reloadShift;
                    const weaponOffsetY = -wHeight / 2 - 2;

                    if (player.currentWeapon === 'mega_bazooka') {
                        this.ctx.filter = 'brightness(0.1) sepia(1) hue-rotate(180deg)'; // very dark tint
                    }
                    this.ctx.drawImage(weaponSprite, weaponOffsetX, weaponOffsetY, wWidth, wHeight);
                    this.ctx.filter = 'none'; // reset filter

                    // Draw Muzzle Flash (still on top of everything) - NO MUZZLE FOR MELEE
                    if (player.muzzleFlash && player.reloadTimer <= 0 && !isMelee) {
                        const muzzleTypeMap = {
                            'm4a1': 'blue', 'scar_h': 'orange', 'aug_a3': 'blue',
                            'p90': 'cyan', 'vector': 'white',
                            'l115a3': 'white', 'barrett': 'red',
                            'remington': 'white', 'spas12': 'white', 'aa12': 'cyan',
                            'rpg7': 'orange', 'minigun': 'blue',
                            'm1911': 'orange', 'glock18': 'blue'
                        };
                        const mType = muzzleTypeMap[player.currentWeapon] || 'blue';
                        const mSprite = this.sprites.muzzles[mType];
                        if (mSprite && mSprite.complete) {
                            const flashSize = 48;
                            this.ctx.drawImage(mSprite, weaponOffsetX + wWidth - 5, weaponOffsetY + wHeight / 2 - flashSize / 2, flashSize, flashSize);
                        }
                    }
                    this.ctx.restore();
                }
            }

            // Draw character sprite AFTER weapon
            this.ctx.drawImage(sprite, -drawSize / 2, -drawSize / 2, drawSize, drawSize);
        } else {
            // Fallback
            this.ctx.fillStyle = player.isDead ? '#444' : (player.team === 'blue' ? '#4a90e2' : '#e24a4a');
            this.ctx.beginPath();
            this.ctx.arc(0, 0, 24, 0, Math.PI * 2);
            this.ctx.fill();
        }

        this.ctx.restore();
    }

    drawProjectile(p) {
        this.ctx.save();
        this.ctx.translate(p.x, p.y);

        this.ctx.rotate(Math.atan2(p.vy, p.vx));

        const weaponData = this.weaponSpriteMap[p.weaponType];

        // Map weapon names to projectile types defined in this.projectileSpriteMap
        let projType = 'bullet';

        // Map weapon names to projectile types defined in this.projectileSpriteMap
        if (p.weaponType === 'tank_1_turret' || p.weaponType === 'tank_2_turret' || p.weaponType === 'tank_3_turret') projType = 'heavy_shell';
        else if (['m4a1', 'scar_h', 'aug_a3', 'p90', 'vector', 'l115a3', 'barrett', 'remington', 'spas12', 'aa12', 'm1911', 'glock18', 'minigun'].includes(p.weaponType)) projType = 'bullet';
        else if (p.weaponType === 'rpg7' || p.weaponType === 'mega_bazooka') projType = 'rocket';
        else if (p.weaponType === 'laser_sniper') projType = 'beam';

        const sprite = this.sprites.projectiles[projType];

        if (sprite && sprite.complete && sprite.naturalWidth !== 0) {
            let w = 24;
            let h = 8;
            if (projType === 'heavy_shell') {
                w = 32;
                h = 16;
            }
            this.ctx.drawImage(sprite, -w / 2, -h / 2, w, h);
        } else {
            // Draw based on weapon type/team fallback
            this.ctx.fillStyle = p.team === 'blue' ? '#74b9ff' : '#ff7675';
            this.ctx.shadowBlur = 15;
            this.ctx.shadowColor = this.ctx.fillStyle;

            if (p.weaponType === 'laser_sniper' || p.weaponType === 'railgun') {
                this.ctx.fillRect(0, -2, 30, 4);
            } else if (p.weaponType === 'plasma_rifle') {
                this.ctx.fillRect(0, -4, 16, 8);
            } else {
                this.ctx.fillRect(0, -3, 10, 6);
            }
        }

        this.ctx.restore();
    }

    drawRobot(robot, localPlayer) {
        const isTeammate = localPlayer && robot.team === localPlayer.team && robot.team !== 'none';

        // If it's a bot, draw it like a player
        if (robot.ownerId === 'bot') {
            // Ensure bots draw their weapon and dead state
            this.drawPlayer(robot, false, isTeammate);

            // Draw Name and Health if teammate and alive
            if (isTeammate && !robot.isDead) {
                this.ctx.save();
                this.ctx.translate(robot.x, robot.y);
                this.ctx.fillStyle = robot.team === 'blue' ? '#4a90e2' : '#e24a4a';
                this.ctx.font = 'bold 12px Courier New';
                this.ctx.textAlign = 'center';
                this.ctx.shadowBlur = 4;
                this.ctx.shadowColor = '#000';
                this.ctx.fillText(`BOT ${robot.id.substring(0, 4)}`, 0, -52);

                // Health Bar
                this.ctx.fillStyle = '#f00';
                this.ctx.fillRect(-20, -45, 40, 5);
                this.ctx.fillStyle = '#0f0';
                const hpPercent = Math.max(0, robot.health) / 200;
                this.ctx.fillRect(-20, -45, 40 * hpPercent, 5);
                this.ctx.restore();
            }
            return;
        }

        this.ctx.save();
        this.ctx.translate(robot.x, robot.y);

        const isTurret = robot.type.startsWith('turret');
        if (isTurret) {
            const baseSprite = this.sprites.turrets[robot.type];
            const barrelSprite = this.sprites.turrets[`${robot.type}_barrel`];

            // Draw Base
            if (baseSprite && baseSprite.complete && baseSprite.naturalWidth > 0) {
                let scale = 1.0;
                if (robot.type === 'turret_1') scale = 1.5;
                if (robot.type === 'turret_2') scale = 1.8;
                if (robot.type === 'turret_3') scale = 2.2;

                const bw = 32 * scale;
                const bh = 32 * scale;
                this.ctx.globalAlpha = 1.0;
                this.ctx.drawImage(baseSprite, -bw / 2, -bh / 2, bw, bh);
            } else {
                // Fallback Base
                this.ctx.fillStyle = '#333';
                this.ctx.beginPath();
                this.ctx.arc(0, 0, 16, 0, Math.PI * 2);
                this.ctx.fill();
            }

            // Health Bar
            const maxH = robot.type === 'turret_1' ? 250 : (robot.type === 'turret_2' ? 450 : 700);
            if (robot.health < maxH) {
                this.ctx.fillStyle = '#f00';
                this.ctx.fillRect(-20, -35, 40, 5);
                this.ctx.fillStyle = '#0f0';
                const hpPercent = Math.max(0, robot.health) / maxH;
                this.ctx.fillRect(-20, -35, 40 * hpPercent, 5);
            }

            // Team Indicator Ring
            this.ctx.beginPath();
            this.ctx.arc(0, 0, 20, 0, Math.PI * 2);
            this.ctx.strokeStyle = robot.team === 'blue' ? 'rgba(74, 144, 226, 0.5)' : 'rgba(226, 74, 74, 0.5)';
            this.ctx.lineWidth = 3;
            this.ctx.stroke();

            // Gun Barrel
            this.ctx.rotate(robot.rotation + Math.PI / 2);
            if (barrelSprite && barrelSprite.complete && barrelSprite.naturalWidth > 0) {
                let scale = 1.0;
                if (robot.type === 'turret_1') scale = 1.5;
                if (robot.type === 'turret_2') scale = 1.8;
                if (robot.type === 'turret_3') scale = 2.2;

                // Approximate bounding boxes for these specific sprites
                const gw = 32 * scale;
                const gh = 16 * scale;

                // Rotates around the center
                this.ctx.drawImage(barrelSprite, -gw / 4, -gh / 2, gw, gh);
            } else {
                this.ctx.fillStyle = '#777';
                this.ctx.fillRect(0, -4, 25, 8);
            }
        } else if (robot.type === 'remote_drone') {
            const droneSize = 48;
            this.ctx.rotate(robot.rotation + Math.PI / 2);

            if (this.sprites.remoteDrone && this.sprites.remoteDrone.complete && this.sprites.remoteDrone.naturalWidth > 0) {
                this.ctx.drawImage(this.sprites.remoteDrone, -droneSize / 2, -droneSize / 2, droneSize, droneSize);
            } else {
                this.ctx.fillStyle = '#0ff';
                this.ctx.beginPath();
                this.ctx.arc(0, 0, 16, 0, Math.PI * 2);
                this.ctx.fill();
            }

            this.ctx.rotate(-robot.rotation); // un-rotate for UI Elements

            // Team Outline/Ring
            this.ctx.beginPath();
            this.ctx.arc(0, 0, 24, 0, Math.PI * 2);
            this.ctx.strokeStyle = robot.team === 'blue' ? 'rgba(74, 144, 226, 0.5)' : 'rgba(226, 74, 74, 0.5)';
            this.ctx.lineWidth = 2;
            this.ctx.stroke();

            // Health Bar
            if (robot.health < 200) {
                this.ctx.fillStyle = '#f00';
                this.ctx.fillRect(-15, -30, 30, 4);
                this.ctx.fillStyle = '#0f0';
                const hpPercent = Math.max(0, robot.health) / 200;
                this.ctx.fillRect(-15, -30, 30 * hpPercent, 4);
            }

        } else {
            // Base Generic Bot
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
        }

        this.ctx.restore();

        // Draw Turret Name if teammate
        if (isTeammate) {
            this.ctx.save();
            this.ctx.translate(robot.x, robot.y);
            this.ctx.fillStyle = robot.team === 'blue' ? '#4a90e2' : '#e24a4a';
            this.ctx.font = 'bold 12px Courier New';
            this.ctx.textAlign = 'center';
            this.ctx.shadowBlur = 4;
            this.ctx.shadowColor = '#000';
            this.ctx.fillText(`${robot.type.toUpperCase()}`, 0, -30);
            this.ctx.restore();
        }
    }

    drawMech(mech, isLocal, gameState) {
        this.ctx.save();
        let drawX = mech.x;
        let drawY = mech.y;

        // Force sync mech position to owner's position if piloted for perfect local prediction
        if (gameState && gameState.players && mech.owner) {
            const owner = gameState.players[mech.owner];
            if (owner) {
                drawX = owner.x;
                drawY = owner.y;
            }
        }

        this.ctx.translate(drawX, drawY);

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

        const maxHealth = {
            'titan': 2000,
            'tank_1': 800,
            'tank_2': 1500,
            'tank_3': 2500
        }[mech.type] || 1000;

        // Draw Health Bar (Smaller and Fixed Width)
        if (mech.state !== 'falling') {
            const barW = 40;
            const barH = 4;
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
            this.ctx.fillRect(-barW / 2, -50, barW, barH);

            const hpPercent = Math.max(0, mech.health) / maxHealth;
            this.ctx.fillStyle = hpPercent > 0.4 ? '#0f0' : (hpPercent > 0.2 ? '#ff0' : '#f00');
            this.ctx.fillRect(-barW / 2, -50, barW * hpPercent, barH);
        }

        // Mech Body Drawing
        if (mech.type.startsWith('tank')) {
            const tkDef = {
                'tank_1': {
                    width: 60, height: 85, bodyColor: '#146a4a', towerColor: '#11a067', botColor: '#1c2f2a', weapon: 'mg',
                    hullSprite: this.sprites.tanks['tank_1_hull'], gunSprite: this.sprites.tanks['tank_1_gun']
                },
                'tank_2': {
                    width: 76, height: 105, bodyColor: '#026031', towerColor: '#00753B', botColor: '#333333', weapon: 'twin',
                    hullSprite: this.sprites.tanks['tank_2_hull'], gunSprite: this.sprites.tanks['tank_2_gun']
                },
                'tank_3': {
                    width: 95, height: 135, bodyColor: '#575d1c', towerColor: '#858d2b', botColor: '#282816', weapon: 'shotgun',
                    hullSprite: this.sprites.tanks['tank_3_hull'], gunSprite: this.sprites.tanks['tank_3_gun']
                }
            }[mech.type] || {
                width: 76, height: 105, bodyColor: '#026031', towerColor: '#00753B', botColor: '#333333', weapon: 'twin',
                hullSprite: this.sprites.tanks['tank_2_hull'], gunSprite: this.sprites.tanks['tank_2_gun']
            };

            // Team Tint ring around base
            this.ctx.beginPath();
            this.ctx.arc(0, 0, Math.max(tkDef.width, tkDef.height) / 1.5, 0, Math.PI * 2);
            this.ctx.strokeStyle = mech.team === 'blue' ? 'rgba(74, 144, 226, 0.4)' : 'rgba(226, 74, 74, 0.4)';
            this.ctx.lineWidth = 4;
            this.ctx.stroke();

            // Use predicted rotation for the local player's turret if available
            let turretRot = mech.turretRot !== undefined ? mech.turretRot : (mech.rotation || 0);
            let recoilOffset = 0;

            if (gameState && gameState.players && mech.owner) {
                const owner = gameState.players[mech.owner];
                if (owner) {
                    // Turret should follow the player's rotation (mouse-driven)
                    turretRot = owner.turretRot !== undefined ? owner.turretRot : owner.rotation;
                    if (owner.muzzleFlash > 0) {
                        recoilOffset = -(owner.muzzleFlash / 0.1) * 3; // SMOOTHER RECOIL (Original was 8)
                    }
                }
            }

            // Call the isolated CodePen rendering logic 
            window.TankEntity.render(this.ctx, mech, tkDef, turretRot, recoilOffset);
        } else {
            // Primitive Titan / Default
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
        }

        this.ctx.restore();
    }

    drawDecal(d) {
        let sprite = null;
        if (d.type === 'blood') sprite = this.sprites.blood;
        if (d.type === 'blood_gore_1') sprite = this.sprites.gore['blood_gore_1'];
        if (d.type === 'blood_gore_2') sprite = this.sprites.gore['blood_gore_2'];

        if (sprite && sprite.complete && sprite.naturalWidth > 0) {
            this.ctx.save();
            this.ctx.translate(d.x, d.y);
            this.ctx.rotate(d.rotation || 0);
            const lifeFactor = Math.min(1.0, d.life);
            this.ctx.globalAlpha = lifeFactor;
            const size = (d.type === 'blood' ? 48 : 64);
            this.ctx.drawImage(sprite, -size / 2, -size / 2, size, size);
            this.ctx.restore();
        }
    }
}
