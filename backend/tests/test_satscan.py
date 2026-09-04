import pytest
from datetime import datetime, timezone, timedelta
from app.services.satscan_service import (
    calculate_geodesic_distance_meters,
    satscan_service,
    AHMEDNAGAR_CENSUS_DATA,
)
from app.schemas.cluster import IncidentCreate


def test_haversine_distance():
    # Same point -> 0 meters
    lat1, lon1 = 19.5312, 74.4561
    assert calculate_geodesic_distance_meters(lat1, lon1, lat1, lon1) == 0.0

    # Points approx 1 km apart (0.009 deg latitude is roughly 1 km)
    lat2 = lat1 + 0.009
    dist = calculate_geodesic_distance_meters(lat1, lon1, lat2, lon1)
    assert 990.0 < dist < 1010.0


def test_isolated_single_case_watch():
    incident = IncidentCreate(
        report_id="inc-001",
        syndrome_code="SYN_VESICULAR",
        species="Bovine",
        animal_count_affected=1,
        mortality_count=0,
        latitude=19.5312,
        longitude=74.4561,
        lgd_code=558301,
        village_name="Ashwi Budruk",
    )

    eval_result = satscan_service.evaluate_cluster(incident, recent_incidents=[])

    assert eval_result.status == "WATCH"
    assert eval_result.ops_score == 0.25
    assert eval_result.total_cases == 1
    assert eval_result.total_deaths == 0
    assert eval_result.requires_containment_buffers is False
    assert eval_result.total_census_denominator == 1450


def test_three_cases_warning():
    base_time = datetime.now(timezone.utc)
    incidents = [
        IncidentCreate(
            report_id="inc-101",
            syndrome_code="SYN_RESPIRATORY",
            species="Bovine",
            animal_count_affected=1,
            mortality_count=0,
            latitude=19.5310,
            longitude=74.4560,
            lgd_code=558301,
            village_name="Ashwi Budruk",
            reported_at=base_time - timedelta(hours=10),
        ),
        IncidentCreate(
            report_id="inc-102",
            syndrome_code="SYN_RESPIRATORY",
            species="Bovine",
            animal_count_affected=1,
            mortality_count=0,
            latitude=19.5320,
            longitude=74.4570,
            lgd_code=558301,
            village_name="Ashwi Budruk",
            reported_at=base_time - timedelta(hours=5),
        ),
    ]

    new_incident = IncidentCreate(
        report_id="inc-103",
        syndrome_code="SYN_RESPIRATORY",
        species="Bovine",
        animal_count_affected=1,
        mortality_count=0,
        latitude=19.5315,
        longitude=74.4565,
        lgd_code=558301,
        village_name="Ashwi Budruk",
        reported_at=base_time,
    )

    eval_result = satscan_service.evaluate_cluster(new_incident, recent_incidents=incidents)

    assert eval_result.status == "WARNING"
    assert eval_result.ops_score == 0.55
    assert eval_result.total_cases == 3
    assert eval_result.requires_containment_buffers is False


def test_high_attack_rate_outbreak_declared():
    # 40 cattle affected in Ashwi Budruk (census = 1450 bovine)
    # Attack rate: 40 / 1450 * 100 = 2.759% (> 1.5%)
    incident = IncidentCreate(
        report_id="inc-201",
        syndrome_code="SYN_VESICULAR",
        species="Bovine",
        animal_count_affected=40,
        mortality_count=0,
        latitude=19.5312,
        longitude=74.4561,
        lgd_code=558301,
        village_name="Ashwi Budruk",
    )

    eval_result = satscan_service.evaluate_cluster(incident, recent_incidents=[])

    assert eval_result.status == "OUTBREAK_DECLARED"
    assert eval_result.attack_rate > 1.5
    assert eval_result.ops_score >= 0.80
    assert eval_result.requires_containment_buffers is True
    assert "OUTBREAK DECLARED" in eval_result.advisory_headline


def test_mortality_threshold_triggers_outbreak():
    # Only 1 case affected, but 2 sudden deaths reported -> Outbreak declared regardless of AR
    incident = IncidentCreate(
        report_id="inc-301",
        syndrome_code="SYN_ANTHRAX_SUSPECT",
        species="Bovine",
        animal_count_affected=2,
        mortality_count=2,
        latitude=19.5312,
        longitude=74.4561,
        lgd_code=558301,
        village_name="Ashwi Budruk",
    )

    eval_result = satscan_service.evaluate_cluster(incident, recent_incidents=[])

    assert eval_result.status == "OUTBREAK_DECLARED"
    assert eval_result.total_deaths == 2
    assert eval_result.requires_containment_buffers is True


def test_temporal_and_spatial_window_filtering():
    base_time = datetime.now(timezone.utc)

    # Incident 1: 80 hours ago (> 72 hrs window) - should be ignored
    too_old = IncidentCreate(
        report_id="inc-old",
        syndrome_code="SYN_VESICULAR",
        species="Bovine",
        animal_count_affected=10,
        mortality_count=0,
        latitude=19.5312,
        longitude=74.4561,
        lgd_code=558301,
        reported_at=base_time - timedelta(hours=80),
    )

    # Incident 2: 25 km away (> 5 km window) - should be ignored
    too_far = IncidentCreate(
        report_id="inc-far",
        syndrome_code="SYN_VESICULAR",
        species="Bovine",
        animal_count_affected=10,
        mortality_count=0,
        latitude=19.7500,  # ~24 km north
        longitude=74.4561,
        lgd_code=558304,
        reported_at=base_time - timedelta(hours=2),
    )

    # Incident 3: Different syndrome code - should be ignored
    diff_syndrome = IncidentCreate(
        report_id="inc-diff",
        syndrome_code="SYN_HEMORRHAGIC",
        species="Bovine",
        animal_count_affected=10,
        mortality_count=0,
        latitude=19.5315,
        longitude=74.4565,
        lgd_code=558301,
        reported_at=base_time - timedelta(hours=2),
    )

    # New incident with 1 case
    new_incident = IncidentCreate(
        report_id="inc-current",
        syndrome_code="SYN_VESICULAR",
        species="Bovine",
        animal_count_affected=1,
        mortality_count=0,
        latitude=19.5312,
        longitude=74.4561,
        lgd_code=558301,
        village_name="Ashwi Budruk",
        reported_at=base_time,
    )

    eval_result = satscan_service.evaluate_cluster(
        new_incident,
        recent_incidents=[too_old, too_far, diff_syndrome],
    )

    # Since all other incidents were excluded, total cases should remain 1 and status should be WATCH
    assert eval_result.total_cases == 1
    assert eval_result.status == "WATCH"
    assert eval_result.ops_score == 0.25
