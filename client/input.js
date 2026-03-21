export class Input {
    constructor(canvas) {
        this.canvas = canvas;
        this.keys = {};
        this.mouse = { x: 0, y: 0, buttons: { left: false, right: false } };

        window.addEventListener('keydown', (e) => {
            if (e.code === 'Tab') e.preventDefault();
            this.keys[e.code] = true;
        });
        window.addEventListener('keyup', (e) => this.keys[e.code] = false);

        canvas.addEventListener('mousemove', (e) => {
            const rect = canvas.getBoundingClientRect();
            const scaleX = canvas.width / rect.width;
            const scaleY = canvas.height / rect.height;
            this.mouse.x = (e.clientX - rect.left) * scaleX;
            this.mouse.y = (e.clientY - rect.top) * scaleY;
        });

        canvas.addEventListener('mousedown', (e) => {
            if (e.button === 0) this.mouse.buttons.left = true;
            if (e.button === 2) this.mouse.buttons.right = true;
        });

        canvas.addEventListener('mouseup', (e) => {
            if (e.button === 0) this.mouse.buttons.left = false;
            if (e.button === 2) this.mouse.buttons.right = false;
        });

        // Prevent context menu
        canvas.addEventListener('contextmenu', e => e.preventDefault());
    }

    getInputs() {
        return {
            up: !!this.keys['KeyW'],
            down: !!this.keys['KeyS'],
            left: !!this.keys['KeyA'],
            right: !!this.keys['KeyD'],
            deploy1: !!this.keys['Digit1'], // Turret
            deploy2: !!this.keys['Digit2'], // Drone
            deploy3: !!this.keys['Digit3'], // Walker
            deploy4: !!this.keys['Digit4'], // Suicide
            deployTitan: !!this.keys['KeyT'], // Titan/Mech
            interact: !!this.keys['KeyE'], // Enter/Exit Mech
            cheatXP: !!this.keys['KeyK'], // Developer XP
            tab: !!this.keys['Tab'], // Scoreboard
            menu: !!this.keys['KeyL'], // Weapon Menu (Loadout)
            reload: !!this.keys['KeyR'], // Manual Reload
            throwGrenade: !!this.keys['KeyG'], // Throw Grenade
            sprint: !!this.keys['ShiftLeft'] || !!this.keys['ShiftRight'], // Sprinting
            mouse: {
                x: this.mouse.x,
                y: this.mouse.y,
                leftDown: this.mouse.buttons.left,
                rightDown: this.mouse.buttons.right
            }
        };
    }
}
