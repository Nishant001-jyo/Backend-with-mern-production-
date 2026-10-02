/**
 * Custom Operational Error Class
 * Distinguishes expected, operational errors (validation, auth, not found)
 * from unexpected runtime/programming bugs.
 */
export class AppError extends Error {
  /**
   * @param {string} message - Human-readable error description
   * @param {number} statusCode - HTTP status code (default 500)
   * @param {Array} errors - Optional detailed field-level error messages
   */
  constructor(message, statusCode = 500, errors = []) {
    super(message);

    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;
    this.errors = errors;

    Error.captureStackTrace(this, this.constructor);
  }
}

export default AppError;
