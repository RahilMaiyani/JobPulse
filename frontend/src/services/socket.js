import { io } from 'socket.io-client';

let socket = null;

export const getSocket = () => {
    if (!socket) {
        const token = localStorage.getItem('token');
        const backendUrl = import.meta.env.VITE_API_URL
            ? import.meta.env.VITE_API_URL.replace(/\/api\/?$/, "")
            : `http://${window.location.hostname}:5000`;

        socket = io(backendUrl, {
            auth: { token },
            autoConnect: true,
            transports: ['websocket', 'polling'],
        });

        socket.on('connect', () => {
            console.log(`[Socket.io] Connected to Server! Socket ID:`, socket.id);
        });

        socket.on('connect_error', (err) => {
            console.warn(`[Socket.io] Connection Error:`, err.message);
        });
    }

    return socket;
}