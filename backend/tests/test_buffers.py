import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.services.buffer_service import (
    generate_geodesic_circle,
    generate_containment_buffers,
)
from app.api.v1.clusters import clear_cluster_store


@pytest.fixture(autouse=True)
def reset_clusters():
    clear_cluster_store()
    yield
    clear_cluster_store()


def test_generate_geodesic_circle():
    lat, lon = 19.5312, 74.4561
    ring = generate_geodesic_circle(lat, lon, radius_meters=1000.0, num_points=64)

    # 64 points + 1 to close the loop
    assert len(ring) == 65
    # First point must strictly equal last point to be a valid GeoJSON polygon ring
    assert ring[0] == ring[-1]

    # Verify points lie roughly 1km away
    for pt in ring:
        pt_lon, pt_lat = pt
        assert abs(pt_lat - lat) < 0.02
        assert abs(pt_lon - lon) < 0.02


def test_generate_containment_buffers():
    lat, lon = 19.5312, 74.4561
    cluster_id = "CL-SYN_VESICULAR-558301-TEST"

    fc = generate_containment_buffers(lat, lon, cluster_id)

    assert fc["type"] == "FeatureCollection"
    assert fc["cluster_id"] == cluster_id
    assert len(fc["features"]) == 4

    # 3 Polygons (10km, 5km, 1km) and 1 Point (Epicenter)
    polygons = [f for f in fc["features"] if f["geometry"]["type"] == "Polygon"]
    points = [f for f in fc["features"] if f["geometry"]["type"] == "Point"]

    assert len(polygons) == 3
    assert len(points) == 1

    # Check zone types and colors
    zone_types = [p["properties"]["zone_type"] for p in polygons]
    assert "SURVEILLANCE_ZONE" in zone_types
    assert "RING_VACCINATION_ZONE" in zone_types
    assert "INFECTED_ZONE" in zone_types

    colors = [p["properties"]["stroke"] for p in polygons]
    assert "#06b6d4" in colors  # Cyan 10km
    assert "#f59e0b" in colors  # Amber 5km
    assert "#dc2626" in colors  # Red 1km

    # Confirm closed rings for all polygons
    for poly in polygons:
        ring = poly["geometry"]["coordinates"][0]
        assert ring[0] == ring[-1]
        assert len(ring) == 65


def test_api_cluster_evaluate_and_buffers():
    client = TestClient(app)

    # 1. Evaluate single isolated case (WATCH)
    req1 = {
        "incident": {
            "report_id": "rep-test-01",
            "syndrome_code": "SYN_VESICULAR",
            "species": "Bovine",
            "animal_count_affected": 1,
            "mortality_count": 0,
            "latitude": 19.5312,
            "longitude": 74.4561,
            "lgd_code": 558301,
            "village_name": "Ashwi Budruk",
        }
    }
    resp1 = client.post("/api/v1/clusters/evaluate", json=req1)
    assert resp1.status_code == 200
    data1 = resp1.json()
    assert data1["status"] == "WATCH"
    assert data1["requires_containment_buffers"] is False

    # 2. Evaluate severe outbreak incident (50 cattle in Ashwi Budruk -> Attack Rate ~3.4% > 1.5%)
    req2 = {
        "incident": {
            "report_id": "rep-test-02",
            "syndrome_code": "SYN_VESICULAR",
            "species": "Bovine",
            "animal_count_affected": 50,
            "mortality_count": 1,
            "latitude": 19.5315,
            "longitude": 74.4565,
            "lgd_code": 558301,
            "village_name": "Ashwi Budruk",
        }
    }
    resp2 = client.post("/api/v1/clusters/evaluate", json=req2)
    assert resp2.status_code == 200
    data2 = resp2.json()
    assert data2["status"] == "OUTBREAK_DECLARED"
    assert data2["ops_score"] >= 0.75
    assert data2["requires_containment_buffers"] is True
    cluster_id = data2["cluster_id"]

    # 3. Retrieve active clusters
    resp_active = client.get("/api/v1/clusters/active")
    assert resp_active.status_code == 200
    active_clusters = resp_active.json()
    assert len(active_clusters) >= 1
    assert any(c["cluster_id"] == cluster_id for c in active_clusters)

    # 4. Fetch dynamic buffers as GeoJSON
    resp_buffers = client.get(f"/api/v1/clusters/{cluster_id}/buffers")
    assert resp_buffers.status_code == 200
    buffers_geojson = resp_buffers.json()
    assert buffers_geojson["type"] == "FeatureCollection"
    assert len(buffers_geojson["features"]) == 4

    # Check 1km zone
    infected_zone = next(
        f for f in buffers_geojson["features"]
        if f["properties"].get("zone_type") == "INFECTED_ZONE"
    )
    assert infected_zone["properties"]["radius_km"] == 1.0
    assert infected_zone["properties"]["stroke"] == "#dc2626"
    assert "Complete Movement Freeze" in infected_zone["properties"]["action"]


def test_api_cluster_buffers_not_found():
    client = TestClient(app)
    resp = client.get("/api/v1/clusters/NON_EXISTENT_ID/buffers")
    assert resp.status_code == 404
    assert "not found" in resp.json()["detail"].lower()
