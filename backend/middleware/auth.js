import jwt from 'jsonwebtoken'
import User from '../models/User.js'

const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '')

    if (!token) {
      return res.status(401).json({
        success: false,
        msg: 'No token provided, authorization denied'
      })
    }

  
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    
    
    const user = await User.findById(decoded.id).select('-password')
    
    if (!user) {
      return res.status(401).json({
        success: false,
        msg: 'Token is not valid - user not found'
      })
    }

    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        msg: 'User account is deactivated'
      })
    }

    req.user = user
    next()
  } catch (error) {
    console.error('Auth middleware error:', error.message)
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        msg: 'Token is not valid'
      })
    } else if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        msg: 'Token has expired'
      })
    }
    
    res.status(500).json({
      success: false,
      msg: 'Server error during authentication'
    })
  }
}

export default auth