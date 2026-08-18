import logging

from fastapi import APIRouter

from app.pipelines.explainability_pipeline import run_explainability_pipeline
from app.pipelines.inference_pipeline import run_inference_pipeline
from app.schemas.predict_schema import PredictionRequest, PredictionResponse
from app.services.report_service import generate_prediction_report

router = APIRouter(prefix="/api")
logger = logging.getLogger(__name__)


@router.post("/predict", response_model=PredictionResponse)
async def predict(data: PredictionRequest) -> PredictionResponse:
    inference_result = run_inference_pipeline(data.text)
    prediction = int(inference_result["prediction"])
    confidence = float(inference_result["confidence"])

    explanation = run_explainability_pipeline(text=data.text, prediction=prediction)
    report = generate_prediction_report(
        prediction=prediction,
        confidence=confidence,
        explanation=explanation,
    )
    logger.info("Prediction report generated: %s", report)

    return PredictionResponse(
        prediction=prediction,
        confidence=confidence,
    )