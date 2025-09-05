import jwt from 'jsonwebtoken'
import { validationResult } from 'express-validator'
import User from '../models/User.js'


const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  })
}


export const registerUser = async (req, res) => {
  try {
  
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        msg: 'Validation failed',
        errors: errors.array()
      })
    }

    const { name, email, password } = req.body

  
    const existingUser = await User.findOne({ email })
    if (existingUser) {
      return res.status(400).json({
        success: false,
        msg: 'User already exists with this email'
      })
    }

    const user = new User({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password
    })

    await user.save()

 
    const token = generateToken(user._id)

    res.status(201).json({
      success: true,
      msg: 'User registered successfully',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      }
    })
  } catch (error) {
    console.error('Register error:', error.message)
    res.status(500).json({
      success: false,
      msg: 'Server error during registration'
    })
  }
}


export const loginUser = async (req, res) => {
  try {
   
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        msg: 'Validation failed',
        errors: errors.array()
      })
    }

    const { email, password } = req.body

    const user = await User.findOne({ email: email.toLowerCase().trim() }).select('+password')
    if (!user) {
      return res.status(400).json({
        success: false,
        msg: 'Invalid credentials'
      })
    }

  
    if (!user.isActive) {
      return res.status(400).json({
        success: false,
        msg: 'Account is deactivated. Please contact support.'
      })
    }

  
    const isMatch = await user.comparePassword(password)
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        msg: 'Invalid credentials'
      })
    }

   
    await user.updateLastLogin()

 
    const token = generateToken(user._id)

    res.json({
      success: true,
      msg: 'Login successful',
      token,
      name: user.name,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        lastLogin: user.lastLogin
      }
    })
  } catch (error) {
    console.error('Login error:', error.message)
    res.status(500).json({
      success: false,
      msg: 'Server error during login'
    })
  }
}


export const getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
    
    res.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        createdAt: user.createdAt,
        lastLogin: user.lastLogin
      }
    })
  } catch (error) {
    console.error('Get user error:', error.message)
    res.status(500).json({
      success: false,
      msg: 'Server error while fetching user data'
    })
  }
}


export const updateProfile = async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        msg: 'Validation failed',
        errors: errors.array()
      })
    }

    const { name, email } = req.body
    const userId = req.user.id

    
    if (email) {
      const existingUser = await User.findOne({ 
        email: email.toLowerCase().trim(),
        _id: { $ne: userId }
      })
      
      if (existingUser) {
        return res.status(400).json({
          success: false,
          msg: 'Email is already taken by another user'
        })
      }
    }

   
    const user = await User.findByIdAndUpdate(
      userId,
      {
        ...(name && { name: name.trim() }),
        ...(email && { email: email.toLowerCase().trim() })
      },
      { new: true, runValidators: true }
    )

    res.json({
      success: true,
      msg: 'Profile updated successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      }
    })
  } catch (error) {
    console.error('Update profile error:', error.message)
    res.status(500).json({
      success: false,
      msg: 'Server error while updating profile'
    })
  }
}