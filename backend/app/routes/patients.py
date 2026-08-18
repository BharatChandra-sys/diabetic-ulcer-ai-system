from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas import PatientCreate, PatientResponse
from app.services.patient_service import create_patient, get_user_patients, get_patient, delete_patient
from app.auth.dependencies import get_current_user
from app.models import User

router = APIRouter(prefix="/patients", tags=["patients"])

@router.post("/", response_model=PatientResponse)
def create_patient_endpoint(patient: PatientCreate, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return create_patient(db=db, user_id=user.id, patient=patient)

@router.get("/")
def list_patients(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    patients = get_user_patients(db=db, user_id=user.id)
    return patients

@router.get("/{patient_id}", response_model=PatientResponse)
def get_patient_endpoint(patient_id: int, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    patient = get_patient(db=db, patient_id=patient_id)
    if patient and patient.user_id == user.id:
        return patient
    else:
        return {"error": "Patient not found"}

@router.delete("/{patient_id}")
def delete_patient_endpoint(patient_id: int, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    patient = get_patient(db=db, patient_id=patient_id)
    if patient and patient.user_id == user.id:
        delete_patient(db=db, patient_id=patient_id)
        return {"message": "Patient deleted"}
    else:
        return {"error": "Patient not found"}
