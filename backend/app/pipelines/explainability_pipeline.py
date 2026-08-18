from app.explainability.lime_explainer import generate_lime_explanation


def run_explainability_pipeline(text: str, prediction: int) -> str:
	return generate_lime_explanation(text=text, prediction=prediction)
