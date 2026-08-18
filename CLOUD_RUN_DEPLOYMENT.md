# Google Cloud Run Deployment Guide

This guide will help you deploy your ML backend to Google Cloud Run with 4GB RAM (FREE tier).

## Prerequisites

- Google Cloud account (free $300 credit for new users)
- Google Cloud CLI installed

## Step 1: Install Google Cloud CLI

### Windows
Download and install from: https://cloud.google.com/sdk/docs/install

Or using PowerShell:
```powershell
(New-Object Net.WebClient).DownloadFile("https://dl.google.com/dl/cloudsdk/channels/rapid/GoogleCloudSDKInstaller.exe", "$env:Temp\GoogleCloudSDKInstaller.exe")
& $env:Temp\GoogleCloudSDKInstaller.exe
```

### Verify installation
```bash
gcloud version
```

## Step 2: Initialize gcloud

```bash
# Login to your Google account
gcloud auth login

# Create a new project or select existing one
gcloud projects create medvision-ai-backend --name="MedVision AI"

# Set the project
gcloud config set project medvision-ai-backend

# Enable required APIs
gcloud services enable run.googleapis.com
gcloud services enable containerregistry.googleapis.com
gcloud services enable cloudbuild.googleapis.com
```

## Step 3: Deploy to Cloud Run

### Option A: Deploy with one command (Recommended)

```bash
cd c:\Users\bc833\Downloads\diabetic-ulcer-ai-system

gcloud run deploy medvision-backend \
  --source . \
  --dockerfile Dockerfile.cloudrun \
  --region us-central1 \
  --platform managed \
  --allow-unauthenticated \
  --memory 4Gi \
  --cpu 2 \
  --timeout 300 \
  --max-instances 10 \
  --set-env-vars="ENVIRONMENT=production,ALLOWED_ORIGINS=*"
```

### Option B: Build and deploy separately

```bash
# Build container
gcloud builds submit --tag gcr.io/medvision-ai-backend/backend --dockerfile Dockerfile.cloudrun

# Deploy
gcloud run deploy medvision-backend \
  --image gcr.io/medvision-ai-backend/backend \
  --region us-central1 \
  --platform managed \
  --allow-unauthenticated \
  --memory 4Gi \
  --cpu 2 \
  --timeout 300
```

## Step 4: Set Environment Variables

After deployment, add your environment variables:

```bash
gcloud run services update medvision-backend \
  --region us-central1 \
  --set-env-vars="DATABASE_URL=your-neon-postgres-url,\
SECRET_KEY=your-secret-key,\
FIREBASE_PROJECT_ID=your-project-id,\
FIREBASE_SERVICE_ACCOUNT_JSON='{...}',\
ENVIRONMENT=production,\
ALLOWED_ORIGINS=https://mvai3.vercel.app"
```

Or set them in the Cloud Run UI:
1. Go to https://console.cloud.google.com/run
2. Click on `medvision-backend`
3. Click "EDIT & DEPLOY NEW REVISION"
4. Go to "Variables & Secrets" tab
5. Add environment variables
6. Click "DEPLOY"

## Step 5: Get Your Backend URL

After deployment completes, you'll see:
```
Service [medvision-backend] revision [medvision-backend-00001-xxx] has been deployed and is serving 100 percent of traffic.
Service URL: https://medvision-backend-xxxxxxxxxx-uc.a.run.app
```

Copy this URL and update your Vercel frontend environment variable:
```
VITE_API_BASE_URL=https://medvision-backend-xxxxxxxxxx-uc.a.run.app
```

## Step 6: Test Your Deployment

```bash
# Test health endpoint
curl https://your-cloud-run-url.run.app/health

# Test with ML inference
curl -X POST https://your-cloud-run-url.run.app/predictions/analyze \
  -F "image=@test-image.jpg"
```

## Cost Optimization

### Free Tier Limits
- 2 million requests per month
- 360,000 GB-seconds of memory
- 180,000 vCPU-seconds

### Tips to Stay Free
1. **Set min instances to 0** (scales to zero when idle)
2. **Use 4GB RAM** only when needed (most requests use less)
3. **Set timeout to 60s** (default 300s uses more resources)
4. **Enable request-based autoscaling**

```bash
gcloud run services update medvision-backend \
  --region us-central1 \
  --min-instances 0 \
  --max-instances 3 \
  --concurrency 10
```

## Monitoring

View logs:
```bash
gcloud run services logs read medvision-backend --region us-central1
```

Or in the UI:
https://console.cloud.google.com/run

## Troubleshooting

### Build fails due to memory
Increase Cloud Build memory:
```bash
gcloud builds submit --machine-type=e2-highcpu-8 --tag gcr.io/medvision-ai-backend/backend
```

### Container crashes
Check logs:
```bash
gcloud run services logs read medvision-backend --limit 50
```

### Cold starts are slow
Set min-instances to 1 (costs money but keeps warm):
```bash
gcloud run services update medvision-backend --min-instances 1
```

## Update Deployment

To update after code changes:
```bash
gcloud run deploy medvision-backend \
  --source . \
  --dockerfile Dockerfile.cloudrun \
  --region us-central1
```

## Cleanup

To delete the service:
```bash
gcloud run services delete medvision-backend --region us-central1
```

To delete the project:
```bash
gcloud projects delete medvision-ai-backend
```

## Summary

Your architecture:
- ✅ **Frontend**: Vercel (FREE)
- ✅ **Backend**: Google Cloud Run with 4GB RAM (FREE tier)
- ✅ **Database**: Neon PostgreSQL (FREE)
- ✅ **ML Models**: Running on Cloud Run
- ✅ **Total Cost**: $0/month (within free limits)

---

**Next Steps:**
1. Deploy backend to Cloud Run
2. Get the Cloud Run URL
3. Update Vercel environment variable `VITE_API_BASE_URL`
4. Test authentication and ML inference
5. Set up uptime monitoring (optional)
