# 🚀 Quick Deployment Steps - Do This Now!

## PART 1: Hugging Face ML Service (10 minutes)

You've already created the space at: `https://huggingface.co/spaces/Bharat2004/medvisionai`

### Step 1: Clone Your Space Locally

Open terminal and run:

```bash
cd c:\Users\bc833\Downloads\diabetic-ulcer-ai-system

# Clone your Hugging Face space
git clone https://huggingface.co/spaces/Bharat2004/medvisionai huggingface-space

cd huggingface-space
```

When prompted for password, use your Hugging Face access token:
- Get token from: https://huggingface.co/settings/tokens
- Click "New token" → Give it write permissions → Copy token
- Paste token as password

### Step 2: Copy ML Service Files

```bash
# Copy the ML service files
copy ..\huggingface-ml-service\app.py .
copy ..\huggingface-ml-service\requirements.txt .

# Copy model weights (if you have them)
copy ..\backend\models\best_dfu_model.pth .
```

### Step 3: Create Dockerfile

Create a new file `Dockerfile` with this content:

```dockerfile
FROM python:3.11-slim

WORKDIR /app

# Install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy app and model
COPY app.py .
COPY best_dfu_model.pth .

# Hugging Face Spaces port
EXPOSE 7860
ENV PORT=7860

# Run
CMD ["python", "app.py"]
```

### Step 4: Create README.md for Hugging Face

Create `README.md`:

```markdown
---
title: MedVision AI ML Service
emoji: 🏥
colorFrom: blue
colorTo: green
sdk: docker
pinned: false
license: mit
---

# MedVision AI - ML Inference Service

This is the ML inference service for diabetic foot ulcer detection.

## API Endpoints

- `GET /health` - Health check
- `GET /` - Service info
- `POST /predict` - Basic prediction
- `POST /predict-with-clinical` - Prediction with clinical data

## Usage

```python
import requests

url = "https://bharat2004-medvisionai.hf.space/predict"
files = {"image": open("foot.jpg", "rb")}
response = requests.post(url, files=files)
print(response.json())
```
```

### Step 5: Push to Hugging Face

```bash
git add .
git commit -m "Add ML inference service"
git push
```

Enter your Hugging Face token when prompted for password.

### Step 6: Wait for Build

1. Go to https://huggingface.co/spaces/Bharat2004/medvisionai
2. Watch the "Build" logs
3. Wait ~5-10 minutes for Docker build to complete
4. Status will change to "Running"

### Step 7: Test Your ML Service

Once running, test it:

```bash
# Test health endpoint
curl https://bharat2004-medvisionai.hf.space/health
```

Expected response:
```json
{"status": "healthy", "model_loaded": true}
```

✅ **Your ML service URL is**: `https://bharat2004-medvisionai.hf.space`

---

## PART 2: Update Render Backend (5 minutes)

### Step 1: Update requirements.txt for Render

Replace `backend/requirements.txt` with the lightweight version:

```bash
cd c:\Users\bc833\Downloads\diabetic-ulcer-ai-system

# Backup current requirements
copy backend\requirements.txt backend\requirements-full-backup.txt

# Use lightweight version (no ML libraries)
copy backend\requirements-render.txt backend\requirements.txt
```

### Step 2: Commit Changes to Git

```bash
git add backend/requirements.txt
git add backend/app/routes/analyze.py
git add backend/app/services/remote_ml_service.py
git commit -m "Switch to remote ML inference via Hugging Face"
git push origin main
```

### Step 3: Update Render Environment Variables

1. Go to https://dashboard.render.com
2. Select your backend service: `diabetic-ulcer-ai-system`
3. Click "Environment" tab
4. Add new environment variable:
   - **Key**: `HUGGINGFACE_ML_URL`
   - **Value**: `https://bharat2004-medvisionai.hf.space`
5. Click "Save Changes"

Render will automatically redeploy with the new configuration.

### Step 4: Wait for Render Deploy

1. Watch the deploy logs in Render dashboard
2. Look for these lines:
   ```
   ✓ Using REMOTE ML inference (Hugging Face)
   ✓ Remote ML service configured: https://bharat2004-medvisionai.hf.space
   ✓ MedVision AI ready to serve requests
   ```
3. Wait for "Live" status

---

## PART 3: Test End-to-End (2 minutes)

### Test 1: Check Render Backend Logs

In Render logs, you should see:
```
✓ Using REMOTE ML inference (Hugging Face)
✓ Remote ML service configured: https://bharat2004-medvisionai.hf.space
```

### Test 2: Upload an Image in Frontend

1. Open your frontend URL
2. Log in
3. Upload a foot image
4. Click "Analyze"

**IMPORTANT**: First request may take 30-60 seconds because:
- Hugging Face Space might be sleeping (free tier)
- It needs to wake up and load PyTorch model

Subsequent requests will be much faster!

### Test 3: Check Both Service Logs

**Hugging Face Logs**:
- Go to https://huggingface.co/spaces/Bharat2004/medvisionai
- Click "Logs" tab
- Should see: `POST /predict-with-clinical` requests

**Render Logs**:
- Should see: `Calling remote ML API: https://bharat2004-medvisionai.hf.space/predict-with-clinical`
- Should see: `ML API response: ulcer with 87.5% confidence`

---

## 🐛 Troubleshooting

### Issue: "HUGGINGFACE_ML_URL not set"

**Fix**: Make sure you added the environment variable in Render dashboard and it's saved.

### Issue: "ML service timeout"

**Cause**: Hugging Face Space is sleeping (free tier sleeps after 48 hours)

**Fix**: 
1. First request takes 30-60 seconds to wake up
2. Try again after waiting
3. Add uptime monitor to keep it alive: https://uptimerobot.com (free)

### Issue: Render build failed with "Out of memory"

**Cause**: You're still using full `requirements.txt` with ML libraries

**Fix**:
```bash
# Make sure you copied the lightweight requirements
copy backend\requirements-render.txt backend\requirements.txt
git add backend\requirements.txt
git commit -m "Fix: use lightweight requirements"
git push
```

### Issue: "Failed to connect to ML service"

**Check**:
1. Is Hugging Face Space running? Check https://huggingface.co/spaces/Bharat2004/medvisionai
2. Is `HUGGINGFACE_ML_URL` correct in Render? Should be: `https://bharat2004-medvisionai.hf.space`
3. No trailing slash in URL

---

## 📊 What Changed?

### Before (Monolithic - FAILED)
```
Render Backend (512MB) → Tries to load PyTorch → OUT OF MEMORY ❌
```

### After (Hybrid - SUCCESS)
```
Render Backend (512MB) → HTTP Request → Hugging Face (16GB) → ML Result ✅
```

### File Changes:
1. ✅ `backend/requirements.txt` - Removed PyTorch, numpy, torch (now lightweight)
2. ✅ `backend/app/routes/analyze.py` - Now uses remote ML service when `HUGGINGFACE_ML_URL` is set
3. ✅ `backend/app/services/remote_ml_service.py` - New file that calls Hugging Face API
4. ✅ Hugging Face Space - New separate ML service

---

## ✅ Success Checklist

- [ ] Hugging Face Space is "Running" status
- [ ] Can access `https://bharat2004-medvisionai.hf.space/health`
- [ ] Render backend uses `requirements-render.txt` (lightweight)
- [ ] Render environment has `HUGGINGFACE_ML_URL` set
- [ ] Render logs show "Using REMOTE ML inference"
- [ ] Frontend can upload and analyze images
- [ ] Results show prediction, confidence, risk score

---

## 🎉 You're Done!

You now have a **100% FREE** full-stack AI medical imaging system:

- ✅ Frontend: Vercel (FREE)
- ✅ Backend: Render 512MB (FREE)
- ✅ Database: Neon PostgreSQL (FREE)
- ✅ ML Service: Hugging Face 16GB (FREE)

**Total Cost: $0.00/month** 🚀

No credit cards, no subscriptions, just pure innovation!
