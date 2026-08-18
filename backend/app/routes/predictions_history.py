from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import Optional
from backend.app.database import get_db
from backend.app.auth.dependencies import optional_auth
from backend.app.models import User

router = APIRouter(prefix="/predictions", tags=["predictions"])


@router.get("/history")
def get_prediction_history(
    limit: int = Query(default=10, ge=1, le=100),
    offset: int = Query(default=0, ge=0),
    user: Optional[User] = Depends(optional_auth),
    db: Session = Depends(get_db)
):
    """
    Get prediction history.
    Returns empty list if user is not authenticated (public access).
    """
    if not user:
        # Return empty history for unauthenticated users
        return {
            "predictions": [],
            "total": 0,
            "limit": limit,
            "offset": offset
        }
    
    # Query predictions from database for authenticated users
    from backend.app.models import PredictionLog
    
    query = db.query(PredictionLog).filter(
        PredictionLog.user_id == user.id
    ).order_by(PredictionLog.created_at.desc())
    
    total = query.count()
    predictions = query.offset(offset).limit(limit).all()
    
    return {
        "predictions": [
            {
                "id": p.id,
                "patient_id": p.patient_id,
                "prediction": p.prediction,
                "confidence": p.confidence,
                "risk_level": p.risk_level,
                "risk_score": p.risk_score,
                "severity": p.severity,
                "image_url": p.image_url,
                "created_at": p.created_at.isoformat() if p.created_at else None,
            }
            for p in predictions
        ],
        "total": total,
        "limit": limit,
        "offset": offset
    }
