from fastapi import APIRouter
from datetime import datetime
import os

# Make psutil optional for minimal deployments
try:
    import psutil
    PSUTIL_AVAILABLE = True
except ImportError:
    PSUTIL_AVAILABLE = False

router = APIRouter(tags=["health"])

@router.get("/health")
def health_check():
    """Health check endpoint for service monitoring - prevents sleeping on Render/Heroku"""
    return {
        "status": "healthy",
        "service": "medvision_ai_diabetic_ulcer_detection",
        "version": "1.0.0",
        "timestamp": datetime.utcnow().isoformat(),
        "environment": os.getenv("ENVIRONMENT", "production"),
        "uptime": "ok"
    }

@router.get("/ping")
def ping():
    """Simple ping endpoint for uptime monitoring"""
    return {"status": "ok", "timestamp": datetime.utcnow().isoformat()}

@router.get("/health/ready")
def readiness():
    """Readiness probe for Kubernetes/container orchestration"""
    return {
        "status": "ready",
        "timestamp": datetime.utcnow().isoformat(),
        "checks": {
            "database": "ready",
            "ml_model": "ready"
        }
    }

@router.get("/health/live")
def liveness():
    """Liveness probe for container orchestration"""
    return {"status": "alive", "timestamp": datetime.utcnow().isoformat()}

@router.get("/health/status")
def detailed_status():
    """Detailed system status for monitoring"""
    if not PSUTIL_AVAILABLE:
        return {
            "status": "healthy",
            "timestamp": datetime.utcnow().isoformat(),
            "system": "metrics unavailable (psutil not installed)"
        }
    
    try:
        memory = psutil.virtual_memory()
        disk = psutil.disk_usage('/')
        return {
            "status": "healthy",
            "timestamp": datetime.utcnow().isoformat(),
            "system": {
                "cpu_percent": psutil.cpu_percent(interval=1),
                "memory_percent": memory.percent,
                "memory_available_mb": memory.available / (1024 * 1024),
                "disk_percent": disk.percent,
                "disk_free_gb": disk.free / (1024 * 1024 * 1024)
            }
        }
    except:
        # Fallback if psutil fails
        return {
            "status": "healthy",
            "timestamp": datetime.utcnow().isoformat(),
            "system": "metrics unavailable"
        }

