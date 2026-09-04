from fastapi import APIRouter
from app.api.v1.animals import router as animals_router

api_router = APIRouter()
api_router.include_router(animals_router, prefix="/animals", tags=["Animals & Pashu Aadhaar"])

__all__ = ["api_router"]
