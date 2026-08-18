"""Model loading utilities."""

import torch
import logging
from pathlib import Path
from typing import Union, Optional
from app.ml_models.cnn_ulcer_model import CNNUlcerModel, create_cnn_model
from app.ml_models.segmentation_model import create_segmentation_model
from app.ml_models.multimodal_model import MultimodalModel, create_multimodal_model
from app.core.settings import settings

logger = logging.getLogger(__name__)

# Device configuration
DEVICE = torch.device("cuda" if torch.cuda.is_available() else "cpu")


class ModelLoader:
    """Utility class for loading and managing models."""
    
    _cnn_model: Optional[CNNUlcerModel] = None
    _segmentation_model: Optional[torch.nn.Module] = None
    _multimodal_model: Optional[MultimodalModel] = None
    
    @classmethod
    def load_cnn_model(cls, path: Optional[str] = None) -> CNNUlcerModel:
        """
        Load or retrieve CNN model.
        
        Args:
            path: Path to model weights. If None, uses default from settings.
        
        Returns:
            Loaded CNN model
        """
        if cls._cnn_model is not None:
            return cls._cnn_model
        
        if path is None:
            path = settings.cnn_model_path
        
        try:
            model = create_cnn_model()
            
            # Load weights if file exists
            if Path(path).exists():
                checkpoint = torch.load(path, map_location=DEVICE)
                if isinstance(checkpoint, dict) and "model_state_dict" in checkpoint:
                    model.load_state_dict(checkpoint["model_state_dict"])
                else:
                    model.load_state_dict(checkpoint)
                logger.info(f"Loaded CNN model weights from {path}")
            else:
                logger.warning(f"CNN model weights not found at {path}. Using random initialization.")
            
            model = model.to(DEVICE)
            model.eval()
            cls._cnn_model = model
            
            return model
        
        except Exception as e:
            logger.error(f"Error loading CNN model: {str(e)}")
            raise
    
    @classmethod
    def load_segmentation_model(cls, path: Optional[str] = None) -> torch.nn.Module:
        """
        Load or retrieve segmentation model.
        
        Args:
            path: Path to model weights
        
        Returns:
            Loaded segmentation model
        """
        if cls._segmentation_model is not None:
            return cls._segmentation_model
        
        if path is None:
            path = settings.segmentation_model_path
        
        try:
            model = create_segmentation_model()
            
            if Path(path).exists():
                checkpoint = torch.load(path, map_location=DEVICE)
                if isinstance(checkpoint, dict) and "model_state_dict" in checkpoint:
                    model.load_state_dict(checkpoint["model_state_dict"])
                else:
                    model.load_state_dict(checkpoint)
                logger.info(f"Loaded segmentation model weights from {path}")
            else:
                logger.warning(f"Segmentation model weights not found at {path}")
            
            model = model.to(DEVICE)
            model.eval()
            cls._segmentation_model = model
            
            return model
        
        except Exception as e:
            logger.error(f"Error loading segmentation model: {str(e)}")
            raise
    
    @classmethod
    def load_multimodal_model(cls, path: Optional[str] = None) -> MultimodalModel:
        """
        Load or retrieve multimodal model.
        
        Args:
            path: Path to model weights
        
        Returns:
            Loaded multimodal model
        """
        if cls._multimodal_model is not None:
            return cls._multimodal_model
        
        if path is None:
            path = settings.multimodal_model_path
        
        try:
            model = create_multimodal_model()
            
            if Path(path).exists():
                checkpoint = torch.load(path, map_location=DEVICE)
                if isinstance(checkpoint, dict) and "model_state_dict" in checkpoint:
                    model.load_state_dict(checkpoint["model_state_dict"])
                else:
                    model.load_state_dict(checkpoint)
                logger.info(f"Loaded multimodal model weights from {path}")
            else:
                logger.warning(f"Multimodal model weights not found at {path}")
            
            model = model.to(DEVICE)
            model.eval()
            cls._multimodal_model = model
            
            return model
        
        except Exception as e:
            logger.error(f"Error loading multimodal model: {str(e)}")
            raise
    
    @classmethod
    def clear_cache(cls):
        """Clear cached models."""
        cls._cnn_model = None
        cls._segmentation_model = None
        cls._multimodal_model = None
        logger.info("Model cache cleared")


# Convenience functions
def get_cnn_model() -> CNNUlcerModel:
    """Get CNN model instance."""
    return ModelLoader.load_cnn_model()


def get_segmentation_model() -> torch.nn.Module:
    """Get segmentation model instance."""
    return ModelLoader.load_segmentation_model()


def get_multimodal_model() -> MultimodalModel:
    """Get multimodal model instance."""
    return ModelLoader.load_multimodal_model()
