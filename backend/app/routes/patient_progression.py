from fastapi import APIRouter, Depends, UploadFile, File
from sqlalchemy.orm import Session
from app.database import get_db
from app.services.progression_service import analyze_progression, add_ulcer_image, get_patient_timeline
from app.services.image_service import upload_image
from app.services.inference_service import run_inference
from app.auth.dependencies import get_current_user
from app.models import User
from app.services.patient_service import get_patient

router = APIRouter(prefix="/patients", tags=["progression"])

@router.post("/{patient_id}/upload-image")
async def upload_patient_image(patient_id: int, file: UploadFile = File(...), age: int = None, bmi: float = None, diabetes_duration: int = None, infection_signs: str = "none", user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    patient = get_patient(db=db, patient_id=patient_id)
    if not patient or patient.user_id != user.id:
        return {"error": "Patient not found"}
    
    image_data = await upload_image(file)
    image_url = image_data["url"]
    
    result = run_inference(
        image_url=image_url,
        age=age or patient.age,
        bmi=bmi or patient.bmi,
        diabetes_duration=diabetes_duration or patient.diabetes_duration,
        infection_signs=infection_signs or patient.infection_signs
    )
    
    ulcer_image = add_ulcer_image(
        db=db,
        patient_id=patient_id,
        image_url=image_url,
        prediction=result["prediction"],
        confidence=result["confidence"],
        ulcer_area=result["affected_area"]
    )
    
    return {
        "image": ulcer_image,
        "prediction": result["prediction"],
        "confidence": result["confidence"]
    }

@router.get("/{patient_id}/timeline")
def get_patient_timeline_endpoint(patient_id: int, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    patient = get_patient(db=db, patient_id=patient_id)
    if not patient or patient.user_id != user.id:
        return {"error": "Patient not found"}
    
    timeline = get_patient_timeline(db=db, patient_id=patient_id)
    return timeline

@router.get("/{patient_id}/progression")
def get_progression_endpoint(patient_id: int, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    patient = get_patient(db=db, patient_id=patient_id)
    if not patient or patient.user_id != user.id:
        return {"error": "Patient not found"}
    
    progression = analyze_progression(db=db, patient_id=patient_id)
    return progression
