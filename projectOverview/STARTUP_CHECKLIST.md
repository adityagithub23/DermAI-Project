# DermAI Startup Checklist

## ✅ Pre-Startup Verification

Before starting the servers, verify:

- [ ] MongoDB is running (local) OR MongoDB Atlas IP is whitelisted
- [ ] `.env` file exists in `server/` directory
- [ ] Python ML backend is ready (optional - app works without it)

## 🚀 Starting the Application

### Terminal 1: Backend Server
```bash
cd server
npm run dev
```

**Expected Output:**
```
📋 Loading API routes...
✅ Auth routes registered
✅ Prediction routes registered
✅ Patient routes registered
✅ Doctor routes registered
✅ Report routes registered
✅ All API routes loaded successfully

============================================================
🩺 DermAI Backend Server
============================================================
✅ Server running on port 5001
🌐 API URL: http://localhost:5001
📡 Health check: http://localhost:5001/api/health
============================================================

✅ MongoDB connected successfully
📊 Database: dermai
```

### Terminal 2: Frontend
```bash
cd client
npm run dev
```

**Expected Output:**
```
  VITE v4.5.14  ready in XXX ms

  ➜  Local:   http://localhost:3000/
  ➜  Network: use --host to expose
```

**No more module warnings!** ✅

### Terminal 3: Python ML Backend (Optional)
```bash
cd backend
bash start_simple_backend.sh
```

**Expected Output:**
```
============================================================
DermAI Mock ML Backend
============================================================
Mode: Mock (no TensorFlow model required)
Port: 5002
============================================================
 * Running on http://0.0.0.0:5002
```

## ✅ Verification Steps

1. **Health Check:**
   ```bash
   curl http://localhost:5001/api/health
   ```
   Should return: `{"status":"ok","message":"DermAI API is running",...}`

2. **Frontend:**
   - Open http://localhost:3000
   - Should see "DermAI" and "Your Skin, Our AI – Diagnose with Confidence"
   - No console errors

3. **Test Registration:**
   - Go to http://localhost:3000/patient/signup
   - Create an account
   - Should redirect to dashboard

4. **Test Prediction:**
   - Upload an image
   - Should get prediction (not "Analysis Unavailable" if ML backend is running)

## 🐛 Common Issues

### MongoDB Connection Error
- **Issue:** "Could not connect to any servers in your MongoDB Atlas cluster"
- **Fix:** Whitelist your IP in MongoDB Atlas Network Access

### Port Already in Use
- **Issue:** "EADDRINUSE: address already in use"
- **Fix:** Kill the process using that port or change PORT in `.env`

### Module Warnings (Frontend)
- **Issue:** Module type warnings
- **Fix:** Should be resolved with `"type": "module"` in package.json

## ✅ Success Criteria

All these should be true:
- ✅ Backend starts without errors
- ✅ Frontend starts without warnings
- ✅ All routes registered successfully
- ✅ MongoDB connected (or shows helpful error message)
- ✅ Branding shows "DermAI" everywhere
- ✅ Tagline visible on all major pages
- ✅ Predictions work (with or without ML backend)

