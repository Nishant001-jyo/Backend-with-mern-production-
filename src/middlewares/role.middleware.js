import AppError from '../utils/AppError.js';
import { HTTP_STATUS } from '../config/constants.js';

/**
 * Middleware to restrict route access based on user role(s).
 * Must be used AFTER the protect middleware.
 *
 * @param  {...string} roles - Permitted roles (e.g. 'admin', 'user')
 * @returns {Function} Express middleware
 */
export const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return next(
        new AppError(
          'You do not have permission to perform this action.',
          HTTP_STATUS.FORBIDDEN
        )
      );
    }
    next();
  };
};

export default restrictTo;
