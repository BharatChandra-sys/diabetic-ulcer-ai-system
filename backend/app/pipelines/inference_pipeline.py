from app.services.ml_service import run_prediction


def run_inference_pipeline(text: str) -> dict[str, float | int]:
	prediction, confidence = run_prediction(text)
	return {
		"prediction": prediction,
		"confidence": confidence,
	}
