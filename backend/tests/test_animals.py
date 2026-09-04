from datetime import datetime, timezone, timedelta
import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_health_check(client: AsyncClient):
    response = await client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"
    assert data["service"] == "pashu-suraksha-cloud"


@pytest.mark.asyncio
async def test_register_animal_success(client: AsyncClient):
    payload = {
        "tag_number": "100293847561",
        "owner_name": "Ramesh Patil",
        "owner_mobile": "9876549842",
        "species": "Bovine (Cow)",
        "breed": "Gir",
        "age_months": 36,
        "village_lgd_code": 558301,
        "village_name": "Rahuri",
    }
    response = await client.post("/api/v1/animals", json=payload)
    assert response.status_code == 201
    data = response.json()
    assert data["tag_number"] == "100293847561"
    assert data["formatted_tag"] == "1002-9384-7561"
    assert data["owner_name"] == "Ramesh Patil"
    # Verify DPDP masking
    assert data["owner_phone_masked"] == "+91-XXXXX-9842"
    assert "9876549842" not in str(data)  # Plain text must not leak
    assert data["species"] == "Bovine (Cow)"
    assert data["breed"] == "Gir"
    assert data["age_months"] == 36
    assert data["vaccination_status"] == "UP_TO_DATE"


@pytest.mark.asyncio
async def test_register_animal_duplicate_tag(client: AsyncClient):
    payload = {
        "tag_number": "100293847561",
        "owner_name": "Ramesh Patil",
        "owner_mobile": "9876549842",
        "species": "Bovine (Cow)",
        "breed": "Gir",
        "age_months": 36,
        "village_lgd_code": 558301,
    }
    # First registration succeeds
    resp1 = await client.post("/api/v1/animals", json=payload)
    assert resp1.status_code == 201

    # Second registration with same tag must fail with 409
    resp2 = await client.post("/api/v1/animals", json=payload)
    assert resp2.status_code == 409
    assert "already registered" in resp2.json()["detail"]


@pytest.mark.asyncio
async def test_register_animal_invalid_tag(client: AsyncClient):
    # Invalid tag with only 10 digits
    payload = {
        "tag_number": "1002938475",
        "owner_name": "Ramesh Patil",
        "owner_mobile": "9876549842",
        "species": "Bovine (Cow)",
        "breed": "Gir",
        "age_months": 36,
        "village_lgd_code": 558301,
    }
    response = await client.post("/api/v1/animals", json=payload)
    assert response.status_code == 422


@pytest.mark.asyncio
async def test_get_animal_by_tag(client: AsyncClient):
    # Register animal
    payload = {
        "tag_number": "100293847562",
        "owner_name": "Suresh Kale",
        "owner_mobile": "9812345678",
        "species": "Buffalo",
        "breed": "Murrah",
        "age_months": 48,
        "village_lgd_code": 558301,
        "village_name": "Rahuri",
    }
    await client.post("/api/v1/animals", json=payload)

    # Fetch by tag
    response = await client.get("/api/v1/animals/100293847562")
    assert response.status_code == 200
    data = response.json()
    assert data["tag_number"] == "100293847562"
    assert data["breed"] == "Murrah"
    assert data["owner_phone_masked"] == "+91-XXXXX-5678"

    # Fetch nonexistent tag
    non_existent = await client.get("/api/v1/animals/999999999999")
    assert non_existent.status_code == 404


@pytest.mark.asyncio
async def test_add_vaccination_fmd_booster_calculation(client: AsyncClient):
    # 1. Register animal
    animal_payload = {
        "tag_number": "100293847563",
        "owner_name": "Ganesh Shinde",
        "owner_mobile": "9823456789",
        "species": "Cow",
        "breed": "Khillar",
        "age_months": 24,
        "village_lgd_code": 558302,
    }
    await client.post("/api/v1/animals", json=animal_payload)

    # 2. Add FMD vaccination administered now
    now = datetime.now(timezone.utc)
    vacc_payload = {
        "disease_code": "FMD",
        "dose_number": 1,
        "administered_at": now.isoformat(),
        "batch_number": "FMD-IVRI-2026-B1",
        "veterinarian_name": "Dr. Sunil Deshmukh",
    }
    response = await client.post("/api/v1/animals/100293847563/vaccinations", json=vacc_payload)
    assert response.status_code == 201
    data = response.json()
    assert data["disease_code"] == "FMD"
    assert data["disease_name_marathi"] == "लाळ्या खुरकूत (FMD)"
    assert data["status"] == "UP_TO_DATE"
    assert data["days_remaining"] >= 179  # FMD is 180 days interval

    # 3. Retrieve animal passbook and check vaccination ledger
    animal_resp = await client.get("/api/v1/animals/100293847563")
    assert animal_resp.status_code == 200
    animal_data = animal_resp.json()
    assert len(animal_data["vaccinations"]) == 1
    assert animal_data["vaccinations"][0]["batch_number"] == "FMD-IVRI-2026-B1"


@pytest.mark.asyncio
async def test_add_vaccination_lsd_anthrax_intervals(client: AsyncClient):
    animal_payload = {
        "tag_number": "100293847564",
        "owner_name": "Anil Jadhav",
        "owner_mobile": "9834567890",
        "species": "Goat",
        "breed": "Osmanabadi",
        "age_months": 18,
        "village_lgd_code": 558302,
    }
    await client.post("/api/v1/animals", json=animal_payload)

    # Add LSD vaccination (365 days)
    lsd_resp = await client.post(
        "/api/v1/animals/100293847564/vaccinations",
        json={
            "disease_code": "LSD",
            "dose_number": 1,
            "administered_at": datetime.now(timezone.utc).isoformat(),
            "batch_number": "LSD-GOATPOX-442",
            "veterinarian_name": "Dr. Meera Kulkarni",
        },
    )
    assert lsd_resp.status_code == 201
    lsd_data = lsd_resp.json()
    assert lsd_data["disease_name_marathi"] == "लंपी त्वचा (LSD)"
    assert lsd_data["days_remaining"] >= 364

    # Add Anthrax vaccination (365 days)
    anthrax_resp = await client.post(
        "/api/v1/animals/100293847564/vaccinations",
        json={
            "disease_code": "ANTHRAX",
            "dose_number": 1,
            "administered_at": datetime.now(timezone.utc).isoformat(),
            "batch_number": "STERNE-34F2-89",
            "veterinarian_name": "Dr. Meera Kulkarni",
        },
    )
    assert anthrax_resp.status_code == 201
    anthrax_data = anthrax_resp.json()
    assert anthrax_data["disease_name_marathi"] == "काळपुळी (ॲन्थ्रॅक्स)"
    assert anthrax_data["days_remaining"] >= 364


@pytest.mark.asyncio
async def test_list_animals_with_lgd_filter(client: AsyncClient):
    # Register 2 animals in LGD 558301, 1 in 558302
    animals = [
        {"tag_number": "100293847571", "owner_name": "Farmer Ram", "owner_mobile": "9811111111", "species": "Cow", "age_months": 12, "village_lgd_code": 558301},
        {"tag_number": "100293847572", "owner_name": "Farmer Sham", "owner_mobile": "9822222222", "species": "Cow", "age_months": 24, "village_lgd_code": 558301},
        {"tag_number": "100293847573", "owner_name": "Farmer Anil", "owner_mobile": "9833333333", "species": "Goat", "age_months": 8, "village_lgd_code": 558302},
    ]
    for a in animals:
        res = await client.post("/api/v1/animals", json=a)
        assert res.status_code == 201

    # Filter by 558301
    resp1 = await client.get("/api/v1/animals?village_lgd_code=558301")
    assert resp1.status_code == 200
    data1 = resp1.json()
    assert data1["total"] == 2
    assert len(data1["items"]) == 2

    # Filter by 558302
    resp2 = await client.get("/api/v1/animals?village_lgd_code=558302")
    assert resp2.status_code == 200
    data2 = resp2.json()
    assert data2["total"] == 1
    assert len(data2["items"]) == 1
