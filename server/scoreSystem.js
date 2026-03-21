class ScoreSystem {
    constructor(room) {
        this.room = room;
        this.scores = {}; // playerId -> score
        this.teamScores = { 'red': 0, 'blue': 0 };
    }

    addScore(playerId, points, team) {
        if (!this.scores[playerId]) this.scores[playerId] = 0;
        this.scores[playerId] += points;
        if (team) {
            this.teamScores[team] += points;
            this.checkWinCondition(team);
        }
        this.checkUnlocks(playerId, this.scores[playerId]);
    }

    checkWinCondition(team) {
        if (!this.room) return;

        // Match conditions: if TDM count kills (1 kill = 100 points, so limit * 100)
        // If Control Zone, count point ticks
        const pointsNeeded = this.room.gameMode === 'tdm' ? (this.room.scoreLimit * 100) : this.room.scoreLimit;

        if (this.teamScores[team] >= pointsNeeded) {
            this.room.endMatch(team);
        }
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
