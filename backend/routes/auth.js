import express from 'express';
import { body } from 'express-validator';
import {
  registerUser,
  loginUser,
  getCurrentUser,
  updateProfile,
} from '../controllers/authController.js';
import auth from '../middleware/auth.js';
import passport from '../config/passport.js';
import { buildClientRedirect, signAccessToken } from '../lib/auth.js';

const router = express.Router();

const registerValidation = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters'),
  body('username')
    .trim()
    .isLength({ min: 3, max: 24 })
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('Username must be 3-24 characters and contain only letters, numbers, or underscores'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one lowercase letter, one uppercase letter, and one number'),
];

const loginValidation = [
  body('identifier')
    .trim()
    .notEmpty()
    .withMessage('Email or username is required'),
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
];

const profileValidation = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters'),
  body('username')
    .optional()
    .trim()
    .isLength({ min: 3, max: 24 })
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('Username must be 3-24 characters and contain only letters, numbers, or underscores'),
  body('email')
    .optional()
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
];

router.get('/login', (req, res) => {
  res.redirect(buildClientRedirect('/login'));
});

router.get(
  '/google',
  passport.authenticate('google', {
    scope: ['profile', 'email'],
    prompt: 'select_account',
    session: false,
  })
);

router.get(
  '/google/callback',
  passport.authenticate('google', {
    failureRedirect: buildClientRedirect('/login?error=google_auth_failed'),
    session: false,
  }),
  (req, res) => {
    const token = signAccessToken(req.user.id);
    const redirectUrl = new URL(buildClientRedirect('/auth/callback'));
    redirectUrl.searchParams.set('token', token);
    res.redirect(redirectUrl.toString());
  }
);

router.post('/register', registerValidation, registerUser);
router.post('/login', loginValidation, loginUser);
router.get('/me', auth, getCurrentUser);
router.get('/user', auth, getCurrentUser);
router.put('/profile', auth, profileValidation, updateProfile);

export default router;
