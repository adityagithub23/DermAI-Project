const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Prediction = require('../models/Prediction');
const Rating = require('../models/Rating');
const { protect, authorize } = require('../middleware/auth');

// Log route registration
console.log('✅ Doctor routes registered');

// @route   GET /api/doctors
// @desc    Get all doctors
// @access  Public (for patient to find doctors)
router.get('/', async (req, res) => {
  try {
    const doctors = await User.find({ role: 'doctor' })
      .select('_id firstName lastName specialization consultationFees phone email yearsOfExperience profilePicture bio address patientsTreated')
      .sort({ lastName: 1 });

    // Calculate average ratings for each doctor
    const doctorsWithRatings = await Promise.all(doctors.map(async (doctor) => {
      const ratings = await Rating.find({ doctorId: doctor._id });
      const avgRating = ratings.length > 0
        ? (ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length).toFixed(1)
        : '0.0';
      const totalRatings = ratings.length;

      return {
        ...doctor.toObject(),
        averageRating: parseFloat(avgRating),
        totalRatings
      };
    }));

    res.json({
      success: true,
      count: doctorsWithRatings.length,
      data: doctorsWithRatings
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
});

// @route   GET /api/doctors/dashboard
// @desc    Get doctor dashboard data
// @access  Private (Doctor only)
router.get('/dashboard', protect, authorize('doctor'), async (req, res) => {
  try {
    const doctorId = req.user._id || req.user.id;
    
    console.log('Fetching dashboard for doctor:', doctorId);
    console.log('Doctor ObjectId type:', typeof doctorId, doctorId);
    
    // Convert to ObjectId if it's a string
    const mongoose = require('mongoose');
    const doctorObjectId = mongoose.Types.ObjectId.isValid(doctorId) 
      ? (typeof doctorId === 'string' ? mongoose.Types.ObjectId(doctorId) : doctorId)
      : doctorId;
    
    console.log('Using ObjectId:', doctorObjectId);
    
    // Get all shared reports - query for documents where this doctor is in sharedWithDoctors
    const sharedReports = await Prediction.find({
      'sharedWithDoctors.doctorId': doctorObjectId
    })
      .populate('patientId', 'firstName lastName email phone profilePicture')
      .populate('sharedWithDoctors.doctorId', 'firstName lastName specialization')
      .sort({ createdAt: -1 })
      .lean(); // Use lean() for better performance and to handle nested objects

    console.log('Found shared reports:', sharedReports.length);
    
    // Convert back to Mongoose documents if needed, but with lean() we get plain objects
    // Map the data to ensure consistent structure
    const filteredReports = sharedReports.map(report => {
      // Ensure prediction data is properly structured
      return {
        _id: report._id,
        patientId: report.patientId,
        imageUrl: report.imageUrl,
        symptoms: report.symptoms,
        prediction: {
          disease: report.prediction?.disease || report.prediction?.disease || 'Unknown',
          percentage: report.prediction?.percentage || report.prediction?.confidence || 0,
          confidence: report.prediction?.confidence || report.prediction?.percentage || 0,
          riskLevel: report.prediction?.riskLevel || 'MODERATE'
        },
        allPredictions: report.allPredictions || [],
        recommendation: report.recommendation || {},
        sharedWithDoctors: report.sharedWithDoctors || [],
        createdAt: report.createdAt
      };
    });

    console.log('Processed shared reports:', filteredReports.length);
    
    // Log first report structure for debugging
    if (filteredReports.length > 0) {
      console.log('Sample report structure:', JSON.stringify(filteredReports[0], null, 2));
    }

    // Get all chats for this doctor
    const Chat = require('../models/Chat');
    const chats = await Chat.find({ doctorId: req.user.id })
      .populate('patientId', 'firstName lastName profilePicture')
      .populate('predictionId', 'prediction imageUrl createdAt')
      .sort({ lastMessageAt: -1 })
      .lean();

    // Get doctor info
    const doctor = await User.findById(req.user.id);

    console.log('Final response data:', {
      doctor: doctor ? 'found' : 'not found',
      sharedReportsCount: filteredReports.length,
      chatsCount: chats.length
    });

    res.json({
      success: true,
      data: {
        doctor: doctor ? {
          firstName: doctor.firstName,
          lastName: doctor.lastName,
          specialization: doctor.specialization,
          consultationFees: doctor.consultationFees,
          profilePicture: doctor.profilePicture,
          yearsOfExperience: doctor.yearsOfExperience,
          licenseNumber: doctor.licenseNumber
        } : null,
        sharedReports: filteredReports || [],
        chats: chats || [],
        totalReports: filteredReports.length
      }
    });
  } catch (error) {
    console.error('Doctor dashboard error:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
});

// @route   GET /api/doctors/:id
// @desc    Get single doctor details with ratings
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const doctor = await User.findById(req.params.id)
      .select('-password');

    if (!doctor || doctor.role !== 'doctor') {
      return res.status(404).json({
        success: false,
        message: 'Doctor not found'
      });
    }

    // Get ratings
    const ratings = await Rating.find({ doctorId: doctor._id })
      .populate('patientId', 'firstName lastName profilePicture')
      .populate('predictionId')
      .sort({ createdAt: -1 })
      .limit(20);

    const avgRating = ratings.length > 0
      ? (ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length).toFixed(1)
      : '0.0';

    res.json({
      success: true,
      data: {
        ...doctor.toObject(),
        averageRating: parseFloat(avgRating),
        totalRatings: ratings.length,
        recentRatings: ratings
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

module.exports = router;
