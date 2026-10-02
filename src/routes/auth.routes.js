import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import * as authController from '../controllers/auth.controller.js';
import { protect } from '../middlewares/auth.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import { registerSchema, loginSchema } from '../validations/auth.validation.js';
import config from '../config/config.js';
import { HTTP_STATUS } from '../config/constants.js';

const router = Router();

// Stricter rate limiter specifically for authentication endpoints to prevent brute force attacks
const authLimiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.authMaxRequests,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    statusCode: HTTP_STATUS.TOO_MANY_REQUESTS,
    message: 'Too many authentication attempts from this IP address. Please try again later.',
    errors: [],
  },
});

// Apply rate limiter to sensitive endpoints
router.post('/register', authLimiter, validate(registerSchema), authController.register);
router.post('/login', authLimiter, validate(loginSchema), authController.login);
router.post('/logout', authController.logout);

// Protected routes
router.get('/me', protect, authController.getMe);

export default router;
