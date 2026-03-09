class ScoreSystem {
    constructor() {
        this.scores = {}; // playerId -> score
        this.teamScores = { 'red': 0, 'blue': 0 };
    }

    addScore(playerId, points, team) {
        if (!this.scores[playerId]) this.scores[playerId] = 0;
        this.scores[playerId] += points;
        if (team) {
            this.teamScores[team] += points;
        }
        this.checkUnlocks(playerId, this.scores[playerId]);
    }

    checkUnlocks(playerId, currentScore) {
        // Unlock logic
        // 500  → turret
        // 1000 → drone
        // 1500 → walker bot
        // 2500 → mech
        // 4000 → titan mech
    }
}

module.exports = ScoreSystem;
