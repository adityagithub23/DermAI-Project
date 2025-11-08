# How to Start Python ML Backend

## Option 1: Start Without Model (Placeholder Mode)

The backend will run but return placeholder predictions since no model file exists.

```bash
cd backend
python3 app.py
```

The backend will start on `http://localhost:5001` but won't have a loaded model.

## Option 2: Use a Trained Model (Recommended for Real Predictions)

If you have a trained model file:

1. Place your model file as: `backend/models/dermai_model.h5`
2. Start the backend:
   ```bash
   cd backend
   python3 app.py
   ```

## Option 3: Create a Simple Mock Backend (Quick Solution)

If you want better placeholder predictions without installing TensorFlow dependencies, we can create a simpler mock backend that returns realistic-looking predictions.

---

## Current Status

- ✅ Python 3.13.0 is installed
- ❌ ML model file is missing (`backend/models/dermai_model.h5`)
- ❌ Python ML backend is not running

## Quick Fix

To get the application working with placeholder predictions:

1. Start the Python backend (it will work without the model):
   ```bash
   cd backend
   pip install flask flask-cors pillow
   python3 app.py
   ```

2. The backend will start but show "Model not loaded" - this is OK for now
3. Your Node.js backend will connect to it and get placeholder responses
4. The application will work, but predictions will be placeholders

