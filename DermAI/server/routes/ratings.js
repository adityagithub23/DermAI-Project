const express = require('express');
const router = express.Router();
const Rating = require('../models/Rating');
const User = require('../models/User');
const { protect } = require('../middleware/auth');

// Log route registration
console.log('✅ Rating routes registered');

// @route   POST /api/ratings
// @desc    Create or update a rating for a doctor
// @access  Private (Patient only)
router.post('/', protect, async (req, res) => {
  try {
    if (req.user.role !== 'patient') {
      return res.status(403).json({
        success: false,
        message: 'Only patients can rate doctors'
      });
    }

    const { doctorId, predictionId, rating, feedback } = req.body;

    if (!doctorId || !rating || rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: 'Doctor ID and rating (1-5) are required'
      });
    }

    // Check if doctor exists
    const doctor = await User.findById(doctorId);
    if (!doctor || doctor.role !== 'doctor') {
      return res.status(404).json({
        success: false,
        message: 'Doctor not found'
      });
    }

    // Create or update rating
    const ratingData = {
      doctorId,
      patientId: req.user.id,
      rating: parseInt(rating),
      feedback: feedback?.trim() || ''
    };

    if (predictionId) {
      ratingData.predictionId = predictionId;
    }

    const existingRating = await Rating.findOne({
      doctorId,
      patientId: req.user.id,
      predictionId: predictionId || null
    });

    let savedRating;
    if (existingRating) {
      existingRating.rating = ratingData.rating;
      existingRating.feedback = ratingData.feedback;
      savedRating = await existingRating.save();
    } else {
      savedRating = await Rating.create(ratingData);
    }

    // Update doctor's average rating
    await updateDoctorRating(doctorId);

    res.json({
      success: true,
      message: 'Rating submitted successfully',
      data: savedRating
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

// @route   GET /api/ratings/doctor/:doctorId
// @desc    Get all ratings for a doctor
// @access  Public
router.get('/doctor/:doctorId', async (req, res) => {
  try {
    const ratings = await Rating.find({ doctorId: req.params.doctorId })
      .populate('patientId', 'firstName lastName profilePicture')
      .populate('predictionId')
      .sort({ createdAt: -1 });

    // Calculate average rating
    const avgRating = ratings.length > 0
      ? ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length
      : 0;

    res.json({
      success: true,
      data: {
        ratings,
        averageRating: avgRating.toFixed(1),
        totalRatings: ratings.length
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Helper function to update doctor's rating in User model
async function updateDoctorRating(doctorId) {
  try {
    const ratings = await Rating.find({ doctorId });
    const avgRating = ratings.length > 0
      ? ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length
      : 0;

    // We could add an averageRating field to User model if needed
    // For now, we calculate it on the fly
  } catch (error) {
    console.error('Error updating doctor rating:', error);
  }
}

module.exports = router;

