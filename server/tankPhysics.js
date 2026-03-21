/**
 * LITERAL TRANSLATION of CodePen Tank Physics
 * This module follows the exact logic of the provided snippet.
 */
class TankPhysics {
    static update(player, inputs, dtSec) {
        // Initialize state if first time in tank
        if (player.hullRotation === undefined) player.hullRotation = -1.566; // CodePen heading default
        if (player.vx === undefined) player.vx = 0;
        if (player.vy === undefined) player.vy = 0;

        // --- CodePen: control() ---
        const W = inputs.up;
        const S = inputs.down;
        const A = inputs.left;
        const D = inputs.right;

        // We use isRev to track steering inversion
        if (player.isRev === undefined) player.isRev = false;

        // CodePen: Rotate logic
        let rotateVal = 0.0566; // CodePen rotate value
        // Note: CodePen logic depends on frameRate(60), so we scale by dtSec or use fixed steps
        // To keep it "feel" identical, we simulate the 60fps step if possible
        const steps = 1; // Assuming 60fps server loop, we use raw values or scale

        if (player.isRev === false) {
            if (A) player.hullRotation -= rotateVal;
            if (D) player.hullRotation += rotateVal;
        } else {
            if (A) player.hullRotation += rotateVal;
            if (D) player.hullRotation -= rotateVal;
        }

        // CodePen: Boost Logic (adds to velocity)
        let isBoosting = false;
        if (W) {
            // boost('up') - REDUCED FORCE (Previous was 0.35)
            player.vx += Math.cos(player.hullRotation) * 0.20;
            player.vy += Math.sin(player.hullRotation) * 0.20;
            player.isRev = false;
            isBoosting = true;
        }
        if (S) {
            // boost('rev') - REDUCED FORCE (Previous was -0.8)
            player.vx += Math.cos(player.hullRotation) * -0.5;
            player.vy += Math.sin(player.hullRotation) * -0.5;
            player.isRev = true;
            isBoosting = true;
        }

        // --- CodePen: update() ---
        // if (tank.isBoosting) this.boost('up'); 
        // Note: The CodePen actually adds 'up' force TWICE if W is held (once in control, once in update)
        if (isBoosting && W) {
            player.vx += Math.cos(player.hullRotation) * 0.20;
            player.vy += Math.sin(player.hullRotation) * 0.20;
        }

        // Apply velocities to tentative movement
        const dx = player.vx;
        const dy = player.vy;

        // Friction: tank.vel.mult(0.80);
        player.vx *= 0.80;
        player.vy *= 0.80;

        return { dx, dy };
    }
}

module.exports = TankPhysics;
