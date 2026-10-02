import Post from '../models/Post.js';
import AppError from '../utils/AppError.js';
import catchAsync from '../utils/catchAsync.js';
import sendResponse from '../utils/apiResponse.js';
import { HTTP_STATUS, PAGINATION, USER_ROLES } from '../config/constants.js';

/**
 * Create a new Post
 * POST /api/v1/posts
 * Requires: Authentication (author is automatically bound to req.user._id)
 */
export const createPost = catchAsync(async (req, res) => {
  const { title, content, tags, isPublished } = req.body;

  const post = await Post.create({
    title,
    content,
    tags,
    isPublished,
    author: req.user._id,
  });

  // Populate author details for the immediate response
  await post.populate('author', 'name email');

  return sendResponse(res, {
    statusCode: HTTP_STATUS.CREATED,
    message: 'Post created successfully.',
    data: { post },
  });
});

/**
 * Get all posts with filtering, search, pagination, and sorting
 * GET /api/v1/posts
 */
export const getAllPosts = catchAsync(async (req, res) => {
  const page = parseInt(req.query.page, 10) || PAGINATION.DEFAULT_PAGE;
  const limit = Math.min(
    parseInt(req.query.limit, 10) || PAGINATION.DEFAULT_LIMIT,
    PAGINATION.MAX_LIMIT
  );
  const skip = (page - 1) * limit;

  // Build query filter
  const filter = {};

  // If user is not logged in or not admin, only show published posts
  if (!req.user || req.user.role !== USER_ROLES.ADMIN) {
    filter.isPublished = true;
  } else if (req.query.isPublished !== undefined) {
    filter.isPublished = req.query.isPublished === 'true';
  }

  // Filter by author if requested
  if (req.query.author) {
    filter.author = req.query.author;
  }

  // Full-text regex search across title and content
  if (req.query.search) {
    filter.$or = [
      { title: { $regex: req.query.search, $options: 'i' } },
      { content: { $regex: req.query.search, $options: 'i' } },
    ];
  }

  // Sorting
  const sortBy = req.query.sort ? req.query.sort.split(',').join(' ') : '-createdAt';

  const [posts, total] = await Promise.all([
    Post.find(filter)
      .populate('author', 'name email')
      .sort(sortBy)
      .skip(skip)
      .limit(limit),
    Post.countDocuments(filter),
  ]);

  return sendResponse(res, {
    statusCode: HTTP_STATUS.OK,
    message: 'Posts retrieved successfully.',
    data: { posts },
    meta: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      hasMore: skip + posts.length < total,
    },
  });
});

/**
 * Get a single post by ID
 * GET /api/v1/posts/:id
 */
export const getPostById = catchAsync(async (req, res, next) => {
  const post = await Post.findById(req.params.id).populate('author', 'name email');

  if (!post) {
    return next(new AppError('No post found with that ID.', HTTP_STATUS.NOT_FOUND));
  }

  // Only author or admin can view unpublished draft posts
  if (!post.isPublished) {
    const isOwner = req.user && post.author._id.toString() === req.user._id.toString();
    const isAdmin = req.user && req.user.role === USER_ROLES.ADMIN;
    if (!isOwner && !isAdmin) {
      return next(new AppError('No post found with that ID.', HTTP_STATUS.NOT_FOUND));
    }
  }

  return sendResponse(res, {
    statusCode: HTTP_STATUS.OK,
    message: 'Post retrieved successfully.',
    data: { post },
  });
});

/**
 * Update an existing post
 * PATCH /api/v1/posts/:id
 * Permissions: Owner or Admin
 */
export const updatePost = catchAsync(async (req, res, next) => {
  const post = await Post.findById(req.params.id);

  if (!post) {
    return next(new AppError('No post found with that ID.', HTTP_STATUS.NOT_FOUND));
  }

  // Authorization check: User must be author OR admin
  const isOwner = post.author.toString() === req.user._id.toString();
  const isAdmin = req.user.role === USER_ROLES.ADMIN;

  if (!isOwner && !isAdmin) {
    return next(
      new AppError('You do not have permission to update this post.', HTTP_STATUS.FORBIDDEN)
    );
  }

  // Update allowed fields
  const allowedUpdates = ['title', 'content', 'tags', 'isPublished'];
  allowedUpdates.forEach((field) => {
    if (req.body[field] !== undefined) {
      post[field] = req.body[field];
    }
  });

  await post.save();
  await post.populate('author', 'name email');

  return sendResponse(res, {
    statusCode: HTTP_STATUS.OK,
    message: 'Post updated successfully.',
    data: { post },
  });
});

/**
 * Delete a post
 * DELETE /api/v1/posts/:id
 * Permissions: Owner or Admin
 */
export const deletePost = catchAsync(async (req, res, next) => {
  const post = await Post.findById(req.params.id);

  if (!post) {
    return next(new AppError('No post found with that ID.', HTTP_STATUS.NOT_FOUND));
  }

  // Authorization check: User must be author OR admin
  const isOwner = post.author.toString() === req.user._id.toString();
  const isAdmin = req.user.role === USER_ROLES.ADMIN;

  if (!isOwner && !isAdmin) {
    return next(
      new AppError('You do not have permission to delete this post.', HTTP_STATUS.FORBIDDEN)
    );
  }

  await Post.findByIdAndDelete(req.params.id);

  return sendResponse(res, {
    statusCode: HTTP_STATUS.OK,
    message: 'Post deleted successfully.',
  });
});
