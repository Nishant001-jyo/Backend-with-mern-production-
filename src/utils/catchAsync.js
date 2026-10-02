/**
 * Higher-order function that catches rejected promises in async route handlers
 * and forwards them to the Express next() error handler, eliminating redundant try/catch blocks.
 *
 * @param {Function} fn - Async controller function (req, res, next)
 * @returns {Function} Express middleware handler
 */
export const catchAsync = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

export default catchAsync;
