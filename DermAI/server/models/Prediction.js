const mongoose = require('mongoose');

const predictionSchema = new mongoose.Schema({
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  imageUrl: {
    type: String,
    required: true
  },
  symptoms: {
    type: String,
    default: ''
  },
  prediction: {
    disease: {
      type: String,
      required: true
    },
    confidence: {
      type: Number,
      required: true
    },
    percentage: {
      type: Number,
      required: true
    },
    riskLevel: {
      type: String,
      enum: ['HIGH', 'MODERATE', 'LOW', 'VERY_LOW'],
      required: true
    }
  },
  allPredictions: [{
    disease: String,
    confidence: Number,
    percentage: Number
  }],
  recommendation: {
    riskMessage: String,
    diseaseInfo: String,
    generalAdvice: String
  },
  sharedWithDoctors: [{
    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    sharedAt: {
      type: Date,
      default: Date.now
    }
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Prediction', predictionSchema);

