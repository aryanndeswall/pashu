from fastapi import APIRouter
from app.api.v1.animals import router as animals_router
from app.api.v1.triage import router as triage_router

api_router = APIRouter()
api_router.include_router(animals_router, prefix="/animals", tags=["Animals & Pashu Aadhaar"])
api_router.include_router(triage_router, prefix="/triage", tags=["Multimodal AI Triage"])

__all__ = ["api_router"]
