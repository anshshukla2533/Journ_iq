import express from 'express'
import { body } from 'express-validator'
import jwt from 'jsonwebtoken'
import {
  registerUser,
  loginUser,
  getCurrentUser,
  updateProfile
} from '../controllers/authController.js'
import auth from '../middleware/auth.js'
import passport from '../config/passport.js'

const router = express.Router()

// Frontend login route & OAuth setup
const frontendUrl = process.env.FRONTEND_URL || process.env.VERCEL_FRONTEND_URL || 'http://localhost:5173';

router.get('/login', (req, res) => {
  res.redirect(`${frontendUrl}/login`);
});

// Google OAuth
router.get('/google', passport.authenticate('google', { 
  scope: ['profile', 'email'],
  prompt: 'select_account'
}));

router.get('/google/callback', 
  passport.authenticate('google', { 
    failureRedirect: `${frontendUrl}/login`,
    session: true 
  }), 
  (req, res) => {
    // Generate JWT token here if you're using JWT
    const token = jwt.sign(
      { id: req.user._id },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );
    
    // Redirect to frontend callback route with token
    res.redirect(`${frontendUrl}/auth/callback?token=${token}`);
  });

// GitHub OAuth
router.get('/github/callback', 
  passport.authenticate('github', { 
    failureRedirect: `${frontendUrl}/login`, 
    session: true 
  }), 
  (req, res) => {
    try {
      const token = jwt.sign(
        { id: req.user._id },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN }
      );
      res.redirect(`${frontendUrl}/dashboard?token=${token}`);
    } catch (error) {
      console.error('Auth callback error:', error);
      res.redirect(`${frontendUrl}/login?error=auth_failed`);
    }
  });


// Validation rules
const registerValidation = [
  body('name').trim().isLength({ min: 2, max: 50 }).withMessage('Name must be between 2 and 50 characters'),
  body('email').isEmail().normalizeEmail().withMessage('Please provide a valid email'),
  body('password')
    .isLength({ min: 6 }).withMessage('Password must be at least 6 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one lowercase letter, one uppercase letter, and one number')
];

const loginValidation = [
  body('email').isEmail().normalizeEmail().withMessage('Please provide a valid email'),
  body('password').notEmpty().withMessage('Password is required')
];

const profileValidation = [
  body('name').optional().trim().isLength({ min: 2, max: 50 }).withMessage('Name must be between 2 and 50 characters'),
  body('email').optional().isEmail().normalizeEmail().withMessage('Please provide a valid email')
];

// Auth routes
router.post('/register', registerValidation, registerUser);
router.post('/login', loginValidation, loginUser);
router.get('/user', auth, getCurrentUser);
router.put('/profile', auth, profileValidation, updateProfile);

export default router;
