const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/dermai', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log('✅ MongoDB connected successfully');
  console.log(`📊 Database: ${mongoose.connection.name}`);
})
.catch(err => {
  console.error('❌ MongoDB connection error:', err.message);
  if (err.message.includes('whitelist')) {
    console.log('\n🔧 MongoDB Atlas IP Whitelist Issue:');
    console.log('   1. Go to MongoDB Atlas Dashboard');
    console.log('   2. Navigate to Network Access');
    console.log('   3. Click "Add IP Address"');
    console.log('   4. Click "Allow Access from Anywhere" (0.0.0.0/0) for development');
    console.log('   5. Or add your current IP address\n');
  }
  console.log('⚠️  Server will continue running but database features will not work.\n');
});

// Routes
console.log('📋 Loading API routes...');
app.use('/api/auth', require('./routes/auth'));
app.use('/api/predictions', require('./routes/predictions'));
app.use('/api/patients', require('./routes/patients'));
app.use('/api/doctors', require('./routes/doctors'));
app.use('/api/reports', require('./routes/reports'));
app.use('/api/contact', require('./routes/contact'));
app.use('/api/profile', require('./routes/profile'));
app.use('/api/ratings', require('./routes/ratings'));
app.use('/api/chats', require('./routes/chats'));
app.use('/api/notifications', require('./routes/notifications'));
console.log('✅ All API routes loaded successfully\n');

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'DermAI API is running',
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    timestamp: new Date().toISOString()
  });
});

const PORT = process.env.PORT || 5001;

const server = app.listen(PORT, () => {
  console.log('\n' + '='.repeat(60));
  console.log('🩺 DermAI Backend Server');
  console.log('='.repeat(60));
  console.log(`✅ Server running on port ${PORT}`);
  console.log(`🌐 API URL: http://localhost:${PORT}`);
  console.log(`📡 Health check: http://localhost:${PORT}/api/health`);
  console.log('='.repeat(60) + '\n');
});

// Initialize Socket.io
const initializeSocket = require('./socket');
const io = initializeSocket(server);
console.log('✅ Socket.io initialized\n');

