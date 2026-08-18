# Quick Deploy Reference Card

## 🚀 Render.com Backend Configuration

### Basic Settings
```
Name: medvision-ai-backend
Root Directory: backend
Runtime: Python 3
Build Command: pip install -r requirements.txt
Start Command: uvicorn app.main:app --host 0.0.0.0 --port $PORT
Instance: Free
```

### Environment Variables (Copy-Paste Ready)

```bash
# === DATABASE ===
DATABASE_URL=postgresql://[PASTE_YOUR_NEON_CONNECTION_STRING_HERE]

# === APP SECURITY ===
SECRET_KEY=[GENERATE_32_CHAR_RANDOM_STRING]
JWT_SECRET_KEY=[GENERATE_32_CHAR_RANDOM_STRING]
ENVIRONMENT=production
DEBUG=False

# === FIREBASE ===
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_WEB_API_KEY=AIza...
FIREBASE_SERVICE_ACCOUNT_JSON={"type":"service_account","project_id":"...","private_key":"...","client_email":"..."}

# === EMAIL (GMAIL) ===
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=your-email@gmail.com
SMTP_PASSWORD=[16_CHAR_GMAIL_APP_PASSWORD]
SMTP_FROM_EMAIL=your-email@gmail.com
SMTP_FROM_NAME=MedVision AI

# === CORS (Add after frontend deployed) ===
ALLOWED_ORIGINS=https://your-frontend.vercel.app,http://localhost:3001
```

---

## 🔑 How to Get Each Value

### SECRET_KEY & JWT_SECRET_KEY
```powershell
# Run in PowerShell:
-join ((65..90) + (97..122) + (48..57) | Get-Random -Count 32 | % {[char]$_})
```

### FIREBASE_SERVICE_ACCOUNT_JSON
1. Firebase Console → Project Settings → Service Accounts
2. Click "Generate new private key"
3. Download JSON file
4. **Convert to single line** (remove all newlines):
   ```python
   import json
   with open('firebase-service-account.json') as f:
       print(json.dumps(json.load(f), separators=(',', ':')))
   ```
5. Copy the output (one long line)

### GMAIL APP PASSWORD
1. [myaccount.google.com/security](https://myaccount.google.com/security)
2. Enable "2-Step Verification"
3. Search "App passwords"
4. App: Mail, Device: Other → "MedVision AI"
5. Copy 16-char password (remove spaces)

### NEON DATABASE_URL
1. [neon.tech](https://neon.tech) → Create project
2. Copy connection string
3. **Must end with**: `?sslmode=require`

---

## ✅ Quick Test Endpoints

After deployment, test these:

```bash
# Health check
https://medvision-ai-backend.onrender.com/health

# API documentation
https://medvision-ai-backend.onrender.com/docs

# Test signup (in /docs)
POST /api/auth/signup
{
  "email": "test@example.com",
  "password": "test123",
  "displayName": "Test User"
}

# Test signin (in /docs)
POST /api/auth/signin
{
  "email": "test@example.com",
  "password": "test123"
}
```

---

## 🤖 UptimeRobot Setup

```
Monitor Type: HTTP(s)
Name: MedVision AI Backend
URL: https://medvision-ai-backend.onrender.com/health
Interval: 5 minutes
```

---

## 🚨 Common Issues & Fixes

| Issue | Solution |
|-------|----------|
| "Connection refused" | Check `DATABASE_URL` has `?sslmode=require` |
| "Firebase not initialized" | Verify `FIREBASE_SERVICE_ACCOUNT_JSON` is single line |
| "SMTP auth failed" | Check Gmail App Password (16 chars, no spaces) |
| "Module not found" | Check `requirements.txt`, trigger manual deploy |
| Build fails | Check Render logs, verify Python 3.11+ compatible |

---

## 📦 Vercel Frontend (Next Step)

### Settings
```
Framework: Vite
Root Directory: frontend1
Build Command: npm run build
Output Directory: dist
```

### Environment Variables
```bash
VITE_API_BASE_URL=https://medvision-ai-backend.onrender.com
VITE_FIREBASE_API_KEY=[from Firebase Console]
VITE_FIREBASE_AUTH_DOMAIN=[project-id].firebaseapp.com
VITE_FIREBASE_PROJECT_ID=[your-project-id]
VITE_GOOGLE_CLIENT_ID=[from Google Cloud Console]
```

---

## 🎯 Deployment Order

1. ✅ Setup Neon Database
2. ✅ Deploy Backend to Render
3. ✅ Setup UptimeRobot
4. ✅ Verify Backend Working
5. ⏳ Deploy Frontend to Vercel
6. ⏳ Update ALLOWED_ORIGINS in Render
7. ⏳ Test End-to-End

---

## 📞 Quick Links

- [Render Dashboard](https://dashboard.render.com/)
- [Neon Dashboard](https://console.neon.tech/)
- [Firebase Console](https://console.firebase.google.com/)
- [Google Cloud Console](https://console.cloud.google.com/)
- [UptimeRobot Dashboard](https://uptimerobot.com/dashboard)
- [Vercel Dashboard](https://vercel.com/dashboard)

---

**Save this file for quick reference during deployment!**
