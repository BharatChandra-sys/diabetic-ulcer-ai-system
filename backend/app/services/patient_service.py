from sqlalchemy.orm import Session
from app.models import Patient, User
from app.schemas import PatientCreate, PatientResponse

def create_patient(db: Session, user_id: int, patient: PatientCreate):
    db_patient = Patient(
        user_id=user_id,
        patient_identifier=patient.patient_identifier,
        age=patient.age,
        bmi=patient.bmi,
        diabetes_duration=patient.diabetes_duration,
        infection_signs=patient.infection_signs
    )
    db.add(db_patient)
    db.commit()
    db.refresh(db_patient)
    return db_patient

def get_patient(db: Session, patient_id: int):
    return db.query(Patient).filter(Patient.id == patient_id).first()

def get_user_patients(db: Session, user_id: int):
    return db.query(Patient).filter(Patient.user_id == user_id).all()

def delete_patient(db: Session, patient_id: int):
    patient = get_patient(db, patient_id)
    if patient:
        db.delete(patient)
        db.commit()
    return patient
