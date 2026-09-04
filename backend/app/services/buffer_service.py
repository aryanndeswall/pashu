import math
from typing import List, Dict, Any


def generate_geodesic_circle(
    lat: float,
    lon: float,
    radius_meters: float,
    num_points: int = 64,
) -> List[List[float]]:
    """
    Generates a closed geodetic circular polygon ring [[lon, lat], ...]
    accounting for cosine of latitude to eliminate longitudinal distortion.
    """
    R = 6371000.0  # Earth radius in meters
    lat_rad = math.radians(lat)
    cos_lat = math.cos(lat_rad)
    if abs(cos_lat) < 1e-6:
        cos_lat = 1e-6

    ring: List[List[float]] = []
    for i in range(num_points):
        theta = (2.0 * math.pi * i) / num_points
        # Geodesic delta in radians converted to degrees
        delta_lat = (radius_meters * math.cos(theta) / R) * (180.0 / math.pi)
        delta_lon = (radius_meters * math.sin(theta) / (R * cos_lat)) * (180.0 / math.pi)

        ring.append([round(lon + delta_lon, 6), round(lat + delta_lat, 6)])

    # Close the ring: first point must equal last point
    ring.append(ring[0])
    return ring


def generate_containment_buffers(
    center_lat: float,
    center_lon: float,
    cluster_id: str,
) -> Dict[str, Any]:
    """
    Produces official 3-tier concentric biosecurity containment zones (GeoJSON FeatureCollection)
    aligned with DAHD/FAO biosecurity protocol:
    1. INFECTED_ZONE (1 km): Red #dc2626 - Strict quarantine & zero animal movement.
    2. RING_VACCINATION_ZONE (5 km): Amber #f59e0b - Targeted ring vaccination.
    3. SURVEILLANCE_ZONE (10 km): Cyan #06b6d4 - Market closures & highway checkpoints.
    """
    zones = [
        {
            "zone_type": "SURVEILLANCE_ZONE",
            "tier": 3,
            "radius_meters": 10000.0,
            "radius_km": 10.0,
            "stroke": "#06b6d4",
            "stroke_width": 2,
            "fill": "#06b6d4",
            "fill_opacity": 0.15,
            "action": "Market (Haat) Closures & Highway Check-Posts",
            "action_mr": "पशु बाजार (आठवडे बाजार) बंदी व महामार्ग तपासणी नाके",
        },
        {
            "zone_type": "RING_VACCINATION_ZONE",
            "tier": 2,
            "radius_meters": 5000.0,
            "radius_km": 5.0,
            "stroke": "#f59e0b",
            "stroke_width": 2,
            "fill": "#f59e0b",
            "fill_opacity": 0.20,
            "action": "72-Hour Emergency Blanket Ring Vaccination",
            "action_mr": "७२ तासांत संपूर्ण रिंग लसीकरण मोहीम",
        },
        {
            "zone_type": "INFECTED_ZONE",
            "tier": 1,
            "radius_meters": 1000.0,
            "radius_km": 1.0,
            "stroke": "#dc2626",
            "stroke_width": 3,
            "fill": "#dc2626",
            "fill_opacity": 0.30,
            "action": "Complete Movement Freeze & Clinical Search",
            "action_mr": "पूर्ण हालचाल बंदी व घरोघरी पशु तपासणी",
        },
    ]

    features = []

    # Outer-to-inner polygon features for correct rendering stacking
    for z in zones:
        ring = generate_geodesic_circle(
            lat=center_lat,
            lon=center_lon,
            radius_meters=z["radius_meters"],
            num_points=64,
        )
        features.append({
            "type": "Feature",
            "id": f"{cluster_id}_{z['zone_type'].lower()}",
            "properties": {
                "cluster_id": cluster_id,
                "zone_type": z["zone_type"],
                "tier": z["tier"],
                "radius_km": z["radius_km"],
                "radius_meters": z["radius_meters"],
                "stroke": z["stroke"],
                "stroke_width": z["stroke_width"],
                "fill": z["fill"],
                "fill_opacity": z["fill_opacity"],
                "action": z["action"],
                "action_mr": z["action_mr"],
            },
            "geometry": {
                "type": "Polygon",
                "coordinates": [ring],
            },
        })

    # Add epicenter point feature
    features.append({
        "type": "Feature",
        "id": f"{cluster_id}_epicenter",
        "properties": {
            "cluster_id": cluster_id,
            "zone_type": "EPICENTER",
            "title": "Cluster Epicenter",
            "title_mr": "उद्रेक केंद्रबिंदू",
        },
        "geometry": {
            "type": "Point",
            "coordinates": [round(center_lon, 6), round(center_lat, 6)],
        },
    })

    return {
        "type": "FeatureCollection",
        "cluster_id": cluster_id,
        "center": [round(center_lon, 6), round(center_lat, 6)],
        "features": features,
    }
