import AppError from '../utils/AppError.js';
import { HTTP_STATUS } from '../config/constants.js';

/**
 * Validation Middleware using Joi.
 * Validates req.body, req.query, and req.params against provided Joi schemas.
 *
 * @param {Object} schema - Object containing Joi schemas: { body, query, params }
 * @returns {Function} Express middleware function
 */
export const validate = (schema) => {
  return (req, res, next) => {
    const validSchemaKeys = ['body', 'query', 'params'];
    const errorDetails = [];

    validSchemaKeys.forEach((key) => {
      if (schema[key]) {
        const { error, value } = schema[key].validate(req[key], {
          abortEarly: false, // Include all errors, not just the first one
          stripUnknown: true, // Remove unknown fields
          allowUnknown: false,
        });

        if (error) {
          error.details.forEach((detail) => {
            errorDetails.push({
              field: detail.path.join('.'),
              message: detail.message.replace(/['"]/g, ''),
            });
          });
        } else {
          // Reassign validated & sanitized values back to req[key]
          req[key] = value;
        }
      }
    });

    if (errorDetails.length > 0) {
      const summaryMessage = errorDetails.map((err) => err.message).join('; ');
      return next(new AppError(summaryMessage, HTTP_STATUS.BAD_REQUEST, errorDetails));
    }

    return next();
  };
};

export default validate;
