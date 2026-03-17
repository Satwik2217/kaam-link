import express from 'express';
import { updateProfile, deleteAccount } from '../controllers/user.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

router.put('/profile', protect, updateProfile);
router.delete('/profile', protect, deleteAccount);

export default router;

