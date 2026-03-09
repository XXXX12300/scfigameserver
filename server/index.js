const express = require('express');
const http = require('http');
const path = require('path');
const { WebSocketServer } = require('ws');
const GameServer = require('./gameServer');

const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server });

app.use(express.static(path.join(__dirname, '../client')));

const gameServer = new GameServer(wss);
gameServer.start();

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});
