const express = require('express');
const cors = require('cors');

const healthRoutes = require('./routes/healthRoutes');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const clothesRoutes = require('./routes/clothesRoutes');
const postRoutes = require('./routes/postRoutes');
const donationRoutes = require('./routes/donationRoutes');
const swapRoutes = require('./routes/swapRoutes');
const orderRoutes = require('./routes/orderRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const chatRoutes = require('./routes/chatRoutes');

const adminRoutes = require('./routes/adminRoutes');
const reportRoutes = require('./routes/reportRoutes');

const createApp = () => {
  const app = express();

  app.use(cors());
  app.use(express.json());
  
  // Serve uploaded images statically
  const path = require('path');
  app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

  app.use('/api', healthRoutes);
  app.use('/api/auth', authRoutes);
  app.use('/api/users', userRoutes);
  app.use('/api/clothes', clothesRoutes);
  app.use('/api/posts', postRoutes);
  app.use('/api/donations', donationRoutes);
  app.use('/api/swaps', swapRoutes);
  app.use('/api/orders', orderRoutes);
  app.use('/api/notifications', notificationRoutes);
  app.use('/api/reviews', reviewRoutes);
  app.use('/api/chats', chatRoutes);

  app.use('/api/admin', adminRoutes);
app.use('/api/reports', reportRoutes);


  // 404 handler
  app.use((req, res) => {
    res.status(404).json({ message: 'Route not found' });
  });

  // Global error handler
  // eslint-disable-next-line no-unused-vars
  app.use((err, req, res, next) => {
    // eslint-disable-next-line no-console
    console.error('Unhandled error:', err);
    const statusCode = err.statusCode || 500;
    res.status(statusCode).json({
      message: err.message || 'Internal Server Error'
    });
  });

  return app;
};

module.exports = { createApp };
