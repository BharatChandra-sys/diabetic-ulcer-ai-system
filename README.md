# DFU-AI — Diabetic Ulcer Detection System

<div align="center">

[![Python](https://img.shields.io/badge/Python-3.11-3776AB?style=flat-square&logo=python&logoColor=white)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.109-009688?style=flat-square&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev/)
[![PyTorch](https://img.shields.io/badge/PyTorch-2.0-EE4C2C?style=flat-square&logo=pytorch&logoColor=white)](https://pytorch.org/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind-3.4-38BDF8?style=flat-square&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-MIT-22c55e?style=flat-square)](LICENSE)

[![API Endpoints](https://img.shields.io/badge/API-41%20Endpoints-6366f1?style=flat-square&logo=swagger)](http://localhost:8000/docs)
[![Models](https://img.shields.io/badge/ML%20Models-CNN%20%7C%20Multimodal%20%7C%20Segmentation-f97316?style=flat-square)](backend/app/ml/)
[![Deployment](https://img.shields.io/badge/Deploy-Render%20%7C%20Neon%20%7C%20Vercel-0ea5e9?style=flat-square)](DEPLOY.md)
[![Health](https://img.shields.io/badge/Uptime-Monitored-22c55e?style=flat-square&logo=prometheus)](http://localhost:8000/health)

<br/>

**An explainable AI clinical decision support system for detecting and monitoring diabetic foot ulcers.**  
Upload a foot image, enter patient data, get an instant AI-powered risk assessment with visual explanations.

</div>

---

## Live Demo — Real Results

> All screenshots below are from **actual test runs** using real dataset images. No mockups.

### AI Scan Results — 100% Confidence Detection

<img src="scripts/demo_assets/screenshots/real_test/06_results_page.png" alt="AI Scan Results showing ulcer detection with Grad-CAM heatmap" width="100%"/>

*Real diabetic foot ulcer image processed through the CNN model. Left: original image. Right: Grad-CAM heatmap highlighting the infected region. The system correctly identified the ulcer with 100% confidence and flagged Very High risk.*

---

### Foot Scan Upload — Real Image Loaded

<img src="scripts/demo_assets/screenshots/real_test/04_real_image_preview.png" alt="Foot scan upload page with real ulcer image loaded" width="100%"/>

*Drag-and-drop upload interface. The real `diabetic-foot-ulcer.jpg` dataset image is loaded and ready for analysis.*

---

### Health Metrics & Analysis Form

<img src="scripts/demo_assets/screenshots/real_test/05_metrics_filled.png" alt="Health metrics form with patient data filled in" width="100%"/>

*Patient clinical data (Age 68, BMI 32, Blood Sugar 145) combined with the uploaded image feeds the multimodal AI model.*

---

### Main Dashboard

<img src="scripts/demo_assets/screenshots/real_test/02_dashboard.png" alt="Main application dashboard" width="100%"/>

*Real-time overview of scan history, risk distribution, and patient activity.*

---

### Patient History

<img src="scripts/demo_assets/screenshots/real_test/07_history.png" alt="Patient scan history page" width="100%"/>

*Browse past analyses with risk level filters and full scan records.*

---

### Login & Authentication

<img src="scripts/demo_assets/screenshots/real_test/01_login_filled.png" alt="Login page" width="100%"/>

*JWT-based authentication with registration, forgot password, and token-based session management.*

---

### API Documentation

<img src="scripts/demo_assets/screenshots/real_test/08_api_docs.png" alt="Swagger API documentation" width="100%"/>

*41 endpoints auto-documented via FastAPI's Swagger UI.*

---

## Proven Results — Real Dataset Test

5 real diabetic foot ulcer images from the dataset were tested against the live API:

| Image | Prediction | Confidence | Risk Level | Grad-CAM | Latency |
|-------|-----------|:----------:|:----------:|:--------:|:-------:|
| `diabetic-foot-ulcer.jpg` | **ULCER** | **100.0%** | Very High | ✅ | 3668 ms |
| `diabetic_foot_ulcer.jpg` | **ULCER** | **100.0%** | Very High | ✅ | 2563 ms |
| `14.jpg` | **ULCER** | **100.0%** | Very High | ✅ | 2362 ms |
| `DiabeticPicture4.jpg` | **ULCER** | **99.9%** | Very High | ✅ | 2511 ms |
| `hallux-IPJ-ulcer-post1A.jpg` | **ULCER** | **100.0%** | Very High | ✅ | 2594 ms |

**5/5 correctly classified. Grad-CAM heatmap and overlay generated for every image.**

To reproduce:
```bash
python scripts/real_image_test.py
```

---

## What It Does

Diabetic foot ulcers affect millions of patients yearly and are a leading cause of amputation. Most AI tools behave as black boxes — clinicians can't trust what they can't understand.

MedVision AI solves this by combining:

- **Image analysis** — CNN model detects ulcers from photos
- **Clinical data fusion** — age, BMI, diabetes duration, infection signs
- **Explainability** — Grad-CAM heatmaps show *where* the model looked; SHAP/LIME show *why* it decided
- **Risk scoring** — 0–100% risk score with severity classification
- **Recommendations** — tailored clinical next steps based on risk level

---

## Features

**AI / ML**
- CNN-based ulcer detection from foot images
- Multimodal model fusing image + clinical features
- U-Net segmentation for ulcer area estimation
- Grad-CAM heatmap visualization
- SHAP + LIME feature importance explanations
- Confidence-thresholded predictions (65% minimum)

**Application**
- JWT authentication (login / signup / password reset)
- Drag-and-drop image upload
- Real-time AI inference with progress indicator
- Scan results page with original image + AI heatmap side by side
- Patient history with risk-level filtering
- PDF report generation
- AI chatbot workspace

**Infrastructure**
- 41 REST API endpoints
- 5 health check endpoints for uptime monitoring
- Prometheus metrics
- Redis caching (optional)
- Cloudinary image storage
- SQLAlchemy with PostgreSQL / SQLite

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19, Vite, Tailwind CSS, React Router v7 |
| Backend | FastAPI, SQLAlchemy, Pydantic, Uvicorn |
| ML | PyTorch, ONNX Runtime, OpenCV |
| Explainability | Grad-CAM, SHAP, LIME |
| Database | PostgreSQL (Neon) / SQLite |
| Storage | Cloudinary / local uploads |
| Auth | JWT (python-jose, bcrypt) |
| Monitoring | Prometheus, UptimeRobot |
| Deploy | Render, Fly.io, Docker |

---

## Quick Start

### 1. Clone

```bash
git clone https://github.com/BharatChandra-sys/diabetic-ulcer-ai-system.git
cd diabetic-ulcer-ai-system
```

### 2. Backend

```bash
cd backend
python -m venv venv
venv\Scripts\activate          # Windows
# source venv/bin/activate     # Mac/Linux
pip install -r requirements.txt
uvicorn backend.app.main:app --reload --host 0.0.0.0 --port 8000
```

### 3. Frontend

```bash
cd frontend
npm install
npm run dev
```

### 4. Open

| Service | URL |
|---------|-----|
| App | http://localhost:5173 |
| API | http://localhost:8000 |
| Docs | http://localhost:8000/docs |
| Health | http://localhost:8000/health |

---

## Environment Variables

Copy `.env.template` to `backend/.env` and fill in:

```env
DATABASE_URL=postgresql://user:pass@host/db
SECRET_KEY=your-secret-key-here
JWT_SECRET_KEY=your-jwt-secret-here
CLOUDINARY_CLOUD_NAME=your-cloud
CLOUDINARY_API_KEY=your-key
CLOUDINARY_API_SECRET=your-secret
ENVIRONMENT=development
```

---

## API Endpoints

### Health
```
GET  /health          → system status
GET  /health/ping     → uptime ping
GET  /health/ready    → readiness probe
GET  /health/live     → liveness probe
GET  /health/status   → CPU / memory / disk metrics
```

### Auth
```
POST /auth/register
POST /auth/login           → returns JWT
POST /auth/forgot-password
POST /auth/reset-password
POST /auth/change-password
```

### Core
```
POST /upload              → upload image, returns URL
POST /predict             → run AI inference
GET  /reports/            → user's scan history
GET  /patients/           → patient list
POST /patients/           → create patient
GET  /statistics          → system analytics
GET  /diagnostics         → system diagnostics
```

Full interactive docs: **http://localhost:8000/docs**

---

## Project Structure

```
diabetic-ulcer-ai-system/
├── backend/
│   ├── app/
│   │   ├── auth/               JWT auth + password reset
│   │   ├── routes/             41 API endpoints
│   │   ├── services/           Business logic
│   │   ├── ml/                 CNN, multimodal, segmentation models
│   │   ├── explainability/     Grad-CAM, SHAP, LIME
│   │   ├── pipelines/          Inference + preprocessing pipelines
│   │   ├── monitoring/         Prometheus metrics
│   │   ├── main.py
│   │   └── config.py
│   └── requirements.txt
│
├── frontend/
│   └── src/
│       ├── pages/              11 pages (Login, Dashboard, Scan, Results, History…)
│       ├── components/         Reusable UI components
│       └── services/           API client (Axios)
│
├── datasets/
│   └── images/test/            Real diabetic ulcer dataset images
│
├── scripts/
│   ├── real_image_test.py      End-to-end test with real images
│   ├── capture_demo_screenshots.py
│   └── demo_assets/screenshots/real_test/   ← screenshots in this README
│
├── render.yaml                 Render deployment blueprint
├── fly.toml                    Fly.io deployment config
└── docker-compose.yml
```

---

## Deployment

**Full guide: [DEPLOY.md](DEPLOY.md)**

Stack: **Render** (backend Docker) + **Neon** (PostgreSQL free) + **Vercel** (frontend)

```bash
# 1. Get Neon free DB → https://neon.tech
# 2. Deploy backend → https://dashboard.render.com → New Web Service → connect repo
# 3. Add 5 env vars in Render (see DEPLOY.md)
# 4. Deploy frontend → https://vercel.com/new → connect repo
```

### Local Development

```bash
# Backend
python -m venv venv & venv\Scripts\activate
pip install -r backend/requirements.txt
uvicorn backend.app.main:app --reload --port 8000

# Frontend
cd frontend && npm install && npm run dev

# Or Docker
docker-compose up --build
```

---

## Architecture

```
┌─────────────────────────────────────────────────────┐
│                    React Frontend                    │
│         Login / Dashboard / Scan / History          │
└────────────────────┬────────────────────────────────┘
                     │ HTTPS / REST
┌────────────────────▼────────────────────────────────┐
│                  FastAPI Backend                     │
│   Auth │ Upload │ Predict │ Reports │ Patients      │
└──────┬──────────────────┬──────────────────┬────────┘
       │                  │                  │
┌──────▼──────┐  ┌────────▼──────┐  ┌───────▼───────┐
│  PostgreSQL  │  │  ML Pipeline  │  │  Cloudinary   │
│  (Neon)      │  │  CNN + Grad-  │  │  Image Store  │
│              │  │  CAM + SHAP   │  │               │
└─────────────┘  └───────────────┘  └───────────────┘
```

---

## System Architecture Diagrams

### Overall Architecture

<img width="4992" height="916" alt="architecture" src="https://github.com/user-attachments/assets/90d6f38f-e2e9-4a13-9440-54bb0631bfbb" />

### Prediction Pipeline

<img width="1063" height="1683" alt="pipeline" src="https://github.com/user-attachments/assets/fd0fcbcc-1502-47b2-b63a-5ff43791e72a" />

### Ulcer Progression Tracking

<img width="1150" height="1345" alt="progression" src="https://github.com/user-attachments/assets/914ba666-da7d-4772-ae9a-0ee1cd22b298" />

### Backend API Flow

<img width="2356" height="1266" alt="api-flow" src="https://github.com/user-attachments/assets/d224691b-b6e5-4296-a2a5-c5fcff5f74e6" />

---

## Codebase Stats

| Metric | Value |
|--------|-------|
| Python files | 83 |
| JS / JSX files | 22 |
| Lines of code | 12,223 |
| API routes | 41 |
| React pages | 11 |
| React components | 17 |
| Backend services | 9 |
| ML model files | 15 |

---

## Explainability

**Grad-CAM** highlights the image regions the CNN focused on when making its decision. The heatmap is overlaid on the original image so clinicians can see exactly where the model detected abnormalities.

**SHAP / LIME** quantifies which clinical features (age, BMI, diabetes duration, infection signs) contributed most to the risk score. Each prediction includes a natural language explanation:

> *"The model detected a diabetic foot ulcer with 100.0% confidence. Overall risk assessment: Very High (87%). Key clinical risk factors: advanced age (68), high BMI (32.4), long diabetes duration (14 years), moderate infection signs. The most influential clinical feature was Infection Signs (importance: 0.36)."*

---

## Reproducing the Tests

```bash
# Full end-to-end test with real dataset images
python scripts/real_image_test.py

# API-only test
python scripts/e2e_test.py

# Capture all page screenshots
python scripts/capture_demo_screenshots.py
```

All require the backend (`port 8000`) and frontend (`port 5173`) to be running.

---

## License

MIT — see [LICENSE](LICENSE). Built for educational and research purposes.

---

<div align="center">

Built with ❤️ for better healthcare

</div>
