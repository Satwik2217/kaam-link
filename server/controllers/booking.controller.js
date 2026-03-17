import JobBooking from '../models/JobBooking.model.js';
import WorkerProfile from '../models/WorkerProfile.model.js';
import ApiError from '../utils/ApiError.js';

// @desc    Create a new job booking request
// @route   POST /api/v1/bookings
// @access  Private (Employer only)
export const createBooking = async (req, res, next) => {
  try {
    const {
      workerProfileId,
      jobTitle,
      jobDescription,
      skillRequired,
      scheduledStartDate,
      scheduledEndDate,
      jobLocation,
      agreedWage,
      totalAmount,
      jobType,
    } = req.body;

    const workerProfile = await WorkerProfile.findById(workerProfileId);
    if (!workerProfile) return next(new ApiError(404, 'Worker profile not found.'));

    if (!jobLocation || !jobLocation.address || !jobLocation.city) {
      return next(new ApiError(400, 'Job location (address and city) is required.'));
    }

    const start = new Date(scheduledStartDate);
    const end = new Date(scheduledEndDate);
    if (start < new Date().setHours(0,0,0,0)) {
       return next(new ApiError(400, 'Start date cannot be in the past.'));
    }
    if (end < start) {
       return next(new ApiError(400, 'End date cannot be earlier than start date.'));
    }
    if (!totalAmount || Number(totalAmount) < workerProfile.wageRate.amount) {
       return next(new ApiError(400, 'Invalid total amount for this booking.'));
    }

    const platformFeeRate = 0.05; // 5%
    const platformFee = Math.round(totalAmount * platformFeeRate);

    const booking = await JobBooking.create({
      employerId: req.user._id,
      workerId: workerProfile.userId,
      workerProfileId,
      jobTitle,
      jobDescription,
      skillRequired,
      scheduledStartDate,
      scheduledEndDate,
      jobLocation,
      agreedWage,
      totalAmount,
      platformFee,
      workerPayout: totalAmount - platformFee,
      jobType: jobType || 'one_time',
    });

    res
      .status(201)
      .json({ success: true, message: 'Booking request sent to worker.', booking });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all bookings for the current user (employer or worker)
// @route   GET /api/v1/bookings/my-bookings
// @access  Private
export const getMyBookings = async (req, res, next) => {
  try {
    const query =
      req.user.role === 'employer'
        ? { employerId: req.user._id }
        : { workerId: req.user._id };

    const bookings = await JobBooking.find(query)
      .populate('employerId', 'fullName phone profilePicture')
      .populate('workerId', 'fullName phone profilePicture')
      .populate('workerProfileId', 'primarySkill wageRate stats')
      .sort({ createdAt: -1 });

    res
      .status(200)
      .json({ success: true, count: bookings.length, bookings });
  } catch (error) {
    next(error);
  }
};

// @desc    Update booking status (worker accepts/rejects, employer confirms completion)
// @route   PATCH /api/v1/bookings/:id/status
// @access  Private
export const updateBookingStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const booking = await JobBooking.findById(req.params.id);
    if (!booking) return next(new ApiError(404, 'Booking not found.'));

    const allowedWorkerTransitions = [
      'accepted',
      'rejected',
      'in_progress',
      'pending_completion_review',
    ];
    const allowedEmployerTransitions = [
      'completed',
      'cancelled_by_employer',
      'disputed',
    ];

    if (req.user.role === 'worker' && !allowedWorkerTransitions.includes(status)) {
      return next(new ApiError(400, 'Invalid status transition for worker.'));
    }
    if (req.user.role === 'employer' && !allowedEmployerTransitions.includes(status)) {
      return next(new ApiError(400, 'Invalid status transition for employer.'));
    }

    booking.status = status;
    
    // Auto-generate start OTP when worker accepts
    if (status === 'accepted') {
      const otp = Math.floor(1000 + Math.random() * 9000).toString();
      booking.startOTP = otp;
    }

    // Auto-release payment on completion
    if (status === 'completed') {
      booking.paymentStatus = 'released_to_worker';
      booking.paymentReleasedAt = new Date();
      // Update worker stats
      await WorkerProfile.findByIdAndUpdate(booking.workerProfileId, {
        $inc: {
          'stats.totalJobsCompleted': 1,
          'stats.totalEarnings': booking.workerPayout,
        },
      });
    }

    await booking.save();
    
    // We don't want to expose startOTP to the worker in this response payload typically,
    // but the employer needs it. The frontend might re-fetch.
    const responseBooking = booking.toObject();
    if (req.user.role === 'worker') delete responseBooking.startOTP;

    res.status(200).json({
      success: true,
      message: `Booking status updated to '${status}'.`,
      booking: responseBooking,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Start job using OTP (Worker only)
// @route   POST /api/v1/bookings/:id/start-otp
// @access  Private (Worker)
export const startJobWithOTP = async (req, res, next) => {
  try {
    const { otp } = req.body;
    if (!otp) return next(new ApiError(400, 'Please provide the OTP.'));

    // Include the startOTP field which is normally hidden
    const booking = await JobBooking.findById(req.params.id).select('+startOTP');
    if (!booking) return next(new ApiError(404, 'Booking not found.'));

    if (booking.workerId.toString() !== req.user._id.toString()) {
      return next(new ApiError(403, 'Not authorized to start this booking.'));
    }

    if (booking.status !== 'accepted') {
      return next(new ApiError(400, 'Job cannot be started in its current status.'));
    }

    if (!booking.startOTP || booking.startOTP !== otp.toString()) {
      return next(new ApiError(400, 'Invalid OTP provided. Please check again.'));
    }

    // OTP matched - update status
    booking.status = 'in_progress';
    booking.actualStartTime = new Date();
    await booking.save();

    const responseBooking = booking.toObject();
    delete responseBooking.startOTP;

    res.status(200).json({
      success: true,
      message: 'OTP verified. Job started successfully.',
      booking: responseBooking,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Trigger SOS for a booking
// @route   POST /api/v1/bookings/:id/sos
// @access  Private
export const triggerSOS = async (req, res, next) => {
  try {
    const booking = await JobBooking.findById(req.params.id);
    if (!booking) return next(new ApiError(404, 'Booking not found.'));

    // Verify user is part of the booking
    if (booking.employerId.toString() !== req.user._id.toString() && 
        booking.workerId.toString() !== req.user._id.toString()) {
      return next(new ApiError(403, 'Not authorized to trigger SOS for this booking.'));
    }

    const sosAlert = {
      triggeredBy: req.user._id,
      triggeredAt: new Date(),
      location: booking.jobLocation.coordinates ? booking.jobLocation : { type: 'Point', coordinates: [0, 0] }
    };

    booking.sosAlerts.push(sosAlert);
    await booking.save();

    res.status(200).json({
      success: true,
      message: 'SOS Alert triggered successfully. Our team has been notified.',
    });
  } catch (error) {
    next(error);
  }
};

