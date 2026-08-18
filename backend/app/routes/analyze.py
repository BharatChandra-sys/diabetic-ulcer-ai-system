from fastapi import APIRouter, Depends, UploadFile, File, Form, HTTPException
from sqlalchemy.orm import Session
from typing import Optional
from app.database import get_db
from app.auth.dependencies import optional_auth
from app.models import User
import os
import uuid
from datetime import datetime
import logging

logger = logging.getLogger(__name__)

# Import the appropriate inference service based on environment
USE_REMOTE_ML = bool(os.getenv("HUGGINGFACE_ML_URL"))

if USE_REMOTE_ML:
    from app.services.remote_ml_service import run_inference_remote as run_inference_async
    logger.info("✓ Using REMOTE ML inference (Hugging Face)")
else:
    from app.services.inference_service import run_inference as run_inference_sync
    logger.info("✓ Using LOCAL ML inference (PyTorch)")

router = APIRouter(prefix="/predictions", tags=["predictions"])

# In-memory storage for demo results (replace with database in production)
_scan_results_cache = {}


@router.post("/analyze")
async def analyze_foot_scan(
    image: UploadFile = File(...),
    age: Optional[int] = Form(35),
    bmi: Optional[float] = Form(25.0),
    diabetes_duration: Optional[int] = Form(5),
    infection_signs: Optional[str] = Form("none"),
    save_to_history: bool = Form(False),
    user: Optional[User] = Depends(optional_auth),
    db: Session = Depends(get_db)
):
    """
    Analyze a foot scan image using AI model with full explainability.
    Works for both authenticated and guest users.
    Only saves to history if user is authenticated and save_to_history=True.
    """
    
    # Save uploaded file
    upload_dir = "backend/uploads"
    os.makedirs(upload_dir, exist_ok=True)
    
    file_extension = os.path.splitext(image.filename)[1]
    unique_filename = f"{uuid.uuid4()}{file_extension}"
    file_path = os.path.join(upload_dir, unique_filename)
    
    # Save file to disk
    try:
        with open(file_path, "wb") as f:
            content = await image.read()
            f.write(content)
        logger.info(f"Saved uploaded image to {file_path}")
    except Exception as e:
        logger.error(f"Failed to save uploaded file: {e}")
        raise HTTPException(status_code=500, detail="Failed to save uploaded image")
    
    # Run AI inference (local or remote based on configuration)
    try:
        if USE_REMOTE_ML:
            # Call remote Hugging Face ML service (async)
            result = await run_inference_async(
                image_url=file_path,
                age=age or 35,
                bmi=bmi or 25.0,
                diabetes_duration=diabetes_duration or 5,
                infection_signs=infection_signs or "none"
            )
            logger.info(f"Remote ML inference completed: {result['prediction']} with {result['confidence']:.2f} confidence")
        else:
            # Run local PyTorch inference (sync)
            result = run_inference_sync(
                image_url=file_path,
                age=age or 35,
                bmi=bmi or 25.0,
                diabetes_duration=diabetes_duration or 5,
                infection_signs=infection_signs or "none"
            )
            logger.info(f"Local ML inference completed: {result['prediction']} with {result['confidence']:.2f} confidence")
        
        logger.info(f"GradCAM overlay generated: {'Yes' if result.get('gradcam_overlay') else 'No'}")
        logger.info(f"SHAP importance keys: {list(result.get('shap_importance', {}).keys())}")
    except Exception as e:
        logger.error(f"Inference failed: {e}")
        raise HTTPException(status_code=500, detail=f"AI analysis failed: {str(e)}")
    
    # Create result ID and format response
    result_id = str(uuid.uuid4())
    image_url = f"http://localhost:8000/uploads/{unique_filename}"
    
    analysis_result = {
        "id": result_id,
        "prediction": result["prediction"],
        "confidence": result["confidence"],
        "risk_level": result["risk_level"],
        "risk_score": result["risk_score"],
        "severity": result["severity"],
        "affected_area": result["affected_area"],
        "image_url": image_url,
        "heatmap_url": result.get("gradcam_overlay"),  # Frontend expects heatmap_url
        "gradcam_heatmap": result.get("gradcam_heatmap"),
        "gradcam_overlay": result.get("gradcam_overlay"),
        "segmentation_mask": result.get("segmentation_mask"),
        "shap_importance": result.get("shap_importance", {}),
        "lime_importance": result.get("lime_importance", {}),
        "recommendations": result["recommendations"],
        "explanation_text": result["explanation_text"],
        "lime_explanation": result.get("lime_explanation", ""),
        "analyzed_at": datetime.utcnow().isoformat(),
        "inference_time": result.get("inference_time", 0)
    }
    
    # Store in cache for retrieval
    _scan_results_cache[result_id] = analysis_result
    
    # Save to history if user is logged in and requested
    if user and save_to_history:
        try:
            from app.models import PredictionLog
            
            prediction_log = PredictionLog(
                user_id=user.id,
                prediction=analysis_result["prediction"],
                confidence=analysis_result["confidence"],
                risk_level=analysis_result["risk_level"],
                risk_score=analysis_result["risk_score"],
                severity=analysis_result["severity"],
                image_url=image_url,
                explanation_text=analysis_result["explanation_text"]
            )
            
            db.add(prediction_log)
            db.commit()
            db.refresh(prediction_log)
            
            analysis_result["saved_to_history"] = True
            analysis_result["history_id"] = prediction_log.id
            logger.info(f"Saved prediction to history for user {user.id}")
        except Exception as e:
            logger.error(f"Error saving to history: {e}")
            analysis_result["saved_to_history"] = False
    else:
        analysis_result["saved_to_history"] = False
        if not user:
            analysis_result["message"] = "Sign in to save your scan history"
    
    return analysis_result


@router.get("/{prediction_id}")
async def get_prediction_result(
    prediction_id: str,
    user: Optional[User] = Depends(optional_auth),
    db: Session = Depends(get_db)
):
    """
    Get a specific prediction result by ID.
    Checks cache first, then database if user is authenticated.
    """
    
    # Check in-memory cache first
    if prediction_id in _scan_results_cache:
        logger.info(f"Retrieved prediction {prediction_id} from cache")
        return _scan_results_cache[prediction_id]
    
    # If user is authenticated, check database
    if user:
        from app.models import PredictionLog
        
        prediction = db.query(PredictionLog).filter(
            PredictionLog.id == prediction_id,
            PredictionLog.user_id == user.id
        ).first()
        
        if prediction:
            logger.info(f"Retrieved prediction {prediction_id} from database")
            return {
                "id": str(prediction.id),
                "prediction": prediction.prediction,
                "confidence": prediction.confidence,
                "risk_level": prediction.risk_level,
                "risk_score": prediction.risk_score,
                "severity": prediction.severity,
                "image_url": prediction.image_url,
                "explanation_text": prediction.explanation_text,
                "analyzed_at": prediction.created_at.isoformat() if prediction.created_at else None,
                "saved_to_history": True,
                "recommendations": [],  # Not stored in DB, return empty
                "shap_importance": {},  # Not stored in DB
                "lime_importance": {}   # Not stored in DB
            }
    
    # Not found
    logger.warning(f"Prediction {prediction_id} not found in cache or database")
    from fastapi import HTTPException
    raise HTTPException(status_code=404, detail="Prediction not found")
