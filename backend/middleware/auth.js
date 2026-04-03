import { prisma } from '../lib/prisma.js';
import { verifyAccessToken } from '../lib/auth.js';
import { hasUserUsernameField } from '../lib/prismaCapabilities.js';

const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '').trim();

    if (!token) {
      return res.status(401).json({
        success: false,
        msg: 'No token provided, authorization denied',
      });
    }

    const decoded = verifyAccessToken(token);

    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: {
        id: true,
        name: true,
        email: true,
        online: true,
        lastLogin: true,
        uniqueId: true,
        ...(hasUserUsernameField() ? { username: true } : {}),
      },
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        msg: 'Token is not valid - user not found',
      });
    }

    req.user = {
      ...user,
      _id: user.id,
    };

    return next();
  } catch (error) {
    console.error('Auth middleware error:', error.message);

    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ success: false, msg: 'Token is not valid' });
    }

    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ success: false, msg: 'Token has expired' });
    }

    return res.status(500).json({ success: false, msg: 'Server error during authentication' });
  }
};

export default auth;
