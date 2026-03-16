import mongoose from 'mongoose';

const jobBookingSchema = new mongoose.Schema(
  {
    // --- Parties Involved ---
    employerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Employer ID is required'],
    },
    workerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Worker ID is required'],
    },
    workerProfileId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'WorkerProfile',
      required: [true, 'Worker Profile ID is required'],
    },

    // --- Job Details ---
    jobTitle: {
      type: String,
      required: [true, 'Job title is required'],
      trim: true,
      maxlength: 200,
    },
    jobDescription: {
      type: String,
      trim: true,
      maxlength: 2000,
    },
    skillRequired: {
      type: String,
      required: true,
      enum: [
        'maid',
        'cook',
        'driver',
        'plumber',
        'electrician',
        'carpenter',
        'painter',
        'ac_technician',
        'gardener',
        'security_guard',
        'babysitter',
        'elder_care',
        'delivery',
        'other',
      ],
    },

    // --- Scheduling ---
    scheduledStartDate: {
      type: Date,
      required: [true, 'Start date is required'],
    },
    scheduledEndDate: {
      type: Date,
      required: [true, 'End date is required'],
    },
    actualStartTime: { type: Date, default: null },
    actualEndTime: { type: Date, default: null },
    jobType: {
      type: String,
      enum: ['one_time', 'recurring_daily', 'recurring_weekly', 'contractual'],
      default: 'one_time',
    },

    // --- Location ---
    jobLocation: {
      address: { type: String, required: true },
      city: { type: String, required: true },
      pincode: { type: String },
      coordinates: {
        type: { type: String, default: 'Point' },
        coordinates: { type: [Number], default: [0, 0] },
      },
    },

    // --- Financial ---
    agreedWage: {
      amount: { type: Number, required: true },
      unit: { type: String, enum: ['per_hour', 'per_day', 'per_month'], required: true },
      currency: { type: String, default: 'INR' },
    },
    totalAmount: {
      type: Number,
      required: true, // Calculated at booking time
    },
    platformFee: {
      type: Number,
      default: 0, // Platform commission (e.g., 5% of totalAmount)
    },
    workerPayout: {
      type: Number,
      default: 0, // totalAmount - platformFee
    },

    // --- Booking Lifecycle Status ---
    status: {
      type: String,
      enum: {
        values: [
          'pending_worker_acceptance', // Employer created, waiting for worker
          'accepted', // Worker accepted
          'rejected', // Worker rejected
          'in_progress', // Job is actively happening
          'pending_completion_review', // Worker marked done, employer to confirm
          'completed', // Employer confirmed, triggers payment release
          'cancelled_by_employer',
          'cancelled_by_worker',
          'disputed',
        ],
        message: 'Invalid booking status',
      },
      default: 'pending_worker_acceptance',
    },
    cancellationReason: { type: String, default: null },

    // --- Payment Status ---
    paymentStatus: {
      type: String,
      enum: ['unpaid', 'held_in_escrow', 'released_to_worker', 'refunded', 'disputed'],
      default: 'unpaid',
    },
    paymentMethod: {
      type: String,
      enum: ['upi', 'bank_transfer', 'cash', 'wallet', null],
      default: null,
    },
    paymentTransactionId: { type: String, default: null },
    paymentReleasedAt: { type: Date, default: null },

    // --- Safety & Tracking ---
    safetyCheckin: {
      isEnabled: { type: Boolean, default: false },
      lastCheckinTime: { type: Date, default: null },
      workerCurrentLocation: {
        type: { type: String, default: 'Point' },
        coordinates: { type: [Number], default: [0, 0] },
      },
    },
    sosAlerts: [
      {
        triggeredBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        triggeredAt: { type: Date, default: Date.now },
        location: {
          type: { type: String, default: 'Point' },
          coordinates: [Number],
        },
        isResolved: { type: Boolean, default: false },
        resolvedAt: { type: Date },
        notes: { type: String },
      },
    ],

    // --- Reviews ---
    employerReview: {
      rating: { type: Number, min: 1, max: 5 },
      comment: { type: String, maxlength: 500 },
      submittedAt: { type: Date },
    },
    workerReview: {
      rating: { type: Number, min: 1, max: 5 },
      comment: { type: String, maxlength: 500 },
      submittedAt: { type: Date },
    },
    isEmployerReviewSubmitted: { type: Boolean, default: false },
    isWorkerReviewSubmitted: { type: Boolean, default: false },

    // --- Admin Notes ---
    adminNotes: { type: String, default: null },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// --- INDEXES ---
jobBookingSchema.index({ employerId: 1, status: 1 });
jobBookingSchema.index({ workerId: 1, status: 1 });
jobBookingSchema.index({ status: 1, createdAt: -1 });
jobBookingSchema.index({ 'jobLocation.coordinates': '2dsphere' });

// --- VIRTUAL: Duration in hours ---
jobBookingSchema.virtual('durationHours').get(function () {
  if (!this.actualStartTime || !this.actualEndTime) return null;
  return parseFloat(((this.actualEndTime - this.actualStartTime) / (1000 * 60 * 60)).toFixed(2));
});

const JobBooking = mongoose.model('JobBooking', jobBookingSchema);
export default JobBooking;

