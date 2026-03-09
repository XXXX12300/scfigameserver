export class HUD {
    constructor(container) {
        this.container = container;
        this.element = document.createElement('div');
        this.element.style.position = 'absolute';
        this.element.style.bottom = '20px';
        this.element.style.left = '20px';
        this.element.style.color = '#fff';
        this.element.style.fontFamily = 'monospace';
        this.element.style.textShadow = '0 0 5px #0ff';
        this.element.innerHTML = `
            <div id="hud-health" style="font-size: 24px; margin-bottom: 5px;">HP: 100</div>
            <div id="hud-weapon" style="font-size: 20px; color: #aaa;">Weapon: Plasma Rifle</div>
            <div id="hud-streak" style="margin-top: 10px; width: 200px; height: 10px; background: #333; border: 1px solid #0ff;">
                <div id="hud-streak-fill" style="width: 0%; height: 100%; background: #0ff; box-shadow: 0 0 10px #0ff;"></div>
            </div>
            <div id="hud-streak-text" style="font-size: 14px; margin-top: 5px;">Next: Drone (1000)</div>
        `;
        this.container.appendChild(this.element);

        this.healthEl = this.element.querySelector('#hud-health');
        this.weaponEl = this.element.querySelector('#hud-weapon');
        this.streakFill = this.element.querySelector('#hud-streak-fill');
        this.streakText = this.element.querySelector('#hud-streak-text');
    }

    update(player) {
        if (!player) return;
        this.healthEl.textContent = `HP: ${Math.max(0, Math.floor(player.health))}`;
        
        let weaponName = 'Unknown';
        if (player.currentWeapon) {
            weaponName = player.currentWeapon.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
        }
        this.weaponEl.textContent = `Weapon: ${weaponName}`;

        const score = player.score || 0;
        let nextStreak = 0;
        let nextName = '';
        if (score < 500) { nextStreak = 500; nextName = 'Turret (Press 1)'; }
        else if (score < 2500) { nextStreak = 2500; nextName = 'Titan (Press T)'; }
        else { nextStreak = score; nextName = 'Max'; }

        if (nextStreak > 0 && nextName !== 'Max') {
            const percent = Math.min(100, (score / nextStreak) * 100);
            this.streakFill.style.width = `${percent}%`;
            this.streakText.textContent = `Score: ${score} - Next: ${nextName}`;
            this.streakFill.style.background = '#0ff';
            this.streakFill.style.boxShadow = '0 0 10px #0ff';
        } else {
            this.streakFill.style.width = '100%';
            this.streakText.textContent = `Score: ${score} - TITAN READY (Press T)`;
            this.streakFill.style.background = '#f0f';
            this.streakFill.style.boxShadow = '0 0 10px #f0f';
        }

        // Interaction Prompt
        if (player.inMech) {
            this.streakText.textContent += ' | Press E to Exit Mech';
        } else {
            this.streakText.textContent += ' | Press E to Enter Nearby Mech';
        }
    }
}
