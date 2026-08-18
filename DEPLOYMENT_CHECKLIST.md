# ✅ Deployment Checklist - Follow This!

## 📋 HUGGING FACE DEPLOYMENT

You've already created: `https://huggingface.co/spaces/Bharat2004/medvisionai`

### Files to Upload (via Web UI)

Go to your space → Click "Files" → "Add file" → "Upload files"

Upload these files from `huggingface-ml-service/` folder:

- [ ] `app.py` (Main ML service code)
- [ ] `requirements.txt` (Dependencies)
- [ ] `best_dfu_model.pth` (Model weights - if you have it, optional)

### Files to Create (via Web UI)

Click "Files" → "Add file" → "Create a new file"

#### 1. Create `Dockerfile`:
- Name: `Dockerfile`
- Copy content from: `huggingface-ml-service/Dockerfile`
- Commit

#### 2. Create `README.md`:
- Name: `README.md`
- Copy content from: `huggingface-ml-service/README-HF.md`
- Commit

### Wait for Build

- [ ] Go to "Logs" tab
- [ ] Wait 5-10 minutes for Docker build
- [ ] Status changes to "Running"
- [ ] Test: Open `https://bharat2004-medvisionai.hf.space/health`
- [ ] Should see: `{"status": "healthy", "model_loaded": true}`

✅ **Your ML Service URL**: `https://bharat2004-medvisionai.hf.space`

---

## 📋 RENDER BACKEND UPDATE

### Step 1: Update Local Files

```bash
cd c:\Users\bc833\Downloads\diabetic-ulcer-ai-system

# Backup current requirements
copy backend\requirements.txt backend\requirements-full-backup.txt

# Use lightweight version
copy backend\requirements-render.txt backend\requirements.txt
```

### Step 2: Commit to Git

```bash
git status
git add .
git commit -m "Switch to remote ML inference (Hugging Face)"
git push origin main
```

**Files being committed:**
- [ ] `backend/requirements.txt` (lightweight version - no PyTorch)
- [ ] `backend/app/routes/analyze.py` (updated to use remote ML)
- [ ] `backend/app/services/remote_ml_service.py` (new file)
- [ ] `huggingface-ml-service/` folder (all files)

### Step 3: Update Render Environment

1. [ ] Go to https://dashboard.render.com
2. [ ] Select your service: `diabetic-ulcer-ai-system`
3. [ ] Click "Environment" tab
4. [ ] Click "Add Environment Variable"
5. [ ] Add:
   - **Key**: `HUGGINGFACE_ML_URL`
   - **Value**: `https://bharat2004-medvisionai.hf.space`
6. [ ] Click "Save Changes"

Render will auto-redeploy (~5 minutes).

### Step 4: Verify Render Logs

In Render dashboard, check logs for:

```
✓ Using REMOTE ML inference (Hugging Face)
✓ Remote ML service configured: https://bharat2004-medvisionai.hf.space
✓ MedVision AI ready to serve requests
```

---

## 📋 FINAL TESTING

### Test 1: ML Service Health

```bash
curl https://bharat2004-medvisionai.hf.space/health
```

Expected: `{"status": "healthy", "model_loaded": true}`

- [ ] Works ✅

### Test 2: Backend Health

```bash
curl https://diabetic-ulcer-ai-system.onrender.com/health
```

Expected: `{"status": "healthy"}`

- [ ] Works ✅

### Test 3: Frontend Upload

1. [ ] Open your frontend URL
2. [ ] Log in
3. [ ] Upload a foot image
4. [ ] Click "Analyze"
5. [ ] **Wait 30-60 seconds** (first time - Hugging Face waking up)
6. [ ] See results with prediction, confidence, risk score

---

## 🎯 WHAT TO EXPECT

### First Request (Cold Start)
- Takes 30-60 seconds
- Hugging Face Space is waking up from sleep
- Loading PyTorch model into memory
- **This is normal!**

### Subsequent Requests
- Takes 2-5 seconds
- Much faster once warm
- Model is already loaded

### If Space Sleeps Again
- Free tier spaces sleep after 48 hours of inactivity
- Solution: Set up UptimeRobot (free) to ping `/health` every 5 minutes
- Or upgrade to Hugging Face paid tier ($9/month always-on)

---

## 🐛 COMMON ISSUES

### Issue: "Module not found" in Render

**Fix**: Make sure you're using `requirements-render.txt` (no ML libraries)

```bash
copy backend\requirements-render.txt backend\requirements.txt
git add backend\requirements.txt
git commit -m "Fix requirements"
git push
```

### Issue: "HUGGINGFACE_ML_URL not set"

**Fix**: Double-check Render environment variables. Should have:
- Key: `HUGGINGFACE_ML_URL`
- Value: `https://bharat2004-medvisionai.hf.space` (no trailing slash!)

### Issue: "Connection timeout"

**Cause**: Hugging Face Space is sleeping

**Fix**: 
1. Go to https://huggingface.co/spaces/Bharat2004/medvisionai
2. Check if status is "Running"
3. If "Sleeping", click anywhere to wake it
4. Wait 30 seconds and try again

### Issue: Render still out of memory

**Check**: Are you using the lightweight requirements?

```bash
# Check file size
dir backend\requirements.txt

# Should be ~1 KB (lightweight version)
# If > 2 KB, you're using the wrong file
```

---

## ✅ SUCCESS CRITERIA

All of these should be true:

- [ ] Hugging Face Space shows "Running" status
- [ ] `https://bharat2004-medvisionai.hf.space/health` returns healthy
- [ ] Render backend shows "Live" status
- [ ] Render logs say "Using REMOTE ML inference"
- [ ] Frontend can upload images
- [ ] Analysis returns results (prediction, confidence, risk)
- [ ] No "out of memory" errors

---

## 🎉 YOU'RE DONE!

Once all checkboxes are ticked, you have:

✅ **100% FREE** full-stack AI deployment:
- Frontend: Vercel
- Backend: Render (512MB - lightweight)
- Database: Neon PostgreSQL
- ML Service: Hugging Face (16GB)

**Total monthly cost: $0.00** 🚀

---

## 📞 Need Help?

If stuck:
1. Check Hugging Face Space logs
2. Check Render backend logs
3. Verify all environment variables
4. Make sure you pushed to Git
5. Try manual redeploy in Render dashboard
