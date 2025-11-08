# SkinSense Quick Start Guide

## Prerequisites Checklist

- [ ] Node.js (v14+) installed
- [ ] MongoDB installed and running
- [ ] npm or yarn installed
- [ ] Python 3.8+ (optional, for ML predictions)

## 1. Start MongoDB

**macOS:**
```bash
brew services start mongodb-community
```

**Windows:**
Start MongoDB from Services or run `mongod`

**Linux:**
```bash
sudo systemctl start mongodb
```

## 2. Setup Backend (Node.js)

```bash
cd server
npm install
```

Create `.env` file in `server/` directory:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/skinsense
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
JWT_EXPIRE=7d
PYTHON_ML_API=http://localhost:5001
```

Start backend:
```bash
npm run dev
```

## 3. Setup Frontend (React)

```bash
cd client
npm install
npm run dev
```

## 4. (Optional) Setup Python ML Backend

```bash
cd backend
pip install -r requirements.txt
python app.py
```

**Note:** The app works with placeholder predictions if ML backend is unavailable.

## 5. Access the Application

- Frontend: http://localhost:3000
- API: http://localhost:5000

## First Steps

1. **Create Patient Account:**
   - Go to http://localhost:3000/patient/signup
   - Fill in registration form
   - Login at http://localhost:3000/patient/login

2. **Upload First Prediction:**
   - Go to Dashboard → "New Prediction"
   - Upload a skin lesion image
   - Enter symptoms (optional)
   - Click "Analyze Image"

3. **View History:**
   - Click "History" in navigation
   - View all past predictions
   - Download PDF reports

4. **Share with Doctor:**
   - After prediction, scroll to "Share Report with Doctor"
   - Select a doctor from dropdown
   - Click "Share"

5. **Create Doctor Account:**
   - Go to http://localhost:3000/doctor/signup
   - Fill in doctor details
   - Login at http://localhost:3000/doctor/login
   - View shared reports in dashboard

## Troubleshooting

**MongoDB not connecting:**
- Check if MongoDB is running: `mongod --version`
- Update MONGODB_URI in `.env`
- For MongoDB Atlas, use your connection string

**Port already in use:**
- Change PORT in server `.env`
- Change port in `client/vite.config.js`

**CORS errors:**
- Ensure backend is running on port 5000
- Check `server/server.js` has CORS enabled

**Image upload fails:**
- Check `server/uploads` directory exists
- Verify file size < 10MB
- Check multer configuration

## Common Commands

```bash
# Start all services (in separate terminals)
# Terminal 1: MongoDB (if not running as service)
mongod

# Terminal 2: Backend
cd server && npm run dev

# Terminal 3: Frontend
cd client && npm run dev

# Terminal 4: Python ML (optional)
cd backend && python app.py
```

## Need Help?

- Check `README.md` for detailed documentation
- Check `SETUP.md` for detailed setup instructions
- Review server logs for backend errors
- Check browser console for frontend errors

