import { Router } from 'express';
import { protect, authorize } from '../middleware/auth.middleware.js';
import { getNearbyWorkers, updateWorkerLocation } from '../controllers/map.controller.js';

const router = Router();

// All routes require authentication
router.use(protect);

// Get nearby workers (employers only)
router.get('/nearby-workers', authorize('employer'), getNearbyWorkers);

// Update worker location (workers only)
router.put('/update-location', authorize('worker'), updateWorkerLocation);

export default router;
