import os
import logging
from typing import Optional
from pydantic import Field, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict

logger = logging.getLogger(__name__)

# Determine base directory
BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
ROOT_ENV_FILE = os.path.join(BASE_DIR, ".env")

class Settings(BaseSettings):
    """
    Application settings using pydantic-settings.
    Loads from:
    1. Environment variables (highest priority)
    2. .env file in project root (local development)
    3. Default values (fallback)
    """
    
    # Application
    app_name: str = Field(default="Diabetic Ulcer Detection API", description="Application name")
    debug: bool = Field(default=False, description="Debug mode")
    environment: str = Field(default="development", description="Environment: development, production, staging")
    
    # Database
    database_url: str = Field(
        default="sqlite:///./medvision.db",
        description="Database connection URL"
    )
    
    # JWT Authentication
    jwt_secret_key: str = Field(
        default="your-secret-key-change-in-production",
        alias="SECRET_KEY",
        description="JWT secret key for token signing"
    )
    jwt_algorithm: str = Field(
        default="HS256",
        alias="ALGORITHM",
        description="JWT algorithm"
    )
    access_token_expire_minutes: int = Field(
        default=30,
        alias="JWT_ACCESS_TOKEN_EXPIRE_MINUTES",
        description="JWT token expiration in minutes"
    )
    
    # Cloudinary (optional)
    cloudinary_cloud_name: str = Field(default="", description="Cloudinary cloud name")
    cloudinary_api_key: str = Field(default="", description="Cloudinary API key")
    cloudinary_api_secret: str = Field(default="", description="Cloudinary API secret")
    
    # ML Model Paths (with safe defaults)
    cnn_model_path: str = Field(
        default="backend/models/best_dfu_model.pth",
        description="Path to CNN model weights"
    )
    segmentation_model_path: str = Field(
        default="backend/models/segmentation_model.pth",
        description="Path to segmentation model weights"
    )
    multimodal_model_path: str = Field(
        default="backend/models/multimodal_model.pth",
        description="Path to multimodal model weights"
    )
    
    # Image Upload Settings
    allowed_image_extensions: list = Field(
        default=[".jpg", ".jpeg", ".png", ".bmp"],
        description="Allowed image file extensions"
    )
    max_image_size_mb: int = Field(default=10, description="Maximum image size in MB")
    
    # Email Configuration (SMTP) - Optional
    smtp_server: str = Field(default="smtp.gmail.com", description="SMTP server")
    smtp_port: int = Field(default=587, description="SMTP port")
    smtp_username: str = Field(default="", description="SMTP username")
    smtp_password: str = Field(default="", description="SMTP password")
    smtp_from_email: str = Field(default="noreply@diabeticulcer.com", description="From email address")
    smtp_from_name: str = Field(default="Diabetic Ulcer AI System", description="From name")
    
    # Frontend URL
    frontend_url: str = Field(
        default="http://localhost:3000",
        description="Frontend application URL for CORS and redirects"
    )
    
    # Firebase settings
    firebase_web_api_key: str = Field(
        default="",
        description="Firebase Web API Key for REST API authentication"
    )
    firebase_service_account_path: str = Field(
        default="backend/firebase-service-account.json",
        description="Path to Firebase service account JSON file"
    )
    
    # CORS Origins
    allowed_origins: str = Field(
        default="http://localhost:3000,http://localhost:5173",
        description="Comma-separated list of allowed CORS origins"
    )
    
    @field_validator("debug", mode="before")
    @classmethod
    def parse_debug(cls, v):
        """Parse debug flag from string or bool"""
        if isinstance(v, bool):
            return v
        if isinstance(v, str):
            return v.lower() in ("true", "1", "yes")
        return False
    
    @field_validator("cnn_model_path", "segmentation_model_path", "multimodal_model_path", mode="after")
    @classmethod
    def resolve_model_path(cls, v):
        """Convert relative paths to absolute paths"""
        if not os.path.isabs(v):
            return os.path.join(BASE_DIR, v)
        return v
    
    def get_cors_origins(self) -> list:
        """Parse CORS origins from comma-separated string"""
        if not self.allowed_origins or self.allowed_origins.strip() == "":
            logger.warning("⚠️  ALLOWED_ORIGINS is empty - allowing all origins")
            return ["*"]
        origins = self.allowed_origins.split(",")
        parsed = [origin.strip() for origin in origins if origin.strip()]
        logger.info(f"Parsed CORS origins: {parsed}")
        return parsed if parsed else ["*"]
    
    def validate_critical_settings(self):
        """Log warnings for missing critical settings (non-blocking)"""
        warnings = []
        
        if self.jwt_secret_key == "your-secret-key-change-in-production":
            warnings.append("⚠️  JWT_SECRET_KEY is using default value - CHANGE IN PRODUCTION!")
        
        if not self.database_url:
            warnings.append("⚠️  DATABASE_URL is not set - using default SQLite")
        
        # Check model files (non-blocking)
        model_paths = {
            "CNN Model": self.cnn_model_path,
            "Segmentation Model": self.segmentation_model_path,
            "Multimodal Model": self.multimodal_model_path,
        }
        
        for name, path in model_paths.items():
            if not os.path.exists(path):
                warnings.append(f"⚠️  {name} not found at {path} - will use pretrained weights")
        
        if warnings:
            logger.warning("Configuration warnings:")
            for warning in warnings:
                logger.warning(warning)
    
    model_config = SettingsConfigDict(
        env_file=ROOT_ENV_FILE if os.path.exists(ROOT_ENV_FILE) else None,
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
        populate_by_name=True,  # Allow using aliases
    )


# Initialize settings
try:
    settings = Settings()
    settings.validate_critical_settings()
    logger.info(f"✓ Settings loaded successfully (Environment: {settings.environment})")
except Exception as e:
    logger.error(f"❌ Error loading settings: {e}")
    # Fallback to defaults
    settings = Settings()
    logger.warning("Using default settings due to configuration error")
