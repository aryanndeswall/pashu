# ponytail: clean, RESTful authentication endpoints for Pashu-Suraksha
import uuid
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Header, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models.user import User
from app.schemas.auth import (
    OtpRequest,
    OtpVerifyRequest,
    PinSetupRequest,
    UserProfileResponse,
    AuthTokenResponse,
    OtpStatusResponse,
)
from app.services.auth_service import auth_service

router = APIRouter(prefix="/auth", tags=["Authentication"])

# Predefined demo persona blueprints matching mobile DEMO_PERSONAS
DEMO_PERSONA_DEFAULTS = {
    "consumer": {
        "id": "usr_farmer_01",
        "name": "Ramesh Patil",
        "name_marathi": "रमेश पाटील",
        "name_hindi": "रमेश पाटिल",
        "district": "Ahmednagar",
        "block": "Rahuri Khurd",
        "village": "Rahuri Khurd",
        "title_marathi": "पशुपालक (दुग्ध उत्पादक)",
        "title_hindi": "पशुपालक (दुग्ध उत्पादक)",
        "title_english": "Livestock Owner (Dairy Farmer)",
    },
    "doctor": {
        "id": "usr_vet_02",
        "name": "Dr. Anjali Deshmukh",
        "name_marathi": "डॉ. अंजली देशमुख",
        "name_hindi": "डॉ. अंजलि देशमुख",
        "district": "Ahmednagar",
        "block": "Rahuri & Sangamner",
        "village": "Dispensary Rahuri",
        "license_or_id": "MH-VET-2024-8819",
        "title_marathi": "पशुधन विकास अधिकारी (LDO)",
        "title_hindi": "पशुधन विकास अधिकारी (LDO)",
        "title_english": "Livestock Development Officer (LDO)",
    },
    "admin": {
        "id": "usr_dvo_03",
        "name": "Dr. S. K. Kulkarni",
        "name_marathi": "डॉ. एस. के. कुलकर्णी",
        "name_hindi": "डॉ. एस. के. कुलकर्णी",
        "district": "Ahmednagar",
        "block": "District Headquarters",
        "village": "Headquarters",
        "license_or_id": "DVO-AHM-001",
        "title_marathi": "जिल्हा पशुसंवर्धन अधिकारी (DVO)",
        "title_hindi": "जिला पशुपालन अधिकारी (DVO)",
        "title_english": "District Veterinary Officer (DVO)",
    },
}


def serialize_user(user: User) -> UserProfileResponse:
    return UserProfileResponse(
        id=user.id,
        name=user.name,
        name_marathi=user.name_marathi,
        name_hindi=user.name_hindi,
        role=user.role,
        mobile_number_masked=user.phone_masked,
        district=user.district,
        block=user.block,
        village=user.village,
        title_marathi=user.title_marathi,
        title_hindi=user.title_hindi,
        title_english=user.title_english,
        license_or_id=user.license_or_id,
        has_offline_pin=bool(user.offline_pin_hash),
    )


async def get_current_user(
    authorization: Optional[str] = Header(None),
    db: AsyncSession = Depends(get_db),
) -> User:
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing or invalid Bearer authorization header",
        )
    token = authorization.split(" ", 1)[1]
    payload = auth_service.decode_access_token(token)
    if not payload or "sub" not in payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token expired or invalid",
        )
    
    result = await db.execute(select(User).where(User.id == payload["sub"]))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )
    return user


@router.post("/request-otp", response_model=OtpStatusResponse)
async def request_otp(payload: OtpRequest):
    """Generates 6-digit OTP and caches it in Redis with 300s TTL."""
    clean_phone = "".join(filter(str.isdigit, payload.phone))
    otp = auth_service.generate_and_store_otp(clean_phone)
    masked = auth_service.mask_phone(clean_phone)

    return OtpStatusResponse(
        success=True,
        message="OTP dispatched successfully to registered mobile number",
        phone_masked=masked,
        expires_in_seconds=300,
        test_otp=otp,  # Returned for ease of testing and SIH demonstration
    )


@router.post("/verify-otp", response_model=AuthTokenResponse)
async def verify_otp(
    payload: OtpVerifyRequest,
    db: AsyncSession = Depends(get_db),
):
    """Verifies OTP, provisions or retrieves User in Neon PostgreSQL, and returns JWT."""
    clean_phone = "".join(filter(str.isdigit, payload.phone))
    is_valid = auth_service.verify_otp(clean_phone, payload.otp)
    if not is_valid:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired OTP code",
        )

    phone_hash = auth_service.hash_phone(clean_phone)
    phone_masked = auth_service.mask_phone(clean_phone)

    # Look up existing user in DB
    result = await db.execute(select(User).where(User.phone_hash == phone_hash))
    user = result.scalar_one_or_none()

    if not user:
        # Check if matches known demo personas
        defaults = DEMO_PERSONA_DEFAULTS.get(payload.role, DEMO_PERSONA_DEFAULTS["consumer"])
        user = User(
            id=f"usr_{uuid.uuid4().hex[:12]}",
            phone_hash=phone_hash,
            phone_masked=phone_masked,
            role=payload.role,
            name=defaults["name"] if clean_phone in ["9822000412", "9423000819", "9158000001"] else f"User {clean_phone[-4:]}",
            name_marathi=defaults.get("name_marathi"),
            name_hindi=defaults.get("name_hindi"),
            district=defaults["district"],
            block=defaults["block"],
            village=defaults.get("village", "Default Village"),
            title_marathi=defaults.get("title_marathi"),
            title_hindi=defaults.get("title_hindi"),
            title_english=defaults.get("title_english"),
            license_or_id=payload.secondary_id or defaults.get("license_or_id"),
        )
        db.add(user)
        await db.commit()
        await db.refresh(user)

    token = auth_service.create_access_token(user.id, user.role)
    return AuthTokenResponse(
        access_token=token,
        token_type="bearer",
        user=serialize_user(user),
    )


@router.get("/me", response_model=UserProfileResponse)
async def get_me(current_user: User = Depends(get_current_user)):
    """Fetches currently authenticated user profile from token."""
    return serialize_user(current_user)


@router.post("/pin")
async def set_offline_pin(
    payload: PinSetupRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Sets offline PIN hash for dead-zone authentication."""
    current_user.offline_pin_hash = payload.pin_hash
    await db.commit()
    return {"success": True, "message": "Offline PIN configured successfully"}
