"""
Remote ML Inference Service
Calls Hugging Face Spaces ML API instead of running models locally
"""
import httpx
import logging
import os
from typing import Dict, Any
from pathlib import Path

logger = logging.getLogger(__name__)

# Get Hugging Face ML service URL from environment
HUGGINGFACE_ML_URL = os.getenv("HUGGINGFACE_ML_URL", "").rstrip("/")

if not HUGGINGFACE_ML_URL:
    logger.warning("⚠️  HUGGINGFACE_ML_URL not set - remote ML inference will fail")
else:
    logger.info(f"✓ Remote ML service configured: {HUGGINGFACE_ML_URL}")


def calculate_risk_score(confidence, age, bmi, diabetes_duration, infection_signs, ulcer_area):
    """Calculate holistic risk score (0-100%) from model output + clinical data."""
    score = 0

    # Model confidence contributes up to 40 points
    if confidence > 0.5:
        score += confidence * 40

    # Age risk (up to 10 points)
    if age > 65:
        score += 10
    elif age > 50:
        score += 5

    # BMI risk (up to 10 points)
    if bmi > 35:
        score += 10
    elif bmi > 30:
        score += 7
    elif bmi > 25:
        score += 3

    # Diabetes duration (up to 15 points)
    if diabetes_duration > 20:
        score += 15
    elif diabetes_duration > 10:
        score += 10
    elif diabetes_duration > 5:
        score += 5

    # Infection (up to 15 points)
    infection_map = {"none": 0, "mild": 5, "moderate": 10, "severe": 15}
    score += infection_map.get(infection_signs.lower(), 0)

    # Ulcer area (up to 10 points)
    if ulcer_area > 20:
        score += 10
    elif ulcer_area > 10:
        score += 7
    elif ulcer_area > 5:
        score += 4

    return min(round(score, 1), 100)


def classify_risk_level(score):
    if score < 20:
        return "Low"
    elif score < 40:
        return "Moderate"
    elif score < 70:
        return "High"
    else:
        return "Very High"


def get_severity(confidence, ulcer_area):
    if confidence < 0.5:
        return "None"
    if ulcer_area > 15 or confidence > 0.9:
        return "Severe"
    if ulcer_area > 8 or confidence > 0.75:
        return "Moderate"
    return "Mild"


def generate_explanation(prediction, confidence, risk_score, risk_level,
                         age, bmi, diabetes_duration, infection_signs,
                         ulcer_area):
    """Generate natural language textual justification for the prediction."""
    lines = []

    if prediction == "ulcer":
        lines.append(
            f"The model detected a diabetic foot ulcer with {confidence*100:.1f}% confidence."
        )
    else:
        lines.append(
            f"The model classified this image as normal skin with {(1-confidence)*100:.1f}% confidence."
        )

    lines.append(f"Overall risk assessment: {risk_level} ({risk_score}%).")

    # Explain top contributing clinical factors
    factors = []
    if age > 60:
        factors.append(f"advanced age ({age} years)")
    if bmi > 30:
        factors.append(f"high BMI ({bmi})")
    if diabetes_duration > 10:
        factors.append(f"long diabetes duration ({diabetes_duration} years)")
    if infection_signs.lower() not in ("none", ""):
        factors.append(f"{infection_signs} infection signs")

    if factors:
        lines.append("Key clinical risk factors: " + ", ".join(factors) + ".")

    if prediction == "ulcer" and ulcer_area > 0:
        lines.append(f"Estimated affected area: {ulcer_area:.1f}%.")

    return " ".join(lines)


def get_recommendations(risk_level):
    """Return clinical recommendations based on risk level."""
    recs = {
        "Low": [
            "Continue routine foot care and hygiene",
            "Annual diabetic foot screening recommended"
        ],
        "Moderate": [
            "Increase foot monitoring frequency",
            "Schedule follow-up in 3-6 months",
            "Review blood sugar management with physician"
        ],
        "High": [
            "Intensive wound care protocol recommended",
            "Monthly professional foot assessments",
            "Consider specialist referral (podiatrist/wound care)",
            "Optimize glycemic control immediately"
        ],
        "Very High": [
            "Immediate specialist consultation required",
            "Intensive wound management and possible hospitalization",
            "Daily wound monitoring",
            "Urgent review of all medications and comorbidities"
        ]
    }
    return recs.get(risk_level, [])


async def call_remote_ml_api(image_path: str, age: int, bmi: float, 
                             diabetes_duration: int, infection_signs: str) -> Dict[str, Any]:
    """
    Call the remote Hugging Face ML service for inference.
    
    Args:
        image_path: Local path to the image file
        age: Patient age
        bmi: Patient BMI
        diabetes_duration: Years with diabetes
        infection_signs: Infection level ("none", "mild", "moderate", "severe")
    
    Returns:
        dict: ML prediction response from Hugging Face
    
    Raises:
        Exception: If the remote API call fails
    """
    
    if not HUGGINGFACE_ML_URL:
        raise Exception("HUGGINGFACE_ML_URL environment variable not set")
    
    # Prepare the image file
    try:
        with open(image_path, "rb") as f:
            image_bytes = f.read()
    except Exception as e:
        logger.error(f"Failed to read image {image_path}: {e}")
        raise Exception(f"Failed to read image: {str(e)}")
    
    # Prepare request
    url = f"{HUGGINGFACE_ML_URL}/predict-with-clinical"
    
    files = {
        "image": ("image.jpg", image_bytes, "image/jpeg")
    }
    
    # Convert infection_signs to boolean for API
    infection_bool = infection_signs.lower() not in ("none", "")
    
    data = {
        "age": age,
        "bmi": bmi,
        "diabetes_duration": diabetes_duration,
        "infection_signs": infection_bool
    }
    
    logger.info(f"Calling remote ML API: {url}")
    logger.info(f"Clinical data: age={age}, bmi={bmi}, duration={diabetes_duration}, infection={infection_signs}")
    
    try:
        async with httpx.AsyncClient(timeout=60.0) as client:
            response = await client.post(url, files=files, data=data)
            response.raise_for_status()
            result = response.json()
            
            logger.info(f"ML API response: {result.get('prediction')} with {result.get('confidence', 0)*100:.1f}% confidence")
            return result
    
    except httpx.TimeoutException:
        logger.error(f"Remote ML API timeout (60s) - service may be sleeping")
        raise Exception("ML service timeout - it may be waking up from sleep. Please try again in 30 seconds.")
    
    except httpx.HTTPStatusError as e:
        logger.error(f"ML API HTTP error: {e.response.status_code} - {e.response.text}")
        raise Exception(f"ML service error: {e.response.status_code}")
    
    except Exception as e:
        logger.error(f"ML API call failed: {e}")
        raise Exception(f"Failed to connect to ML service: {str(e)}")


async def run_inference_remote(image_url: str, age: int, bmi: float, 
                               diabetes_duration: int, infection_signs: str) -> Dict[str, Any]:
    """
    Run inference using remote Hugging Face ML service.
    This replaces the local PyTorch inference.
    
    Args:
        image_url: URL or path to the input image
        age: Patient age
        bmi: Patient BMI
        diabetes_duration: Years with diabetes
        infection_signs: Infection level ("none", "mild", "moderate", "severe")
    
    Returns:
        dict: Prediction results with confidence, risk assessment, and explanations
    """
    
    # Call remote ML API
    ml_result = await call_remote_ml_api(image_url, age, bmi, diabetes_duration, infection_signs)
    
    # Extract prediction from ML service
    prediction = ml_result.get("prediction", "unknown")
    confidence = ml_result.get("confidence", 0.5)
    
    # Estimate ulcer area based on confidence (0 if normal, up to 25% if ulcer)
    ulcer_area = 0.0
    if prediction == "ulcer":
        ulcer_area = min(25, 5 + (confidence * 20))
    
    # Calculate comprehensive risk score (same logic as before)
    risk_score = calculate_risk_score(confidence, age, bmi, diabetes_duration, infection_signs, ulcer_area)
    risk_level = classify_risk_level(risk_score)
    severity = get_severity(confidence, ulcer_area)
    recommendations = get_recommendations(risk_level)
    
    # Generate natural language explanation
    explanation_text = generate_explanation(
        prediction, confidence, risk_score, risk_level,
        age, bmi, diabetes_duration, infection_signs, ulcer_area
    )
    
    # Create SHAP/LIME importance (simplified - based on clinical factors)
    feature_names = ["Age", "BMI", "Diabetes Duration", "Infection Signs"]
    lime_importance = {}
    
    # Simple importance calculation
    lime_importance["Age"] = 0.25 if age > 60 else 0.15
    lime_importance["BMI"] = 0.30 if bmi > 30 else 0.20
    lime_importance["Diabetes Duration"] = 0.25 if diabetes_duration > 10 else 0.15
    lime_importance["Infection Signs"] = 0.20 if infection_signs.lower() != "none" else 0.10
    
    # Normalize to sum to 1
    total = sum(lime_importance.values())
    lime_importance = {k: v/total for k, v in lime_importance.items()}
    
    shap_importance = lime_importance  # Use same for both
    
    return {
        "prediction": prediction,
        "confidence": confidence,
        "risk_score": risk_score,
        "risk_level": risk_level,
        "severity": severity,
        "affected_area": ulcer_area,
        "explanation_text": explanation_text,
        "lime_explanation": f"Clinical analysis based on {', '.join(feature_names)}",
        "recommendations": recommendations,
        "gradcam_heatmap": ml_result.get("gradcam"),  # From ML service
        "gradcam_overlay": ml_result.get("gradcam"),  # From ML service
        "segmentation_mask": None,  # Not implemented in remote service yet
        "shap_importance": shap_importance,
        "lime_importance": lime_importance,
        "image_url": image_url,
        "inference_time": 0.0,  # Measured on ML service side
        "ml_service": "remote",
        "ml_device": ml_result.get("device", "unknown")
    }
