# MedVision AI - Deployment Checklist

Use this checklist to track your deployment progress.

## 📋 Pre-Deployment Preparation

- [ ] Code pushed to GitHub
- [ ] All `.env` files excluded from Git
- [ ] `requirements.txt` is up to date
- [ ] Firebase project created
- [ ] Gmail App Password generated

---

## 🗄️ Database Setup (Neon PostgreSQL)

- [ ] Created Neon account at neon.tech
- [ ] Created new project: `medvision-ai-db`
- [ ] Noted down connection string
- [ ] Enabled connection pooling (optional but recommended)
- [ ] Connection string format verified: `postgresql://...?sslmode=require`

**Connection String:** (Save securely)
```
postgresql://[user]:[password]@[host]/[database]?sslmode=require
```

---

## 🚀 Backend Deployment (Render.com)

### Account & Service Setup
- [ ] Created Render account at render.com
- [ ] Connected GitHub account
- [ ] Created new Web Service
- [ ] Selected `diabetic-ulcer-ai-system` repository

### Service Configuration
- [ ] Name set to: `medvision-ai-backend`
- [ ] Root Directory: `backend`
- [ ] Runtime: `Python 3`
- [ ] Build Command: `pip install -r requirements.txt`
- [ ] Start Command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
- [ ] Instance Type: `Free`

### Environment Variables Set
- [ ] `DATABASE_URL` - Neon connection string
- [ ] `SECRET_KEY` - Generated random string (32+ chars)
- [ ] `JWT_SECRET_KEY` - Generated random string (32+ chars)
- [ ] `FIREBASE_PROJECT_ID` - From Firebase Console
- [ ] `FIREBASE_WEB_API_KEY` - From Firebase Console
- [ ] `FIREBASE_SERVICE_ACCOUNT_JSON` - Single-line JSON
- [ ] `SMTP_USERNAME` - Gmail address
- [ ] `SMTP_PASSWORD` - Gmail App Password
- [ ] `SMTP_FROM_EMAIL` - Gmail address
- [ ] `ENVIRONMENT` - Set to `production`
- [ ] `DEBUG` - Set to `False`
- [ ] `ALLOWED_ORIGINS` - Will add frontend URL later

### Deployment
- [ ] Clicked "Create Web Service"
- [ ] Deployment started successfully
- [ ] Build completed without errors
- [ ] Service is live and running

**Backend URL:** (Save this)
```
https://medvision-ai-backend.onrender.com
```

---

## ✅ Backend Verification

- [ ] Health check works: `[backend-url]/health` returns `{"status":"healthy"}`
- [ ] API docs load: `[backend-url]/docs` shows Swagger UI
- [ ] Database connected: Logs show "✓ Database connection verified"
- [ ] Can create account: `POST /api/auth/signup` works
- [ ] Can sign in: `POST /api/auth/signin` works
- [ ] Password reset email sent: `POST /api/auth/forgot-password` works

---

## 🤖 UptimeRobot Setup

- [ ] Created UptimeRobot account at uptimerobot.com
- [ ] Email verified
- [ ] Added new monitor:
  - [ ] Type: HTTP(s)
  - [ ] Name: MedVision AI Backend
  - [ ] URL: `[backend-url]/health`
  - [ ] Interval: 5 minutes
- [ ] Monitor shows "Up" status

---

## 🌐 Frontend Deployment (Vercel) - Coming Next

After backend is verified, deploy frontend:

### Preparation
- [ ] Backend URL confirmed and working
- [ ] Firebase web config ready
- [ ] Google OAuth Client ID ready

### Vercel Deployment
- [ ] Create Vercel account
- [ ] Import GitHub repository
- [ ] Configure build settings:
  - [ ] Framework: Vite
  - [ ] Root Directory: `frontend1`
  - [ ] Build Command: `npm run build`
  - [ ] Output Directory: `dist`

### Frontend Environment Variables
- [ ] `VITE_API_BASE_URL` - Backend URL from Render
- [ ] `VITE_FIREBASE_API_KEY`
- [ ] `VITE_FIREBASE_AUTH_DOMAIN`
- [ ] `VITE_FIREBASE_PROJECT_ID`
- [ ] `VITE_GOOGLE_CLIENT_ID`

### Post-Deployment
- [ ] Frontend URL obtained
- [ ] Added frontend URL to Render `ALLOWED_ORIGINS`
- [ ] Added frontend URL to Firebase Authorized Domains
- [ ] Added frontend URL to Google OAuth Authorized Origins

---

## 🧪 Final Integration Testing

- [ ] Frontend loads successfully
- [ ] Can sign up with email/password
- [ ] Can sign in with email/password
- [ ] Can reset password (receive email)
- [ ] Can upload image and get prediction
- [ ] Can view history
- [ ] Mobile responsive design works
- [ ] Google Sign-In works (after OAuth setup)

---

## 📝 Post-Deployment Tasks

- [ ] Update README.md with live URLs
- [ ] Document any production-specific configurations
- [ ] Set up monitoring/alerting
- [ ] Test from different devices
- [ ] Share with beta testers

---

## 🎯 Success Metrics

- ✅ Backend uptime: >99% (monitored by UptimeRobot)
- ✅ Response time: <2s for API calls
- ✅ Database queries: <500ms average
- ✅ Zero critical errors in logs
- ✅ Email delivery: 100% success rate

---

## 📞 Important URLs

| Service | URL | Purpose |
|---------|-----|---------|
| Backend API | `https://medvision-ai-backend.onrender.com` | Main API |
| API Docs | `https://medvision-ai-backend.onrender.com/docs` | Swagger UI |
| Health Check | `https://medvision-ai-backend.onrender.com/health` | Status |
| Frontend | `https://[your-app].vercel.app` | User interface |
| Database | Neon Dashboard | DB management |
| Monitoring | UptimeRobot Dashboard | Uptime tracking |

---

## 🔐 Security Checklist

- [ ] All secrets stored in environment variables
- [ ] No `.env` files committed to Git
- [ ] Firebase service account JSON secured
- [ ] Gmail App Password used (not main password)
- [ ] HTTPS enabled on all endpoints
- [ ] CORS properly configured
- [ ] Rate limiting enabled (if needed)

---

## 📊 Monitoring Setup

- [ ] UptimeRobot monitoring backend
- [ ] Email alerts configured
- [ ] Render logs reviewed regularly
- [ ] Neon database metrics monitored

---

**Status:** 🚧 IN PROGRESS

**Last Updated:** [Current Date]

**Deployed By:** [Your Name]
