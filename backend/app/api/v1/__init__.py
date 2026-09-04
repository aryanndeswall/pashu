from fastapi import APIRouter
from app.api.v1.animals import router as animals_router
from app.api.v1.triage import router as triage_router
from app.api.v1.clusters import router as clusters_router
from app.api.v1.labs import router as labs_router
from app.api.v1.gis import router as gis_router

api_router = APIRouter()
api_router.include_router(animals_router, prefix="/animals", tags=["Animals & Pashu Aadhaar"])
api_router.include_router(triage_router, prefix="/triage", tags=["Multimodal AI Triage"])
api_router.include_router(clusters_router, prefix="/clusters", tags=["Spatial SaTScan & Containment Buffers"])
api_router.include_router(labs_router, prefix="/labs", tags=["Diagnostic Lab Referral & Cold-Chain (e-LRF)"])
api_router.include_router(gis_router, prefix="/gis", tags=["Web-GIS Command Center & Statutory Orders"])

__all__ = ["api_router"]



