export class PlayerEntity {
    constructor(id) {
        this.id = id;
        this.x = 0;
        this.y = 0;
        this.rotation = 0;
        // Fields for interpolation
        this.targetX = 0;
        this.targetY = 0;
        this.targetRotation = 0;
    }

    update(dt) {
        // Interpolate towards target
        const lerpFactor = 0.3; // tweak based on tick rate
        this.x += (this.targetX - this.x) * lerpFactor;
        this.y += (this.targetY - this.y) * lerpFactor;
    }

    draw(ctx) {
        // Moved from renderer
    }
}
