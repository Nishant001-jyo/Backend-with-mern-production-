/**
 * Standard API Response Formatter
 * Ensures all successful responses adhere to a consistent contract across the entire application.
 */

/**
 * Sends a standardized JSON success response.
 *
 * @param {import('express').Response} res - Express response object
 * @param {Object} options
 * @param {number} [options.statusCode=200] - HTTP status code
 * @param {string} [options.message='Success'] - Descriptive message
 * @param {any} [options.data=null] - Payload to return to client
 * @param {Object} [options.meta=null] - Optional pagination or metadata
 */
export const sendResponse = (
  res,
  { statusCode = 200, message = 'Success', data = null, meta = null } = {}
) => {
  const responseBody = {
    success: true,
    statusCode,
    message,
  };

  if (data !== null && data !== undefined) {
    responseBody.data = data;
  }

  if (meta !== null && meta !== undefined) {
    responseBody.meta = meta;
  }

  return res.status(statusCode).json(responseBody);
};

export default sendResponse;
