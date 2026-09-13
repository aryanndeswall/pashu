from fastapi import APIRouter, Query, status, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import get_db
from app.schemas.gis import (
    EpiCurveResponse,
    MarketClosureMemoRequest,
    MarketClosureMemoResponse,
    IdspDispatchPayload,
    IdspDispatchResponse,
    SimulationResponse,
    ReverseGeocodeResponse,
    LocationSearchResponse,
)
from app.services.gis_service import gis_service

router = APIRouter()


@router.get(
    "/reverse-geocode",
    response_model=ReverseGeocodeResponse,
    summary="Reverse Geocode GPS Coordinates to State, District, Tehsil, and Village",
)
async def reverse_geocode_location(
    lat: float = Query(..., description="Latitude coordinate in WGS-84"),
    lon: float = Query(..., description="Longitude coordinate in WGS-84"),
) -> ReverseGeocodeResponse:
    """
    Reverse-geocodes real-time GPS coordinates into administrative hierarchy:
    State, District, Subdistrict/Tehsil, and Village across any location in India.
    """
    return await gis_service.reverse_geocode(latitude=lat, longitude=lon)


@router.get(
    "/search-locations",
    response_model=LocationSearchResponse,
    summary="Nationwide Search for Any Village, Town, or District in India",
)
async def search_locations(
    q: str = Query(..., min_length=2, description="Village, town, tehsil, or district name"),
    limit: int = Query(8, ge=1, le=20, description="Max result count"),
) -> LocationSearchResponse:
    """
    Nationwide geocoding search for Indian villages, tehsils, and districts.
    """
    return await gis_service.search_locations(query=q, limit=limit)




@router.get(
    "/epi-curve",
    response_model=EpiCurveResponse,
    summary="Get 14-Day Rolling Epidemic Curve & Transmission Trajectory",
)
async def get_epi_curve(
    district: str = Query("Ahmednagar", description="Target district for time-series aggregation"),
    syndrome: str = Query("SYN_VESICULAR", description="Syndromic category code"),
    db: AsyncSession = Depends(get_db),
) -> EpiCurveResponse:
    """
    Returns 14-day rolling epidemiological case counts, mortality figures, peak incidence day,
    and effective reproduction numbers (Rt) modeling post-containment drop.
    """
    return await gis_service.generate_14_day_epi_curve(district=district, syndrome=syndrome, db=db)


@router.post(
    "/market-closure-memo",
    response_model=MarketClosureMemoResponse,
    status_code=status.HTTP_200_OK,
    summary="Generate Statutory PCICDA 2009 Market Closure Order",
)
async def generate_market_closure_memo(
    payload: MarketClosureMemoRequest,
) -> MarketClosureMemoResponse:
    """
    Generates official bilingual administrative memo citing Sections 6, 10, and 20 of The Prevention
    and Control of Infectious and Contagious Diseases in Animals Act, 2009 (Central Act 27 of 2009)
    for District Magistrates mandating market closures and quarantine check-posts.
    """
    return gis_service.generate_market_closure_memo(payload)


@router.post(
    "/idsp-dispatch",
    response_model=IdspDispatchResponse,
    status_code=status.HTTP_200_OK,
    summary="Dispatch Inter-Agency Alert to IDSP / NCDC for Human Zoonotic Tracing",
)
async def dispatch_idsp_alert(
    payload: IdspDispatchPayload,
) -> IdspDispatchResponse:
    """
    Dispatches encrypted syndromic notification packet to the Integrated Disease Surveillance Programme (IDSP/NCDC)
    to initiate door-to-door human fever survey and zoonotic prophylaxis within the 5 km buffer.
    """
    return gis_service.dispatch_idsp_alert(payload)


@router.post(
    "/simulation/run",
    response_model=SimulationResponse,
    status_code=status.HTTP_200_OK,
    summary="Execute Ahmednagar FMD Outbreak SIH Live Presentation Simulation",
)
async def run_simulation() -> SimulationResponse:
    """
    Executes the complete 7-step Ahmednagar outbreak presentation journey in rapid sequence
    demonstrating the entire end-to-end early warning and biosecurity containment lifecycle.
    """
    return gis_service.run_ahmednagar_simulation()
