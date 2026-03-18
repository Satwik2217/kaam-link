import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema(
  {
    // --- Core Identity ---
    fullName: {
      type: String,
      required: [true, 'Full name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters'],
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      unique: true,
      trim: true,
      match: [/^[6-9]\d{9}$/, 'Please enter a valid 10-digit Indian mobile number'],
    },
    email: {
      type: String,
      unique: true,
      sparse: true, // Allows multiple documents to have null email
      lowercase: true,
      trim: true,
      match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [8, 'Password must be at least 8 characters'],
      select: false, // Never return password in queries by default
    },

    // --- Role & Status ---
    role: {
      type: String,
      enum: {
        values: ['worker', 'employer', 'admin'],
        message: 'Role must be worker, employer, or admin',
      },
      required: [true, 'User role is required'],
      default: 'employer',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    isPhoneVerified: {
      type: Boolean,
      default: false,
    },

    // --- Verification & KYC ---
    verificationStatus: {
      type: String,
      enum: ['unverified', 'pending_review', 'verified', 'rejected'],
      default: 'unverified',
    },
    governmentIdType: {
      type: String,
      enum: ['aadhaar', 'voter_id', 'pan', 'driving_license', null],
      default: null,
    },
    governmentIdUrl: {
      type: String, // Path to uploaded document
      default: null,
    },
    adminVerificationNotes: {
      type: String,
      default: null,
    },
    // Feature A: Worker KYC & Bank Details
    aadhaarNumber: {
      type: String,
      select: false,
      trim: true,
      match: [/^\d{12}$/, 'Aadhaar must be exactly 12 digits'],
    },
    last4Aadhaar: {
      type: String,
      default: null,
    },
    bankAccount: {
      holderName: { type: String, trim: true },
      accountNumber: {
        type: String,
        trim: true,
        match: [/^\d{9,18}$/, 'Account number must be between 9 and 18 digits'],
      },
      ifsc: {
        type: String,
        trim: true,
        match: [/^[A-Z]{4}0[A-Z0-9]{6}$/, 'Please enter a valid IFSC code'],
      },
      bankName: { type: String, trim: true },
      upiId: { type: String, trim: true },
    },
    kycStatus: {
      type: String,
      enum: ['not_submitted', 'pending_review', 'verified', 'rejected'],
      default: 'not_submitted',
    },
    kycSubmittedAt: { type: Date, default: null },
    kycVerifiedAt: { type: Date, default: null },
    kycRejectionReason: { type: String, default: null },

    // --- Profile ---
    profilePicture: {
      type: String,
      default: null,
    },
    dateOfBirth: {
      type: Date,
      default: null,
    },
    gender: {
      type: String,
      enum: ['male', 'female', 'non-binary', 'prefer_not_to_say', null],
      default: null,
    },

    // --- Address / Location ---
    address: {
      street: { type: String, trim: true },
      city: { type: String, trim: true },
      state: { type: String, trim: true },
      pincode: {
        type: String,
        match: [/^[1-9][0-9]{5}$/, 'Please enter a valid 6-digit pincode'],
      },
      coordinates: {
        type: { type: String, default: 'Point' },
        coordinates: { type: [Number], default: [0, 0] }, // [longitude, latitude]
      },
    },

    // --- Privacy & Safety (for Women-First feature) ---
    privacySettings: {
      hidePhoneFromPublic: { type: Boolean, default: false },
      womenOnlyJobs: { type: Boolean, default: false }, // Worker: only accept jobs from verified women employers
      allowLocationTracking: { type: Boolean, default: true },
    },

    // --- OTP for phone verification ---
    verificationOtp: {
      code: { type: String, select: false },
      expiresAt: { type: Date, select: false },
    },

    // --- Password Reset Fields ---
    resetToken: { type: String, select: false },
    resetTokenExpiresAt: { type: Date, select: false },

    // --- WorkerProfile reference (only populated if role === 'worker') ---
    workerProfile: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'WorkerProfile',
      default: null,
    },

    // --- Timestamps for last activity ---
    lastLoginAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt automatically
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// --- INDEXES ---
userSchema.index({ 'address.coordinates': '2dsphere' }); // For geospatial queries
userSchema.index({ role: 1, verificationStatus: 1 });

// --- VIRTUAL: Full address string ---
userSchema.virtual('fullAddress').get(function () {
  const a = this.address;
  if (!a || !a.city) return null;
  return [a.street, a.city, a.state, a.pincode].filter(Boolean).join(', ');
});

// --- PRE-SAVE HOOK: Hash password before saving ---
userSchema.pre('save', async function (next) {
  // Only hash the password if it has been modified (or is new)
  if (!this.isModified('password')) return next();
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// --- INSTANCE METHOD: Compare password ---
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// --- INSTANCE METHOD: Return safe public profile (no sensitive fields) ---
userSchema.methods.toPublicProfile = function () {
  const obj = this.toObject();
  delete obj.password;
  delete obj.otp;
  delete obj.governmentIdUrl;
  delete obj.adminVerificationNotes;

  // Ensure we don't return sensitive Aadhaar or precise bank data
  delete obj.aadhaarNumber;

  // Add a safe summary of bank details and kyc status
  const hasBank = !!(this.bankAccount?.accountNumber);
  obj.isBankDetailsPresent = hasBank;

  // Provide masked bank account if present (e.g. ****1234)
  if (hasBank) {
    const acctNum = this.bankAccount.accountNumber;
    if (acctNum) {
      obj.bankAccountMasked = '****' + acctNum.slice(-4);
    }
  }
  delete obj.bankAccount; // Delete the raw bankAccount object entirely

  return obj;
};

const User = mongoose.model('User', userSchema);
export default User;

