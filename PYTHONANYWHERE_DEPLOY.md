# 🚀 PythonAnywhere + Neon PostgreSQL Deployment

**100% FREE • NO CREDIT CARD • Production Ready**

---

## 🎯 What You Get (All Free Forever):

- **Backend**: PythonAnywhere (free plan - always on)
- **Database**: Neon PostgreSQL (500 MB free)
- **Frontend**: Vercel (free plan)
- **Auth**: Firebase (free for 10k users)

---

## Part 1: Create Neon PostgreSQL Database (2 min)

### 1. Sign Up
1. Go to https://neon.tech
2. Sign up with GitHub/Google (NO credit card needed)
3. Click "Create Project"

### 2. Create Database
```
Project name: medvision-db
Region: AWS US East (closest to you)
PostgreSQL version: 16
```

### 3. Get Connection String
After creation, copy the connection string:
```
postgresql://username:password@ep-xxx.us-east-1.aws.neon.tech/neondb?sslmode=require
```

**SAVE THIS!** You'll need it later.

---

## Part 2: Deploy Backend on PythonAnywhere (15 min)

### 1. Sign Up
1. Go to https://www.pythonanywhere.com
2. Create free account (Beginner plan)
3. Choose username: `yourname` (this becomes your domain: `yourname.pythonanywhere.com`)

### 2. Upload Your Code

**Option A: From GitHub (Recommended)**
```bash
# In PythonAnywhere Bash console
git clone https://github.com/BharatChandra-sys/diabetic-ulcer-ai-system.git
cd diabetic-ulcer-ai-system
```

**Option B: Manual Upload**
- Download your project as ZIP
- Upload via Files tab
- Extract in your home directory

### 3. Create Virtual Environment
```bash
cd ~/diabetic-ulcer-ai-system
python3.11 -m venv venv
source venv/bin/activate
pip install -r backend/requirements.txt
```

### 4. Configure WSGI

Create file: `/var/www/yourname_pythonanywhere_com_wsgi.py`

```python
import sys
import os

# Add your project directory
project_home = '/home/yourname/diabetic-ulcer-ai-system'
if project_home not in sys.path:
    sys.path.insert(0, project_home)

# Set environment variables
os.environ['DATABASE_URL'] = 'postgresql://user:pass@host/db'
os.environ['FIREBASE_PROJECT_ID'] = 'dfuai-1f1af'
os.environ['FIREBASE_SERVICE_ACCOUNT_JSON'] = '{"type":"service_account",...}'
os.environ['ENVIRONMENT'] = 'production'
os.environ['DEBUG'] = 'False'
os.environ['SECRET_KEY'] = 'your-secret-key-here'
os.environ['FRONTEND_URL'] = 'https://your-app.vercel.app'
os.environ['ALLOWED_ORIGINS'] = 'https://your-app.vercel.app,http://localhost:5173'

# Import FastAPI app
from backend.app.main import app as application
```

### 5. Configure Web App

Go to **Web** tab:
1. Click "Add a new web app"
2. Choose "Manual configuration"
3. Python version: **3.11**
4. Set:
   - **Source code**: `/home/yourname/diabetic-ulcer-ai-system`
   - **Working directory**: `/home/yourname/diabetic-ulcer-ai-system`
   - **WSGI file**: `/var/www/yourname_pythonanywhere_com_wsgi.py`
   - **Virtualenv**: `/home/yourname/diabetic-ulcer-ai-system/venv`

### 6. Reload Web App
Click **"Reload"** button

Your backend is now live at:
```
https://yourname.pythonanywhere.com
```

---

## Part 3: Deploy Frontend on Vercel (5 min)

### 1. Update Frontend Config

Edit `frontend/.env.production`:
```env
VITE_API_BASE_URL=https://yourname.pythonanywhere.com
VITE_FIREBASE_API_KEY=<from Firebase console>
VITE_FIREBASE_AUTH_DOMAIN=dfuai-1f1af.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=dfuai-1f1af
VITE_FIREBASE_STORAGE_BUCKET=dfuai-1f1af.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=<from Firebase>
VITE_FIREBASE_APP_ID=<from Firebase>
```

### 2. Deploy to Vercel
```bash
cd frontend
npm install -g vercel
vercel login
vercel --prod
```

Follow prompts:
- Project name: `medvision-ai`
- Framework: Vite
- Build command: `npm run build`
- Output directory: `dist`

### 3. Update Backend CORS

Go back to PythonAnywhere WSGI file and update:
```python
os.environ['FRONTEND_URL'] = 'https://medvision-ai.vercel.app'
os.environ['ALLOWED_ORIGINS'] = 'https://medvision-ai.vercel.app'
```

Reload web app.

---

## Part 4: Environment Variables Reference

**What to set in PythonAnywhere WSGI file:**

```python
# Database (from Neon)
os.environ['DATABASE_URL'] = 'postgresql://...'

# Firebase (from FIREBASE_RENDER_CONFIG.txt)
os.environ['FIREBASE_PROJECT_ID'] = 'dfuai-1f1af'
os.environ['FIREBASE_SERVICE_ACCOUNT_JSON'] = '{"type":"service_account",...}'

# Frontend (after Vercel deploy)
os.environ['FRONTEND_URL'] = 'https://your-app.vercel.app'
os.environ['ALLOWED_ORIGINS'] = 'https://your-app.vercel.app'

# Security
os.environ['SECRET_KEY'] = 'random-32-character-string'
os.environ['ENVIRONMENT'] = 'production'
os.environ['DEBUG'] = 'False'
```

---

## Part 5: Verify Deployment

### 1. Test Backend
```bash
curl https://yourname.pythonanywhere.com/health
```

Expected:
```json
{
  "status": "healthy",
  "database": "connected",
  "environment": "production"
}
```

### 2. Test API Docs
Visit: `https://yourname.pythonanywhere.com/docs`

### 3. Test Frontend
1. Go to your Vercel URL
2. Sign up with new account
3. Should connect to PythonAnywhere backend
4. Check PythonAnywhere error logs for issues

---

## Part 6: Free Tier Limits

### PythonAnywhere Free:
- ✅ Always-on web app
- ✅ 512 MB disk space
- ✅ 1 web worker
- ⚠️ CPU limited (may be slow for ML inference)
- ⚠️ Can only connect to whitelist servers (Neon is whitelisted ✅)

### Neon Free:
- ✅ 500 MB storage
- ✅ 10 GB data transfer/month
- ✅ 1 project, 10 branches

### Vercel Free:
- ✅ 100 GB bandwidth/month
- ✅ Unlimited sites
- ✅ CDN included

---

## Part 7: Troubleshooting

### ❌ 502 Bad Gateway
**Fix:** Check error logs in PythonAnywhere → Files → `/var/log/yourname.pythonanywhere.com.error.log`

### ❌ Database Connection Failed
**Fix:** Add Neon IP to PythonAnywhere whitelist (should be automatic)

### ❌ Import Errors
**Fix:**
```bash
cd ~/diabetic-ulcer-ai-system
source venv/bin/activate
pip install -r backend/requirements.txt --upgrade
```

### ❌ ML Models Too Large
**Fix:** PythonAnywhere free tier has 512 MB limit. You may need to:
1. Compress models
2. Use smaller model variants
3. Or upgrade to paid plan ($5/mo for 3GB)

### ❌ CORS Errors
**Fix:** Update `ALLOWED_ORIGINS` in WSGI file with correct Vercel URL

---

## Part 8: Updating Your App

### Update Backend:
```bash
# SSH into PythonAnywhere
cd ~/diabetic-ulcer-ai-system
git pull origin main
source venv/bin/activate
pip install -r backend/requirements.txt
# Go to Web tab and click Reload
```

### Update Frontend:
```bash
cd frontend
git pull
vercel --prod
```

---

## Summary

✅ **Backend**: `https://yourname.pythonanywhere.com`  
✅ **Frontend**: `https://your-app.vercel.app`  
✅ **Database**: Neon PostgreSQL  
✅ **Cost**: $0 forever  
✅ **Credit Card**: Not needed  

---

## 🎉 You're Live!

Your production-ready ML app is now deployed completely free!

**Note**: PythonAnywhere free tier may be slow for ML inference. If you need faster performance, consider upgrading to their $5/mo plan.

---

<div align="center">

**Questions?** Check PythonAnywhere docs: https://help.pythonanywhere.com

</div>
