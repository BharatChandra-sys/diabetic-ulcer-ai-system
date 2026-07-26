import logging
import os
from contextlib import asynccontextmanager

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import JSONResponse
from prometheus_client import make_asgi_app

from backend.app.database import Base, engine, test_connection
from backend.app.config import settings
from backend.app.auth.auth_router import router as auth_router
from backend.app.migrations import run_migrations, get_migration_status
from backend.app.routes import (
    health, predict, upload, reports, patients,
    patient_progression, statistics, health_metrics, diagnostics,
)
from backend.app import models  # noqa: F401 — ensures tables are registered

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s — %(message)s",
)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup / shutdown lifecycle."""
    # ── Startup ──────────────────────────────────────────────────
    logger.info("🚀 Starting MedVision AI backend...")

    # Create all tables (no-op if already exist)
    try:
        Base.metadata.create_all(bind=engine)
        logger.info("✓ Database tables ready")
    except Exception as e:
        logger.error(f"❌ Failed to create tables: {e}")

    # Run automatic migrations (safe to run multiple times)
    try:
        run_migrations()
    except Exception as e:
        logger.error(f"❌ Migration error: {e}")
        logger.warning("⚠  Continuing startup anyway...")

    # Verify DB connectivity
    if test_connection():
        logger.info("✓ Database connection verified")
    else:
        logger.warning("⚠  Database connection check failed — startup continues")

    logger.info(f"✓ Environment: {settings.environment}")
    logger.info("✓ MedVision AI ready to serve requests")
    yield

    # ── Shutdown ──────────────────────────────────────────────────
    logger.info("🛑 Shutting down MedVision AI backend")


app = FastAPI(
    title="MedVision AI — Diabetic Ulcer Detection API",
    version="2.0.0",
    description="AI-powered diabetic foot ulcer detection with explainability",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
)

# ── CORS ─────────────────────────────────────────────────────────────────────
cors_origins = (
    settings.get_cors_origins()
    if settings.environment == "production"
    else ["*"]
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Request logging middleware ────────────────────────────────────────────────
@app.middleware("http")
async def log_requests(request: Request, call_next):
    import time
    start = time.time()
    response = await call_next(request)
    ms = (time.time() - start) * 1000
    logger.info(f"{request.method} {request.url.path} → {response.status_code} ({ms:.0f}ms)")
    return response

# ── Global exception handler ──────────────────────────────────────────────────
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled exception on {request.url.path}: {exc}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={"error": "internal_error", "message": "An unexpected error occurred"},
    )

# ── Static files (uploaded images) ────────────────────────────────────────────
UPLOAD_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=UPLOAD_DIR), name="uploads")

# ── Prometheus metrics ────────────────────────────────────────────────────────
metrics_app = make_asgi_app()
app.mount("/metrics", metrics_app)

# ── Routers ───────────────────────────────────────────────────────────────────
app.include_router(auth_router)
app.include_router(health.router)
app.include_router(predict.router)
app.include_router(upload.router)
app.include_router(reports.router)
app.include_router(patients.router)
app.include_router(patient_progression.router)
app.include_router(statistics.router)
app.include_router(health_metrics.router)
app.include_router(diagnostics.router)


@app.get("/", tags=["root"])
def root():
    return {
        "service": "MedVision AI",
        "version": "2.0.0",
        "status": "running",
        "docs": "/docs",
        "health": "/health",
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)
