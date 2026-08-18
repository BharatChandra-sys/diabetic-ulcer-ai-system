import cloudinary
import cloudinary.uploader
from app.config import settings
from PIL import Image
import io

cloudinary.config(
    cloud_name=settings.cloudinary_cloud_name,
    api_key=settings.cloudinary_api_key,
    api_secret=settings.cloudinary_api_secret
)

def upload_image_to_cloud(file_content: bytes, filename: str) -> str:
    if not settings.cloudinary_cloud_name:
        return f"local://{filename}"
    
    try:
        result = cloudinary.uploader.upload(
            file_content,
            public_id=filename,
            folder="ulcer_images",
            resource_type="auto"
        )
        return result.get("secure_url", result.get("url"))
    except Exception as e:
        print(f"Error uploading to Cloudinary: {e}")
        return f"local://{filename}"

def delete_image_from_cloud(public_id: str) -> bool:
    if not settings.cloudinary_cloud_name:
        return True
    
    try:
        result = cloudinary.uploader.destroy(f"ulcer_images/{public_id}")
        return result.get("result") == "ok"
    except Exception as e:
        print(f"Error deleting from Cloudinary: {e}")
        return False

def generate_thumbnail_url(image_url: str, width: int = 200, height: int = 200) -> str:
    if image_url.startswith("local://"):
        return image_url
    
    if "cloudinary" in image_url:
        base = image_url.rsplit("/", 1)[0]
        filename = image_url.rsplit("/", 1)[1]
        return f"{base}/w_{width},h_{height},c_fill/{filename}"
    
    return image_url
