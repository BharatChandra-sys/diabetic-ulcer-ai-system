# 🚀 Render Deployment Guide

Complete guide to deploying MedVision AI backend + database on Render.

---

## 📋 Prerequisites

- [ ] Render account (free tier: https://render.com)
- [ ] Firebase project with Admin SDK credentials
- [ ] GitHub repository pushed
- [ ] Frontend deployed on Vercel (get URL for CORS)

---

## Part 1: Firebase Setup (5 min)

### 1.1 Get Firebase Credentials

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project (or create one)
3. **Project Settings** → **Service Accounts** tab
4. Click **"Generate New Private Key"**
5. Save the JSON file (keep it secret!)

### 1.2 Prepare Service Account JSON

Open the downloaded JSON file. You'll need to **convert it to a single line**:

**Option A — Python one-liner:**
```bash
python -c "import json; print(json.dumps(json.load(open('your-firebase-key.json'))))"
```

**Option B — Manual:**
Remove all newlines and extra spaces so it looks like:
```
{"type":"service_account","project_id":"your-project-123",...}
```

Copy this string — you'll paste it into Render later.

### 1.3 Get Firebase Project ID

From the same JSON file, copy the `"project_id"` value (e.g., `medvision-ai-prod`).

---

## Part 2: Deploy Backend on Render (10 min)

### 2.1 Connect Repository

1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click **"New +"** → **"Blueprint"**
3. Connect your GitHub account
4. Select repository: `diabetic-ulcer-ai-system`
5. Click **"Apply"**

Render will detect `render.yaml` and provision:
- ✅ PostgreSQL database (`medvision-db`)
- ✅ Web service (`medvision-ai-backend`)

### 2.2 Configure Environment Variables

Once deployed, go to the **backend service settings** and update these env vars:

#### Required Updates:

| Variable | Value | Notes |
|----------|-------|-------|
| `FIREBASE_PROJECT_ID` | `your-project-id` | From Firebase console |
| `FIREBASE_SERVICE_ACCOUNT_JSON` | `{"type":"service_account",...}` | Single-line JSON from step 1.2 |
| `FRONTEND_URL` | `https://your-app.vercel.app` | Your Vercel deployment URL |
| `ALLOWED_ORIGINS` | `https://your-app.vercel.app,http://localhost:5173` | Add your frontend URL |

#### Auto-Generated (leave as-is):
- `DATABASE_URL` — Render auto-links from PostgreSQL
- `SECRET_KEY` — Render auto-generates

#### Optional (add if using Cloudinary):
- `CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`

### 2.3 Save & Deploy

Click **"Save Changes"** — Render will redeploy automatically.

### 2.4 Wait for Build

Build time: ~8–12 minutes (Docker + PyTorch install)

Watch logs for:
```
✓ Build succeeded
✓ Health check passed
==> Your service is live at https://medvision-ai-backend.onrender.com
```

---

## Part 3: Verify Deployment

### 3.1 Health Check

Open in browser:
```
https://medvision-ai-backend.onrender.com/health
```

Expected response:
```json
{
  "status": "healthy",
  "environment": "production",
  "database": "connected"
}
```

### 3.2 API Docs

```
https://medvision-ai-backend.onrender.com/docs
```

You should see the Swagger UI with 41 endpoints.

### 3.3 Test Firebase Auth

Try the `/auth/me` endpoint from Swagger:
1. First, get a Firebase ID token from your frontend (login as a user)
2. Click **"Authorize"** in Swagger
3. Enter: `Bearer YOUR_FIREBASE_ID_TOKEN`
4. Execute `/auth/me` — should return your user profile

---

## Part 4: Database Setup

### 4.1 Access PostgreSQL

Render auto-provisions the database and injects `DATABASE_URL`.

To view database details:
1. Go to Render Dashboard → **"medvision-db"**
2. Copy **Internal Database URL** (for migrations)
3. Note credentials (for direct access if needed)

### 4.2 Run Migrations

SQLAlchemy auto-creates tables on first startup via:
```python
# backend/app/database.py
Base.metadata.create_all(bind=engine)
```

Tables created automatically:
- `users` (Firebase UID + profile)
- `patients`
- `scans`
- `reports`

### 4.3 Verify Tables

**Option A — Render Shell:**
1. Go to backend service → **Shell** tab
2. Run:
```bash
python -c "from backend.app.database import engine; from sqlalchemy import inspect; print(inspect(engine).get_table_names())"
```

**Option B — psql (if you have PostgreSQL client):**
```bash
psql <INTERNAL_DATABASE_URL>
\dt
```

You should see: `users`, `patients`, `scans`, `reports`.

---

## Part 5: Update Frontend

### 5.1 Update API URL

In your Vercel deployment, set environment variable:
```
VITE_API_BASE_URL=https://medvision-ai-backend.onrender.com
```

### 5.2 Redeploy Frontend

```bash
# From Vercel dashboard or CLI
vercel --prod
```

### 5.3 Test Login Flow

1. Go to your frontend: `https://your-app.vercel.app`
2. Click **"Sign Up"**
3. Register with email/password or Google
4. Should redirect to Dashboard
5. Check backend logs — you'll see:
```
INFO: Firebase user authenticated: uid=abc123
INFO: User auto-provisioned in database
```

---

## Part 6: Keep Backend Alive (Free Tier)

Render free tier sleeps after 15 min of inactivity (cold start = 30s delay).

### Solution: UptimeRobot (Free)

1. Go to [UptimeRobot](https://uptimerobot.com)
2. Create account (free)
3. **Add New Monitor:**
   - **Type:** HTTP(s)
   - **URL:** `https://medvision-ai-backend.onrender.com/health/ping`
   - **Interval:** 5 minutes
4. Save

Now your backend pings every 5 min → never sleeps.

---

## Part 7: Advanced Configuration

### 7.1 Custom Domain (Optional)

1. Render Dashboard → backend service → **Settings**
2. **Custom Domain** → Add `api.yourdomain.com`
3. Update DNS CNAME: `api.yourdomain.com` → `medvision-ai-backend.onrender.com`
4. Wait for SSL cert provisioning (~5 min)
5. Update `FRONTEND_URL` and `ALLOWED_ORIGINS` to match

### 7.2 Scale Up (Paid Plans)

Free tier limits:
- 512 MB RAM
- Shared CPU
- 90-day inactivity suspension

To scale:
1. Go to service → **Settings** → **Instance Type**
2. Choose **Starter ($7/mo)** or **Standard ($25/mo)**
3. Benefits: no sleep, more RAM, faster CPU

### 7.3 Database Backups

Free PostgreSQL plan = no auto-backups.

**Manual backup:**
```bash
# Install pg_dump
pg_dump <DATABASE_URL> > backup.sql

# Restore
psql <DATABASE_URL> < backup.sql
```

**Upgrade to paid database ($7/mo):**
- Daily backups
- Point-in-time recovery
- 1 GB → 256 GB storage

---

## Part 8: Monitoring & Logs

### 8.1 View Logs

Render Dashboard → backend service → **Logs** tab

Real-time log stream with filtering.

### 8.2 Health Endpoints

| Endpoint | Purpose | Expected Response |
|----------|---------|------------------|
| `/health` | System status | `{"status":"healthy"}` |
| `/health/ping` | Uptime check | `{"message":"pong"}` |
| `/health/ready` | K8s readiness | `{"ready":true}` |
| `/health/live` | K8s liveness | `{"alive":true}` |
| `/health/status` | Metrics | CPU, RAM, disk usage |

### 8.3 Prometheus Metrics

The backend exposes Prometheus metrics at `/metrics`.

To scrape:
1. Deploy Prometheus on another Render service
2. Configure scrape target: `https://medvision-ai-backend.onrender.com/metrics`

---

## Part 9: Troubleshooting

### ❌ Build Failed: "Requirements installation failed"

**Cause:** PyTorch timeout on free tier

**Fix:**
1. Reduce `torch` version in `requirements.txt`:
```
torch==2.0.1  # instead of 2.1.1
```

2. Or use `--timeout` flag in Dockerfile:
```dockerfile
RUN pip install --timeout 600 -r requirements.txt
```

### ❌ Health Check Failing

**Cause:** Port mismatch or slow startup

**Fix 1:** Increase health check delay in `render.yaml`:
```yaml
healthCheckPath: /health
healthCheckTimeout: 30    # add this
```

**Fix 2:** Check logs for startup errors:
```bash
# Common issues:
# - DATABASE_URL not set
# - Firebase credentials invalid
# - Model files missing
```

### ❌ CORS Error in Frontend

**Cause:** `ALLOWED_ORIGINS` not updated

**Fix:**
1. Render → backend service → **Environment**
2. Update `ALLOWED_ORIGINS`:
```
https://your-app.vercel.app,http://localhost:5173
```
3. Save (auto-redeploys)

### ❌ Database Connection Failed

**Cause:** `DATABASE_URL` not injected

**Fix:**
1. Render → backend service → **Environment**
2. Check `DATABASE_URL` variable exists
3. Should look like: `postgres://user:pass@host/db`
4. If missing, re-link database:
```yaml
# render.yaml
envVars:
  - key: DATABASE_URL
    fromDatabase:
      name: medvision-db
      property: connectionString
```

### ❌ Firebase Auth Failed: "Invalid ID token"

**Cause:** Wrong project ID or service account JSON

**Fix:**
1. Verify `FIREBASE_PROJECT_ID` matches your Firebase console
2. Re-download service account JSON
3. Convert to single line (no newlines!)
4. Update `FIREBASE_SERVICE_ACCOUNT_JSON` in Render

### ❌ Cold Start Taking 30+ Seconds

**Expected behavior on free tier.**

**Solutions:**
1. Set up UptimeRobot (keeps warm)
2. Upgrade to paid plan ($7/mo = no sleep)
3. Add loading indicator in frontend

---

## Part 10: Post-Deployment Checklist

- [ ] Backend health check passes: `/health`
- [ ] API docs accessible: `/docs`
- [ ] Firebase auth works (test signup/login)
- [ ] Database tables created (check logs)
- [ ] Frontend connects to backend (no CORS errors)
- [ ] UptimeRobot monitor active (no sleep)
- [ ] Environment variables set (Firebase, CORS)
- [ ] Logs streaming (no errors)

---

## Part 11: Cost Breakdown

### Free Tier (Current Setup)

| Resource | Plan | Cost | Limits |
|----------|------|------|--------|
| Backend | Free | $0 | 512 MB RAM, sleeps after 15 min |
| PostgreSQL | Free | $0 | 256 MB storage, 100 connections |
| UptimeRobot | Free | $0 | 50 monitors, 5 min interval |
| **Total** | | **$0/mo** | |

### Recommended Production Setup

| Resource | Plan | Cost | Benefits |
|----------|------|------|----------|
| Backend | Starter | $7 | No sleep, 2 GB RAM |
| PostgreSQL | Starter | $7 | Daily backups, 1 GB storage |
| **Total** | | **$14/mo** | Production-ready |

---

## Part 12: Security Best Practices

### ✅ Environment Variables

Never commit to git:
- ✅ `.env` in `.gitignore`
- ✅ Service account JSON in `.gitignore`
- ✅ Secrets stored in Render dashboard

### ✅ Database Security

- ✅ Use internal DB URL (not external) for backend
- ✅ Rotate DB password regularly
- ✅ Limit connections to Render IP ranges

### ✅ API Security

- ✅ Firebase ID token verification on every request
- ✅ CORS restricted to frontend domain
- ✅ Rate limiting (add `slowapi` middleware)
- ✅ HTTPS only (Render enforces)

### ✅ User Data

- ✅ Passwords hashed (Argon2 for legacy users)
- ✅ Firebase handles auth securely
- ✅ No PII in logs

---

## Part 13: Scaling Strategy

### Phase 1: MVP (Current — Free)
- Single dyno
- Free PostgreSQL
- UptimeRobot keepalive

### Phase 2: Launch ($14/mo)
- Starter backend (no sleep)
- Starter database (backups)
- Cloudinary for images

### Phase 3: Growth ($50+/mo)
- Standard backend (2 instances)
- Professional database (10 GB)
- Redis for caching
- CDN for static assets

### Phase 4: Enterprise
- Move to AWS/GCP
- Kubernetes cluster
- Multi-region deployment
- Dedicated ML inference servers

---

## Part 14: Useful Commands

### Check Service Status
```bash
curl https://medvision-ai-backend.onrender.com/health
```

### View Database Tables
```bash
# From Render Shell
python -c "from sqlalchemy import inspect; from backend.app.database import engine; print(inspect(engine).get_table_names())"
```

### Test Firebase Auth
```bash
# Get ID token from frontend, then:
curl -H "Authorization: Bearer <FIREBASE_ID_TOKEN>" \
  https://medvision-ai-backend.onrender.com/auth/me
```

### Restart Service
```bash
# Render Dashboard → service → "Manual Deploy" → "Clear cache & deploy"
```

---

## Part 15: Next Steps

1. **Custom Domain:** `api.yourdomain.com` → Render
2. **CI/CD:** Auto-deploy on `git push` (already enabled)
3. **Monitoring:** Set up Sentry for error tracking
4. **Analytics:** Add PostHog or Mixpanel
5. **CDN:** Cloudflare in front of Render
6. **Load Testing:** Artillery or k6
7. **Backups:** Automate daily database dumps to S3

---

## 🎉 You're Live!

Your backend is now deployed with:
- ✅ Docker containerized FastAPI backend
- ✅ PostgreSQL database with auto-provisioned tables
- ✅ Firebase authentication
- ✅ CORS configured for Vercel frontend
- ✅ Health checks and monitoring
- ✅ Auto-deploy on git push

**Production URLs:**
- Backend: `https://medvision-ai-backend.onrender.com`
- API Docs: `https://medvision-ai-backend.onrender.com/docs`
- Health: `https://medvision-ai-backend.onrender.com/health`

**Questions?** Check logs first, then troubleshooting section above.

---

<div align="center">

**Built with ❤️ for better healthcare**

[Report Issue](https://github.com/BharatChandra-sys/diabetic-ulcer-ai-system/issues) • [Request Feature](https://github.com/BharatChandra-sys/diabetic-ulcer-ai-system/pulls)

</div>
