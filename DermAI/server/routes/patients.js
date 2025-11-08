const express = require('express');
const router = express.Router();
const Prediction = require('../models/Prediction');
const { protect, authorize } = require('../middleware/auth');

// Log route registration
console.log('✅ Patient routes registered');

// @route   GET /api/patients/history
// @desc    Get patient's medical history
// @access  Private (Patient only)
router.get('/history', protect, authorize('patient'), async (req, res) => {
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

module.exports = router;

