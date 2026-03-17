import { Server } from 'socket.io';

let io;
const userSockets = new Map(); // Map to store userId -> socketId

export const initSocket = (httpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: process.env.CLIENT_URL || 'http://localhost:5173',
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
      credentials: true,
    },
  });

  io.on('connection', (socket) => {
    console.log(`Socket connected: ${socket.id}`);

    // When a client connects and authenticates, they should emit 'register' with their userId
    socket.on('register', (userId) => {
      console.log(`User ${userId} registered to socket ${socket.id}`);
      userSockets.set(userId, socket.id);
    });

    // Handle updates to worker location to broadcast or keep track
    socket.on('update_location', (data) => {
      // This could store location in memory or broadcast to employer
    });

    socket.on('disconnect', () => {
      console.log(`Socket disconnected: ${socket.id}`);
      // Remove from map
      for (const [userId, socketId] of userSockets.entries()) {
        if (socketId === socket.id) {
          userSockets.delete(userId);
          console.log(`User ${userId} unregistered`);
          break;
        }
      }
    });
  });

  return io;
};

// Emits an event to a specific user
export const emitToUser = (userId, eventName, payload) => {
  if (!io) {
    console.warn('Socket.io not initialized');
    return false;
  }

  const socketId = userSockets.get(userId.toString());
  if (socketId) {
    io.to(socketId).emit(eventName, payload);
    return true;
  }
  
  console.log(`User ${userId} is not connected via socket`);
  return false;
};

export const getIO = () => io;
