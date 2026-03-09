const GameRoom = require('./rooms/gameRoom');

class Matchmaking {
    constructor() {
        this.waitingPlayers = [];
        this.rooms = [];
        this.playersPerRoom = 16; // 8v8 team deathmatch
        this.roomIdCounter = 1;
    }

    addPlayer(ws) {
        const playerProfile = { ws, id: this.generateId() };
        this.waitingPlayers.push(playerProfile);
        this.sendRoomList(ws);
    }

    removePlayer(ws) {
        this.waitingPlayers = this.waitingPlayers.filter(p => p.ws !== ws);
        // Cleanup empty rooms
        this.rooms = this.rooms.filter(r => r.getPlayersCount() > 0);
    }

    getRoom(roomId) {
        return this.rooms.find(r => r.id === roomId);
    }

    handleMessage(ws, data) {
        if (data.type === 'get_rooms') {
            this.sendRoomList(ws);
        }
        else if (data.type === 'create_room') {
            const roomId = `room_${this.roomIdCounter++}`;
            const room = new GameRoom(roomId, data.roomName, data.mapId, data.addBots);
            this.rooms.push(room);
            
            // Auto join the host
            this.joinRoom(ws, roomId, data.playerName);
            this.broadcastRoomList();
        }
        else if (data.type === 'join_room') {
            this.joinRoom(ws, data.roomId, data.playerName);
            this.broadcastRoomList();
        }
    }

    joinRoom(ws, roomId, playerName) {
        const room = this.getRoom(roomId);
        if (!room) return;
        
        // Remove from waiting
        const player = this.waitingPlayers.find(p => p.ws === ws) || { id: this.generateId() };
        this.waitingPlayers = this.waitingPlayers.filter(p => p.ws !== ws);
        
        ws.roomId = roomId;
        room.addPlayer(ws, player.id, playerName);
    }

    sendRoomList(ws) {
        const list = this.rooms.map(r => ({
            id: r.id,
            name: r.name,
            map: r.mapId,
            players: r.getPlayersCount(),
            maxPlayers: r.maxPlayers
        }));
        if (ws.readyState === 1) ws.send(JSON.stringify({ type: 'room_list', rooms: list }));
    }

    broadcastRoomList() {
        for (let p of this.waitingPlayers) {
            this.sendRoomList(p.ws);
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
