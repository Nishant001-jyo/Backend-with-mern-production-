import mongoose from 'mongoose';

const postSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Post title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
      index: true,
    },
    content: {
      type: String,
      required: [true, 'Post content is required'],
      trim: true,
    },
    tags: {
      type: [String],
      default: [],
      index: true,
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'A post must have an author'],
      index: true,
    },
    isPublished: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (doc, ret) => {
        delete ret.__v;
        return ret;
      },
    },
  }
);

// Compound index for author and creation date for fast author timeline queries
postSchema.index({ author: 1, createdAt: -1 });

const Post = mongoose.model('Post', postSchema);

export default Post;
