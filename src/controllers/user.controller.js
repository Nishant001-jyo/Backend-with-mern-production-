import User from '../models/User.js';
import AppError from '../utils/AppError.js';
import catchAsync from '../utils/catchAsync.js';
import sendResponse from '../utils/apiResponse.js';
import { HTTP_STATUS, PAGINATION } from '../config/constants.js';

/**
 * Filter object to only allow specific fields
 */
const filterObj = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach((el) => {
    if (allowedFields.includes(el)) newObj[el] = obj[el];
  });
  return newObj;
};

/**
 * Update currently authenticated user profile
 * PATCH /api/v1/users/me
 */
export const updateMe = catchAsync(async (req, res, next) => {
  // 1) Filter out unwanted field names that are not allowed to be updated here
  const filteredBody = filterObj(req.body, 'name', 'email');

  // If email is changing, ensure it's not taken by another user
  if (filteredBody.email && filteredBody.email !== req.user.email) {
    const existing = await User.findOne({ email: filteredBody.email });
    if (existing) {
      return next(
        new AppError('This email is already in use by another account.', HTTP_STATUS.CONFLICT)
      );
    }
  }

  // 2) Update user document
  const updatedUser = await User.findByIdAndUpdate(req.user._id, filteredBody, {
    new: true,
    runValidators: true,
  });

  return sendResponse(res, {
    statusCode: HTTP_STATUS.OK,
    message: 'Profile updated successfully.',
    data: { user: updatedUser },
  });
});

/**
 * Deactivate own account (soft delete)
 * DELETE /api/v1/users/me
 */
export const deleteMe = catchAsync(async (req, res) => {
  await User.findByIdAndUpdate(req.user._id, { isActive: false });

  // Clear cookie as well
  res.cookie('token', 'loggedout', {
    expires: new Date(Date.now() + 5 * 1000),
    httpOnly: true,
  });

  return sendResponse(res, {
    statusCode: HTTP_STATUS.OK,
    message: 'Your account has been successfully deactivated.',
  });
});

/**
 * Get all users with pagination and search (Admin only)
 * GET /api/v1/users
 */
export const getAllUsers = catchAsync(async (req, res) => {
  const page = parseInt(req.query.page, 10) || PAGINATION.DEFAULT_PAGE;
  const limit = Math.min(
    parseInt(req.query.limit, 10) || PAGINATION.DEFAULT_LIMIT,
    PAGINATION.MAX_LIMIT
  );
  const skip = (page - 1) * limit;

  // Build filter query
  const queryObj = {};
  if (req.query.role) queryObj.role = req.query.role;
  if (req.query.search) {
    queryObj.$or = [
      { name: { $regex: req.query.search, $options: 'i' } },
      { email: { $regex: req.query.search, $options: 'i' } },
    ];
  }

  const [users, total] = await Promise.all([
    User.find(queryObj).sort('-createdAt').skip(skip).limit(limit),
    User.countDocuments(queryObj),
  ]);

  return sendResponse(res, {
    statusCode: HTTP_STATUS.OK,
    message: 'Users retrieved successfully.',
    data: { users },
    meta: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  });
});

/**
 * Get specific user by ID (Admin only)
 * GET /api/v1/users/:id
 */
export const getUserById = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return next(new AppError('No user found with that ID.', HTTP_STATUS.NOT_FOUND));
  }

  return sendResponse(res, {
    statusCode: HTTP_STATUS.OK,
    message: 'User found.',
    data: { user },
  });
});

/**
 * Permanently delete a user (Admin only)
 * DELETE /api/v1/users/:id
 */
export const deleteUser = catchAsync(async (req, res, next) => {
  const user = await User.findByIdAndDelete(req.params.id);

  if (!user) {
    return next(new AppError('No user found with that ID.', HTTP_STATUS.NOT_FOUND));
  }

  return sendResponse(res, {
    statusCode: HTTP_STATUS.OK,
    message: 'User deleted permanently.',
  });
});
