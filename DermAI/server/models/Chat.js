const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  senderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  senderRole: {
    type: String,
    enum: ['patient', 'doctor'],
    required: true
  },
  message: {
    type: String,
    required: true,
    trim: true
  },
  read: {
    type: Boolean,
    default: false
  },
  readAt: {
    type: Date
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const chatSchema = new mongoose.Schema({
  doctorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  predictionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Prediction'
  },
  messages: [messageSchema],
  lastMessage: {
    type: String,
    default: ''
  },
  lastMessageAt: {
    type: Date,
    default: Date.now
  },
  patientUnreadCount: {
    type: Number,
    default: 0
  },
  doctorUnreadCount: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Compound index for efficient querying
chatSchema.index({ doctorId: 1, patientId: 1 });
chatSchema.index({ predictionId: 1 });

chatSchema.methods.markMessagesAsRead = function(userRole) {
  const now = new Date();
  this.messages.forEach(msg => {
    if (msg.senderRole !== userRole && !msg.read) {
      msg.read = true;
      msg.readAt = now;
    }
  });
  
  if (userRole === 'patient') {
    this.patientUnreadCount = 0;
  } else {
    this.doctorUnreadCount = 0;
  }
  
  this.updatedAt = now;
  return this.save();
};

module.exports = mongoose.model('Chat', chatSchema);

