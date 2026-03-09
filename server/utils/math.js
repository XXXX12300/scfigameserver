const MathUtils = {
    distance(x1, y1, x2, y2) {
        return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
    },
    angleBetween(x1, y1, x2, y2) {
        return Math.atan2(y2 - y1, x2 - x1);
    },
    clamp(val, min, max) {
        return Math.min(Math.max(val, min), max);
    },
    lerp(a, b, t) {
        return a + (b - a) * t;
    }
};

module.exports = MathUtils;
