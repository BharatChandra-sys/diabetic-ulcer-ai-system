# 🔐 Render Backend Environment Variables

Copy-paste reference for Render Dashboard → Backend Service → Environment tab.

---

## ✅ REQUIRED Variables

### 1. Firebase Authentication

| Variable | Value | How to Get |
|----------|-------|-----------|
| `FIREBASE_PROJECT_ID` | `your-firebase-project-id` | Firebase Console → Project Settings → Project ID |
| `FIREBASE_SERVICE_ACCOUNT_JSON` | `{"type":"service_account","project_id":"...",...}` | Download JSON from Firebase Console → convert to single line (see below) |

**Get Firebase Service Account JSON:**
```bash
# 1. Firebase Console → Project Settings → Service Accounts
# 2. Click "Generate New Private Key" → Save JSON file
# 3. Convert to single line:
python -c "import json; print(json.dumps(json.load(open('firebase-key.json'))))"
# 4. Copy output and paste as value
```

---

### 2. Frontend URL (CORS)

| Variable | Value | Notes |
|----------|-------|-------|
| `FRONTEND_URL` | `https://your-app.vercel.app` | Your Vercel deployment URL |
| `ALLOWED_ORIGINS` | `https://your-app.vercel.app,http://localhost:5173` | Add your frontend URL + localhost for testing |

---

### 3. Application Settings

| Variable | Value | Notes |
|----------|-------|-------|
| `ENVIRONMENT` | `production` | Already set in render.yaml |
| `DEBUG` | `False` | Already set in render.yaml |

---

### 4. Security Keys

| Variable | Value | Notes |
|----------|-------|-------|
| `SECRET_KEY` | (auto-generated) | Render generates this automatically ✅ |
| `JWT_ALGORITHM` | `HS256` | Already set in render.yaml |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | `30` | Already set in render.yaml |

---

### 5. Database

| Variable | Value | Notes |
|----------|-------|-------|
| `DATABASE_URL` | (auto-linked) | Render auto-links from PostgreSQL ✅ |

---

## 🔧 OPTIONAL Variables

### Cloudinary (Image Storage)

Only add if using Cloudinary instead of local storage:

| Variable | Value | How to Get |
|----------|-------|-----------|
| `CLOUDINARY_CLOUD_NAME` | `your-cloud-name` | Cloudinary Dashboard |
| `CLOUDINARY_API_KEY` | `123456789012345` | Cloudinary Dashboard → Settings |
| `CLOUDINARY_API_SECRET` | `abc123xyz456` | Cloudinary Dashboard → Settings |

---

### ML Model Paths

These are **already set** in render.yaml with default values:

| Variable | Default Value |
|----------|---------------|
| `CNN_MODEL_PATH` | `backend/models/best_dfu_model.pth` |
| `SEGMENTATION_MODEL_PATH` | `backend/models/segmentation_model.pth` |
| `MULTIMODAL_MODEL_PATH` | `backend/models/multimodal_model.pth` |

---

## 📋 Step-by-Step: Adding Variables in Render

1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click on your backend service: **`medvision-ai-backend`**
3. Go to **"Environment"** tab (left sidebar)
4. Scroll to **"Environment Variables"** section
5. For each variable above:
   - Find the key name (e.g., `FIREBASE_PROJECT_ID`)
   - Click **"Edit"** (pencil icon)
   - Paste your value
   - Click **"Save"**
6. Click **"Save Changes"** at bottom
7. Render will **auto-redeploy** (takes ~8-12 min)

---

## 🎯 Quick Copy-Paste Template

Replace `YOUR_*` values with your actual credentials:

```env
# ── Firebase (REQUIRED) ──────────────────────────────────────
FIREBASE_PROJECT_ID=YOUR_FIREBASE_PROJECT_ID
FIREBASE_SERVICE_ACCOUNT_JSON={"type":"service_account","project_id":"YOUR_PROJECT_ID","private_key_id":"...","private_key":"-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n","client_email":"...","client_id":"...","auth_uri":"https://accounts.google.com/o/oauth2/auth","token_uri":"https://oauth2.googleapis.com/token","auth_provider_x509_cert_url":"https://www.googleapis.com/oauth2/v1/certs","client_x509_cert_url":"..."}

# ── Frontend URL (REQUIRED) ──────────────────────────────────
FRONTEND_URL=https://YOUR_APP.vercel.app
ALLOWED_ORIGINS=https://YOUR_APP.vercel.app,http://localhost:5173

# ── Cloudinary (OPTIONAL) ────────────────────────────────────
CLOUDINARY_CLOUD_NAME=YOUR_CLOUD_NAME
CLOUDINARY_API_KEY=YOUR_API_KEY
CLOUDINARY_API_SECRET=YOUR_API_SECRET
```

---

## ⚠️ Common Mistakes

### ❌ Firebase JSON with newlines
```json
{
  "type": "service_account",
  "project_id": "..."
}
```
**Fix:** Must be single line (remove all `\n` and spaces between keys)

### ❌ Wrong PROJECT_ID
Using Firebase API key instead of Project ID
**Fix:** Get from Firebase Console → Project Settings → **Project ID** (not API key)

### ❌ Missing frontend URL
Leaving `FRONTEND_URL` as `https://your-app.vercel.app`
**Fix:** Replace with your actual Vercel URL

### ❌ Trailing slash in ALLOWED_ORIGINS
`https://your-app.vercel.app/` (with slash)
**Fix:** Remove trailing slash: `https://your-app.vercel.app`

### ❌ Forgetting to save changes
Editing vars but not clicking "Save Changes" at bottom
**Fix:** Always click **"Save Changes"** to trigger redeploy

---

## 🧪 Testing After Setup

### 1. Check Health
```bash
curl https://YOUR_BACKEND.onrender.com/health
```
Expected:
```json
{
  "status": "healthy",
  "environment": "production",
  "database": "connected"
}
```

### 2. Check Environment Variables (Render Shell)
```bash
# Go to backend service → Shell tab
echo $FIREBASE_PROJECT_ID
echo $FRONTEND_URL
echo $DATABASE_URL
```

### 3. Test Firebase Auth
From your frontend:
1. Sign up with new account
2. Check backend logs for:
```
INFO: Firebase user authenticated: uid=abc123
INFO: User auto-provisioned in database
```

---

## 🔄 Updating Variables Later

If you need to change variables:

1. Render Dashboard → Backend Service → **Environment**
2. Click **"Edit"** on the variable
3. Update value
4. Click **"Save Changes"**
5. Wait for auto-redeploy (~5-10 min)

**No need to rebuild from scratch!**

---

## 📱 Mobile Quick Reference

**Bare minimum to get started:**
1. `FIREBASE_PROJECT_ID` = from Firebase Console
2. `FIREBASE_SERVICE_ACCOUNT_JSON` = download JSON, convert to single line
3. `FRONTEND_URL` = your Vercel URL
4. `ALLOWED_ORIGINS` = your Vercel URL + localhost

**Everything else is auto-configured by render.yaml! ✅**

---

<div align="center">

Need help? Check [RENDER_DEPLOY.md](RENDER_DEPLOY.md) for full deployment guide.

</div>
