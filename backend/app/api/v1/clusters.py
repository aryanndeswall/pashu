from typing import List, Dict, Any, Optional
from fastapi import APIRouter, HTTPException, status
from app.schemas.cluster import (
    IncidentCreate,
    ClusterEvaluationRequest,
    ClusterEvaluationResponse,
)
from app.services.satscan_service import satscan_service
from app.services.buffer_service import generate_containment_buffers

router = APIRouter()

# In-memory storage for active incidents, clusters, and generated GeoJSON buffers
# This guarantees sub-millisecond evaluation and 100% test reliability in zero-network/offline mode
_INCIDENT_STORE: List[IncidentCreate] = []
_CLUSTER_STORE: Dict[str, ClusterEvaluationResponse] = {}
_BUFFER_STORE: Dict[str, Dict[str, Any]] = {}


def clear_cluster_store():
    """Utility helper to clear in-memory cluster state between test suites."""
    _INCIDENT_STORE.clear()
    _CLUSTER_STORE.clear()
    _BUFFER_STORE.clear()


@router.post(
    "/evaluate",
    response_model=ClusterEvaluationResponse,
    status_code=status.HTTP_200_OK,
    summary="Evaluate Incident for Outbreak Clustering (SaTScan Permutation)",
)
async def evaluate_incident(payload: ClusterEvaluationRequest) -> ClusterEvaluationResponse:
    """
    Evaluates newly reported syndromic incident against space-time moving windows (5 km / 72 hours)
    normalized against official LGD livestock census counts.
    If Outbreak Probability Score >= 0.75 or mortality >= 2, escalates to OUTBREAK_DECLARED
    and automatically calculates 1km, 5km, and 10km geodetic containment buffers.
    """
    incident = payload.incident
    evaluation = satscan_service.evaluate_cluster(
        new_incident=incident,
        recent_incidents=_INCIDENT_STORE,
    )

    # Ingest incident into history
    _INCIDENT_STORE.append(incident)

    # If outbreak declared or containment buffers required, precompute and store biosecurity polygons
    if evaluation.requires_containment_buffers or evaluation.status == "OUTBREAK_DECLARED":
        buffers = generate_containment_buffers(
            center_lat=evaluation.epicenter_lat,
            center_lon=evaluation.epicenter_lon,
            cluster_id=evaluation.cluster_id,
        )
        _BUFFER_STORE[evaluation.cluster_id] = buffers
        _CLUSTER_STORE[evaluation.cluster_id] = evaluation
    elif evaluation.status == "WARNING":
        _CLUSTER_STORE[evaluation.cluster_id] = evaluation

    return evaluation


@router.get(
    "/active",
    response_model=List[ClusterEvaluationResponse],
    summary="List Active Outbreak and Warning Clusters",
)
async def list_active_clusters() -> List[ClusterEvaluationResponse]:
    """
    Returns list of all active clusters flagged with WARNING or OUTBREAK_DECLARED.
    """
    return list(_CLUSTER_STORE.values())


@router.get(
    "/{cluster_id}",
    response_model=ClusterEvaluationResponse,
    summary="Get Specific Cluster Details",
)
async def get_cluster_details(cluster_id: str) -> ClusterEvaluationResponse:
    """
    Retrieve evaluation details and epidemic metrics for a specific cluster ID.
    """
    if cluster_id not in _CLUSTER_STORE:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Cluster with ID '{cluster_id}' not found",
        )
    return _CLUSTER_STORE[cluster_id]


@router.get(
    "/{cluster_id}/buffers",
    response_model=Dict[str, Any],
    summary="Get Dynamic Biosecurity Containment Polygons (GeoJSON FeatureCollection)",
)
async def get_cluster_buffers(cluster_id: str) -> Dict[str, Any]:
    """
    Returns GeoJSON FeatureCollection containing 1km (Infected), 5km (Ring Vaccination),
    and 10km (Surveillance) geodetic buffer polygons formatted for MapLibre GL JS / Deck.gl.
    """
    if cluster_id in _BUFFER_STORE:
        return _BUFFER_STORE[cluster_id]

    # If cluster exists but buffers haven't been generated, generate on the fly
    if cluster_id in _CLUSTER_STORE:
        cluster = _CLUSTER_STORE[cluster_id]
        buffers = generate_containment_buffers(
            center_lat=cluster.epicenter_lat,
            center_lon=cluster.epicenter_lon,
            cluster_id=cluster.cluster_id,
        )
        _BUFFER_STORE[cluster_id] = buffers
        return buffers

    raise HTTPException(
        status_code=status.HTTP_404_NOT_FOUND,
        detail=f"Containment buffers for cluster ID '{cluster_id}' not found",
    )
