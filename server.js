// server.js

const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

let players = {};
let leaderboard = [];

// Serve static files from the public directory
app.use(express.static('public'));

// Player management
io.on('connection', (socket) => {
    console.log('A player connected: ' + socket.id);

    // Add new player to players object
    players[socket.id] = { id: socket.id, x: 0, y: 0, score: 0 };

    // Emit updated player list to all clients
    io.emit('updatePlayers', players);

    // Handle player movement
    socket.on('move', (data) => {
        if (players[socket.id]) {
            players[socket.id].x = data.x;
            players[socket.id].y = data.y;
            // Optionally update scores or handle collision detection here
        }
        io.emit('updatePlayers', players);
    });

    // Handle disconnection
    socket.on('disconnect', () => {
        console.log('Player disconnected: ' + socket.id);
        delete players[socket.id];
        io.emit('updatePlayers', players);
    });
});

// Collision detection function (example)
function checkCollisions() {
    // Implement collision detection logic here
}

// Leaderboard update function (example)
function updateLeaderboard() {
    leaderboard = Object.values(players).sort((a, b) => b.score - a.score);
    io.emit('updateLeaderboard', leaderboard);
}

// Server startup
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log('Server is running on port ' + PORT);
});
