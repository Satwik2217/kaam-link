import User from '../models/User.model.js';
import ApiError from '../utils/ApiError.js';

// @desc    Update current user's profile
// @route   PUT /api/v1/users/profile
// @access  Private
export const updateProfile = async (req, res, next) => {
  try {
    const allowedUpdates = [
      'fullName',
      'email',
      'address',
      'privacySettings',
      'gender',
      'dateOfBirth',
    ];
    const updates = {};
    allowedUpdates.forEach((field) => {
      if (req.body[field] !== undefined) updates[field] = req.body[field];
    });

    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      { $set: updates },
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      return next(new ApiError(404, 'User not found.'));
    }

    res.status(200).json({ success: true, user: updatedUser.toPublicProfile() });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete current user's profile and account completely
// @route   DELETE /api/v1/users/profile
// @access  Private
export const deleteAccount = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return next(new ApiError(404, 'User not found.'));
    }

    const userId = user._id;

    // 1. Delete all Job Bookings associated with this user
    const JobBooking = (await import('../models/JobBooking.model.js')).default;
    
    if (user.role === 'worker') {
      await JobBooking.deleteMany({ workerId: userId });
    } else if (user.role === 'employer') {
      await JobBooking.deleteMany({ employerId: userId });
    }

    // 2. If the user is a worker, delete their WorkerProfile
    if (user.role === 'worker') {
      const WorkerProfile = (await import('../models/WorkerProfile.model.js')).default;
      await WorkerProfile.deleteOne({ userId });
    }

    // 3. Delete the user from the database directly using deleteOne
    await User.deleteOne({ _id: userId });

    // 4. Clear the authentication cookie to logout
    const { clearTokenCookie } = await import('../utils/generateToken.js');
    clearTokenCookie(res);

    res.status(200).json({ success: true, message: 'Account successfully deleted.' });
  } catch (error) {
    next(error);
  }
};

