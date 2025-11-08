# Environment Variables Guide

## Quick Setup

Run this command in the `server/` directory to auto-create your `.env` file:

```bash
bash create-env.sh
```

Or manually create a `.env` file and copy from `.env.example`.

---

## Environment Variables Explained

### 1. **PORT** (No API Key Needed)
- **Variable**: `PORT=5000`
- **Where to Get**: You choose any available port number
- **Purpose**: Port where your Node.js backend server runs
- **Default**: `5000`
- **Note**: Change if port 5000 is already in use

---

### 2. **MONGODB_URI** (Database Connection - Choose One Option)

#### Option A: Local MongoDB (Easiest for Development)
- **Variable**: `MONGODB_URI=mongodb://localhost:27017/skinsense`
- **Where to Get**: Use this if MongoDB is installed on your computer
- **Setup**:
  ```bash
  # macOS
  brew install mongodb-community
  brew services start mongodb-community
  
  # Windows: Install from mongodb.com and start service
  # Linux: sudo apt-get install mongodb && sudo systemctl start mongodb
  ```
- **When to Use**: Development, testing, local projects

#### Option B: MongoDB Atlas (Cloud - FREE) ⭐ Recommended
- **Variable**: `MONGODB_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/skinsense`
- **Where to Get**: 
  1. **Sign Up**: Go to https://www.mongodb.com/cloud/atlas/register
  2. **Create Free Cluster**:
     - Click "Build a Database"
     - Choose "FREE" (M0 - Shared)
     - Select a cloud provider (AWS, Google Cloud, or Azure)
     - Choose a region closest to you
     - Click "Create Cluster" (takes 3-5 minutes)
  3. **Create Database User**:
     - Click "Database Access" in left sidebar
     - Click "Add New Database User"
     - Choose "Password" authentication
     - Create username and password (SAVE THIS!)
     - Set privileges to "Atlas admin" or "Read and write to any database"
     - Click "Add User"
  4. **Whitelist Your IP**:
     - Click "Network Access" in left sidebar
     - Click "Add IP Address"
     - Click "Allow Access from Anywhere" (0.0.0.0/0) for development
     - Or add your current IP address
     - Click "Confirm"
  5. **Get Connection String**:
     - Click "Database" → "Connect"
     - Choose "Connect your application"
     - Copy the connection string
     - Replace `<password>` with your database user password
     - Replace `<dbname>` with `skinsense` (optional)
  6. **Example**:
     ```
     mongodb+srv://myusername:mypassword@cluster0.abc123.mongodb.net/skinsense?retryWrites=true&w=majority
     ```
- **When to Use**: Production, sharing projects, cloud deployment

---

### 3. **JWT_SECRET** (Authentication Secret - Generate Yourself)
- **Variable**: `JWT_SECRET=your_random_secret_string_here`
- **Where to Get**: **You generate this yourself** - it's not an external API
- **How to Generate**:
  ```bash
  # Method 1: Using Node.js (in server directory)
  node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
  
  # Method 2: Using OpenSSL
  openssl rand -hex 64
  
  # Method 3: Online generator
  # Visit: https://randomkeygen.com/ (use "CodeIgniter Encryption Keys")
  ```
- **Purpose**: Secret key to sign and verify JWT authentication tokens
- **Important**: 
  - Must be a long, random string (minimum 32 characters)
  - Keep it SECRET - never share or commit to git
  - If compromised, change it immediately
- **Auto-Generated**: The `create-env.sh` script generates this for you automatically

---

### 4. **JWT_EXPIRE** (Token Expiration - You Decide)
- **Variable**: `JWT_EXPIRE=7d`
- **Where to Get**: You decide the expiration time
- **Format Options**:
  - `7d` = 7 days
  - `24h` = 24 hours
  - `30d` = 30 days
  - `1h` = 1 hour
  - `30m` = 30 minutes
- **Purpose**: How long authentication tokens remain valid
- **Default**: `7d` (7 days)

---

### 5. **PYTHON_ML_API** (ML Backend URL - Optional)
- **Variable**: `PYTHON_ML_API=http://localhost:5001`
- **Where to Get**: 
  - **Local**: `http://localhost:5001` (if running Python ML backend locally)
  - **Deployed**: Your deployed ML service URL
- **Purpose**: URL of the Python ML backend for actual skin disease predictions
- **Required?**: **NO** - This is optional
- **What Happens Without It**: 
  - Application will still work
  - Predictions will be placeholder/mock predictions
  - You can still test all features
- **To Enable Real Predictions**:
  ```bash
  cd backend
  pip install -r requirements.txt
  python app.py
  ```

---

## Complete .env File Example

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/skinsense
JWT_SECRET=828c6c26276124b50a813c3c697fbd1b20e3e393017f9bd652d46184f29db957e1dd5e4e03022f0aa9a882970f488022e15b6d7ef53cc53023074444ab9f7873
JWT_EXPIRE=7d
PYTHON_ML_API=http://localhost:5001
```

---

## Summary: What Needs External Setup?

| Variable | External API? | Where to Get |
|----------|---------------|--------------|
| `PORT` | ❌ No | You choose |
| `MONGODB_URI` | ⚠️ Maybe | Local: `mongodb://localhost:27017/skinsense`<br>Cloud: MongoDB Atlas (free) |
| `JWT_SECRET` | ❌ No | Generate yourself |
| `JWT_EXPIRE` | ❌ No | You decide |
| `PYTHON_ML_API` | ❌ No | Your local/deployed service |

**Bottom Line**: Only MongoDB requires setup (either local installation or free MongoDB Atlas account). Everything else is configuration you set yourself.

---

## Need Help?

1. **MongoDB Atlas Setup Video**: Search "MongoDB Atlas setup tutorial" on YouTube
2. **MongoDB Local Setup**: https://www.mongodb.com/docs/manual/installation/
3. **MongoDB Atlas Docs**: https://www.mongodb.com/docs/atlas/

