import dotenv from 'dotenv';
import { NODE_ENVIRONMENTS } from './constants.js';

// Load environment variables from .env file
dotenv.config();

const config = {
  env: process.env.NODE_ENV || NODE_ENVIRONMENTS.DEVELOPMENT,
  port: parseInt(process.env.PORT, 10) || 5000,
  mongodb: {
    uri: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/mern_universal_db',
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'fallback_jwt_secret_key_please_change_in_production',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    cookieExpiresInDays: parseInt(process.env.JWT_COOKIE_EXPIRES_IN_DAYS, 10) || 7,
  },
  cors: {
    frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',
  },
  rateLimit: {
    windowMs: (parseInt(process.env.RATE_LIMIT_WINDOW_MINUTES, 10) || 15) * 60 * 1000,
    maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS, 10) || 100,
    authMaxRequests: parseInt(process.env.AUTH_RATE_LIMIT_MAX_REQUESTS, 10) || 20,
  },
};

// Validate critical production configurations
if (config.env === NODE_ENVIRONMENTS.PRODUCTION) {
  if (!process.env.JWT_SECRET || process.env.JWT_SECRET.includes('change_this')) {
    console.warn('⚠️ WARNING: Using insecure or default JWT_SECRET in production!');
  }
  if (!process.env.MONGODB_URI) {
    console.error('❌ FATAL: MONGODB_URI is required in production environment.');
    process.exit(1);
  }
}

export default config;
