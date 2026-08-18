from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional
from app.database import get_db
from app.auth.dependencies import optional_auth
from app.models import User

router = APIRouter(prefix="/chat", tags=["chat"])


class ChatMessageRequest(BaseModel):
    message: str
    context: Optional[dict] = None


class ChatMessageResponse(BaseModel):
    response: str
    suggestions: Optional[list[str]] = None


@router.post("/message", response_model=ChatMessageResponse)
def send_chat_message(
    request: ChatMessageRequest,
    user: Optional[User] = Depends(optional_auth),
    db: Session = Depends(get_db)
):
    """
    Handle chat messages with AI assistant.
    Public access - works without authentication.
    """
    
    # Simple rule-based responses for now
    message_lower = request.message.lower()
    
    # Health and safety responses
    if any(word in message_lower for word in ["emergency", "urgent", "severe pain", "bleeding"]):
        return ChatMessageResponse(
            response="⚠️ If you're experiencing a medical emergency, please call 911 or visit your nearest emergency room immediately. This AI assistant is for informational purposes only and should not replace professional medical care.",
            suggestions=[
                "Find nearest emergency room",
                "Learn about warning signs",
                "Contact my doctor"
            ]
        )
    
    # Diabetic foot care information
    if any(word in message_lower for word in ["foot care", "prevent", "prevention", "how to care"]):
        return ChatMessageResponse(
            response="🦶 Diabetic foot care basics:\n\n• Inspect your feet daily for cuts, blisters, or changes\n• Keep feet clean and moisturized (avoid between toes)\n• Wear proper fitting shoes and clean socks\n• Never walk barefoot\n• Check water temperature before bathing\n• Trim toenails carefully, straight across\n• See your doctor regularly for foot exams\n\nWould you like more detailed information on any of these topics?",
            suggestions=[
                "Daily inspection routine",
                "Choosing proper footwear",
                "When to see a doctor"
            ]
        )
    
    # About ulcers
    if any(word in message_lower for word in ["ulcer", "wound", "sore"]):
        return ChatMessageResponse(
            response="A diabetic foot ulcer is an open wound that occurs in people with diabetes, often on the bottom of the foot. They develop due to:\n\n• Nerve damage (neuropathy) reducing sensation\n• Poor circulation\n• Pressure points\n• Minor injuries that go unnoticed\n\nEarly detection and treatment are crucial. If you notice any open wounds, redness, swelling, or changes in your feet, consult your healthcare provider immediately.",
            suggestions=[
                "Signs and symptoms",
                "Risk factors",
                "Treatment options"
            ]
        )
    
    # About the AI system
    if any(word in message_lower for word in ["how does this work", "what is this", "about", "ai"]):
        return ChatMessageResponse(
            response="MedVision AI uses advanced computer vision and machine learning to help detect and assess diabetic foot ulcers from images. Our system:\n\n• Analyzes foot images for signs of ulcers\n• Provides risk assessments\n• Offers explainable AI results\n• Tracks progression over time\n\nThis tool is designed to support healthcare professionals and assist in early detection, but it should never replace professional medical diagnosis and treatment.",
            suggestions=[
                "Upload a scan",
                "View my history",
                "Learn about risk levels"
            ]
        )
    
    # Risk levels
    if any(word in message_lower for word in ["risk", "level", "severity"]):
        return ChatMessageResponse(
            response="Our AI classifies diabetic foot conditions into risk levels:\n\n🟢 **Low Risk**: No significant issues detected. Continue regular foot care and monitoring.\n\n🟡 **Medium Risk**: Some concerns present. Increased monitoring recommended. Consult your healthcare provider.\n\n🔴 **High Risk**: Urgent attention needed. Contact your healthcare provider immediately.\n\nRemember: AI assessment is not a diagnosis. Always consult with healthcare professionals.",
            suggestions=[
                "Schedule an appointment",
                "Learn prevention tips",
                "View my scan history"
            ]
        )
    
    # Default response
    return ChatMessageResponse(
        response="I'm your MedVision AI assistant, here to provide information about diabetic foot care and ulcer detection. I can help with:\n\n• Understanding diabetic foot ulcers\n• Prevention and care tips\n• Interpreting AI scan results\n• When to seek medical help\n\nWhat would you like to know?",
        suggestions=[
            "Foot care basics",
            "About diabetic ulcers",
            "How the AI works",
            "Understanding risk levels"
        ]
    )
