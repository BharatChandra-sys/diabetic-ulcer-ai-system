from app.config import settings
import os
from typing import Tuple, List

def validate_image_extension(filename: str) -> bool:
    _, ext = os.path.splitext(filename.lower())
    return ext in settings.allowed_image_extensions

def validate_image_size(file_size_bytes: int) -> bool:
    max_bytes = settings.max_image_size_mb * 1024 * 1024
    return file_size_bytes <= max_bytes

def validate_clinical_data(age: int, bmi: float, diabetes_duration: int) -> bool:
    if age < 0 or age > 150:
        return False
    if bmi < 10 or bmi > 60:
        return False
    if diabetes_duration < 0 or diabetes_duration > 100:
        return False
    return True

def validate_infection_signs(infection_signs: str) -> bool:
    valid_signs = ["none", "mild", "moderate", "severe"]
    return infection_signs.lower() in valid_signs


class InputValidator:
    """Validate input data."""

    MAX_IMAGE_SIZE = 4096

    @staticmethod
    def validate_confidence_score(score: float) -> Tuple[bool, str]:
        """Validate confidence score."""
        if score < 0 or score > 1:
            return False, "Confidence score must be between 0 and 1"
        return True, "Valid"
    
    @staticmethod
    def validate_numeric_range(
        value: float,
        min_val: float,
        max_val: float,
        field_name: str
    ) -> Tuple[bool, str]:
        """
        Validate numeric range.
        
        Args:
            value: Value to validate
            min_val: Minimum allowed value
            max_val: Maximum allowed value
            field_name: Field name for error message
        
        Returns:
            Tuple of (is_valid, message)
        """
        if value < min_val or value > max_val:
            return False, f"{field_name} must be between {min_val} and {max_val}"
        return True, "Valid"
    
    @staticmethod
    def validate_required_fields(
        data: dict,
        required_fields: List[str]
    ) -> Tuple[bool, str]:
        """
        Validate required fields.
        
        Args:
            data: Data dictionary
            required_fields: List of required field names
        
        Returns:
            Tuple of (is_valid, message)
        """
        missing = [field for field in required_fields if field not in data or data[field] is None]
        
        if missing:
            return False, f"Missing required fields: {', '.join(missing)}"
        
        return True, "Valid"


class ModelOutputValidator:
    """Validate model outputs."""
    
    @staticmethod
    def validate_prediction_output(output: dict) -> Tuple[bool, str]:
        """
        Validate prediction output.
        
        Args:
            output: Prediction dictionary
        
        Returns:
            Tuple of (is_valid, message)
        """
        required_keys = {"predicted_class", "confidence"}
        
        if not all(key in output for key in required_keys):
            return False, f"Missing required keys: {required_keys}"
        
        # Validate confidence
        if not isinstance(output["confidence"], (int, float)):
            return False, "Confidence must be numeric"
        
        if output["confidence"] < 0 or output["confidence"] > 1:
            return False, "Confidence must be between 0 and 1"
        
        return True, "Valid"
    
    @staticmethod
    def validate_segmentation_output(
        mask: object,
        expected_shape: Tuple
    ) -> Tuple[bool, str]:
        """
        Validate segmentation output.
        
        Args:
            mask: Segmentation mask
            expected_shape: Expected shape
        
        Returns:
            Tuple of (is_valid, message)
        """
        if mask.shape != expected_shape:
            return False, f"Shape mismatch. Expected {expected_shape}, got {mask.shape}"
        
        # Check value range
        if mask.min() < 0 or mask.max() > 1:
            return False, "Mask values must be between 0 and 1"
        
        return True, "Valid"


def validate_input(data: dict, schema: type) -> Tuple[bool, str]:
    """Validate input against schema."""
    try:
        schema(**data)
        return True, "Valid"
    except Exception as e:
        return False, str(e)
