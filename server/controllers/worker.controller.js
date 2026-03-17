import WorkerProfile from '../models/WorkerProfile.model.js';
import User from '../models/User.model.js';
import ApiError from '../utils/ApiError.js';

const isWorkerProfileComplete = ({ user, workerProfile }) => {
  // KYC + bank (stored on User)
  const hasAadhaar = !!user?.aadhaarNumber && /^\d{12}$/.test(user.aadhaarNumber);
  const bank = user?.bankAccount || {};
  const hasBank =
    !!bank?.holderName &&
    typeof bank.holderName === 'string' &&
    bank.holderName.trim().length >= 2 &&
    !!bank?.accountNumber &&
    /^\d{9,18}$/.test(bank.accountNumber) &&
    !!bank?.ifsc &&
    /^[A-Z]{4}0[A-Z0-9]{6}$/.test(String(bank.ifsc).toUpperCase());

  // Skills + work readiness (stored on WorkerProfile)
  const skill = workerProfile?.primarySkill;
  const hasPrimarySkill = !!skill && skill !== 'other';
  const hasExperience =
    workerProfile?.experienceYears !== undefined &&
    workerProfile?.experienceYears !== null &&
    Number.isFinite(Number(workerProfile.experienceYears)) &&
    Number(workerProfile.experienceYears) >= 0;
  const wage = workerProfile?.wageRate || {};
  const hasWage =
    wage?.amount !== undefined &&
    wage?.amount !== null &&
    Number.isFinite(Number(wage.amount)) &&
    Number(wage.amount) >= 100 &&
    !!wage?.unit;
  const hasLanguages =
    Array.isArray(workerProfile?.languages) && workerProfile.languages.length > 0;
  const availability = workerProfile?.availability || {};
  const hasAvailabilityConfig =
    availability?.isAvailable !== undefined &&
    Array.isArray(availability?.availableDays) &&
    availability.availableDays.length > 0 &&
    typeof availability?.availableTimeStart === 'string' &&
    typeof availability?.availableTimeEnd === 'string';

  return (
    hasAadhaar &&
    hasBank &&
    hasPrimarySkill &&
    hasExperience &&
    hasWage &&
    hasLanguages &&
    hasAvailabilityConfig
  );
};

const recomputeAndPersistProfileCompleteness = async ({ userId }) => {
  // Select sensitive fields needed for computation.
  const user = await User.findById(userId).select('+aadhaarNumber +bankAccount');
  if (!user) return null;
  const workerProfile = await WorkerProfile.findOne({ userId });
  if (!workerProfile) return null;

  const computed = isWorkerProfileComplete({ user, workerProfile });
  if (workerProfile.isProfileComplete !== computed) {
    await WorkerProfile.updateOne(
      { _id: workerProfile._id },
      { $set: { isProfileComplete: computed } }
    );
  }
  return computed;
};

// @desc    Get all available workers with filtering (location, skill, rating)
// @route   GET /api/v1/workers
// @access  Public
export const getWorkers = async (req, res, next) => {
  try {
    const { skill, city, minRating, maxWage, page = 1, limit = 12, lat, lng } = req.query;
    const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);
    const limitNum = parseInt(limit, 10);

    // Real-world readiness: only show workers who are fully onboarded and online.
    const matchQuery = {
      isProfileComplete: true,
      isOnline: true,
      'availability.isAvailable': true,
    };
    if (skill) matchQuery.primarySkill = skill;
    if (minRating) matchQuery['stats.averageRating'] = { $gte: parseFloat(minRating) };
    if (maxWage) matchQuery['wageRate.amount'] = { $lte: parseFloat(maxWage) };

    if (lat && lng) {
      // 1. Geospatial search starting from User
      const geoNearStage = {
        $geoNear: {
          near: { type: "Point", coordinates: [parseFloat(lng), parseFloat(lat)] },
          distanceField: "distance", // Distance in meters
          spherical: true,
        }
      };

      const lookupStage = {
        $lookup: {
          from: "workerprofiles",
          localField: "workerProfile",
          foreignField: "_id",
          as: "workerProfileDoc"
        }
      };

      const unwindStage = { $unwind: "$workerProfileDoc" };

      // Re-map matchQuery to use workerProfileDoc prefix
      const geoMatchQuery = {};
      for (const key in matchQuery) {
        geoMatchQuery[`workerProfileDoc.${key}`] = matchQuery[key];
      }
      
      const aggregatePipeline = [
        geoNearStage,
        lookupStage,
        unwindStage,
        { $match: geoMatchQuery }
      ];

      // Get Total Count
      const totalPipeline = [...aggregatePipeline, { $count: "total" }];
      const totalResult = await User.aggregate(totalPipeline);
      const total = totalResult.length > 0 ? totalResult[0].total : 0;

      // Apply pagination
      aggregatePipeline.push({ $skip: skip });
      aggregatePipeline.push({ $limit: limitNum });

      // Fetch
      const aggregateDocs = await User.aggregate(aggregatePipeline);
      
      const workers = aggregateDocs.map(doc => {
        const profile = doc.workerProfileDoc;
        
        // Mimic populate('userId') shape
        profile.userId = {
          _id: doc._id,
          fullName: doc.fullName,
          profilePicture: doc.profilePicture,
          address: doc.address,
          verificationStatus: doc.verificationStatus,
          gender: doc.gender,
        };
        
        // Pass distance back to frontend
        profile.distance = doc.distance; 
        
        return profile;
      });

      return res.status(200).json({
        success: true,
        count: workers.length,
        total,
        totalPages: Math.ceil(total / limitNum),
        currentPage: parseInt(page, 10),
        workers,
      });

    } else {
      // Standard Search (No Location)
      const workers = await WorkerProfile.find(matchQuery)
        .populate('userId', 'fullName profilePicture address verificationStatus gender')
        .sort({ 'stats.averageRating': -1, 'stats.totalJobsCompleted': -1 })
        .skip(skip)
        .limit(limitNum)
        .lean();

      const total = await WorkerProfile.countDocuments(matchQuery);

      return res.status(200).json({
        success: true,
        count: workers.length,
        total,
        totalPages: Math.ceil(total / limitNum),
        currentPage: parseInt(page, 10),
        workers,
      });
    }
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
      'isOnline',
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
    await recomputeAndPersistProfileCompleteness({ userId: req.user._id });
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
      { new: true }
    );

    if (!user) return next(new ApiError(404, 'User not found'));
    await recomputeAndPersistProfileCompleteness({ userId: req.user._id });

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

