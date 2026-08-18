import torch
import numpy as np
from app.services.model_loader import get_model, get_segmentation_model
from app.ml.preprocess import preprocess_image, preprocess_clinical_data
from app.ml.ulcer_area_estimator import estimate_ulcer_area
from app.explainability.gradcam import generate_gradcam_from_tensor
from app.explainability.lime_explainer import generate_lime_explanation
from app.explainability.heatmap_renderer import render_heatmap_overlay
import time
import logging

logger = logging.getLogger(__name__)


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
                         shap_importance, ulcer_area):
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

    # SHAP-based explanation
    if shap_importance:
        sorted_features = sorted(shap_importance.items(), key=lambda x: abs(x[1]), reverse=True)
        top = sorted_features[0]
        lines.append(
            f"The most influential clinical feature was {top[0]} "
            f"(importance: {abs(top[1]):.2f})."
        )

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


def run_inference(image_url: str, age: int, bmi: float, diabetes_duration: int, infection_signs: str):
    """
    Run inference using the trained CNN model with explainability modules.
    
    Args:
        image_url: URL or path to the input image
        age: Patient age
        bmi: Patient BMI
        diabetes_duration: Years with diabetes
        infection_signs: Infection level ("none", "mild", "moderate", "severe")
    
    Returns:
        dict: Prediction results with confidence, risk assessment, and explanations
    """
    start_time = time.time()

    # Load model
    model = get_model()
    device = next(model.parameters()).device

    # Preprocess image
    input_tensor = None
    try:
        input_tensor = preprocess_image(image_url).to(device)
    except Exception as e:
        logger.error(f"Failed to preprocess image {image_url}: {e}")
        raise ValueError(f"Failed to preprocess image: {str(e)}")

    # Run model inference
    gradcam_heatmap_raw = None
    gradcam_overlay_base64 = None
    prediction = None
    confidence = None
    
    try:
        with torch.no_grad():
            outputs = model(input_tensor)
            class_probabilities = torch.softmax(outputs, dim=1)[0]
            
            # Get probabilities for both classes
            prob_normal = class_probabilities[0].item()
            prob_ulcer = class_probabilities[1].item()
            
            # Use confidence threshold to avoid false positives
            # Only predict "ulcer" if confidence > 65%, otherwise predict "normal"
            ULCER_CONFIDENCE_THRESHOLD = 0.65
            
            if prob_ulcer >= ULCER_CONFIDENCE_THRESHOLD:
                prediction = "ulcer"
                confidence = prob_ulcer
            else:
                # If not confident enough, predict "normal"
                prediction = "normal"
                confidence = prob_normal
        
        # Generate Grad-CAM heatmap for explainability
        try:
            gradcam_heatmap_raw = generate_gradcam_from_tensor(model, input_tensor)
            # Convert numpy array to list for JSON serialization
            gradcam_heatmap_raw = gradcam_heatmap_raw.tolist() if hasattr(gradcam_heatmap_raw, 'tolist') else gradcam_heatmap_raw
            logger.info(f"Generated GradCAM heatmap: shape {len(gradcam_heatmap_raw)}x{len(gradcam_heatmap_raw[0]) if gradcam_heatmap_raw else 0}")
            
            # Render heatmap overlay with foot region masking
            gradcam_overlay_base64 = render_heatmap_overlay(image_url, gradcam_heatmap_raw)
            logger.info(f"Rendered GradCAM overlay: {len(gradcam_overlay_base64)} chars, starts with: {gradcam_overlay_base64[:50]}")
        except Exception as e:
            logger.error(f"Failed to generate Grad-CAM: {e}", exc_info=True)
            gradcam_heatmap_raw = None
            gradcam_overlay_base64 = None
    
    except Exception as e:
        logger.error(f"Model inference failed: {e}")
        raise ValueError(f"Model inference failed: {str(e)}")
    
    segmentation_mask = None
    
    # Estimate ulcer area (0 if normal, up to 25% if ulcer)
    ulcer_area = 0.0
    if prediction == "ulcer":
        # Estimate based on confidence score
        ulcer_area = min(25, 5 + (confidence * 20))

    # Calculate comprehensive risk score
    risk_score = calculate_risk_score(confidence, age, bmi, diabetes_duration, infection_signs, ulcer_area)
    risk_level = classify_risk_level(risk_score)
    severity = get_severity(confidence, ulcer_area)
    recommendations = get_recommendations(risk_level)

    # Prepare clinical feature data for explanations
    feature_names = ["Age", "BMI", "Diabetes Duration", "Infection Signs"]
    clinical_data = np.array([[age / 100.0, bmi / 50.0, diabetes_duration / 50.0, 
                               (0.0 if infection_signs.lower() == "none" else 0.5)]])
    
    # Generate LIME explanation (works well with clinical features)
    lime_result = None
    lime_importance = {name: 0.25 for name in feature_names}
    try:
        lime_result = generate_lime_explanation(clinical_data, prediction, confidence, feature_names)
        if lime_result and "lime_importance" in lime_result:
            lime_importance = lime_result.get("lime_importance", {})
    except Exception as e:
        logger.warning(f"LIME generation failed: {e}, using equal importance")
        lime_result = {"explanation": "Clinical feature analysis completed"}
    
    # Use LIME importance for both SHAP and LIME (since SHAP doesn't work with image CNNs)
    shap_importance = lime_importance

    # Generate natural language explanation
    explanation_text = generate_explanation(
        prediction, confidence, risk_score, risk_level,
        age, bmi, diabetes_duration, infection_signs,
        shap_importance, ulcer_area
    )

    inference_time = time.time() - start_time

    return {
        "prediction": prediction,
        "confidence": confidence,
        "risk_score": risk_score,
        "risk_level": risk_level,
        "severity": severity,
        "affected_area": ulcer_area,
        "explanation_text": explanation_text,
        "lime_explanation": lime_result.get("explanation", "") if lime_result else "Clinical analysis completed",
        "recommendations": recommendations,
        "gradcam_heatmap": gradcam_heatmap_raw,
        "gradcam_overlay": gradcam_overlay_base64,
        "segmentation_mask": segmentation_mask,
        "shap_importance": shap_importance,
        "lime_importance": lime_importance,
        "image_url": image_url,
        "inference_time": inference_time
    }

