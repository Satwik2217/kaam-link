import { validationResult } from 'express-validator';
import User from '../models/User.model.js';
import WorkerProfile from '../models/WorkerProfile.model.js';
import { generateTokenAndSetCookie, clearTokenCookie } from '../utils/generateToken.js';
import ApiError from '../utils/ApiError.js';

// ==============================================================
// @desc    Register a new user (Worker or Employer)
// @route   POST /api/v1/auth/signup
// @access  Public
// ==============================================================
export const signup = async (req, res, next) => {
  // Validate request body using express-validator
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new ApiError(400, 'Validation failed', errors.array()));
  }

  const { fullName, phone, email, password, role } = req.body;

  try {
    // Check if user with this phone already exists
    const existingUser = await User.findOne({ phone });
    if (existingUser) {
      return next(
        new ApiError(
          409,
          `An account with phone number ${phone} already exists. Please log in.`
        )
      );
    }

    // Create the core User document
    const newUser = await User.create({
      fullName,
      phone,
      email: email || undefined, // Don't set null/empty string
      password,
      role: role || 'employer',
    });

    // If the user registered as a worker, auto-create a WorkerProfile skeleton
    if (newUser.role === 'worker') {
      const workerProfile = await WorkerProfile.create({
        userId: newUser._id,
        primarySkill: 'other', // Will be filled out in profile setup
        experienceYears: 0,
        wageRate: { amount: 500, unit: 'per_day' },
        // Real-world readiness: workers should not be visible until fully onboarded + online.
        isProfileComplete: false,
        isOnline: false,
      });
      // Link WorkerProfile back to User
      newUser.workerProfile = workerProfile._id;
      await newUser.save();
    }

    // Generate JWT and set HttpOnly cookie
    const token = generateTokenAndSetCookie(res, newUser._id, newUser.role);

    // Return success response
    res.status(201).json({
      success: true,
      message: 'Account created successfully! Welcome to KaamLink.',
      token, // Also return token for API clients
      user: {
        _id: newUser._id,
        fullName: newUser.fullName,
        phone: newUser.phone,
        email: newUser.email,
        role: newUser.role,
        verificationStatus: newUser.verificationStatus,
        kycStatus: newUser.kycStatus,
        workerProfile: newUser.workerProfile,
        createdAt: newUser.createdAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

// ==============================================================
// @desc    Login an existing user
// @route   POST /api/v1/auth/login
// @access  Public
// ==============================================================
export const login = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new ApiError(400, 'Validation failed', errors.array()));
  }

  const { phone, password } = req.body;

  try {
    // Find user by phone, explicitly including the password field
    const user = await User.findOne({ phone }).select('+password');
    if (!user) {
      // Generic message to prevent user enumeration attacks
      return next(new ApiError(401, 'Invalid phone number or password.'));
    }

    // Check if account is active
    if (!user.isActive) {
      return next(
        new ApiError(
          403,
          'Your account has been deactivated. Contact support@kaamlink.in'
        )
      );
    }

    // Compare provided password with hashed password
    const isPasswordCorrect = await user.comparePassword(password);
    if (!isPasswordCorrect) {
      return next(new ApiError(401, 'Invalid phone number or password.'));
    }

    // Update last login timestamp
    user.lastLoginAt = new Date();
    await User.updateOne({ _id: user._id }, { $set: { lastLoginAt: user.lastLoginAt } });

    // Generate JWT and set cookie
    const token = generateTokenAndSetCookie(res, user._id, user.role);

    res.status(200).json({
      success: true,
      message: `Welcome back, ${user.fullName.split(' ')[0]}!`,
      token,
      user: {
        _id: user._id,
        fullName: user.fullName,
        phone: user.phone,
        email: user.email,
        role: user.role,
        verificationStatus: user.verificationStatus,
        kycStatus: user.kycStatus,
        workerProfile: user.workerProfile,
        lastLoginAt: user.lastLoginAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

// ==============================================================
// @desc    Logout user (clears JWT cookie)
// @route   POST /api/v1/auth/logout
// @access  Private
// ==============================================================
export const logout = (req, res) => {
  clearTokenCookie(res);
  res.status(200).json({
    success: true,
    message: 'Logged out successfully.',
  });
};

// ==============================================================
// @desc    Get currently authenticated user's data
// @route   GET /api/v1/auth/me
// @access  Private (requires JWT)
// ==============================================================
export const getMe = async (req, res, next) => {
  try {
    // req.user is set by protect middleware
    // Populate workerProfile if user is a worker, exclude sensitive fields
    const user = await User.findById(req.user._id)
      .populate({
        path: 'workerProfile',
        select: '-reviews' // Exclude reviews for brevity in /me
      })
      .select('-password -otp'); // Exclude sensitive fields from main user document

    if (!user) {
      return next(new ApiError(404, 'User not found.'));
    }

    res.status(200).json({
      success: true,
      user: user.toPublicProfile(),
    });
  } catch (error) {
    next(error);
  }
};

