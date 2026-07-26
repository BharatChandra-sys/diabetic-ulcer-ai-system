# 🚀 Fly.io Deployment Guide

**Complete manual setup for MedVision AI on Fly.io**

---

## 💰 Cost: FREE (with limits)

- **$5/month free credits** (enough for this app!)
- **Free PostgreSQL** (1 GB storage, shared CPU)
- ⚠️ **Requires credit card** (for verification, won't be charged if under $5)

---

## Part 1: Install Fly CLI

### Windows (PowerShell):
```powershell
powershell -Command "iwr https://fly.io/install.ps1 -useb | iex"
```

### Mac:
```bash
brew install flyctl
```

### Linux:
```bash
curl -L https://fly.io/install.sh | sh
```

### Verify Installation:
```bash
flyctl version
```

---

## Part 2: Sign Up & Login

### 1. Create Account
```bash
flyctl auth signup
```
- Opens browser
- Sign up with GitHub/Google/Email
- ⚠️ **Add credit card** (required, but won't charge on free tier)

### 2. Login
```bash
flyctl auth login
```

---

## Part 3: Create PostgreSQL Database

### 1. Create Database
```bash
flyctl postgres create
```

**Answer the prompts:**
```
? Choose an app name: medvision-db
? Select Organization: Personal
? Choose a region: San Jose, California (US) (sjc)
? Select configuration: Development - Single node, 1x shared CPU, 256MB RAM, 1GB disk
```

### 2. Note the Connection Details
After creation, you'll see:
```
Postgres cluster medvision-db created
  Username:    postgres
  Password:    <RANDOM_PASSWORD>
  Hostname:    medvision-db.internal
  Flycast:     fdaa:x:xxxx:x:x:x:x:x
  Proxy port:  5432
  Postgres port: 5433
  Connection string: postgres://postgres:<PASSWORD>@medvision-db.internal:5432
```

**SAVE THIS PASSWORD!** You'll need it later.

---

## Part 4: Deploy Backend

### 1. Initialize Fly App
```bash
cd c:\Users\bc833\Downloads\diabetic-ulcer-ai-system
flyctl launch --no-deploy
```

**Answer the prompts:**
```
? Choose an app name: medvision-ai-backend
? Select Organization: Personal  
? Choose a region: San Jose, California (US) (sjc)
? Would you like to set up a Postgresql database? No (we already created one)
? Would you like to set up an Upstash Redis database? No
```

This creates `fly.toml` (already exists in your project).

### 2. Attach PostgreSQL to App
```bash
flyctl postgres attach medvision-db --app medvision-ai-backend
```

This automatically sets `DATABASE_URL` environment variable! ✅

### 3. Set Environment Variables

**Firebase Project ID:**
```bash
flyctl secrets set FIREBASE_PROJECT_ID="dfuai-1f1af" --app medvision-ai-backend
```

**Firebase Service Account JSON:**
Open `FIREBASE_RENDER_CONFIG.txt` and copy the single-line JSON, then:
```bash
flyctl secrets set 'FIREBASE_SERVICE_ACCOUNT_JSON={"type":"service_account","project_id":"dfuai-1f1af",...}' --app medvision-ai-backend
```

**Frontend URL (after Vercel deploy):**
```bash
flyctl secrets set FRONTEND_URL="https://your-app.vercel.app" --app medvision-ai-backend
```

**CORS Origins:**
```bash
flyctl secrets set ALLOWED_ORIGINS="https://your-app.vercel.app,http://localhost:5173" --app medvision-ai-backend
```

**Secret Key:**
```bash
flyctl secrets set SECRET_KEY="$(openssl rand -base64 32)" --app medvision-ai-backend
```

*On Windows without openssl, use this instead:*
```powershell
flyctl secrets set SECRET_KEY="your-random-32-char-string-here" --app medvision-ai-backend
```

### 4. Deploy!
```bash
flyctl deploy --app medvision-ai-backend
```

This will:
- Build Docker image (8-12 minutes)
- Push to Fly.io registry
- Create VM and deploy
- Run database migrations automatically
- Start serving requests

### 5. Check Status
```bash
flyctl status --app medvision-ai-backend
```

### 6. View Logs
```bash
flyctl logs --app medvision-ai-backend
```

Look for:
```
INFO: Database tables ready
INFO: Running database migrations...
INFO: ✓ firebase_uid column added
INFO: Database migrations completed successfully
INFO: MedVision AI ready to serve requests
```

### 7. Open in Browser
```bash
flyctl open --app medvision-ai-backend
```

Or manually visit:
```
https://medvision-ai-backend.fly.dev
```

---

## Part 5: Verify Deployment

### 1. Health Check
```bash
curl https://medvision-ai-backend.fly.dev/health
```

Expected response:
```json
{
  "status": "healthy",
  "database": "connected",
  "environment": "production",
  "migrations": {
    "tables_exist": {
      "users": true,
      "patients": true
    },
    "migrations_applied": {
      "firebase_uid": true
    }
  }
}
```

### 2. API Documentation
Visit: `https://medvision-ai-backend.fly.dev/docs`

### 3. Test Firebase Auth
From your frontend:
1. Sign up with a new account
2. Check Fly logs: `flyctl logs --app medvision-ai-backend`
3. Should see: `"Firebase user authenticated: uid=..."`

---

## Part 6: Update Frontend

### Update frontend/.env:
```env
VITE_API_BASE_URL=https://medvision-ai-backend.fly.dev
VITE_FIREBASE_API_KEY=<from Firebase console>
VITE_FIREBASE_AUTH_DOMAIN=dfuai-1f1af.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=dfuai-1f1af
VITE_FIREBASE_STORAGE_BUCKET=dfuai-1f1af.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=<from Firebase console>
VITE_FIREBASE_APP_ID=<from Firebase console>
```

### Deploy Frontend to Vercel:
```bash
cd frontend
vercel --prod
```

### Update CORS in Backend:
After getting your Vercel URL, update:
```bash
flyctl secrets set FRONTEND_URL="https://your-app.vercel.app" --app medvision-ai-backend
flyctl secrets set ALLOWED_ORIGINS="https://your-app.vercel.app,http://localhost:5173" --app medvision-ai-backend
```

---

## Part 7: Useful Commands

### View Environment Variables
```bash
flyctl secrets list --app medvision-ai-backend
```

### Update Environment Variable
```bash
flyctl secrets set KEY="value" --app medvision-ai-backend
```

### SSH into VM
```bash
flyctl ssh console --app medvision-ai-backend
```

### View Logs (Real-time)
```bash
flyctl logs --app medvision-ai-backend --follow
```

### Restart App
```bash
flyctl apps restart medvision-ai-backend
```

### Check Database
```bash
flyctl postgres connect --app medvision-db
```
Then run SQL:
```sql
\dt  -- list tables
SELECT * FROM users;
```

### Scale Resources (if needed)
```bash
flyctl scale memory 1024 --app medvision-ai-backend  # Upgrade to 1GB RAM
flyctl scale count 2 --app medvision-ai-backend      # Run 2 instances
```

### Delete Everything (Start Over)
```bash
flyctl apps destroy medvision-ai-backend
flyctl apps destroy medvision-db
```

---

## Part 8: Monitoring

### 1. Fly.io Dashboard
Visit: https://fly.io/dashboard

Shows:
- App status
- Resource usage
- Billing (should stay under $5!)
- Logs
- Metrics

### 2. Check Current Usage
```bash
flyctl billing show
```

### 3. Set Up Alerts (Optional)
In dashboard → Settings → Alerts:
- Alert when usage > $4
- Alert when app goes down

---

## Part 9: Troubleshooting

### ❌ Build Failed: "requirements.txt not found"
**Fix:** Ensure you're in project root with `backend/` folder

### ❌ Health Check Failing
**Fix:**
```bash
# Check logs
flyctl logs --app medvision-ai-backend

# Increase grace period in fly.toml
grace_period = "120s"  # Change from 60s

# Redeploy
flyctl deploy
```

### ❌ Database Connection Failed
**Fix:**
```bash
# Check if DATABASE_URL is set
flyctl secrets list --app medvision-ai-backend

# Re-attach database
flyctl postgres attach medvision-db --app medvision-ai-backend
```

### ❌ Firebase Auth Not Working
**Fix:**
```bash
# Verify Firebase secrets
flyctl secrets list --app medvision-ai-backend

# Re-set if missing
flyctl secrets set FIREBASE_PROJECT_ID="dfuai-1f1af" --app medvision-ai-backend
flyctl secrets set 'FIREBASE_SERVICE_ACCOUNT_JSON={...}' --app medvision-ai-backend
```

### ❌ CORS Errors
**Fix:**
```bash
flyctl secrets set ALLOWED_ORIGINS="https://your-app.vercel.app,http://localhost:5173" --app medvision-ai-backend
```

### ❌ Out of Memory
**Fix:** Upgrade to 1GB RAM:
```bash
flyctl scale memory 1024 --app medvision-ai-backend
```
(Note: This may exceed free tier)

---

## Part 10: Cost Optimization

### Free Tier Limits ($5/month):
- 1 VM with 256 MB RAM, shared CPU
- 1 PostgreSQL database (1 GB storage)
- 3 GB outbound data transfer
- 160 GB inbound data transfer

### Stay Under $5:
✅ Use shared CPU (default)  
✅ Use 256-512 MB RAM  
✅ Single instance (no scaling)  
✅ Small database (<1 GB)  
✅ Moderate traffic (<100k requests/month)  

### If You Exceed $5:
- Card will be charged for overage
- Check usage: `flyctl billing show`
- Scale down or pause app

---

## Part 11: Continuous Deployment

### Option A: GitHub Actions (Recommended)

Create `.github/workflows/deploy.yml`:
```yaml
name: Deploy to Fly.io

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: superfly/flyctl-actions/setup-flyctl@master
      - run: flyctl deploy --remote-only
        env:
          FLY_API_TOKEN: ${{ secrets.FLY_API_TOKEN }}
```

Get API token:
```bash
flyctl auth token
```

Add to GitHub Secrets:
- Repository → Settings → Secrets → Actions
- New secret: `FLY_API_TOKEN` = (paste token)

Now every push to `main` auto-deploys! ✅

### Option B: Manual Deploy
```bash
git push origin main
flyctl deploy --app medvision-ai-backend
```

---

## Part 12: Backup & Recovery

### Backup Database
```bash
flyctl postgres backup create --app medvision-db
```

### List Backups
```bash
flyctl postgres backup list --app medvision-db
```

### Restore from Backup
```bash
flyctl postgres backup restore <backup-id> --app medvision-db
```

### Export Database
```bash
flyctl postgres connect --app medvision-db
pg_dump medvision > backup.sql
```

---

## Summary Checklist

- [ ] Install Fly CLI
- [ ] Sign up & add credit card
- [ ] Create PostgreSQL database
- [ ] Initialize Fly app
- [ ] Attach database
- [ ] Set Firebase environment variables
- [ ] Deploy backend
- [ ] Verify health endpoint
- [ ] Deploy frontend to Vercel
- [ ] Update CORS settings
- [ ] Test end-to-end

---

## 🎉 You're Live!

**Your URLs:**
- Backend: `https://medvision-ai-backend.fly.dev`
- API Docs: `https://medvision-ai-backend.fly.dev/docs`
- Health: `https://medvision-ai-backend.fly.dev/health`

**Free tier usage:**
- Check: `flyctl billing show`
- Should stay under $5/month for this app

**Need help?**
- Fly.io Docs: https://fly.io/docs
- Community: https://community.fly.io
- Support: https://fly.io/support

---

<div align="center">

**Built with ❤️ for better healthcare**

[Report Issue](https://github.com/BharatChandra-sys/diabetic-ulcer-ai-system/issues)

</div>
