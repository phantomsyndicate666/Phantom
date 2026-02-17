const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Basic server settings
const PORT = process.env.PORT || 3000;

global.players = {};

// Serve static files
app.use(express.static('public'));

// Map generation function
function generateMap() {
    const map = [];
    for (let i = 0; i < 10; i++) {
        map.push([]);
        for (let j = 0; j < 10; j++) {
            map[i][j] = Math.random() > 0.5 ? 1 : 0; // 1 = land, 0 = water
        }
    }
    return map;
}

// Socket.io connection
io.on('connection', (socket) => {
    console.log('A player connected: ' + socket.id);

    // Initialize player
    players[socket.id] = {
        id: socket.id,
        x: Math.random() * 100,
        y: Math.random() * 100,
    };

    // Send current player data
    socket.emit('init', players[socket.id]);

    // Broadcast new player to all other players
    socket.broadcast.emit('newPlayer', players[socket.id]);

    // Handle player movement
    socket.on('move', (direction) => {
        if (direction === 'left') players[socket.id].x--;
        if (direction === 'right') players[socket.id].x++;
        if (direction === 'up') players[socket.id].y--;
        if (direction === 'down') players[socket.id].y++;

        // Broadcast updated player position
        socket.broadcast.emit('playerMoved', players[socket.id]);
    });

    // Handle player disconnection
    socket.on('disconnect', () => {
        console.log('Player disconnected: ' + socket.id);
        delete players[socket.id];
        socket.broadcast.emit('playerDisconnected', socket.id);
    });
});

server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    generateMap(); // Generate the map on server start
});