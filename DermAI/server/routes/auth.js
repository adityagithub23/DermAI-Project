const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { protect } = require('../middleware/auth');

// Log route registration
console.log('✅ Auth routes registered');

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'your_super_secret_jwt_key_change_this_in_production', {
    expiresIn: process.env.JWT_EXPIRE || '7d'
  });
};

// @route   POST /api/auth/register/patient
// @desc    Register a new patient
// @access  Public
router.post('/register/patient', async (req, res) => {
  try {
    const { email, password, firstName, lastName, phone, dateOfBirth, gender } = req.body;

    // Validate required fields
    if (!email || !password || !firstName || !lastName) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email, password, first name, and last name are required' 
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ 
        success: false, 
        message: 'User already exists with this email' 
      });
    }

    // Create user
    const user = await User.create({
      email: email.trim().toLowerCase(),
      password,
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      phone: phone?.trim() || '',
      dateOfBirth: dateOfBirth || undefined,
      gender: gender || 'other',
      role: 'patient'
    });

    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Patient registration error:', error);
    res.status(400).json({ 
      success: false, 
      message: error.message || 'Registration failed. Please check your input.' 
    });
  }
});

// @route   POST /api/auth/register/doctor
// @desc    Register a new doctor
// @access  Public
router.post('/register/doctor', async (req, res) => {
  try {
    const { 
      email, 
      password, 
      firstName, 
      lastName, 
      phone, 
      specialization, 
      consultationFees, 
      licenseNumber,
      yearsOfExperience 
    } = req.body;

    // Validate required fields
    if (!email || !password || !firstName || !lastName) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email, password, first name, and last name are required' 
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ 
        success: false, 
        message: 'User already exists with this email' 
      });
    }

    // Create user
    const user = await User.create({
      email: email.trim().toLowerCase(),
      password,
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      phone: phone?.trim() || '',
      specialization: specialization?.trim() || '',
      consultationFees: consultationFees ? parseFloat(consultationFees) : 0,
      licenseNumber: licenseNumber?.trim() || '',
      yearsOfExperience: yearsOfExperience ? parseInt(yearsOfExperience) : 0,
      role: 'doctor'
    });

    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        specialization: user.specialization,
        consultationFees: user.consultationFees
      }
    });
  } catch (error) {
    console.error('Doctor registration error:', error);
    res.status(400).json({ 
      success: false, 
      message: error.message || 'Registration failed. Please check your input.' 
    });
  }
});

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate email and password
    if (!email || !password) {
      return res.status(400).json({ 
        success: false, 
        message: 'Please provide email and password' 
      });
    }

    // Check for user
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid credentials' 
      });
    }

    // Check if password matches
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid credentials' 
      });
    }

    const token = generateToken(user._id);

    const userResponse = {
      id: user._id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role
    };

    if (user.role === 'doctor') {
      userResponse.specialization = user.specialization;
      userResponse.consultationFees = user.consultationFees;
    }

    res.json({
      success: true,
      token,
      user: userResponse
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message || 'Server error. Please try again.' 
    });
  }
});

// @route   GET /api/auth/me
// @desc    Get current logged in user
// @access  Private
router.get('/me', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    res.json({
      success: true,
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        phone: user.phone,
        ...(user.role === 'doctor' && {
          specialization: user.specialization,
          consultationFees: user.consultationFees,
          licenseNumber: user.licenseNumber,
          yearsOfExperience: user.yearsOfExperience
        }),
        ...(user.role === 'patient' && {
          gender: user.gender,
          dateOfBirth: user.dateOfBirth
        })
      }
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
});

module.exports = router;

