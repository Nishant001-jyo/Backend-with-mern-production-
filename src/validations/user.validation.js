import Joi from 'joi';

// Helper regex for MongoDB 24-character hexadecimal ObjectId
const objectIdPattern = /^[0-9a-fA-F]{24}$/;

export const updateMeSchema = {
  body: Joi.object({
    name: Joi.string().trim().min(2).max(50).optional().messages({
      'string.min': 'Name must have at least 2 characters',
      'string.max': 'Name cannot exceed 50 characters',
    }),
    email: Joi.string().trim().email().optional().messages({
      'string.email': 'Please provide a valid email address',
    }),
  }).min(1).messages({
    'object.min': 'Please provide at least one field to update (name or email)',
  }),
};

export const userIdParamSchema = {
  params: Joi.object({
    id: Joi.string().pattern(objectIdPattern).required().messages({
      'string.pattern.base': 'Invalid user ID format. Must be a valid 24-character hex ID',
      'any.required': 'User ID is required in URL parameter',
    }),
  }),
};
