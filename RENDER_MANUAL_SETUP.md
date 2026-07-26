# 🎯 Render Manual Deployment Guide

**Complete step-by-step manual setup (No Blueprint, No Auto-Detect)**

---

## Part 1: Create PostgreSQL Database (5 min)

### Step 1: Go to Render Dashboard
- Open: https://dashboard.render.com
- Login with GitHub

### Step 2: Create Database
1. Click **"New +"** (top right)
2. Select **"PostgreSQL"**
3. Fill in details:

```
Name: medvision-db
Database: medvision
User: medvision_user
Region: Oregon (US West)
PostgreSQL Version: 15
```

4. **Instance Type:** Select **"Free"**
5. Click **"Create Database"**

### Step 3: Wait for Database Creation
- Takes 2-3 minutes
- Status will change to "Available"

### Step 4: Copy Database URL
1. Click on the database name: `medvision-db`
2. Find **"Internal Database URL"**
3. Copy the entire URL (starts with `postgresql://`)
4. Save it in a text file - you'll need it in Part 2

**Example format:**
```
postgresql://medvision_user:password@dpg-xxxxx-a.oregon-postgres.render.com/medvision
```

---

## Part 2: Create Backend Web Service (10 min)

### Step 1: Create New Web Service
1. Click **"New +"** → **"Web Service"**
2. Click **"Build and deploy from a Git repository"**
3. Click **"Connect account"** (if not connected)
4. Select your repo: `BharatChandra-sys/diabetic-ulcer-ai-system`
5. Click **"Connect"**

### Step 2: Configure Service Settings

**Basic Settings:**
```
Name: medvision-ai-backend
Region: Oregon (US West)
Branch: main
Root Directory: (leave empty)
```

**Runtime:**
```
Runtime: Docker
```

**Build Settings:**
```
Dockerfile Path: ./Dockerfile
Docker Context: . (current directory)
Docker Command: (leave empty - uses CMD from Dockerfile)
```

**Instance Type:**
```
Select: Free
```

### Step 3: Add Environment Variables

Click **"Advanced"** → **"Add Environment Variable"**

Add these one by one (click "+ Add Environment Variable" for each):

#### 1. Database
```
Key: DATABASE_URL
Value: [paste the Internal Database URL from Part 1 Step 4]
```

#### 2. Firebase Project ID
```
Key: FIREBASE_PROJECT_ID
Value: dfuai-1f1af
```

#### 3. Firebase Service Account JSON
```
Key: FIREBASE_SERVICE_ACCOUNT_JSON
Value: [open FIREBASE_RENDER_CONFIG.txt and copy the entire single-line JSON]
```

#### 4. Environment
```
Key: ENVIRONMENT
Value: production
```

#### 5. Debug
```
Key: DEBUG
Value: False
```

#### 6. Secret Key
```
Key: SECRET_KEY
Value: [generate one - see below]
```

**To generate SECRET_KEY:**
```bash
python -c "import secrets; print(secrets.token_urlsafe(32))"
```
Or use: https://randomkeygen.com/ (CodeIgniter Encryption Keys)

#### 7. JWT Algorithm
```
Key: JWT_ALGORITHM
Value: HS256
```

#### 8. Token Expiration
```
Key: ACCESS_TOKEN_EXPIRE_MINUTES
Value: 30
```

#### 9. Frontend URL (add after you deploy frontend)
```
Key: FRONTEND_URL
Value: https://your-app.vercel.app
```
(Leave as placeholder for now, update later)

#### 10. CORS Origins
```
Key: ALLOWED_ORIGINS
Value: https://your-app.vercel.app,http://localhost:5173
```
(Update first part after frontend deployment)

#### 11-13. Model Paths (Optional - has defaults)
```
Key: CNN_MODEL_PATH
Value: backend/models/best_dfu_model.pth

Key: SEGMENTATION_MODEL_PATH
Value: backend/models/segmentation_model.pth

Key: MULTIMODAL_MODEL_PATH
Value: backend/models/multimodal_model.pth
```

#### 14-16. Cloudinary (Optional - only if using)
```
Key: CLOUDINARY_CLOUD_NAME
Value: (your cloud name or leave empty)

Key: CLOUDINARY_API_KEY
Value: (your API key or leave empty)

Key: CLOUDINARY_API_SECRET
Value: (your API secret or leave empty)
```

### Step 4: Configure Health Check

Scroll down to **"Health Check Path"**
```
Health Check Path: /health
```

### Step 5: Click "Create Web Service"

- Build will start automatically
- Takes 8-12 minutes (Docker + PyTorch)
- Watch logs in real-time

---

## Part 3: Verify Deployment

### Step 1: Check Build Logs

Watch for these messages:
```
✓ Build succeeded
✓ Docker image created
✓ Starting service...
✓ Health check passed
```

### Step 2: Get Your Backend URL

After deployment succeeds:
- You'll see: **"Your service is live at https://medvision-ai-backend.onrender.com"**
- Copy this URL

### Step 3: Test Health Endpoint

Open in browser:
```
https://medvision-ai-backend.onrender.com/health
```

Expected response:
```json
{
  "status": "healthy",
  "database": "connected",
  "users_count": 0,
  "environment": "production",
  "migrations": {
    "tables_exist": {
      "users": true,
      "patients": true,
      "prediction_logs": true,
      "ulcer_images": true,
      "health_metrics": true
    },
    "migrations_applied": {
      "firebase_uid": true,
      "risk_level": true,
      "explanation_text": true
    }
  }
}
```

### Step 4: Test API Documentation

Open:
```
https://medvision-ai-backend.onrender.com/docs
```

You should see Swagger UI with all API endpoints.

---

## Part 4: Update Frontend URL

### After you deploy frontend on Vercel:

1. Go to Render Dashboard → **medvision-ai-backend** service
2. Click **"Environment"** in left sidebar
3. Find `FRONTEND_URL` variable
4. Click **"Edit"** (pencil icon)
5. Update value to your Vercel URL: `https://your-app.vercel.app`
6. Find `ALLOWED_ORIGINS` variable
7. Click **"Edit"**
8. Update to: `https://your-app.vercel.app,http://localhost:5173`
9. Click **"Save Changes"** at bottom
10. Service will redeploy automatically (~2 min)

---

## Part 5: Keep Backend Alive (Free Tier)

Render free tier sleeps after 15 min of inactivity.

### Setup UptimeRobot (Free):

1. Go to: https://uptimerobot.com
2. Sign up (free)
3. Click **"Add New Monitor"**
4. Fill in:
```
Monitor Type: HTTP(s)
Friendly Name: MedVision Backend
URL: https://medvision-ai-backend.onrender.com/health/ping
Monitoring Interval: 5 minutes
```
5. Click **"Create Monitor"**

Your backend will now ping every 5 minutes and stay warm! ✅

---

## Complete Environment Variables Summary

Here's the complete list you need to add:

| Variable | Value | Required |
|----------|-------|----------|
| `DATABASE_URL` | From database Internal URL | ✅ Yes |
| `FIREBASE_PROJECT_ID` | `dfuai-1f1af` | ✅ Yes |
| `FIREBASE_SERVICE_ACCOUNT_JSON` | Single-line JSON | ✅ Yes |
| `ENVIRONMENT` | `production` | ✅ Yes |
| `DEBUG` | `False` | ✅ Yes |
| `SECRET_KEY` | Generate random 32-char string | ✅ Yes |
| `JWT_ALGORITHM` | `HS256` | ✅ Yes |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | `30` | ✅ Yes |
| `FRONTEND_URL` | Your Vercel URL | ✅ Yes |
| `ALLOWED_ORIGINS` | Vercel URL + localhost | ✅ Yes |
| `CNN_MODEL_PATH` | `backend/models/best_dfu_model.pth` | ⚪ Optional |
| `SEGMENTATION_MODEL_PATH` | `backend/models/segmentation_model.pth` | ⚪ Optional |
| `MULTIMODAL_MODEL_PATH` | `backend/models/multimodal_model.pth` | ⚪ Optional |
| `CLOUDINARY_CLOUD_NAME` | Your cloud name | ⚪ Optional |
| `CLOUDINARY_API_KEY` | Your API key | ⚪ Optional |
| `CLOUDINARY_API_SECRET` | Your API secret | ⚪ Optional |

**Total: 10 required + 6 optional = 16 variables maximum**

---

## Troubleshooting

### ❌ Build Failed: "Cannot find Dockerfile"

**Fix:**
1. Go to service settings
2. Check **"Dockerfile Path"** is: `./Dockerfile`
3. Check **"Docker Context"** is: `.`
4. Redeploy

### ❌ Build Failed: "Requirements installation failed"

**Cause:** PyTorch timeout on free tier

**Fix:** Wait and retry. Free tier has limited resources. Build may take 2-3 attempts.

### ❌ Health Check Failing

**Fix:**
1. Check logs for errors
2. Verify `DATABASE_URL` is correct
3. Verify Firebase credentials are valid
4. Increase health check timeout:
   - Settings → Health Check → Timeout: 30 seconds

### ❌ Database Connection Failed

**Fix:**
1. Verify you copied **"Internal Database URL"** (not External)
2. Check database is "Available" status
3. Verify URL format: `postgresql://user:pass@host/db`

### ❌ CORS Errors in Frontend

**Fix:**
1. Update `ALLOWED_ORIGINS` with your actual Vercel URL
2. Remove trailing slashes
3. Save changes (triggers redeploy)

### ❌ Firebase Auth Failed

**Fix:**
1. Verify `FIREBASE_PROJECT_ID` is exactly: `dfuai-1f1af`
2. Check `FIREBASE_SERVICE_ACCOUNT_JSON` is single line (no newlines)
3. Re-download service account JSON from Firebase Console

---

## Cost Breakdown

### Free Tier (Current Setup)

| Resource | Cost | Limits |
|----------|------|--------|
| PostgreSQL Database | $0 | 256 MB storage, 97 connection hours/mo |
| Web Service | $0 | 512 MB RAM, 0.1 CPU, sleeps after 15 min |
| UptimeRobot | $0 | 50 monitors, 5 min interval |
| **TOTAL** | **$0/month** | |

### Limitations:
- ⏰ Backend sleeps after 15 min (30s cold start)
- 💾 Database expires after 90 days (free tier)
- 📊 750 hours/month (not 24/7 with UptimeRobot keepalive)

### Upgrade to Paid ($14/month for production):
- Backend Starter: $7/mo (no sleep, 512 MB RAM, 0.5 CPU)
- Database Starter: $7/mo (1 GB storage, daily backups, no expiration)

---

## Next Steps

1. ✅ Backend deployed and running
2. ✅ Database connected and migrated
3. ✅ Health checks passing
4. ⬜ Deploy frontend to Vercel
5. ⬜ Update `FRONTEND_URL` in backend
6. ⬜ Setup UptimeRobot keepalive
7. ⬜ Test full authentication flow

---

## Alternative: If Card Required for Free Tier

If Render requires a card even for free tier, you have options:

### Option 1: Add Card (Recommended)
- Add a debit card
- They won't charge unless you exceed free tier
- You can set spending limits

### Option 2: Virtual Card
- Use Privacy.com (US only)
- Use Revolut virtual card
- Set $1 limit

### Option 3: Try Railway
- Railway has $5 free credit monthly
- No card required initially
- See: https://railway.app

### Option 4: Try Fly.io
- Fly.io has generous free tier
- Credit card required but not charged
- See: https://fly.io

---

## Summary

### What You Created:
✅ PostgreSQL database (256 MB)  
✅ Backend web service (Docker)  
✅ Auto-migrations enabled  
✅ Health monitoring  
✅ Firebase auth configured  

### What You Need:
📋 16 environment variables added manually  
🔗 Backend URL for frontend  
⏰ UptimeRobot monitor (optional but recommended)  

### Time Required:
⏱️ Database: 5 minutes  
⏱️ Backend: 10 minutes setup + 10 minutes build  
⏱️ Total: ~25 minutes  

---

<div align="center">

**Your backend is now live!** 🎉

API: `https://medvision-ai-backend.onrender.com`  
Docs: `https://medvision-ai-backend.onrender.com/docs`  
Health: `https://medvision-ai-backend.onrender.com/health`

</div>
