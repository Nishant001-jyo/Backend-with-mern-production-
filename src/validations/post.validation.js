import Joi from 'joi';

const objectIdPattern = /^[0-9a-fA-F]{24}$/;

export const createPostSchema = {
  body: Joi.object({
    title: Joi.string().trim().min(3).max(200).required().messages({
      'string.empty': 'Title cannot be empty',
      'string.min': 'Title must be at least 3 characters',
      'string.max': 'Title cannot exceed 200 characters',
      'any.required': 'Title is required',
    }),
    content: Joi.string().trim().min(5).required().messages({
      'string.empty': 'Content cannot be empty',
      'string.min': 'Content must be at least 5 characters',
      'any.required': 'Content is required',
    }),
    tags: Joi.array().items(Joi.string().trim().max(30)).optional().messages({
      'array.base': 'Tags must be an array of strings',
    }),
    isPublished: Joi.boolean().optional(),
  }),
};

export const updatePostSchema = {
  params: Joi.object({
    id: Joi.string().pattern(objectIdPattern).required().messages({
      'string.pattern.base': 'Invalid post ID format',
      'any.required': 'Post ID parameter is required',
    }),
  }),
  body: Joi.object({
    title: Joi.string().trim().min(3).max(200).optional(),
    content: Joi.string().trim().min(5).optional(),
    tags: Joi.array().items(Joi.string().trim().max(30)).optional(),
    isPublished: Joi.boolean().optional(),
  }).min(1).messages({
    'object.min': 'At least one field must be provided to update',
  }),
};

export const postIdParamSchema = {
  params: Joi.object({
    id: Joi.string().pattern(objectIdPattern).required().messages({
      'string.pattern.base': 'Invalid post ID format',
      'any.required': 'Post ID parameter is required',
    }),
  }),
};

export const queryPostsSchema = {
  query: Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(10),
    sort: Joi.string().trim().default('-createdAt'),
    search: Joi.string().trim().optional(),
    isPublished: Joi.boolean().optional(),
    author: Joi.string().pattern(objectIdPattern).optional(),
  }),
};
