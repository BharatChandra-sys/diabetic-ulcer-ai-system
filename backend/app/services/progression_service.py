from sqlalchemy.orm import Session
from app.models import UlcerImage
from app.schemas import PatientProgressionResponse

def get_patient_timeline(db: Session, patient_id: int):
    images = db.query(UlcerImage).filter(UlcerImage.patient_id == patient_id).order_by(UlcerImage.created_at).all()
    return images

def analyze_progression(db: Session, patient_id: int):
    images = get_patient_timeline(db, patient_id)
    
    if len(images) < 2:
        return PatientProgressionResponse(
            trend="insufficient_data",
            previous_area=0.0,
            latest_area=0.0,
            percentage_change=0.0,
            total_images=len(images)
        )
    
    previous_area = images[-2].ulcer_area
    latest_area = images[-1].ulcer_area
    
    if previous_area == 0:
        percentage_change = 0
    else:
        percentage_change = ((latest_area - previous_area) / previous_area) * 100
    
    if percentage_change < -5:
        trend = "healing"
    elif percentage_change > 5:
        trend = "worsening"
    else:
        trend = "stable"
    
    return PatientProgressionResponse(
        trend=trend,
        previous_area=previous_area,
        latest_area=latest_area,
        percentage_change=percentage_change,
        total_images=len(images)
    )

def add_ulcer_image(db: Session, patient_id: int, image_url: str, prediction: str, confidence: float, ulcer_area: float):
    ulcer_image = UlcerImage(
        patient_id=patient_id,
        image_url=image_url,
        prediction=prediction,
        confidence=confidence,
        ulcer_area=ulcer_area
    )
    db.add(ulcer_image)
    db.commit()
    db.refresh(ulcer_image)
    return ulcer_image
