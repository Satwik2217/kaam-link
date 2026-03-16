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
    res.status(200).json({
      success: true,
      message: `Booking status updated to '${status}'.`,
      booking,
    });
  } catch (error) {
    next(error);
  }
};

