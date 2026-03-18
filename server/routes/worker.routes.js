import express from 'express';
import {
  getWorkers,
  getWorkerById,
  updateMyWorkerProfile,
  submitKyc,
  getMyKycStatus,
} from '../controllers/worker.controller.js';
import { protect } from '../middleware/auth.middleware.js';
import { restrictTo } from '../middleware/role.middleware.js';

const router = express.Router();

// Worker Protected Routes (must be before param routes like /:id)
router.put('/my-profile', protect, restrictTo('worker'), updateMyWorkerProfile);
router.put('/my-kyc', protect, restrictTo('worker'), submitKyc);
router.get('/my-kyc', protect, restrictTo('worker'), getMyKycStatus);

// Public Routes
router.get('/', getWorkers);
router.get('/:id', getWorkerById);

export default router;
