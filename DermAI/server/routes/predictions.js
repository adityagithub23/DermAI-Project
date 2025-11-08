const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const axios = require('axios');
const Prediction = require('../models/Prediction');
const User = require('../models/User');
const { protect, authorize } = require('../middleware/auth');

// Log route registration
console.log('✅ Prediction routes registered');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'uploads';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'prediction-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|bmp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'));
    }
  }
});

// @route   POST /api/predictions
// @desc    Create a new prediction
// @access  Private (Patient only)
router.post('/', protect, authorize('patient'), upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ 
        success: false, 
        message: 'Please upload an image' 
      });
    }

    const { symptoms } = req.body;
    const imageUrl = `/uploads/${req.file.filename}`;

    // Call Python ML API for prediction
    try {
      const FormData = require('form-data');
      const formData = new FormData();
      const imageBuffer = fs.readFileSync(req.file.path);
      formData.append('file', imageBuffer, {
        filename: req.file.filename,
        contentType: req.file.mimetype
      });

      const mlApiUrl = (process.env.PYTHON_ML_API || 'http://localhost:5002') + '/predict';
      console.log('Calling ML API:', mlApiUrl);
      
      const mlResponse = await axios.post(
        mlApiUrl,
        formData,
        {
          headers: formData.getHeaders(),
          maxContentLength: Infinity,
          maxBodyLength: Infinity
        }
      );

      if (!mlResponse.data.success) {
        // If ML API fails, create a placeholder prediction
        const placeholderPrediction = {
          disease: 'Unknown',
          confidence: 0.5,
          percentage: 50,
          riskLevel: 'LOW'
        };

        const prediction = await Prediction.create({
          patientId: req.user.id,
          imageUrl,
          symptoms: symptoms || '',
          prediction: placeholderPrediction,
          allPredictions: [placeholderPrediction],
          recommendation: {
            riskMessage: 'Unable to analyze image. Please consult a doctor.',
            diseaseInfo: 'AI analysis unavailable',
            generalAdvice: 'Please consult with a qualified dermatologist.'
          }
        });

        return res.json({
          success: true,
          data: prediction
        });
      }

      const mlData = mlResponse.data;

      // Create prediction record
      const prediction = await Prediction.create({
        patientId: req.user.id,
        imageUrl,
        symptoms: symptoms || '',
        prediction: {
          disease: mlData.prediction.disease,
          confidence: mlData.prediction.confidence,
          percentage: mlData.prediction.percentage,
          riskLevel: mlData.prediction.risk_level
        },
        allPredictions: mlData.all_predictions || [],
        recommendation: mlData.recommendation || {}
      });

      res.json({
        success: true,
        data: prediction
      });

    } catch (mlError) {
      console.error('ML API Error:', mlError.message);
      console.error('ML API Error Details:', {
        message: mlError.message,
        status: mlError.response?.status,
        statusText: mlError.response?.statusText,
        data: mlError.response?.data,
        url: mlApiUrl
      });
      
      // Create placeholder prediction if ML API is unavailable
      const placeholderPrediction = {
        disease: 'Analysis Unavailable',
        confidence: 0.5,
        percentage: 50,
        riskLevel: 'LOW'
      };

      const prediction = await Prediction.create({
        patientId: req.user.id,
        imageUrl,
        symptoms: symptoms || '',
        prediction: placeholderPrediction,
        allPredictions: [placeholderPrediction],
        recommendation: {
          riskMessage: 'AI analysis service is currently unavailable. Please consult a doctor.',
          diseaseInfo: 'Service unavailable',
          generalAdvice: 'Please consult with a qualified dermatologist for proper evaluation.'
        }
      });

      res.json({
        success: true,
        data: prediction,
        warning: 'ML service unavailable, placeholder prediction created'
      });
    }

  } catch (error) {
    console.error('Prediction error:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
});

// @route   GET /api/predictions
// @desc    Get all predictions for logged in patient
// @access  Private (Patient only)
router.get('/', protect, authorize('patient'), async (req, res) => {
  try {
    const predictions = await Prediction.find({ patientId: req.user.id })
      .sort({ createdAt: -1 })
      .populate('sharedWithDoctors.doctorId', 'firstName lastName specialization');

    res.json({
      success: true,
      count: predictions.length,
      data: predictions
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
});

// @route   GET /api/predictions/:id
// @desc    Get single prediction
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const prediction = await Prediction.findById(req.params.id)
      .populate('patientId', 'firstName lastName email')
      .populate('sharedWithDoctors.doctorId', 'firstName lastName specialization');

    if (!prediction) {
      return res.status(404).json({ 
        success: false, 
        message: 'Prediction not found' 
      });
    }

    // Check if user has access
    if (req.user.role === 'patient' && prediction.patientId._id.toString() !== req.user.id) {
      return res.status(403).json({ 
        success: false, 
        message: 'Not authorized' 
      });
    }

    // Doctors can only see if shared with them
    if (req.user.role === 'doctor') {
      const isShared = prediction.sharedWithDoctors.some(
        share => share.doctorId._id.toString() === req.user.id
      );
      if (!isShared) {
        return res.status(403).json({ 
          success: false, 
          message: 'This report has not been shared with you' 
        });
      }
    }

    res.json({
      success: true,
      data: prediction
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
});

// @route   POST /api/predictions/:id/share
// @desc    Share prediction with a doctor
// @access  Private (Patient only)
router.post('/:id/share', protect, authorize('patient'), async (req, res) => {
  try {
    const { doctorId } = req.body;

    const prediction = await Prediction.findById(req.params.id);

    if (!prediction) {
      return res.status(404).json({ 
        success: false, 
        message: 'Prediction not found' 
      });
    }

    if (prediction.patientId.toString() !== req.user.id) {
      return res.status(403).json({ 
        success: false, 
        message: 'Not authorized' 
      });
    }

    // Check if already shared
    const alreadyShared = prediction.sharedWithDoctors.some(
      share => share.doctorId.toString() === doctorId
    );

    if (alreadyShared) {
      return res.status(400).json({ 
        success: false, 
        message: 'Already shared with this doctor' 
      });
    }

    prediction.sharedWithDoctors.push({
      doctorId: doctorId,
      sharedAt: new Date()
    });
    await prediction.save();

    // Create or get chat thread
    const Chat = require('../models/Chat');
    const Notification = require('../models/Notification');
    
    let chat = await Chat.findOne({
      doctorId: doctorId,
      patientId: req.user.id,
      predictionId: prediction._id
    });

    if (!chat) {
      chat = await Chat.create({
        doctorId: doctorId,
        patientId: req.user.id,
        predictionId: prediction._id
      });
    }

    // Create notifications
    const doctor = await User.findById(doctorId);
    await Notification.create({
      userId: doctorId,
      type: 'report_shared',
      title: 'New Report Shared',
      message: `${req.user.firstName} ${req.user.lastName} shared a report with you`,
      relatedId: prediction._id,
      relatedModel: 'Prediction'
    });

    res.json({
      success: true,
      message: 'Report shared successfully. Chat thread created.',
      data: {
        prediction,
        chatId: chat._id
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

