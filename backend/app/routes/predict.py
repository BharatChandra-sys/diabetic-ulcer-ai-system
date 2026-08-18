from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas import PredictionRequest, PredictionResponse
from app.services.inference_service import run_inference
from app.services.report_service import save_prediction_log
from app.auth.dependencies import get_current_user
from app.models import User
from app.monitoring.metrics import track_prediction, track_inference_time
import time

router = APIRouter(prefix="/predict", tags=["prediction"])

@router.post("", response_model=PredictionResponse)
async def predict(request: PredictionRequest, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    start_time = time.time()
    
    result = run_inference(
        image_url=request.image_url,
        age=request.age,
        bmi=request.bmi,
        diabetes_duration=request.diabetes_duration,
        infection_signs=request.infection_signs
    )
    
    inference_time = time.time() - start_time
    track_prediction("multimodal")
    track_inference_time("multimodal", inference_time)
    
    save_prediction_log(
        db=db,
        user_id=user.id,
        patient_id=request.patient_id,
        prediction=result["prediction"],
        confidence=result["confidence"],
        risk_score=result["risk_score"],
        risk_level=result["risk_level"],
        severity=result["severity"],
        explanation_text=result["explanation_text"],
        image_url=request.image_url
    )
    
    return PredictionResponse(
        prediction=result["prediction"],
        confidence=result["confidence"],
        risk_score=result["risk_score"],
        risk_level=result["risk_level"],
        severity=result["severity"],
        affected_area=result["affected_area"],
        explanation_text=result["explanation_text"],
        lime_explanation=result.get("lime_explanation", ""),
        recommendations=result["recommendations"],
        gradcam_heatmap=result.get("gradcam_heatmap"),
        gradcam_overlay=result.get("gradcam_overlay"),
        segmentation_mask=result.get("segmentation_mask"),
        shap_importance=result["shap_importance"],
        lime_importance=result.get("lime_importance"),
        image_url=result["image_url"]
    )
