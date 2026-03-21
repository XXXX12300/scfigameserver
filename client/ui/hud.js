export class HUD {
    constructor(container) {
        this.container = container;
        this.element = document.createElement('div');
        this.element.style.position = 'absolute';
        this.element.style.bottom = '20px';
        this.element.style.left = '20px';
        this.element.style.color = '#fff';
        this.element.style.fontFamily = 'monospace';
        this.element.style.display = 'none'; // Hidden until match starts
        this.element.innerHTML = `
            <div style="display: flex; align-items: flex-end; gap: 20px;">
                <div>
                    <div id="hud-health" style="font-size: 24px; margin-bottom: 5px; font-weight: bold; text-shadow: 1px 1px 2px #000;">HP: 100</div>
                    <div id="hud-weapon" style="font-size: 18px; color: #aaa; text-shadow: 1px 1px 2px #000;">Weapon: Plasma Rifle</div>
                </div>
                <div id="hud-streak-container" style="position: relative; width: 64px; height: 64px; filter: drop-shadow(0 0 5px rgba(0,0,0,0.5));">
                    <svg width="64" height="64" viewBox="0 0 64 64" style="transform: rotate(-90deg);">
                        <circle cx="32" cy="32" r="28" fill="rgba(0,0,0,0.5)" stroke="#333" stroke-width="4"/>
                        <circle id="hud-streak-ring" cx="32" cy="32" r="28" fill="none" stroke="#0ff" stroke-width="4" stroke-dasharray="176" stroke-dashoffset="176" style="transition: stroke-dashoffset 0.3s ease-out;" />
                    </svg>
                    <img id="hud-streak-icon" src="" style="position: absolute; top: 16px; left: 16px; width: 32px; height: 32px; object-fit: contain; opacity: 0.5;">
                </div>
            </div>
            <div id="hud-streak-text" style="font-size: 14px; margin-top: 5px; color: #0ff; font-weight: bold; text-shadow: 1px 1px 2px #000; text-align: right; width: 100%;">0 / 3 KILLS</div>
        `;
        this.container.appendChild(this.element);

        // HTML Score UI has been removed because renderer.js handles it drawn directly to the Canvas.

        this.healthEl = this.element.querySelector('#hud-health');
        this.weaponEl = this.element.querySelector('#hud-weapon');
        this.streakRing = this.element.querySelector('#hud-streak-ring');
        this.streakIcon = this.element.querySelector('#hud-streak-icon');
        this.streakText = this.element.querySelector('#hud-streak-text');

        this.spriteMap = {
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
            'chainsaw': 'ERA CHAINSAW.png'
        };

        this.onWeaponSelect = null;
        this.createWeaponMenu();
    }

    createWeaponMenu() {

        this.weaponMenu = document.createElement('div');
        this.weaponMenu.id = 'weapon-menu';
        this.weaponMenu.style.position = 'absolute';
        this.weaponMenu.style.top = '50%';
        this.weaponMenu.style.left = '50%';
        this.weaponMenu.style.transform = 'translate(-50%, -50%)';
        this.weaponMenu.style.background = 'rgba(10, 10, 20, 0.98)';
        this.weaponMenu.style.padding = '40px';
        this.weaponMenu.style.border = '1px solid #444';
        this.weaponMenu.style.boxShadow = '0 10px 30px rgba(0, 0, 0, 0.8)';
        this.weaponMenu.style.display = 'none';
        this.weaponMenu.style.flexDirection = 'column';
        this.weaponMenu.style.gap = '30px';
        this.weaponMenu.style.zIndex = '1000';
        this.weaponMenu.style.fontFamily = 'monospace';
        this.weaponMenu.style.pointerEvents = 'auto'; // Critically important for clicking
        this.weaponMenu.style.minWidth = '800px';

        const title = document.createElement('h1');
        title.style.margin = '0';
        title.style.color = '#fff';
        title.style.textAlign = 'center';
        title.style.fontSize = '36px';
        title.style.letterSpacing = '8px';
        title.textContent = 'SELECT LOADOUT';
        this.weaponMenu.appendChild(title);

        const weaponsArr = [
            { id: 'm4a1', name: 'M4A1', category: 'Assault Rifles', type: 'Assault' },
            { id: 'scar_h', name: 'SCAR-H', category: 'Assault Rifles', type: 'Heavy' },
            { id: 'aug_a3', name: 'AUG A3', category: 'Assault Rifles', type: 'Tactical' },
            { id: 'p90', name: 'P90', category: 'Submachine Guns', type: 'High Capacity' },
            { id: 'vector', name: 'Vector', category: 'Submachine Guns', type: 'Fast Fire' },
            { id: 'l115a3', name: 'L115A3', category: 'Sniper Rifles', type: 'Bolt-Action' },
            { id: 'barrett', name: 'Barrett .50', category: 'Sniper Rifles', type: 'Anti-Materiel' },
            { id: 'remington', name: 'Remington', category: 'Shotguns', type: 'Pump-Action' },
            { id: 'spas12', name: 'Spas-12', category: 'Shotguns', type: 'Semi-Auto' },
            { id: 'aa12', name: 'AA-12', category: 'Shotguns', type: 'Full-Auto' },
            { id: 'rpg7', name: 'RPG-7', category: 'Heavy Weapons', type: 'Launcher' },
            { id: 'minigun', name: 'Minigun', category: 'Heavy Weapons', type: 'Rotary' },
            { id: 'm1911', name: 'M1911', category: 'Sidearms', type: 'Pistol' },
            { id: 'glock18', name: 'Glock 18', category: 'Sidearms', type: 'Auto-Pistol' },
            { id: 'katana', name: 'Katana', category: 'Melee', type: 'Blade' },
            { id: 'laser_blade', name: 'Laser Blade', category: 'Melee', type: 'Energy' },
            { id: 'chainsaw', name: 'Chainsaw', category: 'Melee', type: 'Industrial' },
            // Killstreaks
            { id: 'turret_1', name: 'Light Turret', category: 'Killstreaks', type: 'Deployable (3 Kills)' },
            { id: 'turret_2', name: 'Plasma Turret', category: 'Killstreaks', type: 'Deployable (5 Kills)' },
            { id: 'turret_3', name: 'Laser Turret', category: 'Killstreaks', type: 'Deployable (7 Kills)' },
            { id: 'mega_bazooka', name: 'Mega Bazooka', category: 'Killstreaks', type: 'Weapon Override (5 Kills)' },
            { id: 'tank_1', name: 'Recon Tank', category: 'Killstreaks', type: 'Vehicle (5 Kills)' },
            { id: 'remote_drone', name: 'Remote Drone', category: 'Killstreaks', type: 'Remote (6 Kills)' },
            { id: 'tank_2', name: 'Battle Tank', category: 'Killstreaks', type: 'Vehicle (8 Kills)' },
            { id: 'tank_3', name: 'Siege Tank', category: 'Killstreaks', type: 'Vehicle (12 Kills)' }
        ];

        const categories = {};
        weaponsArr.forEach(w => {
            if (!categories[w.category]) categories[w.category] = [];
            categories[w.category].push(w);
        });

        const tabContainer = document.createElement('div');
        tabContainer.style.display = 'flex';
        tabContainer.style.justifyContent = 'center';
        tabContainer.style.gap = '10px';
        tabContainer.style.flexWrap = 'wrap';
        tabContainer.style.marginBottom = '20px';
        this.weaponMenu.appendChild(tabContainer);

        const contentArea = document.createElement('div');
        contentArea.style.flexGrow = '1';
        contentArea.style.minHeight = '300px';
        this.weaponMenu.appendChild(contentArea);

        const categoryGrids = {};

        for (let catName in categories) {
            const tabBtn = document.createElement('button');
            tabBtn.textContent = catName.toUpperCase();
            tabBtn.style.padding = '8px 15px';
            tabBtn.style.background = 'transparent';
            tabBtn.style.color = '#fff';
            tabBtn.style.border = '1px solid #333';
            tabBtn.style.cursor = 'pointer';
            tabBtn.style.fontSize = '12px';
            tabBtn.style.transition = 'all 0.2s';

            const grid = document.createElement('div');
            grid.style.display = 'none'; // Hidden by default
            grid.style.gridTemplateColumns = 'repeat(3, 1fr)';
            grid.style.gap = '15px';
            contentArea.appendChild(grid);
            categoryGrids[catName] = { grid, tabBtn };

            categories[catName].forEach(w => {
                const btn = document.createElement('button');
                btn.style.padding = '10px';
                btn.style.background = 'rgba(20, 20, 30, 0.9)';
                btn.style.color = '#fff';
                btn.style.border = '1px solid #333';
                btn.style.borderRadius = '5px';
                btn.style.cursor = 'pointer';
                btn.style.transition = 'all 0.2s';
                btn.style.display = 'flex';
                btn.style.flexDirection = 'column';
                btn.style.alignItems = 'center';

                let iconUrl = `/Sprites/Weapons/${this.spriteMap[w.id] || w.id + '.png'}`;
                if (w.category === 'Killstreaks') {
                    if (w.id.startsWith('turret')) iconUrl = `/Sprites/Sci-Fi Turret Pack/autocannon/autocannon2.png`;
                    if (w.id === 'tank_1') iconUrl = `/Sprites/TANK/Hulls_Color_A/Hull_01.png`;
                    if (w.id === 'tank_2') iconUrl = `/Sprites/TANK/Hulls_Color_A/Hull_03.png`;
                    if (w.id === 'tank_3') iconUrl = `/Sprites/TANK/Hulls_Color_A/Hull_06.png`;
                    if (w.id === 'mega_bazooka') iconUrl = `/Sprites/Weapons/ERA SEMI RPG.png`;
                    if (w.id === 'remote_drone') iconUrl = `/Sprites/remoterobot.png`;
                }
                btn.innerHTML = `
                    <img src="${iconUrl}" style="width: 80px; height: 40px; object-fit: contain; margin-bottom: 8px;">
                    <div style="font-weight: bold; font-size: 14px;">${w.name}</div>
                    <div style="font-size: 10px; color: #888;">${w.type}</div>
                `;

                btn.onmouseover = () => {
                    btn.style.borderColor = '#0ff';
                    btn.style.background = 'rgba(0, 255, 255, 0.1)';
                };
                btn.onmouseout = () => {
                    btn.style.borderColor = '#333';
                    btn.style.background = 'rgba(20, 20, 30, 0.9)';
                };
                btn.onclick = (e) => {
                    e.preventDefault();
                    if (w.category === 'Killstreaks') {
                        if (this.onKillstreakSelect) this.onKillstreakSelect(w.id);
                    } else {
                        if (this.onWeaponSelect) this.onWeaponSelect(w.id);
                    }
                    this.hideWeaponMenu();
                };
                grid.appendChild(btn);
            });

            tabBtn.onclick = () => {
                // Hide all grids, reset all tabs
                for (let c in categoryGrids) {
                    categoryGrids[c].grid.style.display = 'none';
                    categoryGrids[c].tabBtn.style.background = 'transparent';
                    categoryGrids[c].tabBtn.style.borderColor = '#333';
                    categoryGrids[c].tabBtn.style.color = '#fff';
                }
                // Show current
                grid.style.display = 'grid';
                tabBtn.style.background = 'rgba(0, 255, 255, 0.2)';
                tabBtn.style.borderColor = '#0ff';
                tabBtn.style.color = '#0ff';
            };

            tabContainer.appendChild(tabBtn);
        }

        // Default to first category
        const firstCat = Object.keys(categories)[0];
        if (firstCat) {
            categoryGrids[firstCat].grid.style.display = 'grid';
            categoryGrids[firstCat].tabBtn.style.background = 'rgba(0, 255, 255, 0.2)';
            categoryGrids[firstCat].tabBtn.style.borderColor = '#0ff';
            categoryGrids[firstCat].tabBtn.style.color = '#0ff';
        }

        const closeBtn = document.createElement('button');
        closeBtn.textContent = 'BACK TO COMBAT';
        closeBtn.style.marginTop = '25px';
        closeBtn.style.padding = '10px 20px';
        closeBtn.style.background = 'transparent';
        closeBtn.style.border = '1px solid #0ff';
        closeBtn.style.color = '#0ff';
        closeBtn.style.cursor = 'pointer';
        closeBtn.style.fontWeight = 'bold';
        closeBtn.onclick = () => this.hideWeaponMenu();
        this.weaponMenu.appendChild(closeBtn);

        this.container.appendChild(this.weaponMenu);
    }

    selectWeapon(id) {
        if (this.onWeaponSelect) this.onWeaponSelect(id);
        this.hideWeaponMenu();
    }

    showWeaponMenu() {
        this.weaponMenu.style.display = 'flex';
    }

    hideWeaponMenu() {
        this.weaponMenu.style.display = 'none';
        // Ensure game canvas gets focus back if needed, but usually it works fine
    }

    toggleWeaponMenu() {
        if (this.weaponMenu.style.display === 'none') {
            this.showWeaponMenu();
        } else {
            this.hideWeaponMenu();
        }
    }

    show() {
        this.element.style.display = 'block';
    }

    hide() {
        this.element.style.display = 'none';
        this.hideWeaponMenu();
    }

    update(player) {
        if (!player) return;
        this.healthEl.textContent = `HP: ${Math.max(0, Math.floor(player.health))}`;

        let weaponName = 'Unknown';
        if (player.currentWeapon) {
            weaponName = player.currentWeapon.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
        }

        const ammoInfo = player.isReloading ? 'RELOADING...' : `AMMO: ${player.ammo}/${player.maxAmmo}`;
        this.weaponEl.innerHTML = `
            <div>${weaponName}</div>
            <div style="font-size: 16px; color: #0ff; margin-top: 5px;">${ammoInfo}</div>
        `;

        const currentStreak = player.currentStreak || 0;
        const selectedStreak = player.selectedKillstreak || 'turret_1';

        // Set the icon
        let iconUrl = `/Sprites/Weapons/${this.spriteMap[selectedStreak] || selectedStreak + '.png'}`;
        if (selectedStreak.startsWith('turret')) iconUrl = `/Sprites/Sci-Fi Turret Pack/autocannon/autocannon2.png`;
        if (selectedStreak.startsWith('tank')) iconUrl = `/Sprites/Sci-Fi Turret Pack/autocannon/autocannon2.png`; // Fallback icon
        if (selectedStreak === 'mega_bazooka') iconUrl = `/Sprites/Weapons/ERA SEMI RPG.png`;
        if (selectedStreak === 'remote_drone') iconUrl = `/Sprites/remoterobot.png`;

        // Robust check to avoid infinite downloads (resolving relative to absolute for comparison)
        const absoluteIconUrl = new URL(iconUrl, window.location.origin).href;
        if (this.streakIcon.src !== absoluteIconUrl) {
            this.streakIcon.src = absoluteIconUrl;
        }

        // Define thresholds based on the exact specifications
        let requiredKills = 3;
        if (selectedStreak === 'turret_1') requiredKills = 3;
        if (selectedStreak === 'turret_2') requiredKills = 5;
        if (selectedStreak === 'turret_3') requiredKills = 7;
        if (selectedStreak === 'tank_1') requiredKills = 5;
        if (selectedStreak === 'tank_2') requiredKills = 8;
        if (selectedStreak === 'tank_3') requiredKills = 12;
        if (selectedStreak === 'mega_bazooka') requiredKills = 5;
        if (selectedStreak === 'remote_drone') requiredKills = 6;

        let killRatio = Math.min(currentStreak / requiredKills, 1.0);

        // SVG circumference for r=28 is 2 * PI * 28 = ~175.92 => 176
        const circumference = 176;
        const dashoffset = circumference - (killRatio * circumference);
        this.streakRing.style.strokeDashoffset = dashoffset;

        if (killRatio >= 1.0) {
            this.streakRing.style.stroke = '#f0f';
            this.streakIcon.style.opacity = '1.0';
            this.streakIcon.style.filter = 'drop-shadow(0 0 5px #f0f)';
            this.streakText.textContent = `READY (KEY 1)`;
            this.streakText.style.color = '#f0f';
        } else {
            this.streakRing.style.stroke = '#0ff';
            this.streakIcon.style.opacity = '0.5';
            this.streakIcon.style.filter = 'none';
            this.streakText.textContent = `${currentStreak} / ${requiredKills} KILLS`;
            this.streakText.style.color = '#0ff';
        }

        // Interaction Prompt
        if (player.inMech) {
            this.streakText.textContent += ' | Press E to Exit Mech';
        } else {
            this.streakText.textContent += ' | Press E to Enter Nearby Mech';
        }

        // Hack to update team scores if available in a global state or passed differently
        // For now, let's assume we can get it from the game client instance if we had access, 
        // but since we are in HUD, maybe we just let Renderer handle it as it's already implemented there.
        // Actually, the user asked for it "above the screen in the center".
        // My Renderer already does this in drawTeamScores. So HUD doesn't STRICTLY need it now.
    }
}
