import { Router } from 'express';
import authRoutes from './auth.routes.js';
import userRoutes from './user.routes.js';
import postRoutes from './post.routes.js';
import sendResponse from '../utils/apiResponse.js';
import { HTTP_STATUS } from '../config/constants.js';

const router = Router();

/**
 * Service Health Check Endpoint
 * GET /api/v1/health
 * Used by container orchestrators, load balancers, and uptime monitors.
 */
router.get('/health', (req, res) => {
  return sendResponse(res, {
    statusCode: HTTP_STATUS.OK,
    message: 'Universal MERN API is running healthy.',
    data: {
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
    },
  });
});

/**
 * Application Domain Routes
 * To add a new domain feature, simply import its route and mount it below.
 */
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/posts', postRoutes);

export default router;
