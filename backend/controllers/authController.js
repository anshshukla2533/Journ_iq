import bcrypt from 'bcryptjs';
import { validationResult } from 'express-validator';
import { prisma } from '../lib/prisma.js';
import { signAccessToken } from '../lib/auth.js';
import {
  hasAuthAccountModel,
  hasUserUsernameField,
  userSelectWithCompatibility,
} from '../lib/prismaCapabilities.js';

const userSelect = userSelectWithCompatibility();

function formatValidationError(res, errors) {
  return res.status(400).json({
    success: false,
    msg: 'Validation failed',
    errors: errors.array(),
  });
}

function normalizeUsername(value) {
  if (!value) return null;
  return value.trim().toLowerCase();
}

function buildAuthPayload(user, msg) {
  return {
    success: true,
    msg,
    token: signAccessToken(user.id),
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      username: user.username || null,
      createdAt: user.createdAt,
      lastLogin: user.lastLogin,
    },
  };
}

export const registerUser = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return formatValidationError(res, errors);
    }

    const { name, email, username, password } = req.body;
    const normalizedEmail = email.toLowerCase().trim();
    const normalizedUsername = normalizeUsername(username);
    const supportsUsername = hasUserUsernameField();
    const supportsAuthAccount = hasAuthAccountModel();

    const [existingEmail, existingUsername] = await Promise.all([
      prisma.user.findUnique({ where: { email: normalizedEmail } }),
      supportsUsername && normalizedUsername
        ? prisma.user.findUnique({ where: { username: normalizedUsername } })
        : Promise.resolve(null),
    ]);

    if (existingEmail) {
      return res.status(400).json({ success: false, msg: 'User already exists with this email' });
    }

    if (existingUsername) {
      return res.status(400).json({ success: false, msg: 'Username is already taken' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await prisma.user.create({
      data: {
        name: name.trim(),
        email: normalizedEmail,
        ...(supportsUsername ? { username: normalizedUsername } : {}),
        password: hashedPassword,
        ...(supportsAuthAccount
          ? {
              authAccounts: {
                create: {
                  provider: 'credentials',
                  providerAccountId: normalizedEmail,
                },
              },
            }
          : {}),
      },
      select: userSelect,
    });

    return res.status(201).json(buildAuthPayload(user, 'User registered successfully'));
  } catch (error) {
    console.error('Register error:', error.message);
    return res.status(500).json({ success: false, msg: 'Server error during registration' });
  }
};

export const loginUser = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return formatValidationError(res, errors);
    }

    const { identifier, password } = req.body;
    const normalizedIdentifier = identifier.toLowerCase().trim();
    const supportsUsername = hasUserUsernameField();

    const user = await prisma.user.findFirst({
      where: {
        OR: supportsUsername
          ? [
              { email: normalizedIdentifier },
              { username: normalizedIdentifier },
            ]
          : [{ email: normalizedIdentifier }],
      },
    });

    if (!user?.password) {
      return res.status(400).json({ success: false, msg: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ success: false, msg: 'Invalid credentials' });
    }

    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: { lastLogin: new Date() },
      select: userSelect,
    });

    return res.json(buildAuthPayload(updatedUser, 'Login successful'));
  } catch (error) {
    console.error('Login error:', error.message);
    return res.status(500).json({ success: false, msg: 'Server error during login' });
  }
};

export const getCurrentUser = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: userSelect,
    });

    return res.json({
      success: true,
      user,
    });
  } catch (error) {
    console.error('Get user error:', error.message);
    return res.status(500).json({ success: false, msg: 'Server error while fetching user data' });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return formatValidationError(res, errors);
    }

    const { name, email, username } = req.body;
    const userId = req.user.id;
    const normalizedEmail = email ? email.toLowerCase().trim() : undefined;
    const normalizedUsername = username ? normalizeUsername(username) : undefined;
    const supportsUsername = hasUserUsernameField();

    if (normalizedEmail) {
      const existingUser = await prisma.user.findUnique({ where: { email: normalizedEmail } });
      if (existingUser && existingUser.id !== userId) {
        return res.status(400).json({ success: false, msg: 'Email is already taken by another user' });
      }
    }

    if (supportsUsername && normalizedUsername) {
      const existingUser = await prisma.user.findUnique({ where: { username: normalizedUsername } });
      if (existingUser && existingUser.id !== userId) {
        return res.status(400).json({ success: false, msg: 'Username is already taken by another user' });
      }
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(name ? { name: name.trim() } : {}),
        ...(normalizedEmail ? { email: normalizedEmail } : {}),
        ...(supportsUsername && normalizedUsername ? { username: normalizedUsername } : {}),
      },
      select: userSelect,
    });

    return res.json({
      success: true,
      msg: 'Profile updated successfully',
      user: updatedUser,
    });
  } catch (error) {
    console.error('Update profile error:', error.message);
    return res.status(500).json({ success: false, msg: 'Server error while updating profile' });
  }
};
