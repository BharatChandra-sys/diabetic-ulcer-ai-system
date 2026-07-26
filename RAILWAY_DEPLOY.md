# 🚂 Railway Deployment Guide (Manual Setup)

**Free Tier: $5 credit/month | No credit card required | Better than Render**

---

## Why Railway?

✅ **$5 free credit every month** (renews monthly)  
✅ **No credit card required** for free tier  
✅ **No sleep/cold starts** (unlike Render free tier)  
✅ **Better performance** than Render free tier  
✅ **Postgres included** in free tier  
✅ **Easy to use** dashboard  

Free tier limits:
- 500 hours/month execution time
- 5 GB RAM
- PostgreSQL database included

---

## Step-by-Step Deployment

### Part 1: Create Railway Account (2 min)

1. Go to: https://railway.app
2. Click **"Start a New Project"**
3. Sign up with GitHub (recommended) or email
4. ✅ Free $5 credit automatically added

---

### Part 2: Create PostgreSQL Database (1 min)

1. **Dashboard** → Click **"+ New Project"**
2. Select **"Provision PostgreSQL"**
3. Database created! ✅
4. Click on the PostgreSQL service
5. Go to **"Variables"** tab
6. Copy `DATABASE_URL` value (you'll need this later)

**Your DATABASE_URL looks like:**
```
postgresql://postgres:PASSWORD@containers-us-west-XXX.railway.app:PORT/railway
```

---

### Part 3: Deploy Backend Service (5 min)

#### 3.1 Add Backend Service

1. Same project → Click **"+ New"**
2. Select **"GitHub Repo"**
3. Connect your GitHub account (if not already)
4. Select repository: **`diabetic-ulcer-ai-system`**
5. Click **"Add variables"** or **"Deploy"**

#### 3.2 Configure Build Settings

After deployment starts, click on the service:

1. Go to **"Settings"** tab
2. **Root Directory**: Leave empty (repo root)
3. **Dockerfile Path**: `Dockerfile`
4. **Build Command**: (leave empty - uses Dockerfile)
5. **Start Command**: (leave empty - uses Dockerfile CMD)

#### 3.3 Add Environment Variables

Click on **"Variables"** tab and add these one by one:

##### Required Variables:

| Variable Name | Value | Notes |
|--------------|-------|-------|
| `PORT` | `8000` | Railway auto-injects $PORT, but set default |
| `ENVIRONMENT` | `production` | |
| `DEBUG` | `False` | |
| `DATABASE_URL` | (copy from PostgreSQL service) | Click "Reference" → Select PostgreSQL → DATABASE_URL |
| `FIREBASE_PROJECT_ID` | `dfuai-1f1af` | From your FIREBASE_RENDER_CONFIG.txt |
| `FIREBASE_SERVICE_ACCOUNT_JSON` | `{"type":"service_account"...}` | Single-line JSON from FIREBASE_RENDER_CONFIG.txt |
| `SECRET_KEY` | (generate below) | |
| `JWT_ALGORITHM` | `HS256` | |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | `30` | |
| `FRONTEND_URL` | `https://your-app.vercel.app` | Update after Vercel deploy |
| `ALLOWED_ORIGINS` | `https://your-app.vercel.app,http://localhost:5173` | |

**Generate SECRET_KEY:**
```bash
python -c "import secrets; print(secrets.token_urlsafe(32))"
```

##### Optional (Cloudinary):
| Variable Name | Value |
|--------------|-------|
| `CLOUDINARY_CLOUD_NAME` | (if using Cloudinary) |
| `CLOUDINARY_API_KEY` | (if using Cloudinary) |
| `CLOUDINARY_API_SECRET` | (if using Cloudinary) |

#### 3.4 Link Database (Easy Way)

Instead of copying DATABASE_URL manually:

1. In **"Variables"** tab
2. Click **"+ New Variable"**
3. Click **"Add Reference"**
4. Select **PostgreSQL service**
5. Select **`DATABASE_URL`**
6. Save

Railway auto-links the database! ✅

#### 3.5 Deploy

1. Click **"Deploy"** button (top right)
2. Watch logs in **"Deployments"** tab
3. Build takes ~8-12 minutes (PyTorch install)
4. Wait for: **"✓ Deployment successful"**

---

### Part 4: Get Your Backend URL (1 min)

1. Click on backend service
2. Go to **"Settings"** tab
3. Scroll to **"Networking"** section
4. Click **"Generate Domain"**
5. Railway creates a public URL like:
   ```
   https://diabetic-ulcer-ai-system-production.up.railway.app
   ```
6. **Copy this URL** - you'll need it for frontend

---

### Part 5: Update CORS Settings (1 min)

After you deploy frontend on Vercel:

1. Go back to backend service → **"Variables"**
2. Update `FRONTEND_URL`:
   ```
   https://your-app.vercel.app
   ```
3. Update `ALLOWED_ORIGINS`:
   ```
   https://your-app.vercel.app,http://localhost:5173
   ```
4. Service auto-redeploys with new settings ✅

---

### Part 6: Verify Deployment

#### Test Health Endpoint

Open in browser:
```
https://your-backend.up.railway.app/health
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
      "prediction_logs": true
    }
  }
}
```

#### Test API Docs

```
https://your-backend.up.railway.app/docs
```

Should show Swagger UI with 41 endpoints.

#### Check Logs

1. Backend service → **"Deployments"** tab
2. Click latest deployment
3. View logs:
```
✓ Database tables ready
✓ Running database migrations...
✓ firebase_uid column added
✓ Database migrations completed
✓ MedVision AI ready to serve requests
```

---

## Frontend Deployment (Vercel)

### Update Frontend Environment Variables

Create `frontend/.env.production`:

```env
VITE_API_BASE_URL=https://your-backend.up.railway.app
VITE_FIREBASE_API_KEY=AIza...
VITE_FIREBASE_AUTH_DOMAIN=dfuai-1f1af.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=dfuai-1f1af
VITE_FIREBASE_STORAGE_BUCKET=dfuai-1f1af.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=1:...:web:...
```

### Deploy to Vercel

```bash
cd frontend
npm install -g vercel
vercel login
vercel --prod
```

Or use Vercel Dashboard:
1. Import from GitHub
2. Add environment variables
3. Deploy

---

## Railway CLI (Alternative Method)

### Install CLI

```bash
# Windows (PowerShell)
iwr https://railway.app/install.ps1 | iex

# Mac/Linux
curl -fsSL https://railway.app/install.sh | sh
```

### Deploy from CLI

```bash
# Login
railway login

# Link project
railway link

# Add variables (one by one)
railway variables set FIREBASE_PROJECT_ID=dfuai-1f1af
railway variables set ENVIRONMENT=production
# ... (add all variables)

# Deploy
railway up
```

---

## Cost Management

### Monitor Usage

1. Railway Dashboard → **"Usage"** tab
2. See your $5 credit usage
3. Resets every month

### Free Tier Limits

**Included in $5/month:**
- ~500 hours execution time
- PostgreSQL database
- 5 GB RAM
- No sleep/cold starts

**Typical usage for this app:**
- Backend: ~$3/month (always on)
- Database: ~$1/month
- Total: **~$4/month** (within free tier!)

### If You Exceed $5

Railway will:
1. Email you warning at $4
2. Pause services if you hit $5
3. Resume next month automatically

**To extend:**
- Add $5/month subscription
- Or optimize to stay within free tier

---

## Troubleshooting

### ❌ Build Failed: "Dockerfile not found"

**Fix:**
1. Settings → **Dockerfile Path**: `Dockerfile` (capital D)
2. Settings → **Root Directory**: leave empty

### ❌ Health Check 502 Bad Gateway

**Cause:** Port mismatch

**Fix:**
1. Variables → Check `PORT=8000`
2. Railway auto-injects `$PORT` - our Dockerfile uses it ✅

### ❌ Database Connection Failed

**Cause:** DATABASE_URL not set

**Fix:**
1. Variables → Add reference to PostgreSQL DATABASE_URL
2. Or manually copy from PostgreSQL service

### ❌ CORS Error in Frontend

**Cause:** ALLOWED_ORIGINS not updated

**Fix:**
1. Variables → Update `ALLOWED_ORIGINS` with your Vercel URL
2. No trailing slash!

### ❌ Firebase Auth Failed

**Cause:** Invalid SERVICE_ACCOUNT_JSON

**Fix:**
1. Check JSON is single line (no newlines)
2. Copy from FIREBASE_RENDER_CONFIG.txt
3. Paste carefully (no extra spaces)

### ❌ "Out of Credits"

**Solution 1: Optimize**
- Use smaller instance (Railway auto-scales)
- Add sleep mode (not recommended for production)

**Solution 2: Upgrade**
- Add $5/month subscription
- Or use Hobby plan ($5-20/month depending on usage)

---

## Comparison: Railway vs Render

| Feature | Railway Free | Render Free |
|---------|-------------|-------------|
| **Credit Card** | ❌ Not required | ✅ Required |
| **Free Credit** | $5/month | $0 |
| **Cold Starts** | ❌ None | ✅ After 15 min |
| **Sleep** | ❌ No sleep | ✅ Sleeps |
| **Postgres** | ✅ Included | ✅ Included |
| **RAM** | 5 GB | 512 MB |
| **Deployment** | 🚀 Fast | 🐢 Slow |
| **Best For** | Always-on apps | Static sites |

**Winner:** Railway (for this app)

---

## Advanced: Custom Domain

### Add Custom Domain (Free)

1. Backend service → **"Settings"** → **"Networking"**
2. **"Custom Domains"** → **"+ Add Domain"**
3. Enter: `api.yourdomain.com`
4. Add CNAME record in your DNS:
   ```
   CNAME  api  your-app.up.railway.app
   ```
5. Wait for SSL provisioning (~5 min)
6. ✅ Your API is at `https://api.yourdomain.com`

---

## Backup & Restore

### Backup Database

```bash
# Install Railway CLI
railway login
railway link

# Backup
railway run pg_dump $DATABASE_URL > backup.sql
```

### Restore Database

```bash
railway run psql $DATABASE_URL < backup.sql
```

### Automated Backups

Railway Pro plan ($5+/month) includes:
- Daily automated backups
- Point-in-time recovery
- 7-day retention

---

## Environment Variables Quick Reference

### Copy-Paste Template

```env
# App
PORT=8000
ENVIRONMENT=production
DEBUG=False

# Database (Reference from PostgreSQL service)
DATABASE_URL=<REFERENCE_TO_POSTGRES>

# Firebase (from FIREBASE_RENDER_CONFIG.txt)
FIREBASE_PROJECT_ID=dfuai-1f1af
FIREBASE_SERVICE_ACCOUNT_JSON={"type":"service_account"...}

# Security (generate SECRET_KEY)
SECRET_KEY=<GENERATE_WITH_PYTHON>
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# CORS (update after Vercel deploy)
FRONTEND_URL=https://your-app.vercel.app
ALLOWED_ORIGINS=https://your-app.vercel.app,http://localhost:5173

# Optional: Cloudinary
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
```

---

## Summary

### What You Did:

1. ✅ Created Railway account (free $5/month)
2. ✅ Provisioned PostgreSQL database
3. ✅ Deployed backend from GitHub
4. ✅ Added 11 environment variables
5. ✅ Generated public URL
6. ✅ Auto-migrations run on startup

### What You Have:

- **Backend**: `https://your-app.up.railway.app`
- **Database**: PostgreSQL (auto-linked)
- **Free tier**: $5/month credit
- **No sleep**: Always-on backend
- **Auto-deploy**: Push to GitHub → auto-deploy

### Next Steps:

1. Deploy frontend to Vercel
2. Update FRONTEND_URL in Railway
3. Test end-to-end authentication
4. Done! 🎉

---

## Help & Resources

- **Railway Docs**: https://docs.railway.app
- **Community**: https://discord.gg/railway
- **Status**: https://status.railway.app

---

<div align="center">

**Railway is ready! 🚂**

Your backend will be live in ~10 minutes.

[Check Status](https://railway.app/dashboard) • [View Logs](https://railway.app/dashboard) • [Monitor Usage](https://railway.app/dashboard)

</div>
