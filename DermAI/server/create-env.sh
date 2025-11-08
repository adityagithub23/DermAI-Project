#!/bin/bash

# SkinSense .env File Creator
# This script creates a .env file with a generated JWT_SECRET

echo "Creating .env file for SkinSense..."

# Generate JWT_SECRET
JWT_SECRET=$(node -e "console.log(require('crypto').randomBytes(64).toString('hex'))" 2>/dev/null || openssl rand -hex 64)

cat > .env << EOF
# ============================================
# SkinSense Backend Environment Variables
# ============================================

# Server Port
PORT=5000

# MongoDB Connection String
# OPTION 1 - Local MongoDB: mongodb://localhost:27017/skinsense
# OPTION 2 - MongoDB Atlas: Get from https://www.mongodb.com/cloud/atlas
#   Steps: Register → Create Cluster → Connect → Copy connection string
MONGODB_URI=mongodb://localhost:27017/skinsense

# JWT Secret Key (Auto-generated)
# This was automatically generated for you
JWT_SECRET=${JWT_SECRET}

# JWT Token Expiration Time
JWT_EXPIRE=7d

# Python ML Backend API URL (Optional)
PYTHON_ML_API=http://localhost:5001
EOF

echo "✅ .env file created successfully!"
echo ""
echo "📝 Next steps:"
echo "   1. Review the .env file"
echo "   2. Update MONGODB_URI if using MongoDB Atlas (cloud)"
echo "   3. The JWT_SECRET has been auto-generated for you"
echo ""

