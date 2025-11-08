const jwt = require('jsonwebtoken');
const User = require('./models/User');
const Chat = require('./models/Chat');
const Notification = require('./models/Notification');

function initializeSocket(server) {
  const io = require('socket.io')(server, {
    cors: {
      origin: process.env.CLIENT_URL || "http://localhost:3000",
      methods: ["GET", "POST"]
    }
  });

  // Middleware for authentication
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      
      if (!token) {
        return next(new Error('Authentication error: No token provided'));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_super_secret_jwt_key_change_this_in_production');
      const user = await User.findById(decoded.id).select('-password');
      
      if (!user) {
        return next(new Error('Authentication error: User not found'));
      }

      socket.userId = user._id.toString();
      socket.userRole = user.role;
      socket.user = user;
      next();
    } catch (error) {
      next(new Error('Authentication error: Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`✅ User connected: ${socket.user.firstName} ${socket.user.lastName} (${socket.userRole})`);

    // Join user's personal room
    socket.join(`user_${socket.userId}`);

    // Join chats this user is part of
    Chat.find({
      $or: [
        { doctorId: socket.userId },
        { patientId: socket.userId }
      ]
    }).then(chats => {
      chats.forEach(chat => {
        socket.join(`chat_${chat._id}`);
      });
    });

    // Handle joining a specific chat
    socket.on('join_chat', async (chatId) => {
      try {
        const chat = await Chat.findById(chatId);
        if (chat && (chat.doctorId.toString() === socket.userId || chat.patientId.toString() === socket.userId)) {
          socket.join(`chat_${chatId}`);
          socket.emit('joined_chat', { chatId });
        }
      } catch (error) {
        socket.emit('error', { message: 'Failed to join chat' });
      }
    });

    // Handle leaving a chat
    socket.on('leave_chat', (chatId) => {
      socket.leave(`chat_${chatId}`);
    });

    // Handle typing indicator
    socket.on('typing', (data) => {
      const { chatId } = data;
      socket.to(`chat_${chatId}`).emit('user_typing', {
        chatId,
        userId: socket.userId,
        userName: `${socket.user.firstName} ${socket.user.lastName}`
      });
    });

    socket.on('stop_typing', (data) => {
      const { chatId } = data;
      socket.to(`chat_${chatId}`).emit('user_stopped_typing', {
        chatId,
        userId: socket.userId
      });
    });

    // Handle sending a message
    socket.on('send_message', async (data) => {
      try {
        const { chatId, message } = data;

        if (!chatId || !message || !message.trim()) {
          return socket.emit('error', { message: 'Chat ID and message are required' });
        }

        const chat = await Chat.findById(chatId);

        if (!chat) {
          return socket.emit('error', { message: 'Chat not found' });
        }

        // Check authorization
        if (chat.doctorId.toString() !== socket.userId && chat.patientId.toString() !== socket.userId) {
          return socket.emit('error', { message: 'Not authorized' });
        }

        // Add message
        const newMessage = {
          senderId: socket.userId,
          senderRole: socket.userRole,
          message: message.trim()
        };

        chat.messages.push(newMessage);
        chat.lastMessage = message.trim();
        chat.lastMessageAt = new Date();
        chat.updatedAt = new Date();

        // Update unread count for recipient
        if (socket.userRole === 'patient') {
          chat.doctorUnreadCount += 1;
        } else {
          chat.patientUnreadCount += 1;
        }

        await chat.save();

        // Populate sender info
        const populatedChat = await Chat.findById(chatId)
          .populate('messages.senderId', 'firstName lastName profilePicture role');

        const messageWithSender = populatedChat.messages[populatedChat.messages.length - 1];

        // Emit to all users in the chat room
        io.to(`chat_${chatId}`).emit('new_message', {
          chatId,
          message: messageWithSender
        });

        // Create notification for recipient
        const recipientId = socket.userRole === 'patient' ? chat.doctorId : chat.patientId;
        const recipient = await User.findById(recipientId);
        
        await Notification.create({
          userId: recipientId,
          type: 'message_received',
          title: 'New Message',
          message: `You have a new message from ${socket.user.firstName} ${socket.user.lastName}`,
          relatedId: chatId,
          relatedModel: 'Chat'
        });

        // Notify recipient if they're online
        io.to(`user_${recipientId}`).emit('notification', {
          type: 'message_received',
          title: 'New Message',
          message: `You have a new message from ${socket.user.firstName} ${socket.user.lastName}`,
          chatId
        });
      } catch (error) {
        console.error('Error sending message:', error);
        socket.emit('error', { message: 'Failed to send message' });
      }
    });

    // Handle message read receipts
    socket.on('mark_read', async (data) => {
      try {
        const { chatId } = data;
        const chat = await Chat.findById(chatId);

        if (!chat) return;

        if (chat.doctorId.toString() === socket.userId || chat.patientId.toString() === socket.userId) {
          await chat.markMessagesAsRead(socket.userRole);
          
          // Notify other user
          socket.to(`chat_${chatId}`).emit('messages_read', {
            chatId,
            userId: socket.userId
          });
        }
      } catch (error) {
        console.error('Error marking messages as read:', error);
      }
    });

    // Handle disconnection
    socket.on('disconnect', (reason) => {
      if (reason === 'io client disconnect') {
        console.log(`❌ User disconnected: ${socket.user.firstName} ${socket.user.lastName} (client disconnect)`);
      } else {
        console.log(`❌ User disconnected: ${socket.user.firstName} ${socket.user.lastName} (reason: ${reason})`);
      }
    });
  });

  return io;
}

module.exports = initializeSocket;

