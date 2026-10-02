/**
 * Application Entry Point
 * Handles uncaught exceptions, initializes DB connection, starts HTTP listener,
 * and sets up graceful shutdown hooks.
 */

// 1. Catch Uncaught Synchronous Exceptions immediately
process.on('uncaughtException', (err) => {
  console.error('💥 UNCAUGHT EXCEPTION! Shutting down immediately...');
  console.error(err.name, err.message);
  console.error(err.stack);
  process.exit(1);
});

import app from './app.js';
import config from './config/config.js';
import { connectDB, disconnectDB } from './config/db.js';

let server;

// 2. Connect to Database and start HTTP server
const startServer = async () => {
  // Connect to MongoDB
  await connectDB();

  // Listen for incoming traffic
  server = app.listen(config.port, () => {
    console.log(`🚀 Server listening on port ${config.port} in [${config.env}] mode`);
    console.log(`🌐 Base API URL: http://localhost:${config.port}/api/v1`);
    console.log(`🩺 Health check: http://localhost:${config.port}/api/v1/health`);
  });
};

startServer();

// 3. Handle Asynchronous Unhandled Promise Rejections
process.on('unhandledRejection', (err) => {
  console.error('💥 UNHANDLED REJECTION! Shutting down gracefully...');
  console.error(err.name, err.message);
  if (server) {
    server.close(() => {
      process.exit(1);
    });
  } else {
    process.exit(1);
  }
});

// 4. Handle OS Termination Signals for Zero-Downtime Graceful Exits (Docker/Kubernetes/Render/Railway)
const gracefulShutdown = async (signal) => {
  console.log(`\n🛑 ${signal} received. Initiating graceful shutdown...`);
  if (server) {
    server.close(async () => {
      console.log('HTTP server closed.');
      await disconnectDB();
      console.log('Process terminated cleanly.');
      process.exit(0);
    });

    // Force close if graceful shutdown takes longer than 10 seconds
    setTimeout(() => {
      console.error('Forced shutdown due to timeout.');
      process.exit(1);
    }, 10000);
  } else {
    process.exit(0);
  }
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
