const express = require('express');
const router = express.Router();
const Chat = require('../models/Chat');
const Notification = require('../models/Notification');
const User = require('../models/User');
const Prediction = require('../models/Prediction');
const { protect } = require('../middleware/auth');

// Log route registration
console.log('✅ Chat routes registered');

// @route   GET /api/chats
// @desc    Get all chats for current user
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    let chats;
    
    if (req.user.role === 'patient') {
      chats = await Chat.find({ patientId: req.user.id })
        .populate('doctorId', 'firstName lastName specialization profilePicture')
        .populate('predictionId', 'prediction imageUrl createdAt')
        .sort({ lastMessageAt: -1 });
    } else {
      chats = await Chat.find({ doctorId: req.user.id })
        .populate('patientId', 'firstName lastName profilePicture')
        .populate('predictionId', 'prediction imageUrl createdAt')
        .sort({ lastMessageAt: -1 });
    }

    res.json({
      success: true,
      data: chats
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   GET /api/chats/:chatId
// @desc    Get single chat with messages
// @access  Private
router.get('/:chatId', protect, async (req, res) => {
  try {
    const chat = await Chat.findById(req.params.chatId)
      .populate('doctorId', 'firstName lastName specialization profilePicture')
      .populate('patientId', 'firstName lastName profilePicture')
      .populate('predictionId')
      .populate('messages.senderId', 'firstName lastName profilePicture role');

    if (!chat) {
      return res.status(404).json({
        success: false,
        message: 'Chat not found'
      });
    }

    // Check authorization
    if (req.user.role === 'patient' && chat.patientId._id.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized'
      });
    }

    if (req.user.role === 'doctor' && chat.doctorId._id.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized'
      });
    }

    // Mark messages as read
    await chat.markMessagesAsRead(req.user.role);

    res.json({
      success: true,
      data: chat
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   POST /api/chats
// @desc    Create or get chat between doctor and patient
// @access  Private
router.post('/', protect, async (req, res) => {
  try {
    const { doctorId, patientId, predictionId } = req.body;

    let finalDoctorId = doctorId;
    let finalPatientId = patientId;

    // Auto-determine IDs based on user role
    if (req.user.role === 'patient') {
      finalPatientId = req.user.id;
      if (!doctorId) {
        return res.status(400).json({
          success: false,
          message: 'Doctor ID is required'
        });
      }
    } else if (req.user.role === 'doctor') {
      finalDoctorId = req.user.id;
      if (!patientId) {
        return res.status(400).json({
          success: false,
          message: 'Patient ID is required'
        });
      }
    }

    // Check if chat already exists
    let chat = await Chat.findOne({
      doctorId: finalDoctorId,
      patientId: finalPatientId,
      ...(predictionId && { predictionId })
    });

    if (!chat) {
      chat = await Chat.create({
        doctorId: finalDoctorId,
        patientId: finalPatientId,
        predictionId: predictionId || null
      });

      // Create notification for the other party
      const otherUserId = req.user.role === 'patient' ? finalDoctorId : finalPatientId;
      await Notification.create({
        userId: otherUserId,
        type: 'report_shared',
        title: 'New Chat Started',
        message: `A ${req.user.role === 'patient' ? 'patient' : 'doctor'} wants to chat with you`,
        relatedId: chat._id,
        relatedModel: 'Chat'
      });
    }

    const populatedChat = await Chat.findById(chat._id)
      .populate('doctorId', 'firstName lastName specialization profilePicture')
      .populate('patientId', 'firstName lastName profilePicture')
      .populate('predictionId');

    res.json({
      success: true,
      data: populatedChat
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

// @route   POST /api/chats/:chatId/messages
// @desc    Send a message in a chat
// @access  Private
router.post('/:chatId/messages', protect, async (req, res) => {
  try {
    const { message } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Message is required'
      });
    }

    const chat = await Chat.findById(req.params.chatId);

    if (!chat) {
      return res.status(404).json({
        success: false,
        message: 'Chat not found'
      });
    }

    // Check authorization
    if (req.user.role === 'patient' && chat.patientId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized'
      });
    }

    if (req.user.role === 'doctor' && chat.doctorId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized'
      });
    }

    // Add message
    chat.messages.push({
      senderId: req.user.id,
      senderRole: req.user.role,
      message: message.trim()
    });

    chat.lastMessage = message.trim();
    chat.lastMessageAt = new Date();
    chat.updatedAt = new Date();

    // Update unread count for recipient
    if (req.user.role === 'patient') {
      chat.doctorUnreadCount += 1;
    } else {
      chat.patientUnreadCount += 1;
    }

    await chat.save();

    // Create notification for recipient
    const recipientId = req.user.role === 'patient' ? chat.doctorId : chat.patientId;
    await Notification.create({
      userId: recipientId,
      type: 'message_received',
      title: 'New Message',
      message: `You have a new message from ${req.user.firstName} ${req.user.lastName}`,
      relatedId: chat._id,
      relatedModel: 'Chat'
    });

    const populatedChat = await Chat.findById(chat._id)
      .populate('messages.senderId', 'firstName lastName profilePicture role');

    res.json({
      success: true,
      data: populatedChat.messages[populatedChat.messages.length - 1]
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

module.exports = router;

