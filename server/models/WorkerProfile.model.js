import mongoose from 'mongoose';

// Sub-schema for individual reviews
const reviewSchema = new mongoose.Schema(
  {
    reviewerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    reviewerName: { type: String, required: true },
    jobBookingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'JobBooking',
      required: true,
    },
    rating: {
      type: Number,
      required: true,
      min: [1, 'Rating must be at least 1'],
      max: [5, 'Rating cannot exceed 5'],
    },
    comment: {
      type: String,
      trim: true,
      maxlength: [500, 'Review comment cannot exceed 500 characters'],
    },
    isVerifiedBooking: { type: Boolean, default: true }, // Only post-booking reviews
  },
  { timestamps: true }
);

const workerProfileSchema = new mongoose.Schema(
  {
    // --- Link to User ---
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true, // One worker profile per user
    },

    // --- Real-world readiness flags ---
    // Worker is visible in search only when BOTH are true:
    // - isProfileComplete: KYC + bank + skills fully provided
    // - isOnline: worker explicitly toggled "Ready to work"
    isProfileComplete: {
      type: Boolean,
      default: false,
    },
    isOnline: {
      type: Boolean,
      default: false,
    },

    // --- Professional Skills ---
    primarySkill: {
      type: String,
      required: [true, 'Primary skill is required'],
      enum: {
        values: [
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
        message: 'Please select a valid skill category',
      },
    },
    additionalSkills: {
      type: [String],
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
      default: [],
    },
    experienceYears: {
      type: Number,
      required: [true, 'Years of experience is required'],
      min: [0, 'Experience cannot be negative'],
      max: [50, 'Experience cannot exceed 50 years'],
    },
    bio: {
      type: String,
      trim: true,
      maxlength: [1000, 'Bio cannot exceed 1000 characters'],
    },
    languages: {
      type: [String],
      default: ['Hindi'],
    },

    // --- Availability & Pricing ---
    availability: {
      isAvailable: { type: Boolean, default: true },
      availableDays: {
        type: [String],
        enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
        default: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
      },
      availableTimeStart: { type: String, default: '08:00' }, // "HH:MM" 24hr format
      availableTimeEnd: { type: String, default: '20:00' },
    },
    wageRate: {
      amount: {
        type: Number,
        required: [true, 'Wage rate is required'],
        min: [100, 'Minimum wage is ₹100'],
      },
      unit: {
        type: String,
        enum: ['per_hour', 'per_day', 'per_month'],
        default: 'per_day',
      },
      currency: { type: String, default: 'INR' },
      isNegotiable: { type: Boolean, default: true },
    },

    // --- Service Area ---
    serviceRadius: {
      type: Number,
      default: 10, // in kilometers
      min: 1,
      max: 100,
    },
    preferredLocations: {
      type: [String], // List of preferred areas/localities
      default: [],
    },

    // --- Statistics & Reputation ---
    stats: {
      totalJobsCompleted: { type: Number, default: 0 },
      totalEarnings: { type: Number, default: 0 }, // In INR paise (integer for precision)
      averageRating: { type: Number, default: 0, min: 0, max: 5 },
      totalReviews: { type: Number, default: 0 },
      responseRate: { type: Number, default: 100, min: 0, max: 100 }, // Percentage
      onTimeRate: { type: Number, default: 100, min: 0, max: 100 }, // Percentage
    },
    reviews: [reviewSchema],

    // --- Portfolio / Work Samples ---
    portfolioImages: {
      type: [String], // Array of image URLs/paths
      default: [],
      validate: {
        validator: (arr) => arr.length <= 10,
        message: 'Cannot have more than 10 portfolio images',
      },
    },

    // --- Certifications / Training ---
    certifications: [
      {
        name: { type: String, required: true },
        issuingOrganization: { type: String },
        issueDate: { type: Date },
        documentUrl: { type: String },
      },
    ],

    // --- Employment Preferences ---
    jobTypePreference: {
      type: String,
      enum: ['full_time', 'part_time', 'contractual', 'any'],
      default: 'any',
    },
    isOpenToLiveIn: { type: Boolean, default: false }, // For maids/caregivers
    hasOwnTools: { type: Boolean, default: false }, // For plumbers, electricians, etc.
    hasVehicle: { type: Boolean, default: false }, // For drivers, delivery workers

    // --- Background Check ---
    backgroundCheckStatus: {
      type: String,
      enum: ['not_initiated', 'pending', 'passed', 'failed'],
      default: 'not_initiated',
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// --- INDEXES ---
workerProfileSchema.index({ primarySkill: 1 });
workerProfileSchema.index({ 'stats.averageRating': -1 });
workerProfileSchema.index({ 'availability.isAvailable': 1 });
workerProfileSchema.index({ 'wageRate.amount': 1 });
workerProfileSchema.index({ isProfileComplete: 1, isOnline: 1 });

// --- MIDDLEWARE: Recalculate averageRating after review added ---
workerProfileSchema.methods.recalculateRating = function () {
  if (this.reviews.length === 0) {
    this.stats.averageRating = 0;
    this.stats.totalReviews = 0;
    return;
  }
  const totalRating = this.reviews.reduce((sum, review) => sum + review.rating, 0);
  this.stats.averageRating = parseFloat((totalRating / this.reviews.length).toFixed(2));
  this.stats.totalReviews = this.reviews.length;
};

const WorkerProfile = mongoose.model('WorkerProfile', workerProfileSchema);
export default WorkerProfile;

