import { Router } from 'express';
import * as userController from '../controllers/user.controller.js';
import { protect } from '../middlewares/auth.middleware.js';
import { restrictTo } from '../middlewares/role.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import { updateMeSchema, userIdParamSchema } from '../validations/user.validation.js';
import { USER_ROLES } from '../config/constants.js';

const router = Router();

// All user routes require authentication
router.use(protect);

// Current user profile management
router.patch('/me', validate(updateMeSchema), userController.updateMe);
router.delete('/me', userController.deleteMe);

// Admin-only management endpoints
router.get('/', restrictTo(USER_ROLES.ADMIN), userController.getAllUsers);
router.get('/:id', restrictTo(USER_ROLES.ADMIN), validate(userIdParamSchema), userController.getUserById);
router.delete('/:id', restrictTo(USER_ROLES.ADMIN), validate(userIdParamSchema), userController.deleteUser);

export default router;
