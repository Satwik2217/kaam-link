import { randomInt } from 'crypto';
import { validationResult } from 'express-validator';
import User from '../models/User.model.js';
import WorkerProfile from '../models/WorkerProfile.model.js';
import { generateTokenAndSetCookie, clearTokenCookie } from '../utils/generateToken.js';
import ApiError from '../utils/ApiError.js';

// Helper function to generate a 6-digit OTP
const generateOTP = () => {
  return String(randomInt(100000, 1000000));
};

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
      // newUser.workerProfile = workerProfile._id;
      // await newUser.save();
      await User.findByIdAndUpdate(newUser._id, { workerProfile: workerProfile._id });
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
      });

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

// ============================================================== 
// @desc    Send OTP for password reset
// @route   POST /api/v1/auth/forgot-password
// @access  Public
// ============================================================== 
export const forgotPassword = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new ApiError(400, 'Validation failed', errors.array()));
  }

  const { phone } = req.body;

  try {
    // Find user by phone
    const user = await User.findOne({ phone });
    if (!user) {
      return next(new ApiError(404, 'No account found with this phone number'));
    }

    // Generate OTP and set expiry (10 minutes)
    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now

    // Save OTP to user document
    user.verificationOtp = { code: otp, expiresAt };
    await user.save();

    // TODO: Send OTP via SMS (for now, just log it)
    console.log(`Password Reset OTP for ${phone}: ${otp}`);

    // In production, you would integrate with an SMS service like:
    // await sendSMS(phone, `Your KaamLink password reset OTP is: ${otp}. Valid for 10 minutes.`);

    res.status(200).json({
      success: true,
      message: 'OTP sent successfully. Please check your phone.',
      // In development, you might want to return the OTP for testing
      ...(process.env.NODE_ENV === 'development' && { otp })
    });

  } catch (error) {
    console.error('Error in forgotPassword:', error);
    next(new ApiError(500, 'Failed to send OTP. Please try again.'));
  }
};

// ============================================================== 
// @desc    Verify OTP and allow password reset
// @route   POST /api/v1/auth/verify-otp
// @access  Public
// ============================================================== 
export const verifyOTP = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new ApiError(400, 'Validation failed', errors.array()));
  }

  const { phone, otp } = req.body;

  try {
    // Find user by phone and include the OTP fields (they are excluded by default)
    const user = await User.findOne({ phone }).select(
      '+verificationOtp.code +verificationOtp.expiresAt'
    );
    if (!user) {
      return next(new ApiError(404, 'No account found with this phone number'));
    }

    // Check if OTP exists and is valid
    if (!user.verificationOtp || !user.verificationOtp.code) {
      return next(new ApiError(400, 'No OTP request found. Please request a new OTP.'));
    }

    // Check if OTP has expired
    if (user.verificationOtp.expiresAt < new Date()) {
      return next(new ApiError(400, 'OTP has expired. Please request a new OTP.'));
    }

    // Verify OTP
    if (user.verificationOtp.code !== otp) {
      return next(new ApiError(400, 'Invalid OTP. Please try again.'));
    }

    // OTP is valid - generate a temporary token for password reset
    const resetToken = generateOTP(); // Using same function for simplicity
    const resetTokenExpiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    // Store reset token (you could add a separate field for this in the schema)
    user.resetToken = resetToken;
    user.resetTokenExpiresAt = resetTokenExpiresAt;
    // Clear the OTP after successful verification
    user.verificationOtp = undefined;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'OTP verified successfully. You can now reset your password.',
      resetToken // In production, you might not want to return this
    });

  } catch (error) {
    console.error('Error in verifyOTP:', error);
    next(new ApiError(500, 'Failed to verify OTP. Please try again.'));
  }
};

// ============================================================== 
// @desc    Reset password using reset token
// @route   POST /api/v1/auth/reset-password
// @access  Public
// ============================================================== 
export const resetPassword = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new ApiError(400, 'Validation failed', errors.array()));
  }

  const { phone, resetToken, newPassword } = req.body;

  try {
    // Find user by phone with reset token fields
    const user = await User.findOne({ phone }).select('+resetToken +resetTokenExpiresAt');
    if (!user) {
      return next(new ApiError(404, 'No account found with this phone number'));
    }

    // Check if reset token exists and is valid
    if (!user.resetToken || user.resetToken !== resetToken) {
      return next(new ApiError(400, 'Invalid or expired reset token. Please try again.'));
    }

    // Check if reset token has expired
    if (user.resetTokenExpiresAt < new Date()) {
      return next(new ApiError(400, 'Reset token has expired. Please request a new OTP.'));
    }

    // Update password
    user.password = newPassword;

    // Clear reset token
    user.resetToken = undefined;
    user.resetTokenExpiresAt = undefined;

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password reset successfully. You can now log in with your new password.'
    });

  } catch (error) {
    console.error('Error in resetPassword:', error);
    next(new ApiError(500, 'Failed to reset password. Please try again.'));
  }
};

