from fastapi import APIRouter, Query, status
from app.schemas.gis import (
    EpiCurveResponse,
    MarketClosureMemoRequest,
    MarketClosureMemoResponse,
    IdspDispatchPayload,
    IdspDispatchResponse,
    SimulationResponse,
)
from app.services.gis_service import gis_service

router = APIRouter()


@router.get(
    "/epi-curve",
    response_model=EpiCurveResponse,
    summary="Get 14-Day Rolling Epidemic Curve & Transmission Trajectory",
)
async def get_epi_curve(
    district: str = Query("Ahmednagar", description="Target district for time-series aggregation"),
    syndrome: str = Query("SYN_VESICULAR", description="Syndromic category code"),
) -> EpiCurveResponse:
    """
    Returns 14-day rolling epidemiological case counts, mortality figures, peak incidence day,
    and effective reproduction numbers (Rt) modeling post-containment drop.
    """
    return gis_service.generate_14_day_epi_curve(district=district, syndrome=syndrome)


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
