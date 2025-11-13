import express from 'express';
import { body } from 'express-validator';
import passport from '../config/passport.js';
import jwt from 'jsonwebtoken';
import {
  registerUser,
  loginUser,
  getCurrentUser,
  updateProfile
} from '../controllers/authController.js';
import auth from '../middleware/auth.js';

const router = express.Router();

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

// Helper function to generate JWT token
const generateToken = (user) => {
  return jwt.sign(
    { id: user._id },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
};

// Auth routes
router.post('/register', registerValidation, registerUser);
router.post('/login', loginValidation, loginUser);
router.get('/user', auth, getCurrentUser);
router.put('/profile', auth, profileValidation, updateProfile);

// Google OAuth Routes
router.get('/google',
  passport.authenticate('google', { 
    scope: ['profile', 'email'],
    session: false 
  })
);

router.get('/google/callback',
  passport.authenticate('google', { 
    failureRedirect: '/login',
    session: false
  }),
  (req, res) => {
    const token = generateToken(req.user);
    res.redirect(`${process.env.CLIENT_URL}/auth/callback?token=${token}`);
  }
);

// GitHub OAuth Routes
router.get('/github',
  passport.authenticate('github', { 
    scope: ['user:email'],
    session: false
  })
);

router.get('/github/callback',
  passport.authenticate('github', { 
    failureRedirect: '/login',
    session: false
  }),
  (req, res) => {
    const token = generateToken(req.user);
    res.redirect(`${process.env.CLIENT_URL}/auth/callback?token=${token}`);
  }
);

// Logout route
router.post('/logout', auth, (req, res) => {
  res.json({ message: 'Logged out successfully' });
});

export default router;