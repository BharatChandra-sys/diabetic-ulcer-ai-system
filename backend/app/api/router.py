from fastapi import APIRouter

from app.api.routes import clinical_data, health, predict

api_router = APIRouter()

api_router.include_router(health.router, tags=["health"])
api_router.include_router(predict.router, tags=["prediction"])
api_router.include_router(clinical_data.router, tags=["clinical-data"])
