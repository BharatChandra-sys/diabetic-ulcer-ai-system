"""
Diagnostic API endpoints for troubleshooting database and auth issues.
Provides read-only access to database status and user info (dev only).
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from backend.app.database import get_db
from backend.app.models import User
from backend.app.config import settings
from backend.app.migrations import get_migration_status
from typing import List

router = APIRouter(prefix="/diagnostics", tags=["diagnostics"], include_in_schema=True)


@router.get("/health", response_model=dict, tags=["health"])
def health_check(db: Session = Depends(get_db)):
    """
    Health check endpoint - returns database connection status.
    Safe for production. No authentication required.
    """
    try:
        from sqlalchemy import text
        db.execute(text("SELECT 1"))
        
        # Count users
        user_count = db.query(User).count()
        
        # Get migration status
        migrations = get_migration_status()
        
        return {
            "status": "healthy",
            "database": "connected",
            "users_count": user_count,
            "environment": settings.environment,
            "version": "1.0.0",
            "migrations": migrations
        }
    except Exception as e:
        return {
            "status": "unhealthy",
            "database": "error",
            "error": str(e),
            "environment": settings.environment
        }


@router.get("/users", response_model=List[dict])
def list_users_diagnostic(db: Session = Depends(get_db)):
    """
    List all users in database (development only).
    WARNING: Shows user emails and password hash prefixes.
    
    Returns user count, emails, creation dates.
    Useful for debugging auth issues.
    
    Access: Always available for now (TODO: add IP/auth restriction)
    """
    if settings.environment == "production":
        raise HTTPException(
            status_code=403,
            detail="Diagnostics disabled in production"
        )
    
    try:
        users = db.query(User).all()
        
        return [
            {
                "id": user.id,
                "email": user.email,
                "is_active": user.is_active,
                "created_at": user.created_at.isoformat() if user.created_at else None,
                "hash_prefix": user.hashed_password[:20] + "..." if user.hashed_password else None
            }
            for user in users
        ]
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error listing users: {str(e)}")


@router.post("/check-email/{email}", response_model=dict)
def check_email_diagnostic(email: str, db: Session = Depends(get_db)):
    """
    Check if email exists in database.
    Useful for diagnosing "email already exists" errors.
    """
    if settings.environment == "production":
        raise HTTPException(
            status_code=403,
            detail="Diagnostics disabled in production"
        )
    
    try:
        user = db.query(User).filter(User.email == email).first()
        
        if user:
            return {
                "email": email,
                "exists": True,
                "is_active": user.is_active,
                "created_at": user.created_at.isoformat() if user.created_at else None,
                "id": user.id
            }
        else:
            return {
                "email": email,
                "exists": False
            }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error checking email: {str(e)}")


@router.get("/info", response_model=dict)
def database_info(db: Session = Depends(get_db)):
    """
    Get database connection info and statistics.
    """
    if settings.environment == "production":
        raise HTTPException(
            status_code=403,
            detail="Diagnostics disabled in production"
        )
    
    try:
        from sqlalchemy import inspect, text
        
        inspector = inspect(db.get_bind())
        tables = inspector.get_table_names()
        
        # Get row counts
        from app.models import Patient, PredictionLog, UlcerImage, HealthMetrics
        
        stats = {
            "database_url": settings.database_url.split("@")[-1] if "@" in settings.database_url else "hidden",
            "tables": tables,
            "row_counts": {
                "users": db.query(User).count(),
                "patients": db.query(Patient).count(),
                "predictions": db.query(PredictionLog).count(),
                "images": db.query(UlcerImage).count(),
                "health_metrics": db.query(HealthMetrics).count(),
            },
            "environment": settings.environment,
            "debug_mode": settings.debug
        }
        
        return stats
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error getting database info: {str(e)}")


@router.post("/reset-warning", response_model=dict)
def reset_warning():
    """
    WARNING: Shows what will happen if database is reset.
    This endpoint doesn't actually reset anything - just shows the impact.
    
    To actually reset the database, use:
    1. Render Shell with SQL commands
    2. Python script: python fix_database.py --reset
    3. Render CLI: render run python fix_database.py --reset
    """
    return {
        "warning": "Database reset will DELETE ALL data permanently",
        "affected_tables": [
            "users (all accounts deleted)",
            "patients (all patient records deleted)",
            "prediction_logs (all analysis history deleted)",
            "ulcer_images (all uploads deleted)",
            "health_metrics (all metrics deleted)"
        ],
        "recommended_before_reset": [
            "1. Backup your database",
            "2. Export any important data",
            "3. Create new account after reset"
        ],
        "how_to_reset": [
            "Option 1: Render Shell (SQL commands)",
            "Option 2: Python script (python fix_database.py --reset)",
            "Option 3: Render CLI (render run python fix_database.py --reset)",
        ],
        "documentation": "See DB_RESET_GUIDE.md for detailed instructions"
    }
