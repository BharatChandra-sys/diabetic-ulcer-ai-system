# Deployment Guide

**Stack: Render (backend) + Neon (database) + Vercel (frontend)**
All free. No credit card for Neon or Vercel. Render requires card but won't charge.

---

## Architecture

```
Vercel (React frontend)
        ↓ HTTPS
Render (FastAPI backend, Docker, free tier)
        ↓ PostgreSQL
Neon (PostgreSQL database, free forever)
```

---

## Step 1 — Neon Database (2 min, no card)

1. Go to **https://neon.tech** → Sign up with GitHub
2. Click **New Project** → name it `dfuai`
3. Click **Connect** → copy the connection string:
   ```
   postgresql://user:password@ep-xxx.us-east-2.aws.neon.tech/neondb?sslmode=require
   ```
   Save this — you need it in Step 2.

---

## Step 2 — Render Backend (10 min, needs card for verification)

### 2a. Deploy the service

1. Go to **https://dashboard.render.com** → New → Web Service
2. Connect your GitHub repo: `BharatChandra-sys/diabetic-ulcer-ai-system`
3. Render detects Docker automatically
4. Set:
   - **Name**: `dfuai-backend`
   - **Region**: Oregon
   - **Plan**: Free
5. Scroll down to **Environment Variables** and add these:

| Key | Value |
|-----|-------|
| `DATABASE_URL` | Your Neon connection string from Step 1 |
| `FIREBASE_PROJECT_ID` | `dfuai-1f1af` |
| `FIREBASE_SERVICE_ACCOUNT_JSON` | (see below) |
| `FRONTEND_URL` | `https://dfuai.vercel.app` (update after Step 3) |
| `ALLOWED_ORIGINS` | `https://dfuai.vercel.app,http://localhost:5173` |

6. Click **Deploy Web Service**

### 2b. Firebase Service Account JSON

Open `FIREBASE_CREDENTIALS.txt` in your project root — copy the single-line JSON there.

If the file is gone, run this locally:
```powershell
python -c "import json; print(json.dumps(json.load(open('dfuai-1f1af-firebase-adminsdk-fbsvc-a0caf64de8.json'))))"
```

Paste the output as the value of `FIREBASE_SERVICE_ACCOUNT_JSON`.

### 2c. Auto-configured (leave as defaults)

These are already set in `render.yaml` — no action needed:
- `ENVIRONMENT` = production
- `DEBUG` = False
- `SECRET_KEY` = (Render generates)
- `JWT_ALGORITHM` = HS256

### 2d. Wait for build (~10 min)

Watch logs for:
```
✓ Database tables ready
✓ Database migrations completed
✓ MedVision AI ready to serve requests
```

Your backend is live at: `https://dfuai-backend.onrender.com`

---

## Step 3 — Vercel Frontend (3 min, no card)

### 3a. Update frontend environment

Edit `frontend/.env` — it already has the right Firebase values. Just update the API URL:

```env
VITE_API_BASE_URL=https://dfuai-backend.onrender.com
```

### 3b. Deploy to Vercel

```bash
cd frontend
npm run build
```

Then either:
- Push to GitHub and connect repo at https://vercel.com/new
- Or use CLI: `npx vercel --prod`

In Vercel dashboard, add these **Environment Variables**:

| Key | Value |
|-----|-------|
| `VITE_API_BASE_URL` | `https://dfuai-backend.onrender.com` |
| `VITE_FIREBASE_API_KEY` | `AIzaSyCbz-iDW0Im8unng08Cjwx1cciXXooKIpM` |
| `VITE_FIREBASE_AUTH_DOMAIN` | `dfuai-1f1af.firebaseapp.com` |
| `VITE_FIREBASE_PROJECT_ID` | `dfuai-1f1af` |
| `VITE_FIREBASE_STORAGE_BUCKET` | `dfuai-1f1af.firebasestorage.app` |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | `616964572908` |
| `VITE_FIREBASE_APP_ID` | `1:616964572908:web:2a94f6e56eb9250cfac7c9` |

### 3c. Update Render CORS

After Vercel gives you the URL, go back to Render → Environment and update:
- `FRONTEND_URL` = `https://your-actual-vercel-url.vercel.app`
- `ALLOWED_ORIGINS` = `https://your-actual-vercel-url.vercel.app,http://localhost:5173`

---

## Step 4 — Keep Backend Alive (free tier sleeps after 15 min)

1. Go to **https://uptimerobot.com** → Sign up free
2. Add monitor:
   - URL: `https://dfuai-backend.onrender.com/health/ping`
   - Interval: 5 minutes
3. Done — backend stays awake

---

## Step 5 — Verify Everything Works

```bash
# Backend health
curl https://dfuai-backend.onrender.com/health

# Expected:
# {"status":"healthy","database":"connected","environment":"production"}
```

Then open your Vercel URL, sign up, and test a scan.

---

## Local Development

```bash
# Backend
cd diabetic-ulcer-ai-system
python -m venv venv
venv\Scripts\activate
pip install -r backend/requirements.txt
uvicorn backend.app.main:app --reload --port 8000

# Frontend (separate terminal)
cd frontend
npm install
npm run dev
```

Or with Docker:
```bash
docker-compose up --build
```

---

## Troubleshooting

**CORS errors in browser**
→ Check `ALLOWED_ORIGINS` includes your Vercel URL (no trailing slash)

**Firebase auth not working**
→ Check `FIREBASE_PROJECT_ID` = `dfuai-1f1af` and JSON is valid single-line

**Database connection failed**
→ Check `DATABASE_URL` is the Neon connection string with `?sslmode=require`

**Build timeout (first build is slow)**
→ PyTorch installs take 8–12 min on free tier. Wait it out.

**Cold start (30 sec delay on first request)**
→ Set up UptimeRobot as in Step 4

---

## Environment Variables Summary

### Render (backend)

| Key | Where to get |
|-----|-------------|
| `DATABASE_URL` | Neon dashboard → Connect |
| `FIREBASE_PROJECT_ID` | Already known: `dfuai-1f1af` |
| `FIREBASE_SERVICE_ACCOUNT_JSON` | Run python command in 2b above |
| `FRONTEND_URL` | Your Vercel URL after deploy |
| `ALLOWED_ORIGINS` | Your Vercel URL + `,http://localhost:5173` |
| `SECRET_KEY` | Auto-generated by Render ✅ |

### Vercel (frontend)

| Key | Value |
|-----|-------|
| `VITE_API_BASE_URL` | `https://dfuai-backend.onrender.com` |
| `VITE_FIREBASE_API_KEY` | `AIzaSyCbz-iDW0Im8unng08Cjwx1cciXXooKIpM` |
| `VITE_FIREBASE_AUTH_DOMAIN` | `dfuai-1f1af.firebaseapp.com` |
| `VITE_FIREBASE_PROJECT_ID` | `dfuai-1f1af` |
| `VITE_FIREBASE_STORAGE_BUCKET` | `dfuai-1f1af.firebasestorage.app` |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | `616964572908` |
| `VITE_FIREBASE_APP_ID` | `1:616964572908:web:2a94f6e56eb9250cfac7c9` |
