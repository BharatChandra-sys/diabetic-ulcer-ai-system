from fastapi import APIRouter, Query, Depends, HTTPException
from fastapi.responses import FileResponse, StreamingResponse
from sqlalchemy.orm import Session
from app.database import get_db
from app.services.report_service import generate_prediction_report
from app.services.pdf_service import generate_prediction_report_pdf, generate_patient_analysis_pdf
from app.auth.dependencies import get_current_user
from app.models import User, PredictionLog, Patient
import io
from datetime import datetime

router = APIRouter(prefix="/reports", tags=["reports"])

@router.get("/predictions")
def get_prediction_report(patient_id: int = Query(None), user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    report = generate_prediction_report(db=db, user_id=user.id, patient_id=patient_id)
    return report


@router.get("/export-pdf/{prediction_id}")
def export_prediction_pdf(
    prediction_id: int,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Export a single prediction as PDF."""
    prediction = db.query(PredictionLog).filter(
        PredictionLog.id == prediction_id,
        PredictionLog.user_id == user.id
    ).first()
    
    if not prediction:
        raise HTTPException(status_code=404, detail="Prediction not found")
    
    patient = db.query(Patient).filter(Patient.id == prediction.patient_id).first() if prediction.patient_id else None
    
    prediction_data = {
        "prediction": prediction.prediction,
        "confidence": prediction.confidence,
        "risk_score": prediction.risk_score,
        "risk_level": prediction.risk_level,
        "severity": prediction.severity,
        "affected_area": 0.0,  # Would be stored in future schema version
        "explanation_text": prediction.explanation_text or "",
        "recommendations": [],  # Would be derived from risk_level or stored separately
        "shap_importance": {}
    }
    
    patient_info = None
    if patient:
        patient_info = {
            "patient_id": patient.id,
            "age": patient.age,
            "bmi": patient.bmi,
            "diabetes_duration": patient.diabetes_duration,
            "infection_signs": patient.infection_signs
        }
    
    pdf_bytes = generate_prediction_report_pdf(prediction_data, patient_info)
    
    if not pdf_bytes:
        raise HTTPException(status_code=500, detail="Failed to generate PDF")
    
    return StreamingResponse(
        io.BytesIO(pdf_bytes),
        media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename=prediction_{prediction_id}_{datetime.utcnow().strftime('%Y%m%d_%H%M%S')}.pdf"}
    )


@router.get("/export-patient-pdf/{patient_id}")
def export_patient_analysis_pdf(
    patient_id: int,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Export all analyses for a patient as PDF."""
    patient = db.query(Patient).filter(
        Patient.id == patient_id,
        Patient.user_id == user.id
    ).first()
    
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")
    
    predictions = db.query(PredictionLog).filter(
        PredictionLog.patient_id == patient_id,
        PredictionLog.user_id == user.id
    ).order_by(PredictionLog.created_at.desc()).all()
    
    analyses = [
        {
            "timestamp": p.created_at.isoformat() if p.created_at else "",
            "prediction": p.prediction,
            "confidence": p.confidence,
            "risk_level": p.risk_level
        }
        for p in predictions
    ]
    
    pdf_bytes = generate_patient_analysis_pdf(patient.id, patient.patient_identifier, analyses)
    
    if not pdf_bytes:
        raise HTTPException(status_code=500, detail="Failed to generate PDF")
    
    return StreamingResponse(
        io.BytesIO(pdf_bytes),
        media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename=patient_{patient_id}_analysis_{datetime.utcnow().strftime('%Y%m%d_%H%M%S')}.pdf"}
    )

