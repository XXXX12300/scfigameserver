export class Input {
    constructor(canvas) {
        this.canvas = canvas;
        this.keys = {};
        this.mouse = { x: 0, y: 0, buttons: { left: false, right: false } };

        window.addEventListener('keydown', (e) => this.keys[e.code] = true);
        window.addEventListener('keyup', (e) => this.keys[e.code] = false);

        canvas.addEventListener('mousemove', (e) => {
            const rect = canvas.getBoundingClientRect();
            this.mouse.x = e.clientX - rect.left;
            this.mouse.y = e.clientY - rect.top;
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
            mouse: { ...this.mouse }
        };
    }
}
