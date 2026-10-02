import mongoose from 'mongoose';
import config from './config.js';

/**
 * Connect to MongoDB with robust error handling and lifecycle event listeners.
 */
export const connectDB = async () => {
  try {
    const conn = await mongoose.connect(config.mongodb.uri, {
      autoIndex: config.env !== 'production', // Build indexes in development, avoid overhead in production
    });

    console.log(`✅ MongoDB Connected: ${conn.connection.host} [DB: ${conn.connection.name}]`);

    // Event listeners for ongoing connection states
    mongoose.connection.on('error', (err) => {
      console.error(`❌ MongoDB connection error: ${err.message}`);
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('⚠️ MongoDB disconnected. Attempting reconnection...');
    });

    mongoose.connection.on('reconnected', () => {
      console.log('🔄 MongoDB reconnected successfully.');
    });

    return conn;
  } catch (error) {
    console.error(`❌ MongoDB initial connection failed: ${error.message}`);
    // Exit process with failure so process manager (pm2 / docker / kubernetes) can restart or alert
    process.exit(1);
  }
};

/**
 * Gracefully close MongoDB connection on application shutdown.
 */
export const disconnectDB = async () => {
  try {
    await mongoose.connection.close();
    console.log('🔒 MongoDB connection closed gracefully.');
  } catch (error) {
    console.error(`❌ Error while closing MongoDB connection: ${error.message}`);
  }
};

export default connectDB;
