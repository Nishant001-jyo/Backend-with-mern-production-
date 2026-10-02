import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { USER_ROLES } from '../config/constants.js';

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide your name'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters'],
      maxlength: [50, 'Name cannot exceed 50 characters'],
    },
    email: {
      type: String,
      required: [true, 'Please provide your email address'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
        'Please provide a valid email address',
      ],
      index: true,
    },
    password: {
      type: String,
      required: [true, 'Please provide a password'],
      minlength: [8, 'Password must be at least 8 characters long'],
      select: false, // Do not return password by default in queries
    },
    role: {
      type: String,
      enum: {
        values: Object.values(USER_ROLES),
        message: 'Role must be either user or admin',
      },
      default: USER_ROLES.USER,
    },
    isActive: {
      type: Boolean,
      default: true,
      select: false,
    },
    passwordChangedAt: {
      type: Date,
      select: false,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (doc, ret) => {
        delete ret.password;
        delete ret.__v;
        return ret;
      },
    },
  }
);

/**
 * Pre-save middleware to automatically hash the password before saving to the database.
 */
userSchema.pre('save', async function (next) {
  // Only hash password if it was modified or is new
  if (!this.isModified('password')) return next();

  this.password = await bcrypt.hash(this.password, 12);

  // If modifying existing password (not creating new user), update passwordChangedAt
  if (!this.isNew) {
    this.passwordChangedAt = Date.now() - 1000; // 1s in the past to ensure token issued after save works
  }

  next();
});

/**
 * Instance method to check if provided password matches hashed password in DB.
 *
 * @param {string} candidatePassword - Plaintext password from user input
 * @param {string} userPassword - Hashed password stored in DB
 * @returns {Promise<boolean>}
 */
userSchema.methods.comparePassword = async function (candidatePassword, userPassword) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

/**
 * Instance method to verify if user changed password after the JWT token was issued.
 *
 * @param {number} JWTTimestamp - Token issuance timestamp in seconds
 * @returns {boolean} True if password was changed after token issue, false otherwise
 */
userSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(this.passwordChangedAt.getTime() / 1000, 10);
    return JWTTimestamp < changedTimestamp;
  }
  return false;
};

const User = mongoose.model('User', userSchema);

export default User;
