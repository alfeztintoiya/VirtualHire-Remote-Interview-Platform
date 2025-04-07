const express = require('express');
const http = require('http');
const cors = require('cors');
const { Server } = require('socket.io');

const app = express();

app.use(cors({
    origin: "*",
    methods: ["GET", "POST"]
}));

const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"],
    },
});

io.on("connection", (socket) => {
    console.log("A user Connected:", socket.id);

    socket.on("join", (roomId) => {
        socket.join(roomId);
        console.log(`User ${socket.id} joined room ${roomId}`);
        socket.to(roomId).emit("user-connected", socket.id);
    });

    socket.on("offer", (data) => {
        console.log("Received offer from", socket.id, "for target", data.target);
        socket.to(data.target).emit("offer", { sdp: data.sdp, caller: socket.id });
    });

    socket.on("answer", (data) => {
        console.log("Received answer from", socket.id, "for target", data.target);
        socket.to(data.target).emit("answer", { sdp: data.sdp, caller: socket.id });
    });

    socket.on("ice-candidate", (data) => {
        console.log("Received ICE candidate from", socket.id, "for target", data.target);
        socket.to(data.target).emit("ice-candidate", { candidate: data.candidate, caller: socket.id });
    });

    socket.on("disconnect", () => {
        console.log("User Disconnected:", socket.id);
    });
});

const PORT = 8013;
server.listen(PORT, () => console.log(`Signaling Server running on port ${PORT}`));
