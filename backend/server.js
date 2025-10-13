// server.js

// 1️⃣ Packages import karo
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

// 2️⃣ Express app initialize karo
const app = express();
app.use(cors());

// 3️⃣ Simple test route
app.get('/', (req, res) => {
    res.send('Chat server is running');
});

// 4️⃣ HTTP server create karo
const server = http.createServer(app);

// 5️⃣ Socket.IO server initialize karo
const io = new Server(server, {
    cors: { origin: '*' }  // frontend ke liye allow all origins (temporary)
});

// 6️⃣ Listen for socket connections
io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);

    // Receive message from client
    socket.on('sendMessage', (msg) => {
        console.log('Message received:', msg);
        // Broadcast message to all clients
        io.emit('receiveMessage', msg);
    });

    // Disconnect event
    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
    });
});

// 7️⃣ Start server
const PORT = 3001;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));