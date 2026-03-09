module.exports = {
    distance(x1, y1, x2, y2) {
        return Math.sqrt((x2-x1)**2 + (y2-y1)**2);
    },
    normalize(vx, vy) {
        const len = Math.sqrt(vx*vx + vy*vy);
        if (len === 0) return {x:0, y:0};
        return {x: vx/len, y: vy/len};
    }
};
