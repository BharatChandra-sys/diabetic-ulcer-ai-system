# 🚀 Deployment Checklist

Quick reference for deploying MedVision AI to production.

---

## Pre-Deployment

### Firebase Setup
- [ ] Create Firebase project at [console.firebase.google.com](https://console.firebase.google.com)
- [ ] Enable Authentication → Email/Password + Google Sign-in
- [ ] Download service account JSON (Project Settings → Service Accounts)
- [ ] Convert JSON to single line: `python -c "import json; print(json.dumps(json.load(open('key.json'))))"`
- [ ] Note down Firebase Project ID

### Code Preparation
- [ ] All changes committed to git
- [ ] `.env` and `firebase-service-account.json` in `.gitignore`
- [ ] `frontend/.env` in `.gitignore`
- [ ] Backend builds locally: `docker build -t test .`
- [ ] Frontend builds: `cd frontend && npm run build`

---

## Backend Deployment (Render)

### 1. Initial Setup
- [ ] Create Render account at [dashboard.render.com](https://dashboard.render.com)
- [ ] Push code to GitHub: `git push origin main`
- [ ] Render Dashboard → **New +** → **Blueprint**
- [ ] Connect GitHub repo
- [ ] Click **Apply** (provisions database + backend)

### 2. Environment Variables
Go to backend service → **Environment** → Add these:

**Required:**
- [ ] `FIREBASE_PROJECT_ID` = `your-project-id`
- [ ] `FIREBASE_SERVICE_ACCOUNT_JSON` = `{"type":"service_account",...}`
- [ ] `FRONTEND_URL` = `https://your-app.vercel.app`
- [ ] `ALLOWED_ORIGINS` = `https://your-app.vercel.app,http://localhost:5173`

**Auto-generated (leave as-is):**
- [ ] `DATABASE_URL` (linked from PostgreSQL)
- [ ] `SECRET_KEY` (Render generates)

**Optional:**
- [ ] `CLOUDINARY_CLOUD_NAME`
- [ ] `CLOUDINARY_API_KEY`
- [ ] `CLOUDINARY_API_SECRET`

### 3. Wait for Build
- [ ] Build completes (8–12 min)
- [ ] Health check passes
- [ ] Note backend URL: `https://medvision-ai-backend.onrender.com`

---

## Frontend Deployment (Vercel)

### 1. Deploy
```bash
cd frontend
npm install -g vercel
vercel login
vercel --prod
```

### 2. Environment Variables
Add in Vercel dashboard → Project Settings → Environment Variables:

- [ ] `VITE_API_BASE_URL` = `https://medvision-ai-backend.onrender.com`
- [ ] `VITE_FIREBASE_API_KEY` = (from Firebase console)
- [ ] `VITE_FIREBASE_AUTH_DOMAIN` = `your-project.firebaseapp.com`
- [ ] `VITE_FIREBASE_PROJECT_ID` = `your-project-id`
- [ ] `VITE_FIREBASE_STORAGE_BUCKET` = `your-project.appspot.com`
- [ ] `VITE_FIREBASE_MESSAGING_SENDER_ID` = (from Firebase)
- [ ] `VITE_FIREBASE_APP_ID` = (from Firebase)

### 3. Redeploy
- [ ] Redeploy after adding env vars
- [ ] Note frontend URL: `https://your-app.vercel.app`

---

## Database Setup

### Auto-Provisioned
- [ ] PostgreSQL created by `render.yaml`
- [ ] Tables auto-created on first startup
- [ ] Check logs for: `INFO: Database tables created successfully`

### Verify
- [ ] Render → `medvision-db` → **Info** tab
- [ ] Note connection details (for backup/migration)

---

## Post-Deployment Verification

### Backend Health
- [ ] `/health` → `{"status":"healthy"}`
- [ ] `/docs` → Swagger UI loads
- [ ] `/health/status` → Shows CPU/RAM metrics
- [ ] Logs show no errors

### Frontend → Backend Connection
- [ ] Open frontend in browser
- [ ] No CORS errors in console
- [ ] Login page loads
- [ ] Can register new user (Firebase)
- [ ] Dashboard loads after login

### Database
- [ ] Check backend logs: `INFO: User auto-provisioned`
- [ ] Render shell: `python -c "from backend.app.database import engine; from sqlalchemy import inspect; print(inspect(engine).get_table_names())"`
- [ ] Should show: `['users', 'patients', 'scans', 'reports']`

### End-to-End Test
- [ ] Sign up with new account
- [ ] Upload test image
- [ ] Fill health metrics
- [ ] Click "Analyze"
- [ ] Results page shows prediction + heatmap
- [ ] Check history page for scan record

---

## Monitoring Setup

### UptimeRobot (Prevent Sleep)
- [ ] Create account at [uptimerobot.com](https://uptimerobot.com)
- [ ] Add monitor: `https://medvision-ai-backend.onrender.com/health/ping`
- [ ] Interval: 5 minutes
- [ ] Alert: Email on downtime

### Optional: Error Tracking
- [ ] Set up Sentry (sentry.io)
- [ ] Add DSN to backend env vars
- [ ] Install `sentry-sdk` in requirements.txt

---

## Security Checklist

### Secrets
- [ ] `.env` NOT in git
- [ ] `firebase-service-account.json` NOT in git
- [ ] `frontend/.env` NOT in git
- [ ] All secrets in Render/Vercel dashboards only

### CORS
- [ ] `ALLOWED_ORIGINS` only includes production frontend
- [ ] Test from unknown domain → Should block

### Firebase
- [ ] Only authorized domains in Firebase console
- [ ] API key restrictions enabled (optional)
- [ ] Service account JSON stored securely

### Database
- [ ] Using internal DB URL (not external)
- [ ] No DB credentials in code
- [ ] Connection pooling enabled

---

## Optional Upgrades

### Performance
- [ ] Upgrade Render backend to Starter ($7/mo) → No sleep
- [ ] Upgrade database to Starter ($7/mo) → Backups
- [ ] Enable Redis caching (Render Redis addon)

### Custom Domain
- [ ] Register domain (Namecheap, Cloudflare)
- [ ] Backend: `api.yourdomain.com` → CNAME to Render
- [ ] Frontend: `yourdomain.com` → Vercel custom domain
- [ ] Update CORS origins

### SSL/HTTPS
- [ ] Render auto-provisions SSL (Let's Encrypt)
- [ ] Vercel auto-provisions SSL
- [ ] Test HTTPS redirects

---

## Troubleshooting

### Build Failed
- [ ] Check logs for specific error
- [ ] Common: PyTorch timeout → Reduce version or increase timeout
- [ ] Docker build locally first

### Health Check Failing
- [ ] Increase `healthCheckTimeout` in render.yaml
- [ ] Check if PORT is correctly used: `uvicorn ... --port $PORT`
- [ ] Verify `/health` endpoint works locally

### CORS Errors
- [ ] Verify `ALLOWED_ORIGINS` includes frontend URL
- [ ] Check for typos (trailing slash, http vs https)
- [ ] Redeploy after changing env vars

### Firebase Auth Failed
- [ ] Check `FIREBASE_PROJECT_ID` matches console
- [ ] Verify service account JSON is valid (single line, no newlines)
- [ ] Test token locally: `firebase-admin` verify ID token

### Database Connection Failed
- [ ] Check `DATABASE_URL` is set (should be auto-linked)
- [ ] Verify database is running (Render dashboard)
- [ ] Check connection pooling settings

### Cold Start Slow
- [ ] Expected on free tier (15 min sleep)
- [ ] Add UptimeRobot monitor
- [ ] Or upgrade to paid plan

---

## Cost Summary

### Free Tier (Total: $0/mo)
- Render Backend: Free (sleeps after 15 min)
- Render PostgreSQL: Free (256 MB, 90 day limit)
- Vercel Frontend: Free (100 GB bandwidth)
- UptimeRobot: Free (50 monitors)
- Firebase Auth: Free (10k MAU)

### Production Ready (Total: $14/mo)
- Render Backend: Starter $7 (no sleep, 2 GB RAM)
- Render PostgreSQL: Starter $7 (backups, 1 GB)
- Vercel Frontend: Free
- Firebase Auth: Free

---

## Next Steps After Deployment

1. **Test Thoroughly**
   - [ ] Test all user flows (signup, login, scan, history)
   - [ ] Test from mobile device
   - [ ] Test image upload with large files

2. **Set Up Monitoring**
   - [ ] UptimeRobot for uptime
   - [ ] Sentry for error tracking (optional)
   - [ ] Google Analytics (optional)

3. **Performance Testing**
   - [ ] Load test with Artillery/k6
   - [ ] Check response times
   - [ ] Monitor RAM/CPU usage

4. **Backups**
   - [ ] Upgrade database to paid plan (auto backups)
   - [ ] Or set up manual backup script to S3

5. **Documentation**
   - [ ] Update README with production URLs
   - [ ] Document API changes
   - [ ] Create user guide

6. **Marketing**
   - [ ] Create demo video
   - [ ] Write blog post
   - [ ] Share on social media

---

## Emergency Contacts

- **Render Support:** https://render.com/docs/support
- **Vercel Support:** https://vercel.com/support
- **Firebase Support:** https://firebase.google.com/support

---

## Useful Commands

### View Logs
```bash
# Render logs (real-time)
# Dashboard → service → Logs tab

# Or via CLI
render logs -s medvision-ai-backend --tail
```

### Restart Service
```bash
# Render dashboard → Manual Deploy → Clear cache & deploy
```

### Database Backup
```bash
pg_dump $DATABASE_URL > backup_$(date +%Y%m%d).sql
```

### Test Health Endpoint
```bash
curl https://medvision-ai-backend.onrender.com/health
```

### Check Environment Variables
```bash
# Render Shell
env | grep FIREBASE
```

---

<div align="center">

✅ **Deployment Complete!**

Your MedVision AI system is now live in production.

[View Logs](https://dashboard.render.com) • [Monitor Uptime](https://uptimerobot.com) • [Check Health](https://medvision-ai-backend.onrender.com/health)

</div>
