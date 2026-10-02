import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';

import config from './config/config.js';
import { HTTP_STATUS, NODE_ENVIRONMENTS } from './config/constants.js';
import routes from './routes/index.js';
import AppError from './utils/AppError.js';
import errorHandler from './middlewares/error.middleware.js';

const app = express();

// ============================================================================
// 1. GLOBAL SECURITY MIDDLEWARES
// ============================================================================

// Set secure HTTP headers
app.use(helmet());

// Enable Cross-Origin Resource Sharing (CORS) with frontend credentials support
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, Postman)
      if (!origin) return callback(null, true);

      const allowedOrigins = [
        config.cors.frontendUrl,
        'http://localhost:3000',
        'http://localhost:5173',
      ];

      if (allowedOrigins.indexOf(origin) !== -1 || config.env === NODE_ENVIRONMENTS.DEVELOPMENT) {
        callback(null, true);
      } else {
        callback(new AppError('Blocked by CORS policy', HTTP_STATUS.FORBIDDEN));
      }
    },
    credentials: true, // Allow cookies to be sent across origins
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  })
);

// Global Rate Limiter to guard against Brute Force and DoS attacks
const globalLimiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.maxRequests,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    statusCode: HTTP_STATUS.TOO_MANY_REQUESTS,
    message: 'Too many requests from this IP, please try again after 15 minutes.',
    errors: [],
  },
});
app.use('/api', globalLimiter);

// ============================================================================
// 2. REQUEST PARSING & LOGGING MIDDLEWARES
// ============================================================================

// HTTP Request Logging
if (config.env === NODE_ENVIRONMENTS.DEVELOPMENT) {
  app.use(morgan('dev'));
} else {
  // Production: standard Apache combined format
  app.use(morgan('combined'));
}

// Body parsers with payload size limits to prevent denial-of-service
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// Cookie parser for reading JWT tokens from cookies
app.use(cookieParser());

// Custom NoSQL Query Injection Sanitizer
// Removes prohibited operators starting with '$' or containing '.'
const sanitizeNoSql = (obj) => {
  if (obj && typeof obj === 'object') {
    Object.keys(obj).forEach((key) => {
      if (key.startsWith('$') || key.includes('.')) {
        delete obj[key];
      } else {
        sanitizeNoSql(obj[key]);
      }
    });
  }
};

app.use((req, res, next) => {
  if (req.body) sanitizeNoSql(req.body);
  if (req.query) sanitizeNoSql(req.query);
  if (req.params) sanitizeNoSql(req.params);
  next();
});

// ============================================================================
// 3. API ROUTES
// ============================================================================

// Mount central API router under /api/v1
app.use('/api/v1', routes);

// Alias root health check
app.get('/', (req, res) => {
  res.status(HTTP_STATUS.OK).json({
    success: true,
    message: 'Welcome to Universal MERN Backend API. Visit /api/v1/health for status.',
    docs: '/api/v1',
  });
});

// ============================================================================
// 4. ERROR HANDLING FOR UNHANDLED ROUTES & EXCEPTIONS
// ============================================================================

// Catch-all 404 handler for undefined endpoints
app.all('*', (req, res, next) => {
  next(
    new AppError(
      `Cannot find endpoint ${req.method} ${req.originalUrl} on this server.`,
      HTTP_STATUS.NOT_FOUND
    )
  );
});

// Centralized Global Error Handler
app.use(errorHandler);

export default app;
