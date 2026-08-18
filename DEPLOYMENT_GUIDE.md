# MedVision AI - Manual Deployment Guide

## 🎯 Deployment Architecture

- **Backend**: Render.com (Free tier with UptimeRobot)
- **Database**: Neon PostgreSQL (Free tier)
- **Frontend**: Vercel (Free tier)
- **Monitoring**: UptimeRobot (to prevent cold starts)

---

## 📦 Part 1: Backend Deployment on Render.com

### Step 1: Prepare Neon PostgreSQL Database

1. **Create Neon Account**
   - Go to [neon.tech](https://neon.tech)
   - Sign up with GitHub or email
   - Click **"Create a project"**

2. **Configure Database**
   - Project name: `medvision-ai-db`
   - Region: Choose closest to you (US East recommended)
   - PostgreSQL version: Latest (16)
   - Click **"Create project"**

3. **Get Connection String**
   - After creation, you'll see the connection string
   - Format: `postgresql://[user]:[password]@[host]/[database]?sslmode=require`
   - Example:
     ```
     postgresql://neondb_owner:npg_xTSBZ5ej3JDh@ep-nameless-cherry-axj5jyim-pooler.c-4.us-east-2.aws.neon.tech/neondb?sslmode=require
     ```
   - **Save this connection string** - you'll need it for Render

4. **Optional: Enable Connection Pooling**
   - In Neon dashboard → Connection Details
   - Enable **"Pooled connection"** (recommended for Render free tier)
   - Use the pooled connection string for Render

---

### Step 2: Deploy Backend to Render.com

1. **Create Render Account**
   - Go to [render.com](https://render.com)
   - Sign up with GitHub
   - Connect your GitHub account

2. **Create New Web Service**
   - Click **"New +"** → **"Web Service"**
   - Select **"Build and deploy from a Git repository"**
   - Click **"Connect account"** (if not connected)
   - Find and select: `diabetic-ulcer-ai-system`
   - Click **"Connect"**

3. **Configure Web Service**

   **Basic Settings:**
   ```
   Name: medvision-ai-backend
   Region: Oregon (US West) or closest to your Neon region
   Branch: main
   Root Directory: backend
   Runtime: Python 3
   Python Version: 3.11.7 (IMPORTANT: Select 3.11.x, NOT 3.14)
   Build Command: pip install --upgrade pip setuptools wheel && pip install -r requirements.txt
   Start Command: uvicorn app.main:app --host 0.0.0.0 --port $PORT
   ```

   **Instance Type:**
   ```
   Plan: Free
   ```

4. **Add Environment Variables**
   
   Click **"Advanced"** → **"Add Environment Variable"**
   
   Add each of these variables:

   ```bash
   # Database
   DATABASE_URL=postgresql://[YOUR_NEON_CONNECTION_STRING]
   
   # Backend Settings
   ENVIRONMENT=production
   DEBUG=False
   SECRET_KEY=[Generate a random 32+ character string]
   JWT_SECRET_KEY=[Generate another random 32+ character string]
   ALLOWED_ORIGINS=https://your-frontend-domain.vercel.app,http://localhost:3001
   
   # Firebase (from Firebase Console)
   FIREBASE_PROJECT_ID=your-project-id
   FIREBASE_WEB_API_KEY=your-web-api-key
   
   # Firebase Service Account (CRITICAL)
   FIREBASE_SERVICE_ACCOUNT_JSON={"type":"service_account","project_id":"...","private_key":"...","client_email":"..."}
   
   # Email (Gmail SMTP)
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USERNAME=your-email@gmail.com
   SMTP_PASSWORD=[Your Gmail App Password - 16 characters]
   SMTP_FROM_EMAIL=your-email@gmail.com
   SMTP_FROM_NAME=MedVision AI
   ```

   **How to get each value:**

   **SECRET_KEY & JWT_SECRET_KEY:**
   ```bash
   # Run in PowerShell to generate:
   -join ((65..90) + (97..122) + (48..57) | Get-Random -Count 32 | % {[char]$_})
   ```

   **FIREBASE_SERVICE_ACCOUNT_JSON:**
   - Go to Firebase Console → Project Settings → Service Accounts
   - Click **"Generate new private key"**
   - Download the JSON file
   - **IMPORTANT**: Convert to single line:
     ```bash
     # Open the JSON file and remove ALL newlines and extra spaces
     # Make it ONE SINGLE LINE
     # Example: {"type":"service_account","project_id":"medvision-ai",...}
     ```
   - Paste the single-line JSON into the environment variable

   **SMTP_PASSWORD (Gmail App Password):**
   - Go to [myaccount.google.com/security](https://myaccount.google.com/security)
   - Enable **"2-Step Verification"** (if not enabled)
   - Search for **"App passwords"**
   - Select app: **Mail**, device: **Other** → type "MedVision AI"
   - Click **"Generate"**
   - Copy the 16-character password (format: `xxxx xxxx xxxx xxxx`)
   - **Paste without spaces**: `xxxxxxxxxxxxxxxx`

5. **Deploy**
   - Click **"Create Web Service"**
   - Render will start building and deploying
   - Wait 5-10 minutes for first deployment
   - Check logs for any errors

6. **Get Backend URL**
   - After deployment succeeds, you'll see your backend URL
   - Format: `https://medvision-ai-backend.onrender.com`
   - **Save this URL** - you'll need it for frontend

---

### Step 3: Verify Backend Deployment

1. **Test Health Endpoint**
   - Open browser: `https://medvision-ai-backend.onrender.com/health`
   - Should return: `{"status": "healthy"}`

2. **Test API Documentation**
   - Open: `https://medvision-ai-backend.onrender.com/docs`
   - You should see FastAPI Swagger UI with all endpoints

3. **Check Database Connection**
   - Look at Render logs
   - Should see: `✓ Database connection verified`
   - If you see database errors, check your `DATABASE_URL`

4. **Test Auth Endpoints**
   - In Swagger UI (`/docs`), try:
     - `POST /api/auth/signup` - Create test account
     - `POST /api/auth/signin` - Sign in
   - If these work, authentication is properly configured

---

### Step 4: Setup UptimeRobot (Prevent Cold Starts)

Render free tier sleeps after 15 minutes of inactivity. Use UptimeRobot to ping it every 5 minutes.

1. **Create UptimeRobot Account**
   - Go to [uptimerobot.com](https://uptimerobot.com)
   - Sign up for free account
   - Verify email

2. **Add Monitor**
   - Click **"+ Add New Monitor"**
   - Monitor Type: **HTTP(s)**
   - Friendly Name: `MedVision AI Backend`
   - URL: `https://medvision-ai-backend.onrender.com/health`
   - Monitoring Interval: **5 minutes**
   - Click **"Create Monitor"**

3. **Done!**
   - UptimeRobot will ping your backend every 5 minutes
   - This keeps it from going to sleep
   - You'll also get email alerts if it goes down

---

## 🔥 Part 2: Frontend Deployment (Next Steps)

After backend is working, we'll deploy:

### Frontend to Vercel
- Build command: `npm run build`
- Output directory: `dist`
- Environment variables:
  ```
  VITE_API_BASE_URL=https://medvision-ai-backend.onrender.com
  VITE_FIREBASE_API_KEY=[from Firebase Console]
  VITE_FIREBASE_AUTH_DOMAIN=[project-id].firebaseapp.com
  VITE_FIREBASE_PROJECT_ID=[your-project-id]
  VITE_GOOGLE_CLIENT_ID=[from Google Cloud Console]
  ```

---

## 🧪 Testing Checklist

After deployment, test these features:

### Backend Tests
- [ ] Health check: `/health` returns 200
- [ ] API docs: `/docs` loads
- [ ] Database connection: Check logs for "Database connection verified"
- [ ] Sign up: `POST /api/auth/signup` with test email
- [ ] Sign in: `POST /api/auth/signin` with test credentials
- [ ] Forgot password: `POST /api/auth/forgot-password` sends email
- [ ] Upload image: `POST /predict/upload` accepts image file

### Integration Tests (After Frontend Deployed)
- [ ] Frontend can reach backend API
- [ ] Login/signup flows work end-to-end
- [ ] Image upload and prediction works
- [ ] Email notifications are received
- [ ] Google Sign-In works (after OAuth setup)

---

## 🚨 Troubleshooting

### Issue: "Connection refused" or "Cannot connect to database"
**Solution:**
- Check `DATABASE_URL` in Render environment variables
- Ensure it includes `?sslmode=require` at the end
- Verify Neon database is active (check Neon dashboard)

### Issue: "Firebase Admin SDK not initialized"
**Solution:**
- Verify `FIREBASE_SERVICE_ACCOUNT_JSON` is a **single line**
- Check that all quotes are properly escaped
- Make sure it's valid JSON (test with online JSON validator)

### Issue: "SMTP authentication failed"
**Solution:**
- Verify Gmail App Password is correct (16 characters, no spaces)
- Check that 2-Step Verification is enabled on Gmail
- Try generating a new App Password

### Issue: "Module not found" errors
**Solution:**
- Check `requirements.txt` includes all dependencies
- Look at Render build logs for specific missing packages
- Trigger a manual deploy: Render Dashboard → Manual Deploy

### Issue: Backend sleeps despite UptimeRobot
**Solution:**
- Check UptimeRobot monitor is active (green status)
- Verify monitoring interval is 5 minutes
- Check that `/health` endpoint is responding

---

## 📋 Environment Variables Reference

### Required Variables
```bash
DATABASE_URL              # Neon PostgreSQL connection string
SECRET_KEY                # Random 32+ chars for app security
JWT_SECRET_KEY            # Random 32+ chars for JWT tokens
FIREBASE_PROJECT_ID       # From Firebase Console
FIREBASE_WEB_API_KEY      # From Firebase Console
FIREBASE_SERVICE_ACCOUNT_JSON  # Single-line JSON from Firebase
SMTP_USERNAME             # Gmail address
SMTP_PASSWORD             # Gmail App Password (16 chars)
```

### Optional Variables
```bash
ENVIRONMENT=production    # Default: development
DEBUG=False              # Default: True
ALLOWED_ORIGINS=https://your-frontend.vercel.app
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_FROM_EMAIL=your-email@gmail.com
SMTP_FROM_NAME=MedVision AI
```

---

## 🎯 Quick Start Commands

### Generate Secret Keys
```powershell
# SECRET_KEY
-join ((65..90) + (97..122) + (48..57) | Get-Random -Count 32 | % {[char]$_})

# JWT_SECRET_KEY
-join ((65..90) + (97..122) + (48..57) | Get-Random -Count 32 | % {[char]$_})
```

### Convert Firebase JSON to Single Line (Python)
```python
import json
with open('firebase-service-account.json') as f:
    data = json.load(f)
print(json.dumps(data, separators=(',', ':')))
```

### Test Backend Locally Before Deploy
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

---

## 📞 Support

If you encounter issues:
1. Check Render logs: Dashboard → Logs tab
2. Check Neon database status: Neon Dashboard
3. Verify all environment variables are set correctly
4. Test each endpoint individually in `/docs`

---

## ✅ Success Criteria

Your backend is successfully deployed when:
- ✅ Health check returns 200 OK
- ✅ API documentation loads at `/docs`
- ✅ You can create an account via `/api/auth/signup`
- ✅ You can sign in via `/api/auth/signin`
- ✅ Password reset emails are sent
- ✅ UptimeRobot shows monitor as "Up"
- ✅ No errors in Render logs

**Next Step:** Once backend is verified, proceed to frontend deployment on Vercel!
