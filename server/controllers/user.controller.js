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

