import Joi from 'joi';
import { USER_ROLES } from '../config/constants.js';

export const registerSchema = {
  body: Joi.object({
    name: Joi.string().trim().min(2).max(50).required().messages({
      'string.empty': 'Name cannot be empty',
      'string.min': 'Name must have at least 2 characters',
      'string.max': 'Name cannot exceed 50 characters',
      'any.required': 'Name is required',
    }),
    email: Joi.string().trim().email().required().messages({
      'string.empty': 'Email cannot be empty',
      'string.email': 'Please provide a valid email address',
      'any.required': 'Email is required',
    }),
    password: Joi.string().min(8).max(128).required().messages({
      'string.empty': 'Password cannot be empty',
      'string.min': 'Password must be at least 8 characters long',
      'any.required': 'Password is required',
    }),
    role: Joi.string()
      .valid(...Object.values(USER_ROLES))
      .optional()
      .messages({
        'any.only': `Role must be one of: ${Object.values(USER_ROLES).join(', ')}`,
      }),
  }),
};

export const loginSchema = {
  body: Joi.object({
    email: Joi.string().trim().email().required().messages({
      'string.empty': 'Email cannot be empty',
      'string.email': 'Please provide a valid email address',
      'any.required': 'Email is required',
    }),
    password: Joi.string().required().messages({
      'string.empty': 'Password cannot be empty',
      'any.required': 'Password is required',
    }),
  }),
};
