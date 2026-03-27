const { Server } = require('socket.io');

let io;

const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: '*', // In production, replace with your frontend URL
      methods: ['GET', 'POST']
    }
  });

  io.on('connection', (socket) => {
    // console.log('User connected:', socket.id);

    // Join a specific chat room
    socket.on('join_chat', (chatId) => {
      socket.join(chatId);
      // console.log(`Socket ${socket.id} joined chat: ${chatId}`);
    });

    // Leave a specific chat room
    socket.on('leave_chat', (chatId) => {
      socket.leave(chatId);
      // console.log(`Socket ${socket.id} left chat: ${chatId}`);
    });

    // Handle typing indicator
    socket.on('typing', (data) => {
      socket.to(data.chatId).emit('user_typing', { userId: data.userId });
    });

    socket.on('stop_typing', (data) => {
      socket.to(data.chatId).emit('user_stop_typing', { userId: data.userId });
    });

    socket.on('disconnect', () => {
      // console.log('User disconnected:', socket.id);
    });
  });

  return io;
};

const getIO = () => {
  if (!io) {
    throw new Error('Socket.io not initialized');
  }
  return io;
};

// Emit message to a specific chat room
const emitMessage = (chatId, message) => {
  if (io) {
    io.to(chatId.toString()).emit('new_message', message);
  }
};

// Emit notification to a user
const emitNotification = (userId, notification) => {
  if (io) {
    // Each user should join a room with their userId
    io.to(userId.toString()).emit('new_notification', notification);
  }
};

module.exports = { initSocket, getIO, emitMessage, emitNotification };
