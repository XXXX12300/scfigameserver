/**
 * LITERAL TRANSLATION of CodePen Tank Rendering
 */
class TankEntity {
    static render(ctx, mech, tkDef, turretRot, recoilOffset = 0) {
        // Target dimensions from definition
        const targetWidth = tkDef.width || 50;
        const targetHeight = tkDef.height || 50;

        const bodyColor = tkDef.bodyColor || '#026031';
        const towerColor = tkDef.towerColor || '#00753B';
        const botColor = tkDef.botColor || '#333';
        const lightColor = tkDef.lightColor || '#b40000';
        const heading = (mech.hullRot !== undefined) ? mech.hullRot : 0;
        const turretAngle = (turretRot !== undefined) ? turretRot : (mech.turretRot !== undefined ? mech.turretRot : 0);

        ctx.save();

        // --- HULL / BODY ---
        ctx.save();
        // CodePen: rotate(tank.heading + PI / 2)
        ctx.rotate(heading + Math.PI / 2);

        if (tkDef.hullSprite && tkDef.hullSprite.complete && tkDef.hullSprite.naturalWidth !== 0) {
            // SCALE BASED ON HEIGHT (LENGTH) to prevent side-to-side stretching
            const ratio = tkDef.hullSprite.naturalWidth / tkDef.hullSprite.naturalHeight;
            const drawH = targetHeight;
            const drawW = targetHeight * ratio;
            ctx.drawImage(tkDef.hullSprite, -drawW / 2, -drawH / 2, drawW, drawH);
        } else {
            // Centered Fallback Primitives
            ctx.translate(-targetWidth / 2, -targetHeight / 2);
            ctx.fillStyle = bodyColor;
            ctx.fillRect(0, 0, targetWidth, targetHeight);

            // --- TRACKS ---
            ctx.fillStyle = botColor;
            const trackWidth = targetWidth * 0.2;
            ctx.fillRect(0, 0, trackWidth, targetHeight);
            ctx.fillRect(targetWidth - trackWidth, 0, trackWidth, targetHeight);

            // --- LIGHTS ---
            ctx.fillStyle = lightColor;
            const lightW = targetWidth * 0.1;
            const lightH = targetHeight * 0.06;
            ctx.fillRect(targetWidth * 0.24, targetHeight - lightH, lightW, lightH);
            ctx.fillRect(targetWidth * 0.66, targetHeight - lightH, lightW, lightH);
        }
        ctx.restore(); // Pop Hull

        // --- TURRET / TOWER ---
        ctx.save();
        // CodePen: rotate(atan2(mouseY - height / 2, mouseX - width / 2))
        ctx.rotate(turretAngle + Math.PI / 2);

        if (tkDef.gunSprite && tkDef.gunSprite.complete && tkDef.gunSprite.naturalWidth !== 0) {
            // TURRETS: Scale to 85% of targetWidth to look balanced
            const turretBaseWidth = targetWidth * 0.85;
            const ratio = tkDef.gunSprite.naturalHeight / tkDef.gunSprite.naturalWidth;
            const drawW = turretBaseWidth;
            const drawH = turretBaseWidth * ratio;

            ctx.translate(recoilOffset, 0);
            ctx.drawImage(tkDef.gunSprite, -drawW / 2, -drawH / 2, drawW, drawH);
        } else {
            // Centered Fallback Primitives
            ctx.fillStyle = towerColor;
            const barrelLen = targetWidth * 1.0;
            const barrelThickness = targetWidth * 0.2;
            ctx.fillRect(-barrelThickness / 2 + recoilOffset, -barrelThickness / 2, barrelLen, barrelThickness);

            ctx.beginPath();
            const ellipseSize = targetWidth / 1.5;
            ctx.arc(recoilOffset, 0, ellipseSize / 2, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.restore(); // Pop Turret

        ctx.restore(); // Pop Global
    }
}

if (typeof module !== 'undefined') module.exports = TankEntity;
else window.TankEntity = TankEntity;
