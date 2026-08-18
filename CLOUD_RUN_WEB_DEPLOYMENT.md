# Google Cloud Run Deployment - Web UI Guide

Deploy your ML backend using just your browser - no CLI needed!

## Step 1: Create Google Cloud Account

1. Go to https://cloud.google.com/
2. Click "Get started for free"
3. Sign in with your Google account
4. Get $300 free credits (valid for 90 days)
5. Enter billing info (won't be charged unless you exceed free tier)

## Step 2: Create a New Project

1. Go to https://console.cloud.google.com/
2. Click the project dropdown (top left, next to "Google Cloud")
3. Click "NEW PROJECT"
4. Project name: `medvision-ai-backend`
5. Click "CREATE"
6. Wait for project creation, then select it from the dropdown

## Step 3: Enable Cloud Run API

1. Go to https://console.cloud.google.com/marketplace/product/google/run.googleapis.com
2. Make sure your project `medvision-ai-backend` is selected
3. Click "ENABLE"
4. Wait for API to be enabled (~30 seconds)

## Step 4: Connect Your GitHub Repository

1. Go to https://console.cloud.google.com/run
2. Click "CREATE SERVICE"
3. Select "Continuously deploy from a repository (source-based)"
4. Click "SET UP WITH CLOUD BUILD"

### Step 4a: Connect to GitHub
1. Click "GitHub" as source repository
2. Click "Authenticate with GitHub"
3. Authorize Google Cloud Build
4. Select your repository: `BharatChandra-sys/diabetic-ulcer-ai-system`
5. Click "NEXT"

### Step 4b: Build Configuration
1. **Branch**: `^main$` (deploy from main branch)
2. **Build Type**: Select "Dockerfile"
3. **Dockerfile path**: `Dockerfile.cloudrun`
4. **Dockerfile directory**: `/` (root)
5. Click "SAVE"

## Step 5: Configure the Service

### Container Settings
- **Service name**: `medvision-backend`
- **Region**: `us-central1` (Iowa - cheapest)
- **CPU allocation**: "CPU is only allocated during request processing"
- **Authentication**: "Allow unauthenticated invocations" ✅

### Resources
Click "CONTAINER, VARIABLES & SECRETS, CONNECTIONS, SECURITY"

#### Container tab:
- **Memory**: `4 GiB` ⚠️ Important for ML
- **CPU**: `2`
- **Request timeout**: `300` seconds
- **Maximum requests per container**: `10`

#### Variables & Secrets tab:
Add these environment variables:

| Name | Value |
|------|-------|
| `ENVIRONMENT` | `production` |
| `ALLOWED_ORIGINS` | `*` (or your Vercel URL) |
| `SECRET_KEY` | (generate random string) |
| `DATABASE_URL` | (your Neon PostgreSQL URL) |
| `FIREBASE_PROJECT_ID` | (your Firebase project ID) |

For `FIREBASE_SERVICE_ACCOUNT_JSON`:
- Copy your entire Firebase service account JSON
- Paste it as the value (as a single-line string)

#### Capacity tab:
- **Minimum number of instances**: `0` (scales to zero = free)
- **Maximum number of instances**: `10`

## Step 6: Deploy

1. Click "CREATE" at the bottom
2. Wait for build to complete (~5-10 minutes for first build)
3. Watch the build logs in the UI

## Step 7: Get Your Backend URL

After deployment succeeds:
1. You'll see your service URL: `https://medvision-backend-xxxxxxxxxx-uc.a.run.app`
2. Copy this URL
3. Test it: Visit `https://your-url.run.app/health`

## Step 8: Update Frontend

1. Go to your Vercel dashboard
2. Select your frontend project
3. Go to Settings → Environment Variables
4. Update `VITE_API_BASE_URL` to your Cloud Run URL:
   ```
   VITE_API_BASE_URL=https://medvision-backend-xxxxxxxxxx-uc.a.run.app
   ```
5. Redeploy your frontend

## Step 9: Test Everything

Visit your Vercel frontend and try:
1. ✅ Sign up / Sign in
2. ✅ Upload an image for analysis
3. ✅ View prediction results with GradCAM heatmap
4. ✅ Check prediction history

## Managing Your Service

### View Logs
1. Go to https://console.cloud.google.com/run
2. Click on `medvision-backend`
3. Click "LOGS" tab
4. See real-time logs and errors

### Update Environment Variables
1. Go to your service page
2. Click "EDIT & DEPLOY NEW REVISION"
3. Go to "VARIABLES & SECRETS" tab
4. Add/Edit variables
5. Click "DEPLOY"

### Monitor Usage
1. Go to https://console.cloud.google.com/run
2. Click on `medvision-backend`
3. Click "METRICS" tab
4. See requests, CPU, memory usage

### Automatic Deploys
Every time you push to `main` branch on GitHub:
- Cloud Build automatically builds new image
- Cloud Run deploys the new version
- Zero downtime deployment

## Troubleshooting

### Build Fails
1. Check build logs in Cloud Build: https://console.cloud.google.com/cloud-build/builds
2. Common issues:
   - Dockerfile syntax error
   - Missing dependencies in requirements.txt
   - Out of memory during build (increase build machine size in Build Settings)

### Container Crashes
1. Check service logs
2. Common issues:
   - Missing environment variables
   - Database connection failed
   - Out of memory (increase to 4GB)

### 502 Bad Gateway
- Container is taking too long to start
- Increase timeout to 300 seconds
- Check health check endpoint works

### 503 Service Unavailable
- All instances are busy
- Increase max instances
- Optimize your code

## Cost Estimate

**Monthly Free Tier:**
- 2 million requests
- 360,000 GB-seconds
- 180,000 vCPU-seconds

**With 4GB RAM and typical usage:**
- ~50,000 ML inferences/month = **FREE**
- Each inference: ~5 seconds @ 4GB = 20 GB-seconds
- 50,000 × 20 = 1,000,000 GB-seconds = **FREE** ✅

**Beyond free tier:**
- $0.00002400 per GB-second
- $0.00001200 per vCPU-second
- Still very cheap!

## Alternative: Manual Deploy (Without GitHub)

If you don't want automatic deploys:

1. Install gcloud CLI (one time): https://cloud.google.com/sdk/docs/install
2. Run from your terminal:
```bash
cd c:\Users\bc833\Downloads\diabetic-ulcer-ai-system
gcloud auth login
gcloud config set project medvision-ai-backend
gcloud run deploy medvision-backend --source . --dockerfile Dockerfile.cloudrun --region us-central1 --allow-unauthenticated --memory 4Gi --cpu 2
```

## Summary

✅ **Setup Time**: 15-20 minutes
✅ **Cost**: FREE (within limits)
✅ **Performance**: 4GB RAM, handles ML workloads
✅ **Auto-scaling**: Scales to zero when idle
✅ **Auto-deploys**: Every git push deploys automatically
✅ **Monitoring**: Built-in logs and metrics

Your backend is now running on Google Cloud Run with full ML capabilities! 🎉
