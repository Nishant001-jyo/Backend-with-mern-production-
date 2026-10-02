import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import config from '../config/config.js';
import AppError from '../utils/AppError.js';
import catchAsync from '../utils/catchAsync.js';
import sendResponse from '../utils/apiResponse.js';
import EmailService from '../services/email.service.js';
import { HTTP_STATUS, NODE_ENVIRONMENTS } from '../config/constants.js';

/**
 * Generate a signed JWT token containing the user's ID
 *
 * @param {string} id - User ObjectId
 * @returns {string} Signed JWT
 */
const signToken = (id) => {
  return jwt.sign({ id }, config.jwt.secret, {
    expiresIn: config.jwt.expiresIn,
  });
};

/**
 * Helper to generate JWT, configure httpOnly cookie, and send standard response.
 *
 * ARCHITECTURAL DESIGN NOTE:
 * We set an httpOnly cookie AND return the token in the JSON body.
 * - Web browsers on same domain or configured CORS can automatically transmit the secure cookie (XSS protection).
 * - Mobile clients, third-party consumers, or cross-origin frontends can use the bearer token in Authorization header.
 * - The protect middleware accepts either method seamlessly.
 */
const createSendToken = (user, statusCode, message, req, res) => {
  const token = signToken(user._id);

  // Cookie options
  const cookieOptions = {
    expires: new Date(
      Date.now() + config.jwt.cookieExpiresInDays * 24 * 60 * 60 * 1000
    ),
    httpOnly: true, // Prevents client-side JS from reading cookie (protects against XSS)
    secure: config.env === NODE_ENVIRONMENTS.PRODUCTION || req.secure || req.headers['x-forwarded-proto'] === 'https',
    sameSite: config.env === NODE_ENVIRONMENTS.PRODUCTION ? 'none' : 'lax',
  };

  res.cookie('token', token, cookieOptions);

  // Clean user object (password excluded via Mongoose toJSON transform)
  const userData = user.toObject ? user.toObject() : user;
  delete userData.password;
  delete userData.__v;

  return sendResponse(res, {
    statusCode,
    message,
    data: {
      user: userData,
      token, // Also returned in body for non-cookie / mobile / Bearer header clients
    },
  });
};

/**
 * Register a new user
 * POST /api/v1/auth/register
 */
export const register = catchAsync(async (req, res, next) => {
  const { name, email, password, role } = req.body;

  // Check if email already registered
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return next(
      new AppError(
        'An account with this email address already exists.',
        HTTP_STATUS.CONFLICT
      )
    );
  }

  // Create new user (role defaults to 'user' unless explicitly provided and valid)
  const newUser = await User.create({
    name,
    email,
    password,
    ...(role && { role }),
  });

  // Asynchronously dispatch welcome email (fire-and-forget, non-blocking)
  EmailService.sendWelcomeEmail(newUser).catch((err) =>
    console.error('Failed to dispatch welcome email:', err.message)
  );

  createSendToken(newUser, HTTP_STATUS.CREATED, 'Account created successfully.', req, res);
});

/**
 * Login user with email and password
 * POST /api/v1/auth/login
 */
export const login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  // 1) Find user and explicitly select password & isActive (since they are hidden by default)
  const user = await User.findOne({ email }).select('+password +isActive');

  // 2) Check if user exists & password matches
  if (!user || !(await user.comparePassword(password, user.password))) {
    return next(
      new AppError(
        'Invalid email or password.',
        HTTP_STATUS.UNAUTHORIZED
      )
    );
  }

  // 3) Check if user is active
  if (!user.isActive) {
    return next(
      new AppError(
        'Your account has been deactivated. Please contact support.',
        HTTP_STATUS.UNAUTHORIZED
      )
    );
  }

  createSendToken(user, HTTP_STATUS.OK, 'Logged in successfully.', req, res);
});

/**
 * Logout current user
 * POST /api/v1/auth/logout
 */
export const logout = catchAsync(async (req, res) => {
  // Clear the authentication cookie
  res.cookie('token', 'loggedout', {
    expires: new Date(Date.now() + 5 * 1000), // Expires in 5 seconds
    httpOnly: true,
  });

  return sendResponse(res, {
    statusCode: HTTP_STATUS.OK,
    message: 'Logged out successfully.',
  });
});

/**
 * Get profile of currently logged-in user
 * GET /api/v1/auth/me
 */
export const getMe = catchAsync(async (req, res) => {
  return sendResponse(res, {
    statusCode: HTTP_STATUS.OK,
    message: 'Current user profile fetched successfully.',
    data: {
      user: req.user,
    },
  });
});
