import express from 'express';
import { body } from 'express-validator';
import { signup, login, logout, getMe } from '../controllers/auth.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

// --- Validation Rules ---
const signupValidation = [
  body('fullName')
    .trim()
    .notEmpty()
    .withMessage('Full name is required.')
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters.'),
  body('phone')
    .trim()
    .notEmpty()
    .withMessage('Phone number is required.')
    .matches(/^[6-9]\d{9}$/)
    .withMessage('Please enter a valid 10-digit Indian mobile number.'),
  body('email')
    .optional({ checkFalsy: true })
    .isEmail()
    .withMessage('Please enter a valid email address.')
    .normalizeEmail(),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long.')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage(
      'Password must contain at least one uppercase letter, one lowercase letter, and one number.'
    ),
  body('role')
    .optional()
    .isIn(['worker', 'employer'])
    .withMessage("Role must be either 'worker' or 'employer'."),
];

const loginValidation = [
  body('phone').trim().notEmpty().withMessage('Phone number is required.'),
  body('password').notEmpty().withMessage('Password is required.'),
];

// --- Routes ---
router.post('/signup', signupValidation, signup);
router.post('/login', loginValidation, login);
router.post('/logout', protect, logout);
router.get('/me', protect, getMe);

export default router;

