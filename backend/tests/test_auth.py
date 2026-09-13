import pytest
from httpx import AsyncClient
from app.services.auth_service import auth_service


@pytest.mark.asyncio
async def test_dpdp_phone_hashing_and_masking():
    phone = "9822000412"
    h1 = auth_service.hash_phone(phone)
    h2 = auth_service.hash_phone("+91 98220-00412")
    assert h1 == h2
    assert len(h1) == 64
    
    masked = auth_service.mask_phone(phone)
    assert masked == "+91 9822X-XX412"


@pytest.mark.asyncio
async def test_request_otp_api(client: AsyncClient):
    payload = {"phone": "9822000412", "role": "consumer"}
    response = await client.post("/api/v1/auth/request-otp", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert data["phone_masked"] == "+91 9822X-XX412"
    assert data["test_otp"] is not None
    assert len(data["test_otp"]) == 6


@pytest.mark.asyncio
async def test_verify_otp_invalid_code(client: AsyncClient):
    payload = {"phone": "9822000412", "otp": "000000", "role": "consumer"}
    response = await client.post("/api/v1/auth/verify-otp", json=payload)
    assert response.status_code == 400
    assert "Invalid or expired OTP" in response.json()["detail"]


@pytest.mark.asyncio
async def test_verify_otp_and_token_flow(client: AsyncClient):
    # 1. Verify OTP with universal demo code 123456
    verify_payload = {"phone": "9822000412", "otp": "123456", "role": "consumer"}
    resp = await client.post("/api/v1/auth/verify-otp", json=verify_payload)
    assert resp.status_code == 200
    auth_data = resp.json()
    assert "access_token" in auth_data
    assert auth_data["token_type"] == "bearer"
    user = auth_data["user"]
    assert user["name"] == "User 0412"
    assert user["role"] == "consumer"
    assert user["mobile_number_masked"] == "+91 9822X-XX412"

    token = auth_data["access_token"]

    # 2. Query /auth/me with Bearer token
    me_resp = await client.get("/api/v1/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert me_resp.status_code == 200
    me_data = me_resp.json()
    assert me_data["id"] == user["id"]
    assert me_data["name"] == "User 0412"

    # 3. Configure offline PIN
    pin_resp = await client.post(
        "/api/v1/auth/pin",
        json={"pin_hash": "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"},
        headers={"Authorization": f"Bearer {token}"},
    )
    assert pin_resp.status_code == 200
    assert pin_resp.json()["success"] is True

    # 4. Verify /auth/me reflects has_offline_pin = True
    me_resp2 = await client.get("/api/v1/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert me_resp2.status_code == 200
    assert me_resp2.json()["has_offline_pin"] is True


@pytest.mark.asyncio
async def test_doctor_and_admin_persona_provisioning(client: AsyncClient):
    # Test Doctor
    doc_resp = await client.post(
        "/api/v1/auth/verify-otp",
        json={"phone": "9423000819", "otp": "123456", "role": "doctor", "secondary_id": "MH-VET-2024-8819"},
    )
    assert doc_resp.status_code == 200
    doc_data = doc_resp.json()
    assert doc_data["user"]["name"] == "User 0819"
    assert doc_data["user"]["role"] == "doctor"
    assert doc_data["user"]["license_or_id"] == "MH-VET-2024-8819"

    # Test Admin
    admin_resp = await client.post(
        "/api/v1/auth/verify-otp",
        json={"phone": "9158000001", "otp": "123456", "role": "admin", "secondary_id": "DVO-AHM-001"},
    )
    assert admin_resp.status_code == 200
    admin_data = admin_resp.json()
    assert admin_data["user"]["name"] == "User 0001"
    assert admin_data["user"]["role"] == "admin"

    # Test GET /doctors
    docs_resp = await client.get("/api/v1/auth/doctors")
    assert docs_resp.status_code == 200
    docs = docs_resp.json()
    assert any(d["role"] == "doctor" for d in docs)
