from sqlalchemy.orm import Session
from app.models import PredictionLog, User
from datetime import datetime

def generate_prediction_report(db: Session, user_id: int, patient_id: int = None):
    query = db.query(PredictionLog).filter(PredictionLog.user_id == user_id)
    if patient_id:
        query = query.filter(PredictionLog.patient_id == patient_id)
    
    logs = query.all()
    
    total_predictions = len(logs)
    ulcer_predictions = sum(1 for log in logs if log.prediction == "ulcer")
    normal_predictions = sum(1 for log in logs if log.prediction == "normal")
    
    avg_confidence = sum(log.confidence for log in logs) / len(logs) if logs else 0
    
    report = {
        "total_predictions": total_predictions,
        "ulcer_predictions": ulcer_predictions,
        "normal_predictions": normal_predictions,
        "average_confidence": avg_confidence,
        "ulcer_percentage": (ulcer_predictions / total_predictions * 100) if total_predictions > 0 else 0,
        "report_generated_at": datetime.utcnow()
    }
    
    return report

def save_prediction_log(db: Session, user_id: int, patient_id: int = None, prediction: str = "", confidence: float = 0, risk_score: float = 0, risk_level: str = "Low", severity: str = "None", explanation_text: str = "", image_url: str = ""):
    log = PredictionLog(
        user_id=user_id,
        patient_id=patient_id,
        prediction=prediction,
        confidence=confidence,
        risk_score=risk_score,
        risk_level=risk_level,
        severity=severity,
        explanation_text=explanation_text,
        image_url=image_url
    )
    db.add(log)
    db.commit()
    db.refresh(log)
    return log
