const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI;
    
    if (!mongoUri) {
      throw new Error('MONGODB_URI is not defined in environment variables');
    }

    mongoose.set('strictQuery', true);
    
    const conn = await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });

    // eslint-disable-next-line no-console
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    
    return {
      connected: true,
      host: conn.connection.host,
      name: conn.connection.name
    };
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(`MongoDB Connection Error: ${error.message}`);
    throw error;
  }
};

module.exports = { connectDB };
