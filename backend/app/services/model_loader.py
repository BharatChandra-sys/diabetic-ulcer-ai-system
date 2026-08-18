import torch
import os
from app.ml.cnn_model import create_model
from app.ml.multimodal_model import create_multimodal_model
from app.config import settings
import logging

logger = logging.getLogger(__name__)

_cnn_model = None
_multimodal_model = None
_segmentation_model = None

def load_cnn_model():
    global _cnn_model
    
    if _cnn_model is not None:
        return _cnn_model
    
    model = create_model(num_classes=2, pretrained=True)
    
    # Build list of checkpoint paths to try (with multiple fallbacks)
    base_dir = os.path.dirname(os.path.dirname(os.path.dirname(__file__)))  # Get repo root
    models_dir = os.path.join(base_dir, "models")
    
    checkpoint_paths = [
        # Try the configured path first
        settings.cnn_model_path,
        # Try models directory with standard names
        os.path.join(models_dir, "best_dfu_model.pth"),
        os.path.join(models_dir, "cnn_ulcer_model.pth"),
        # Try model_weights directory (legacy)
        os.path.join(base_dir, "model_weights", "best_dfu_model.pth"),
        os.path.join(base_dir, "model_weights", "cnn_ulcer_model.pth"),
    ]
    
    logger.info(f"CNN Model Root Directory: {models_dir}")
    logger.info(f"CNN Model paths to try: {checkpoint_paths}")
    
    loaded = False
    for path in checkpoint_paths:
        # Convert relative paths to absolute
        if not os.path.isabs(path):
            path = os.path.abspath(path)
        
        logger.info(f"Checking path: {path} | Exists: {os.path.exists(path)}")
        
        if os.path.exists(path):
            try:
                checkpoint = torch.load(path, map_location='cpu')
                model.load_state_dict(checkpoint)
                logger.info(f"✓ Successfully loaded CNN model from {path}")
                loaded = True
                break
            except Exception as e:
                logger.warning(f"Could not load checkpoint from {path}: {e}")
    
    if not loaded:
        logger.warning("⚠ No CNN checkpoint found, using ImageNet pretrained weights (model accuracy may be affected)")
        logger.info(f"To fix: Train model with: python train_dfu_model.py")
    
    device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
    model = model.to(device)
    model.eval()
    
    _cnn_model = model
    return model

def load_multimodal_model():
    global _multimodal_model
    
    if _multimodal_model is not None:
        return _multimodal_model
    
    model = create_multimodal_model(image_feature_dim=2048, num_clinical_features=4, num_classes=2)
    
    device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
    model = model.to(device)
    model.eval()
    
    _multimodal_model = model
    return model

def load_segmentation_model():
    """Load or retrieve the segmentation model."""
    global _segmentation_model
    
    if _segmentation_model is not None:
        return _segmentation_model
    
    try:
        from app.ml.segmentation_model import create_segmentation_model
        
        model = create_segmentation_model(num_classes=2)
        
        if os.path.exists(settings.segmentation_model_path):
            try:
                checkpoint = torch.load(settings.segmentation_model_path, map_location='cpu')
                model.load_state_dict(checkpoint)
                logger.info(f"Loaded segmentation model weights from {settings.segmentation_model_path}")
            except Exception as e:
                logger.warning(f"Could not load segmentation model checkpoint: {e}")
        else:
            logger.warning(f"Segmentation model weights not found at {settings.segmentation_model_path}")
        
        device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
        model = model.to(device)
        model.eval()
        
        _segmentation_model = model
        return model
    except Exception as e:
        logger.error(f"Error loading segmentation model: {e}")
        return None

def get_model(model_type: str = "cnn"):
    if model_type == "cnn":
        return load_cnn_model()
    elif model_type == "multimodal":
        return load_multimodal_model()
    elif model_type == "segmentation":
        return load_segmentation_model()
    else:
        return load_cnn_model()

def get_segmentation_model():
    """Get segmentation model instance."""
    return load_segmentation_model()
