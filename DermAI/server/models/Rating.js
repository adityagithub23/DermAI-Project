const mongoose = require('mongoose');

const ratingSchema = new mongoose.Schema({
  doctorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  predictionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Prediction'
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  feedback: {
    type: String,
    default: ''
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Ensure one rating per patient-doctor-prediction combination
ratingSchema.index({ doctorId: 1, patientId: 1, predictionId: 1 }, { unique: true });

module.exports = mongoose.model('Rating', ratingSchema);

