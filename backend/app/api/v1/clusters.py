from typing import List, Dict, Any, Optional
from fastapi import APIRouter, HTTPException, status, WebSocket, WebSocketDisconnect
from fastapi.responses import StreamingResponse
from app.schemas.cluster import (
    IncidentCreate,
    ClusterEvaluationRequest,
    ClusterEvaluationResponse,
    ContainmentBroadcastRequest,
    ContainmentBroadcastResponse,
)
from app.services.satscan_service import satscan_service
from app.services.buffer_service import generate_containment_buffers
from app.services.pubsub_service import pubsub_service, OutbreakAlertEvent
from app.services.notification_service import notification_service

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

        # Broadcast live outbreak alert via Redis Pub/Sub & WebSockets
        try:
            syndrome_names = {
                "SARF": "Anthrax / काळपुळी",
                "VSS": "Foot & Mouth Disease (FMD) / लाळ्या खुरकूत",
                "NSLS": "Lumpy Skin Disease (LSD) / लंपी",
                "HSDS": "Hemorrhagic Septicemia (HS) / घटसर्प",
                "BQ": "Black Quarter (BQ) / एकटांग्या",
                "PPR": "Peste des Petits Ruminants (PPR)",
            }
            disease_name = getattr(evaluation, "suspected_disease", None) or syndrome_names.get(
                incident.syndrome_code, f"Syndrome {incident.syndrome_code} Outbreak"
            )
            await pubsub_service.publish_outbreak_event(
                OutbreakAlertEvent(
                    cluster_id=evaluation.cluster_id,
                    syndrome_code=incident.syndrome_code,
                    suspected_disease=disease_name,
                    epicenter_lat=evaluation.epicenter_lat,
                    epicenter_lon=evaluation.epicenter_lon,
                    village_name=incident.village_name or "Ashwi Budruk",
                    movement_freeze_radius_km=1.0,
                    ring_vaccination_radius_km=5.0,
                    surveillance_radius_km=10.0,
                    alert_level="CRITICAL" if evaluation.status == "OUTBREAK_DECLARED" else "WARNING",
                    containment_directive=f"Biosecurity containment declared for {incident.syndrome_code}. 1 km Movement Freeze active.",
                )
            )

            # If full outbreak declared, dispatch high-priority FCM containment push & SMS
            if evaluation.status == "OUTBREAK_DECLARED":
                await notification_service.broadcast_containment_directive(
                    cluster_id=evaluation.cluster_id,
                    syndrome_code=incident.syndrome_code,
                    village_name=incident.village_name or "Ashwi Budruk",
                    district_name="Ahmednagar",
                    epicenter_lat=evaluation.epicenter_lat,
                    epicenter_lon=evaluation.epicenter_lon,
                    movement_freeze_radius_km=1.0,
                    ring_vaccination_radius_km=5.0,
                    surveillance_radius_km=10.0,
                    alert_level="CRITICAL",
                )
        except Exception:
            pass
    elif evaluation.status == "WARNING":
        _CLUSTER_STORE[evaluation.cluster_id] = evaluation

    return evaluation


@router.websocket("/ws")
async def websocket_cluster_alerts(websocket: WebSocket):
    """
    Full-duplex WebSocket endpoint for Web-GIS Command War Room and field dashboards.
    Streams instantaneous outbreak cluster triggers, biosecurity ring updates, and emergency directives.
    """
    await pubsub_service.manager.connect(websocket)
    try:
        # Send initial connection handshake with recent events
        await websocket.send_json({
            "type": "CONNECTION_ESTABLISHED",
            "message": "Connected to Pashu-Suraksha Real-Time Outbreak Stream",
            "recent_events": pubsub_service.get_recent_events()[-3:],
        })
        while True:
            text = await websocket.receive_text()
            if text == "ping":
                await websocket.send_text("pong")
    except WebSocketDisconnect:
        pubsub_service.manager.disconnect(websocket)
    except Exception:
        pubsub_service.manager.disconnect(websocket)


@router.get(
    "/stream",
    summary="Real-Time Server-Sent Events (SSE) Outbreak Alert Stream",
)
async def sse_cluster_alerts(limit: Optional[int] = None):
    """
    Lightweight HTTP Server-Sent Events (SSE) stream for web browsers and GIS dashboards.
    """
    return StreamingResponse(
        pubsub_service.sse_stream(max_events=limit),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        },
    )


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


@router.post(
    "/broadcast",
    response_model=ContainmentBroadcastResponse,
    status_code=status.HTTP_200_OK,
    summary="Broadcast Statutory Biosecurity Containment Directives (FCM + SMS)",
)
async def broadcast_containment_order(
    payload: ContainmentBroadcastRequest,
) -> ContainmentBroadcastResponse:
    """
    Dispatches high-priority Firebase Cloud Messaging (FCM) containment notifications to
    district veterinarians & field Pashu Sakhis, and generates statutory SMS alerts citing
    Sections 6, 10, and 20 of PCICDA 2009.
    """
    result = await notification_service.broadcast_containment_directive(
        cluster_id=payload.cluster_id,
        syndrome_code=payload.syndrome_code,
        village_name=payload.village_name,
        district_name=payload.district_name,
        epicenter_lat=payload.epicenter_lat,
        epicenter_lon=payload.epicenter_lon,
        movement_freeze_radius_km=payload.movement_freeze_radius_km,
        ring_vaccination_radius_km=payload.ring_vaccination_radius_km,
        surveillance_radius_km=payload.surveillance_radius_km,
        alert_level=payload.alert_level,
        custom_topic=payload.target_topic,
    )
    return ContainmentBroadcastResponse(**result)

