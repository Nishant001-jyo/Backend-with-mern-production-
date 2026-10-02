import AppError from '../utils/AppError.js';
import config from '../config/config.js';
import { HTTP_STATUS, NODE_ENVIRONMENTS } from '../config/constants.js';

/**
 * Handle invalid MongoDB ObjectId cast errors
 */
const handleCastErrorDB = (err) => {
  const message = `Invalid ${err.path}: ${err.value}`;
  return new AppError(message, HTTP_STATUS.BAD_REQUEST);
};

/**
 * Handle duplicate field values in MongoDB (Code 11000)
 */
const handleDuplicateFieldsDB = (err) => {
  const field = Object.keys(err.keyValue || {})[0] || 'field';
  const value = err.keyValue ? err.keyValue[field] : '';
  const message = `Duplicate value '${value}' for field '${field}'. Please use another value!`;
  return new AppError(message, HTTP_STATUS.CONFLICT, [{ field, message }]);
};

/**
 * Handle Mongoose schema validation errors
 */
const handleValidationErrorDB = (err) => {
  const errors = Object.values(err.errors).map((el) => ({
    field: el.path,
    message: el.message,
  }));
  const message = `Validation failed: ${errors.map((e) => e.message).join('. ')}`;
  return new AppError(message, HTTP_STATUS.BAD_REQUEST, errors);
};

/**
 * Handle invalid JWT signature/format
 */
const handleJWTError = () =>
  new AppError('Invalid token. Please log in again!', HTTP_STATUS.UNAUTHORIZED);

/**
 * Handle expired JWT
 */
const handleJWTExpiredError = () =>
  new AppError('Your token has expired! Please log in again.', HTTP_STATUS.UNAUTHORIZED);

/**
 * Development error payload (includes full stack for easy debugging)
 */
const sendErrorDev = (err, res) => {
  res.status(err.statusCode).json({
    success: false,
    statusCode: err.statusCode,
    message: err.message,
    errors: err.errors && err.errors.length > 0 ? err.errors : undefined,
    stack: err.stack,
    error: err,
  });
};

/**
 * Production error payload (strips internal stacks and sanitizes unexpected leaks)
 */
const sendErrorProd = (err, res) => {
  // Operational, trusted error: send message to client
  if (err.isOperational) {
    res.status(err.statusCode).json({
      success: false,
      statusCode: err.statusCode,
      message: err.message,
      errors: err.errors && err.errors.length > 0 ? err.errors : [],
    });
  } else {
    // Programming or unknown error: don't leak implementation details
    console.error('💥 UNEXPECTED ERROR 💥', err);

    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      statusCode: HTTP_STATUS.INTERNAL_SERVER_ERROR,
      message: 'Something went wrong on our end. Please try again later.',
      errors: [],
    });
  }
};

/**
 * Central Global Error Handling Middleware
 */
export const errorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR;
  err.status = err.status || 'error';

  if (config.env === NODE_ENVIRONMENTS.DEVELOPMENT) {
    let error = { ...err };
    error.message = err.message;
    error.name = err.name;
    error.stack = err.stack;

    if (error.name === 'CastError') error = handleCastErrorDB(error);
    if (error.code === 11000) error = handleDuplicateFieldsDB(error);
    if (error.name === 'ValidationError') error = handleValidationErrorDB(error);
    if (error.name === 'JsonWebTokenError') error = handleJWTError();
    if (error.name === 'TokenExpiredError') error = handleJWTExpiredError();

    sendErrorDev(error, res);
  } else {
    let error = { ...err };
    error.message = err.message;
    error.name = err.name;

    if (error.name === 'CastError') error = handleCastErrorDB(error);
    if (error.code === 11000) error = handleDuplicateFieldsDB(error);
    if (error.name === 'ValidationError') error = handleValidationErrorDB(error);
    if (error.name === 'JsonWebTokenError') error = handleJWTError();
    if (error.name === 'TokenExpiredError') error = handleJWTExpiredError();

    sendErrorProd(error, res);
  }
};

export default errorHandler;
