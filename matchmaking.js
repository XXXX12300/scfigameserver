const GameRoom = require('./rooms/gameRoom');

class Matchmaking {
    constructor() {
        this.waitingPlayers = [];
        this.rooms = [];
        this.playersPerRoom = 16; // 8v8 team deathmatch
        this.roomIdCounter = 1;
    }

    addPlayer(ws) {
        // Create an initial player profile
        const playerProfile = { ws, id: this.generateId() };
        this.waitingPlayers.push(playerProfile);
        
        // Notify player they are in lobby
        ws.send(JSON.stringify({ type: 'lobby', status: 'waiting', playersJoined: this.waitingPlayers.length, playersNeeded: this.playersPerRoom }));

        this.tryCreateRoom();
    }

    removePlayer(ws) {
        this.waitingPlayers = this.waitingPlayers.filter(p => p.ws !== ws);
        // Also remove from rooms if needed
        for (let room of this.rooms) {
            room.removePlayer(ws);
        }
        // Cleanup empty rooms
        this.rooms = this.rooms.filter(r => r.getPlayersCount() > 0);
    }

    tryCreateRoom() {
        // For testing, even 1 player creates a room. In prod: >= this.playersPerRoom
        if (this.waitingPlayers.length >= 1) { 
            const playersForRoom = this.waitingPlayers.splice(0, this.playersPerRoom);
            const room = new GameRoom(`room_${this.roomIdCounter++}`);
            
            for (let p of playersForRoom) {
                room.addPlayer(p.ws, p.id);
            }

            room.initMatch();
            this.rooms.push(room);
        }
    }

    updateRooms(dt) {
        for (let room of this.rooms) {
            room.update(dt);
        }
    }

    generateId() {
        return Math.random().toString(36).substr(2, 9);
    }
}

module.exports = Matchmaking;
