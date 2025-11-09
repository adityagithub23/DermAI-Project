# SkinSense - Skin Disease Prediction System

A full-stack web application for skin disease prediction using AI/ML technology. Built with React, Node.js, Express, MongoDB, and integrated with a Python ML backend.

## Features

### Patient Features
- ✅ User registration and login
- ✅ Upload skin lesion images for AI analysis
- ✅ Enter symptoms along with image
- ✅ View predictions with confidence scores
- ✅ Medical history tracking
- ✅ Share reports with doctors
- ✅ Download detailed PDF reports

### Doctor Features
- ✅ Doctor registration with specialization and fees
- ✅ Doctor dashboard
- ✅ View shared patient reports
- ✅ Access to patient prediction history
- ✅ Download PDF reports

## Tech Stack

### Frontend
- React 18
- React Router DOM
- TailwindCSS
- Axios
- React Toastify

### Backend
- Node.js
- Express.js
- MongoDB with Mongoose
- JWT Authentication
- Multer (file uploads)
- PDFKit (PDF generation)

### ML Backend (Python)
- Flask
- TensorFlow/Keras
- Image preprocessing

## Project Structure

```
DermAI/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/    # Reusable components
│   │   ├── context/       # React Context (Auth)
│   │   ├── pages/         # Page components
│   │   │   ├── auth/      # Login/Signup pages
│   │   │   ├── patient/   # Patient pages
│   │   │   └── doctor/    # Doctor pages
│   │   └── App.jsx        # Main app component
│   └── package.json
├── server/                 # Node.js backend
│   ├── models/            # MongoDB models
│   ├── routes/            # API routes
│   ├── middleware/        # Auth middleware
│   ├── uploads/           # Uploaded images
│   └── server.js          # Main server file
├── backend/               # Python ML backend
│   ├── app.py            # Flask application
│   ├── models/           # ML models
│   └── requirements.txt
└── README.md
```

## Installation & Setup

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or MongoDB Atlas)
- Python 3.8+ (for ML backend)
- npm or yarn

### Backend Setup (Node.js)

1. Navigate to server directory:
```bash
cd server
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file:
```bash
PORT=5000
MONGODB_URI=mongodb://localhost:27017/skinsense
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
JWT_EXPIRE=7d
PYTHON_ML_API=http://localhost:5001
```

4. Start the server:
```bash
npm run dev
```

The server will run on `http://localhost:5000`

### Frontend Setup (React)

1. Navigate to client directory:
```bash
cd client
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

The frontend will run on `http://localhost:3000`

### Python ML Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Create virtual environment (recommended):
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Start the Flask server:
```bash
python app.py
```

The ML API will run on `http://localhost:5001`

## Environment Variables

### Server (.env)
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/skinsense
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
JWT_EXPIRE=7d
PYTHON_ML_API=http://localhost:5001
```

## API Endpoints

### Authentication
- `POST /api/auth/register/patient` - Register new patient
- `POST /api/auth/register/doctor` - Register new doctor
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (protected)

### Predictions
- `POST /api/predictions` - Create new prediction (patient only)
- `GET /api/predictions` - Get all predictions (patient only)
- `GET /api/predictions/:id` - Get single prediction
- `POST /api/predictions/:id/share` - Share prediction with doctor

### Doctors
- `GET /api/doctors` - Get all doctors
- `GET /api/doctors/dashboard` - Get doctor dashboard (doctor only)

### Reports
- `GET /api/reports/:id/pdf` - Download PDF report

## Usage

1. **Patient Registration/Login**
   - Navigate to `/patient/signup` or `/patient/login`
   - Create account or login

2. **Upload Image for Prediction**
   - Go to `/patient/predict`
   - Upload skin lesion image
   - Enter symptoms (optional)
   - Click "Analyze Image"

3. **View Medical History**
   - Go to `/patient/history`
   - View all past predictions
   - Download PDF reports

4. **Share with Doctor**
   - After prediction, select a doctor
   - Click "Share" to share the report

5. **Doctor Dashboard**
   - Doctor logs in at `/doctor/login`
   - View all shared reports
   - Download PDF reports

## Notes

- The ML prediction uses a placeholder if the Python ML API is unavailable
- Images are stored in `server/uploads/` directory
- JWT tokens expire after 7 days (configurable)
- All passwords are hashed using bcrypt

## License

This project is for educational purposes only. The AI predictions should not replace professional medical advice.
