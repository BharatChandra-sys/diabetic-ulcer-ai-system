from fastapi import APIRouter, UploadFile, File, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.services.image_service import upload_image
from app.auth.dependencies import get_current_user
from app.models import User

router = APIRouter(prefix="", tags=["images"])

@router.post("/upload")
async def upload_image_endpoint(file: UploadFile = File(...), user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    result = await upload_image(file)
    return result
