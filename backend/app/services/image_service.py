from fastapi import UploadFile, HTTPException
from app.utils.cloud_storage import upload_image_to_cloud, delete_image_from_cloud
from app.utils.validators import validate_image_extension, validate_image_size
import uuid
import os

UPLOAD_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)

async def upload_image(file: UploadFile):
    if not validate_image_extension(file.filename):
        raise HTTPException(status_code=400, detail="Invalid image format")
    
    file_content = await file.read()
    
    if not validate_image_size(len(file_content)):
        raise HTTPException(status_code=413, detail="File too large")
    
    unique_filename = f"{uuid.uuid4()}_{file.filename}"
    
    # Save locally
    filepath = os.path.join(UPLOAD_DIR, unique_filename)
    with open(filepath, "wb") as f:
        f.write(file_content)
    
    image_url = f"/uploads/{unique_filename}"
    
    return {
        "filename": unique_filename,
        "url": image_url,
        "size": len(file_content)
    }

def delete_image(image_url: str):
    if image_url.startswith("local://"):
        return True
    
    public_id = image_url.split("/")[-1].split(".")[0]
    return delete_image_from_cloud(public_id)

def process_uploaded_image(image_url: str):
    meta = {
        "url": image_url,
        "uploaded_at": __import__('datetime').datetime.utcnow()
    }
    return meta
