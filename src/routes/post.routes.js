import { Router } from 'express';
import * as postController from '../controllers/post.controller.js';
import { protect, optionalAuth } from '../middlewares/auth.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import {
  createPostSchema,
  updatePostSchema,
  postIdParamSchema,
  queryPostsSchema,
} from '../validations/post.validation.js';

const router = Router();

// Public routes (with optional auth so authors/admins see drafts if authenticated)
router.get('/', optionalAuth, validate(queryPostsSchema), postController.getAllPosts);
router.get('/:id', optionalAuth, validate(postIdParamSchema), postController.getPostById);

// Protected routes (require valid JWT login)
router.post('/', protect, validate(createPostSchema), postController.createPost);
router.patch('/:id', protect, validate(updatePostSchema), postController.updatePost);
router.delete('/:id', protect, validate(postIdParamSchema), postController.deletePost);

export default router;
