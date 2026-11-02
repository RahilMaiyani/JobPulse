const { Server } = require("socket.io");
const jwt = require('jsonwebtoken');

let io = null;

const initSocket = (httpServer) => {
    io = new Server(httpServer, {
        cors: {
            origin: [
                'http://localhost:5173',
                'http://127.0.0.1:5173',
                process.env.CLIENT_URL,
            ].filter(Boolean),
            credentials: true,
        },
    });

    io.use((socket, next) => {
        const token = socket.handshake.auth?.token;
        if (!token) {
            return next(new Error("Authentication error: Token required"));
        }

        try {
            const secret = process.env.JWT_SECRET || process.env.ACCESS_TOKEN_SECRET;
            const decoded = jwt.verify(token, secret);
            socket.userId = decoded.id;
            next();
        }
        catch (err) {
            return next(new Error("Authentication error: Invalid token"));
        }
    });

    io.on('connection', (socket) => {
        const userRoom = `user:${socket.userId}`;
        socket.join(userRoom);
        console.log(`[Socket.io] Candidate connected: ${socket.userId} (Joined ${userRoom})`);

        socket.on('disconnect', () => {
            console.log(`[Socket.io] Candidate disconnected: ${socket.userId}`);
        });
    });

    return io;
};

const getIO = () => {
    if (!io) {
        throw new Error("Socket.io has not been initialized yet!");
    }
    return io;
}

module.exports = { initSocket, getIO };