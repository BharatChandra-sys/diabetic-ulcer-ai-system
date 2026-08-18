from fastapi import APIRouter, Depends
from pydantic import BaseModel
from typing import Optional, List, Dict
from sqlalchemy.orm import Session
from app.database import get_db

router = APIRouter(prefix="/health-metrics", tags=["health-metrics"])


class HealthMetricsRequest(BaseModel):
    age: int
    bmi: float
    blood_sugar: int
    diabetes_duration: Optional[int] = None


class HealthAssessmentResponse(BaseModel):
    risk_score: float
    risk_level: str
    recommendations: List[str]
    details: Dict[str, str]
    explanation: str


class HealthMetricsCalculator:
    """Calculate health metrics and risk assessments"""

    @staticmethod
    def calculate_bmi_category(bmi: float) -> tuple[str, float]:
        """
        Categorize BMI and return category with weight
        Returns: (category, risk_weight)
        """
        if bmi < 18.5:
            return "Underweight", 15.0
        elif bmi < 25:
            return "Normal", 5.0
        elif bmi < 30:
            return "Overweight", 25.0
        else:
            return "Obese", 40.0

    @staticmethod
    def calculate_blood_sugar_category(blood_sugar: int) -> tuple[str, float]:
        """
        Categorize blood sugar level and return category with weight
        Returns: (category, risk_weight)
        """
        if blood_sugar < 100:
            return "Low", 20.0
        elif blood_sugar < 126:
            return "Normal", 5.0
        elif blood_sugar < 200:
            return "High", 35.0
        else:
            return "Critical", 50.0

    @staticmethod
    def calculate_age_risk(age: int) -> tuple[str, float]:
        """
        Calculate age-related risk
        Returns: (age_group, risk_weight)
        """
        if age < 30:
            return "Young Adult", 10.0
        elif age < 45:
            return "Adult", 20.0
        elif age < 60:
            return "Middle-aged", 30.0
        else:
            return "Senior", 40.0

    @staticmethod
    def calculate_overall_risk(
        age: int, bmi: float, blood_sugar: int, diabetes_duration: Optional[int] = None
    ) -> float:
        """
        Calculate overall risk score (0-100)
        """
        # Get individual risk components
        _, bmi_risk = HealthMetricsCalculator.calculate_bmi_category(bmi)
        _, sugar_risk = HealthMetricsCalculator.calculate_blood_sugar_category(blood_sugar)
        _, age_risk = HealthMetricsCalculator.calculate_age_risk(age)

        # Diabetes duration impact
        diabetes_risk = 0.0
        if diabetes_duration is not None:
            if diabetes_duration < 5:
                diabetes_risk = 10.0
            elif diabetes_duration < 10:
                diabetes_risk = 20.0
            else:
                diabetes_risk = 30.0

        # Weight the factors: age (20%), bmi (25%), blood_sugar (40%), diabetes (15%)
        weighted_risk = (
            (age_risk * 0.20)
            + (bmi_risk * 0.25)
            + (sugar_risk * 0.40)
            + (diabetes_risk * 0.15)
        )

        # Normalize to 0-100 scale
        return min(100.0, max(0.0, weighted_risk))

    @staticmethod
    def get_risk_level(risk_score: float) -> str:
        """Get risk level based on score"""
        if risk_score < 30:
            return "Low Risk"
        elif risk_score < 60:
            return "Moderate Risk"
        else:
            return "High Risk"

    @staticmethod
    def generate_recommendations(
        age: int, bmi: float, blood_sugar: int, diabetes_duration: Optional[int] = None
    ) -> List[str]:
        """Generate personalized recommendations"""
        recommendations = []

        # BMI recommendations
        bmi_cat, _ = HealthMetricsCalculator.calculate_bmi_category(bmi)
        if bmi_cat == "Underweight":
            recommendations.append("Increase calorie intake through balanced nutrition")
        elif bmi_cat == "Overweight":
            recommendations.append(
                "Implement a gradual weight loss plan (0.5-1 kg per week) through diet and exercise"
            )
        elif bmi_cat == "Obese":
            recommendations.append(
                "Consult with a nutritionist for a medically supervised weight management program"
            )

        # Blood sugar recommendations
        sugar_cat, _ = HealthMetricsCalculator.calculate_blood_sugar_category(blood_sugar)
        if sugar_cat == "High":
            recommendations.append(
                "Monitor blood glucose regularly (3+ times daily) and adjust medications if needed"
            )
        elif sugar_cat == "Critical":
            recommendations.append(
                "Seek immediate medical attention - blood sugar level is dangerously high"
            )
        else:
            recommendations.append("Continue regular blood glucose monitoring")

        # Age-specific recommendations
        if age > 60:
            recommendations.append(
                "Regular health check-ups and foot examinations recommended"
            )
        elif age > 45:
            recommendations.append(
                "Schedule preventive health screenings annually"
            )

        # Diabetes recommendations
        if diabetes_duration is not None:
            if diabetes_duration > 10:
                recommendations.append(
                    "Intensive foot care and regular podiatry examinations are essential"
                )
            recommendations.append(
                "Maintain HbA1c levels below 7% for better diabetes control"
            )

        # General recommendations
        recommendations.append("Maintain a consistent exercise routine (150 mins/week)")
        recommendations.append(
            "Regular foot examinations for early detection of potential ulcers"
        )

        return recommendations[:5]  # Return top 5 recommendations

    @staticmethod
    def generate_explanation(
        age: int, bmi: float, blood_sugar: int, risk_level: str
    ) -> str:
        """Generate a detailed explanation of the assessment"""
        bmi_cat, _ = HealthMetricsCalculator.calculate_bmi_category(bmi)
        sugar_cat, _ = HealthMetricsCalculator.calculate_blood_sugar_category(blood_sugar)
        age_group, _ = HealthMetricsCalculator.calculate_age_risk(age)

        explanation = (
            f"Your assessment shows {risk_level}. "
            f"You are in the {age_group} category with a {bmi_cat} BMI and {sugar_cat} blood sugar level. "
        )

        if risk_level == "High Risk":
            explanation += (
                "These metrics indicate you need closer medical supervision and lifestyle modifications. "
                "Please consult with your healthcare provider immediately."
            )
        elif risk_level == "Moderate Risk":
            explanation += (
                "While not critical, there are areas for improvement. "
                "Focus on the recommended lifestyle changes to reduce your risk."
            )
        else:
            explanation += (
                "You are maintaining good health metrics. "
                "Continue with regular monitoring and healthy lifestyle practices."
            )

        return explanation


@router.post("/assess", response_model=HealthAssessmentResponse)
async def assess_health_metrics(request: HealthMetricsRequest, db: Session = Depends(get_db)):
    """
    Assess health metrics and return risk score with recommendations
    
    Parameters:
    - age: Patient age in years
    - bmi: Body Mass Index
    - blood_sugar: Blood sugar level in mg/dL
    - diabetes_duration: Optional, years with diabetes
    
    Returns:
    - risk_score: 0-100 scale
    - risk_level: Low, Moderate, or High Risk
    - recommendations: Personalized health recommendations
    - details: Breakdown of individual metrics
    - explanation: Detailed assessment explanation
    """

    # Calculate individual metrics
    bmi_cat, _ = HealthMetricsCalculator.calculate_bmi_category(request.bmi)
    sugar_cat, _ = HealthMetricsCalculator.calculate_blood_sugar_category(request.blood_sugar)
    age_group, _ = HealthMetricsCalculator.calculate_age_risk(request.age)

    # Calculate overall risk
    risk_score = HealthMetricsCalculator.calculate_overall_risk(
        request.age, request.bmi, request.blood_sugar, request.diabetes_duration
    )

    # Get risk level
    risk_level = HealthMetricsCalculator.get_risk_level(risk_score)

    # Generate recommendations
    recommendations = HealthMetricsCalculator.generate_recommendations(
        request.age, request.bmi, request.blood_sugar, request.diabetes_duration
    )

    # Generate explanation
    explanation = HealthMetricsCalculator.generate_explanation(
        request.age, request.bmi, request.blood_sugar, risk_level
    )

    # Prepare details dictionary
    details = {
        "bmi_category": bmi_cat,
        "sugar_level": sugar_cat,
        "age_group": age_group,
        "bmi_value": f"{request.bmi:.1f}",
        "blood_sugar_value": f"{request.blood_sugar} mg/dL",
    }

    return HealthAssessmentResponse(
        risk_score=round(risk_score, 2),
        risk_level=risk_level,
        recommendations=recommendations,
        details=details,
        explanation=explanation,
    )


@router.post("/calculate-ulcer-risk")
async def calculate_ulcer_risk(
    age: int,
    bmi: float,
    blood_sugar: int,
    diabetes_duration: Optional[int] = None,
    has_infection: bool = False,
    previous_ulcers: bool = False,
):
    """
    Calculate specific diabetic foot ulcer risk
    """
    base_risk = HealthMetricsCalculator.calculate_overall_risk(
        age, bmi, blood_sugar, diabetes_duration
    )

    # Add factors specific to ulcer risk
    ulcer_risk = base_risk * 0.7  # Scale down from general health risk

    # Add infection risk
    if has_infection:
        ulcer_risk += 20.0

    # Add history factor
    if previous_ulcers:
        ulcer_risk += 25.0

    # Normalize
    ulcer_risk = min(100.0, max(0.0, ulcer_risk))

    return {
        "ulcer_risk_score": round(ulcer_risk, 2),
        "recommendation": (
            "Urgent foot examination required"
            if ulcer_risk > 70
            else "Regular foot monitoring recommended" if ulcer_risk > 40 else "Low risk - continue routine care"
        ),
        "factors": {
            "age_factor": f"{HealthMetricsCalculator.calculate_age_risk(age)[0]}",
            "bmi_factor": f"{HealthMetricsCalculator.calculate_bmi_category(bmi)[0]}",
            "blood_sugar_factor": f"{HealthMetricsCalculator.calculate_blood_sugar_category(blood_sugar)[0]}",
            "infection_present": has_infection,
            "ulcer_history": previous_ulcers,
        },
    }


@router.post("/generate-report")
async def generate_health_report(request: HealthMetricsRequest):
    """
    Generate comprehensive health report
    """
    risk_score = HealthMetricsCalculator.calculate_overall_risk(
        request.age, request.bmi, request.blood_sugar, request.diabetes_duration
    )
    recommendations = HealthMetricsCalculator.generate_recommendations(
        request.age, request.bmi, request.blood_sugar, request.diabetes_duration
    )

    return {
        "report_type": "Health Assessment Report",
        "risk_score": round(risk_score, 2),
        "risk_level": HealthMetricsCalculator.get_risk_level(risk_score),
        "metrics": {
            "age": request.age,
            "bmi": request.bmi,
            "blood_sugar": request.blood_sugar,
            "diabetes_duration": request.diabetes_duration,
        },
        "recommendations": recommendations,
        "generated_at": "2024-03-06",
        "next_review_date": "2024-04-06",
    }
