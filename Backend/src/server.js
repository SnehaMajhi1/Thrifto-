require('dotenv').config();
const http = require('http');
const { createApp } = require('./app');
const { connectDB } = require('./config/db');
const { initSocket } = require('./socket');

const PORT = process.env.PORT || 5000;

const start = async () => {
  try {
    // Connect to MongoDB
    await connectDB();
    
    const app = createApp();
    const server = http.createServer(app);

    // Initialize Socket.io
    const io = initSocket(server);
    app.set('socketio', io);

    server.listen(PORT, () => {
      // eslint-disable-next-line no-console
      console.log(`Thrifto REST + WebSocket backend running on port ${PORT}`);
    });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Failed to start server:', error.message);
    process.exit(1);
  }
};

start();
