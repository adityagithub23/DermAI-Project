# SkinSense Setup Guide

## Quick Start

### Step 1: Install MongoDB
Make sure MongoDB is installed and running on your system:
- **macOS**: `brew install mongodb-community` then `brew services start mongodb-community`
- **Windows**: Download from [MongoDB website](https://www.mongodb.com/try/download/community)
- **Linux**: `sudo apt-get install mongodb` then `sudo systemctl start mongodb`

Or use MongoDB Atlas (cloud): Update `MONGODB_URI` in server `.env` file

### Step 2: Setup Backend Server

```bash
cd server
npm install
```

Create `.env` file:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/skinsense
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
JWT_EXPIRE=7d
PYTHON_ML_API=http://localhost:5001
```

Start the server:
```bash
npm run dev
```

### Step 3: Setup React Frontend

```bash
cd client
npm install
npm run dev
```

### Step 4: Setup Python ML Backend (Optional)

If you have the Python ML model ready:

```bash
cd backend
pip install -r requirements.txt
python app.py
```

**Note**: The application will work with placeholder predictions if the Python ML API is not available.

## Running All Services

Open three terminal windows:

**Terminal 1 - MongoDB:**
```bash
mongod
# or if using MongoDB as a service:
# brew services start mongodb-community (macOS)
```

**Terminal 2 - Node.js Backend:**
```bash
cd server
npm run dev
```

**Terminal 3 - React Frontend:**
```bash
cd client
npm run dev
```

**Terminal 4 - Python ML Backend (Optional):**
```bash
cd backend
source venv/bin/activate  # if using virtual environment
python app.py
```

## Access the Application

- Frontend: http://localhost:3000
- Node.js API: http://localhost:5000
- Python ML API: http://localhost:5001 (if running)

## Troubleshooting

### MongoDB Connection Error
- Ensure MongoDB is running: `mongod` or check service status
- Update `MONGODB_URI` in `.env` file
- For MongoDB Atlas, use the connection string provided

### Port Already in Use
- Change the PORT in `.env` file (server)
- Change port in `vite.config.js` (client)

### Python ML API Not Available
- The application will create placeholder predictions
- Ensure Python backend is running if you want actual ML predictions
- Check `PYTHON_ML_API` URL in server `.env`

### File Upload Issues
- Ensure `server/uploads` directory exists (created automatically)
- Check file size limits (10MB default)

## Testing

1. Register as a patient at `/patient/signup`
2. Login and upload an image at `/patient/predict`
3. View medical history at `/patient/history`
4. Register as a doctor at `/doctor/signup`
5. Share a report with doctor from prediction results
6. View shared reports in doctor dashboard

