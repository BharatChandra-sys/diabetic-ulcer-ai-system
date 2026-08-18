from sqlalchemy import Column, Integer, Float, String
from app.db.database import Base

class PredictionLog(Base):

    __tablename__ = "predictions"

    id = Column(Integer, primary_key=True, index=True)
    input_text = Column(String)
    prediction = Column(Integer)
    confidence = Column(Float)