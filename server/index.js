const express = require('express');
const http = require('http');
const path = require('path');
const { Server } = require('socket.io');
const GameServer = require('./gameServer');

const fs = require('fs');
const app = express();
const server = http.createServer(app);
app.use(express.json({ limit: '10mb' }));

app.post('/api/maps', (req, res) => {
    const mapId = req.body.id;
    if (!mapId) return res.status(400).send('No map id');
    fs.writeFileSync(path.join(__dirname, 'maps', `${mapId}.json`), JSON.stringify(req.body, null, 2));
    res.json({ success: true, id: mapId });
});

app.get('/api/maps', (req, res) => {
    const mapsDir = path.join(__dirname, 'maps');
    if (!fs.existsSync(mapsDir)) fs.mkdirSync(mapsDir);
    const files = fs.readdirSync(mapsDir).filter(f => f.endsWith('.json'));
    const maps = files.map(f => {
        return JSON.parse(fs.readFileSync(path.join(mapsDir, f)));
    });
    res.json(maps);
});

app.get('/api/assets', (req, res) => {
    const spritesDir = path.join(__dirname, '../client/Sprites');
    let results = [];
    const walk = (dir) => {
        if (!fs.existsSync(dir)) return;
        const list = fs.readdirSync(dir);
        list.forEach(file => {
            const filepath = path.join(dir, file);
            const stat = fs.statSync(filepath);
            const nameLower = file.toLowerCase();
            if (stat && stat.isDirectory()) {
                const blocked = ['player', 'killstreaks', 'muzzles', 'projectiles', 'weapons', 'characters', 'sci-fi turret pack', 'tank', 'effects'];
                if (blocked.includes(nameLower)) return;
                walk(filepath);
            } else if (file.endsWith('.png')) {
                results.push(path.relative(spritesDir, filepath).replace(/\\/g, '/'));
            }
        });
    };
    walk(spritesDir);
    res.json(results);
});

app.use(express.static(path.join(__dirname, '../client')));

const io = new Server(server, {
    transports: ['websocket'],  // Skip HTTP polling, go straight to WebSocket
    pingInterval: 2000,
    pingTimeout: 5000,
    maxHttpBufferSize: 1e6
});

const gameServer = new GameServer(io);
gameServer.start();

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});
