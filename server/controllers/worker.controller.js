import WorkerProfile from '../models/WorkerProfile.model.js';
import User from '../models/User.model.js';
import ApiError from '../utils/ApiError.js';

// @desc    Get all available workers with filtering (location, skill, rating)
// @route   GET /api/v1/workers
// @access  Public
export const getWorkers = async (req, res, next) => {
  try {
    const { skill, city, minRating, maxWage, page = 1, limit = 12 } = req.query;

    const matchQuery = { 'availability.isAvailable': true };
    if (skill) matchQuery.primarySkill = skill;
    if (minRating) matchQuery['stats.averageRating'] = { $gte: parseFloat(minRating) };
    if (maxWage) matchQuery['wageRate.amount'] = { $lte: parseFloat(maxWage) };

    const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);
    const workers = await WorkerProfile.find(matchQuery)
      .populate('userId', 'fullName profilePicture address verificationStatus gender')
      .sort({ 'stats.averageRating': -1, 'stats.totalJobsCompleted': -1 })
      .skip(skip)
      .limit(parseInt(limit, 10))
      .lean();

    const total = await WorkerProfile.countDocuments(matchQuery);

    res.status(200).json({
      success: true,
      count: workers.length,
      total,
      totalPages: Math.ceil(total / parseInt(limit, 10)),
      currentPage: parseInt(page, 10),
      workers,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get a single worker's public profile
// @route   GET /api/v1/workers/:id
// @access  Public
export const getWorkerById = async (req, res, next) => {
  try {
    const workerProfile = await WorkerProfile.findById(req.params.id).populate(
      'userId',
      'fullName profilePicture address verificationStatus gender privacySettings'
    );

    if (!workerProfile) return next(new ApiError(404, 'Worker profile not found.'));

    res.status(200).json({ success: true, worker: workerProfile });
  } catch (error) {
    next(error);
  }
};

// @desc    Update the authenticated worker's own profile
// @route   PUT /api/v1/workers/my-profile
// @access  Private (Worker only)
export const updateMyWorkerProfile = async (req, res, next) => {
  try {
    const allowedUpdates = [
      'primarySkill',
      'additionalSkills',
      'experienceYears',
      'bio',
      'languages',
      'availability',
      'wageRate',
      'serviceRadius',
      'jobTypePreference',
      'isOpenToLiveIn',
      'hasOwnTools',
      'hasVehicle',
      'portfolioImages',
      'preferredLocations',
    ];
    const updates = {};
    allowedUpdates.forEach((field) => {
      if (req.body[field] !== undefined) updates[field] = req.body[field];
    });

    const updatedProfile = await WorkerProfile.findOneAndUpdate(
      { userId: req.user._id },
      { $set: updates },
      { new: true, runValidators: true }
    );

    if (!updatedProfile) return next(new ApiError(404, 'Worker profile not found.'));
    res.status(200).json({ success: true, workerProfile: updatedProfile });
  } catch (error) {
    next(error);
  }
};

// @desc    Submit or update KYC and Bank details
// @route   PUT /api/v1/workers/my-kyc
// @access  Private (Worker only)
export const submitKyc = async (req, res, next) => {
  try {
    const { aadhaarNumber, bankAccount } = req.body;

    // Basic validation
    if (!aadhaarNumber || !/^\d{12}$/.test(aadhaarNumber)) {
      return next(new ApiError(400, 'Please provide a valid 12-digit Aadhaar number'));
    }

    if (!bankAccount || !bankAccount.accountNumber || !bankAccount.ifsc || !bankAccount.holderName) {
      return next(new ApiError(400, 'Please provide essential bank details (Holder Name, Account Number, IFSC)'));
    }

    if (!/^[A-Z]{4}0[A-Z0-9]{6}$/.test(bankAccount.ifsc.toUpperCase())) {
      return next(new ApiError(400, 'Please provide a valid IFSC code'));
    }

    const last4Aadhaar = aadhaarNumber.slice(-4);
    
    // Normalize IFSC
    bankAccount.ifsc = bankAccount.ifsc.toUpperCase();

    // Update User doc efficiently and avoid mongoose save() path collision bugs on unselected fields
    const user = await User.findByIdAndUpdate(
      req.user._id,
      {
        $set: {
          aadhaarNumber,
          last4Aadhaar,
          bankAccount,
          kycStatus: 'pending_review',
          kycSubmittedAt: new Date(),
        },
      },
      { new: true, runValidators: true }
    );

    if (!user) return next(new ApiError(404, 'User not found'));

    res.status(200).json({
      success: true,
      message: 'KYC and Bank details submitted successfully. Awaiting review.',
      kycStatus: user.kycStatus,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get the current user's KYC and Bank info (masked)
// @route   GET /api/v1/workers/my-kyc
// @access  Private (Worker only)
export const getMyKycStatus = async (req, res, next) => {
  try {
    // Explicitly select the fields we need to format the safe response
    const user = await User.findById(req.user._id).select('+aadhaarNumber +bankAccount');
    if (!user) return next(new ApiError(404, 'User not found'));

    const responseData = {
      kycStatus: user.kycStatus,
      last4Aadhaar: user.last4Aadhaar,
      kycSubmittedAt: user.kycSubmittedAt,
      kycVerifiedAt: user.kycVerifiedAt,
      kycRejectionReason: user.kycRejectionReason,
    };

    if (user.bankAccount && user.bankAccount.accountNumber) {
        responseData.bankAccountMasked = '****' + user.bankAccount.accountNumber.slice(-4);
        responseData.holderName = user.bankAccount.holderName;
        // Don't send exact IFSC or account numbers back
    }

    res.status(200).json({
      success: true,
      kyc: responseData
    });
  } catch (error) {
    next(error);
  }
};

