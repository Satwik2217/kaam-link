import express from 'express';
import { updateProfile } from '../controllers/user.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

router.put('/profile', protect, updateProfile);

export default router;

