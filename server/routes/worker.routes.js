import express from 'express';
import {
  getWorkers,
  getWorkerById,
  updateMyWorkerProfile,
} from '../controllers/worker.controller.js';
import { protect } from '../middleware/auth.middleware.js';
import { restrictTo } from '../middleware/role.middleware.js';

const router = express.Router();

router.get('/', getWorkers);
router.get('/:id', getWorkerById);
router.put('/my-profile', protect, restrictTo('worker'), updateMyWorkerProfile);

export default router;

