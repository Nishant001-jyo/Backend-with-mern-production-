import jwt from 'jsonwebtoken';
import config from '../config/config.js';
import User from '../models/User.js';
import AppError from '../utils/AppError.js';
import catchAsync from '../utils/catchAsync.js';
import { HTTP_STATUS } from '../config/constants.js';

/**
 * Middleware to authenticate requests via JWT.
 * Extracts token from Authorization Bearer header OR from signed/regular cookies.
 */
export const protect = catchAsync(async (req, res, next) => {
  let token;

  // 1) Extract token from Authorization header (Bearer <token>)
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  }
  // 2) Or fallback to cookie if enabled
  else if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  }

  if (!token) {
    return next(
      new AppError(
        'You are not logged in. Please log in to obtain access.',
        HTTP_STATUS.UNAUTHORIZED
      )
    );
  }

  // 3) Verify JWT token
  const decoded = jwt.verify(token, config.jwt.secret);

  // 4) Check if the user still exists in the database
  const currentUser = await User.findById(decoded.id).select('+isActive +passwordChangedAt');
  if (!currentUser) {
    return next(
      new AppError(
        'The user belonging to this token no longer exists.',
        HTTP_STATUS.UNAUTHORIZED
      )
    );
  }

  // 5) Check if user is active / not deactivated
  if (!currentUser.isActive) {
    return next(
      new AppError(
        'This user account has been deactivated. Please contact support.',
        HTTP_STATUS.UNAUTHORIZED
      )
    );
  }

  // 6) Check if user changed password after the token was issued
  if (currentUser.changedPasswordAfter(decoded.iat)) {
    return next(
      new AppError(
        'User recently changed password! Please log in again.',
        HTTP_STATUS.UNAUTHORIZED
      )
    );
  }

  // Grant access: attach user to request object
  req.user = currentUser;
  next();
});

/**
 * Optional authentication middleware:
 * If a token is provided and valid, attaches req.user.
 * If no token is provided, proceeds silently without error.
 */
export const optionalAuth = catchAsync(async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  }

  if (!token) return next();

  try {
    const decoded = jwt.verify(token, config.jwt.secret);
    const currentUser = await User.findById(decoded.id).select('+isActive');
    if (currentUser && currentUser.isActive && !currentUser.changedPasswordAfter(decoded.iat)) {
      req.user = currentUser;
    }
  } catch {
    // If token invalid, ignore and continue as guest
  }

  next();
});

export default protect;
