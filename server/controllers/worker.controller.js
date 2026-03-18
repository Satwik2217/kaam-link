import WorkerProfile from '../models/WorkerProfile.model.js';
import User from '../models/User.model.js';
import ApiError from '../utils/ApiError.js';

/**
 * Internal Helper: Checks if a worker has filled all mandatory fields.
 * Relaxed for easier discovery during testing.
 */
const isWorkerProfileComplete = ({ user, workerProfile }) => {
  // KYC + Bank (stored on User)
  const hasAadhaar = !!user?.aadhaarNumber;
  const bank = user?.bankAccount || {};
  const hasBank = !!bank?.accountNumber && !!bank?.ifsc;

  // Skills + Professional Details (stored on WorkerProfile)
  const skill = workerProfile?.primarySkill;
  const hasPrimarySkill = !!skill && skill !== 'other';
  
  const hasExperience = workerProfile?.experienceYears !== undefined;

  const wage = workerProfile?.wageRate || {};
  const hasWage = !!wage?.amount && !!wage?.unit;

  // Returning true if core professional info is present
  return (
    hasAadhaar &&
    hasBank &&
    hasPrimarySkill &&
    hasExperience &&
    hasWage
  );
};

/**
 * Internal Helper: Recomputes the boolean flag and saves to DB
 */
const recomputeAndPersistProfileCompleteness = async ({ userId }) => {
  const user = await User.findById(userId).select(
    '+aadhaarNumber +bankAccount.accountNumber +bankAccount.ifsc +bankAccount.holderName'
  );
  if (!user) return null;
  const workerProfile = await WorkerProfile.findOne({ userId });
  if (!workerProfile) return null;

  const computed = isWorkerProfileComplete({ user, workerProfile });
  
  // Force update the document
  await WorkerProfile.updateOne(
    { _id: workerProfile._id },
    { $set: { isProfileComplete: computed } }
  );
  
  return computed;
};

// @desc    Get all available workers (List-based search, No Map)
// @route   GET /api/v1/workers
// @access  Public
export const getWorkers = async (req, res, next) => {
  try {
    const { skill, city, minRating, maxWage, page = 1, limit = 12 } = req.query;
    const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);
    const limitNum = parseInt(limit, 10);

    // Filter Logic:
    // We only show workers who have at least core info (isProfileComplete)
    // and have toggled themselves as "Online".
    const profileFilter = {
      isProfileComplete: true,
      isOnline: true
    };

    if (skill) profileFilter.primarySkill = skill;
    if (minRating) profileFilter['stats.averageRating'] = { $gte: parseFloat(minRating) };
    if (maxWage) profileFilter['wageRate.amount'] = { $lte: parseFloat(maxWage) };

    // Fetch workers
    const workers = await WorkerProfile.find(profileFilter)
      .populate({
        path: 'userId',
        select: 'fullName profilePicture address verificationStatus gender',
      })
      .sort({ 'stats.averageRating': -1, createdAt: -1 });

    // Filter by city if provided in the User's address
    let filteredWorkers = workers;
    if (city) {
      const cityRegex = new RegExp(city, 'i');
      filteredWorkers = workers.filter(w => 
        w.userId?.address?.city && cityRegex.test(w.userId.address.city)
      );
    }

    // Manual Pagination
    const paginatedWorkers = filteredWorkers.slice(skip, skip + limitNum);
    const total = filteredWorkers.length;

    return res.status(200).json({
      success: true,
      count: paginatedWorkers.length,
      total,
      totalPages: Math.ceil(total / limitNum),
      currentPage: parseInt(page, 10),
      workers: paginatedWorkers,
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

// @desc    Update worker professional details
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
      'isOnline'
    ];
    
    const updates = {};
    allowedUpdates.forEach((field) => {
      if (req.body[field] !== undefined) updates[field] = req.body[field];
    });

    // Ensure isOnline is treated as a boolean if it comes as a string
    if (updates.isOnline !== undefined) {
      updates.isOnline = updates.isOnline === true || updates.isOnline === 'true';
    }

    const updatedProfile = await WorkerProfile.findOneAndUpdate(
      { userId: req.user._id },
      { $set: updates },
      { new: true, runValidators: true }
    );

    if (!updatedProfile) return next(new ApiError(404, 'Worker profile not found.'));
    
    // Re-check completeness whenever profile is updated
    await recomputeAndPersistProfileCompleteness({ userId: req.user._id });
    
    res.status(200).json({ success: true, workerProfile: updatedProfile });
  } catch (error) {
    next(error);
  }
};

// @desc    Submit KYC and Bank details
// @route   PUT /api/v1/workers/my-kyc
// @access  Private (Worker only)
export const submitKyc = async (req, res, next) => {
  try {
    const { aadhaarNumber, bankAccount } = req.body;

    if (!aadhaarNumber || !/^\d{12}$/.test(aadhaarNumber)) {
      return next(new ApiError(400, 'Please provide a valid 12-digit Aadhaar number'));
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      {
        $set: {
          aadhaarNumber,
          bankAccount,
          kycStatus: 'verified', // Set to verified directly for Demo purposes
          kycSubmittedAt: new Date(),
        },
      },
      { new: true }
    );

    if (!user) return next(new ApiError(404, 'User not found'));
    await recomputeAndPersistProfileCompleteness({ userId: req.user._id });

    res.status(200).json({
      success: true,
      message: 'KYC updated successfully.',
      kycStatus: user.kycStatus,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get Masked KYC Info
// @route   GET /api/v1/workers/my-kyc
// @access  Private (Worker only)
export const getMyKycStatus = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select('+aadhaarNumber +bankAccount');
    if (!user) return next(new ApiError(404, 'User not found'));

    const responseData = {
      kycStatus: user.kycStatus,
      kycSubmittedAt: user.kycSubmittedAt,
      bankAccountMasked: user.bankAccount?.accountNumber ? '****' + user.bankAccount.accountNumber.slice(-4) : null,
      holderName: user.bankAccount?.holderName,
    };

    res.status(200).json({ success: true, kyc: responseData });
  } catch (error) {
    next(error);
  }
};