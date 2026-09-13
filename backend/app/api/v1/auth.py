import uuid
import hashlib
from typing import Optional, List
import firebase_admin
from firebase_admin import auth as firebase_auth, credentials
from fastapi import APIRouter, Depends, HTTPException, Header, status, Query
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
    RoleCredentialRequest,
    RoleCredentialResponse,
    AdminProvisionRequest,
    AdminProvisionResponse,
)
from app.services.auth_service import auth_service
from app.config import settings

# Hardcoded admin allowlist — in production, load from environment or DB
ADMIN_EMPLOYEE_ALLOWLIST = {
    "DVO-AHM-001", "DVO-AHM-002", "DVO-PNE-001", "DVO-NAS-001",
    "DVO-AUR-001", "DVO-LTR-001", "ADMIN-SIH-2026",
}

# VCI license pattern (Maharashtra): MH-VET-YYYY-NNNN or MH-PARA-NNNN
import re
VCI_PATTERN = re.compile(r"^(MH|KA|UP|RJ|GJ)-(?:VET|PARA|LDO)-\d{4}-?\d{2,6}$", re.IGNORECASE)

router = APIRouter(prefix="/auth", tags=["Authentication"])

# Initialize Firebase Admin
if not firebase_admin._apps:
    try:
        import os, json, base64
        if settings.FIREBASE_CREDENTIALS_JSON:
            cred = credentials.Certificate(json.loads(settings.FIREBASE_CREDENTIALS_JSON))
            firebase_admin.initialize_app(cred)
        elif settings.FIREBASE_CREDENTIALS_BASE64:
            cred = credentials.Certificate(json.loads(base64.b64decode(settings.FIREBASE_CREDENTIALS_BASE64).decode("utf-8")))
            firebase_admin.initialize_app(cred)
        elif settings.FIREBASE_CREDENTIALS_PATH and os.path.exists(settings.FIREBASE_CREDENTIALS_PATH):
            cred = credentials.Certificate(settings.FIREBASE_CREDENTIALS_PATH)
            firebase_admin.initialize_app(cred)
        elif os.path.exists("firebase-service-account.json"):
            cred = credentials.Certificate("firebase-service-account.json")
            firebase_admin.initialize_app(cred)
        else:
            firebase_admin.initialize_app()
    except Exception as e:
        print(f"Warning: Firebase init error: {e}")



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


def _hash_string(s: str) -> str:
    return hashlib.sha256(s.encode("utf-8")).hexdigest()


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

    # 1. First try decoding as internal application JWT (issued by OTP service)
    payload = auth_service.decode_access_token(token)
    if payload and "sub" in payload:
        result = await db.execute(select(User).where(User.id == payload["sub"]))
        user = result.scalar_one_or_none()
        if user:
            return user

    # 2. Verify as Firebase ID Token — role MUST come from custom claims, not client
    try:
        decoded_token = firebase_auth.verify_id_token(token)
        uid = decoded_token.get("uid")
        email = decoded_token.get("email")
        # Authoritative role from Firebase custom claims set by /verify-role-credential
        claimed_role = decoded_token.get("role", "consumer")

        if uid:
            result = await db.execute(select(User).where(User.id == uid))
            user = result.scalar_one_or_none()
            if not user:
                # Auto-provision: new Firebase users start as consumer
                # until /verify-role-credential stamps their real role
                user_name = email.split("@")[0] if email else f"User {uid[:4]}"
                user = User(
                    id=uid,
                    phone_hash=_hash_string(uid),
                    phone_masked="Email Login",
                    role=claimed_role,  # from token claim, not client payload
                    name=user_name,
                    district="Unknown",
                    block="Unknown",
                    village="Unknown",
                )
                db.add(user)
                await db.commit()
                await db.refresh(user)
            else:
                # Sync DB role with authoritative token claim if it changed
                if user.role != claimed_role and claimed_role != "consumer":
                    user.role = claimed_role
                    await db.commit()
                    await db.refresh(user)
            return user
    except Exception:
        pass

    # 3. Direct user ID token check (for existing provisioned users)
    if token.startswith("usr_"):
        result = await db.execute(select(User).where(User.id == token))
        user = result.scalar_one_or_none()
        if user:
            return user

    raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Token expired or invalid",
    )


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
        user = User(
            id=f"usr_{uuid.uuid4().hex[:12]}",
            phone_hash=phone_hash,
            phone_masked=phone_masked,
            role=payload.role,
            name=f"User {clean_phone[-4:]}",
            district="Ahmednagar",
            block="Rahuri",
            village=None,
            license_or_id=payload.secondary_id,
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


@router.post("/verify-role-credential", response_model=RoleCredentialResponse)
async def verify_role_credential(
    payload: RoleCredentialRequest,
    db: AsyncSession = Depends(get_db),
):
    """
    Called immediately after Firebase sign-in/sign-up.
    Validates the role-specific secondary credential, then stamps the
    Firebase custom claim {role} on the token so the backend can trust it.
    """
    uid = payload.uid
    role = payload.role.lower()

    if role not in ("consumer", "doctor", "admin"):
        raise HTTPException(status_code=400, detail=f"Unknown role: {role}")

    # --- Role-specific secondary credential validation ---
    if role == "doctor":
        if not payload.secondary_id:
            raise HTTPException(
                status_code=422,
                detail="VCI License / Registration Number is required for Veterinarian accounts.",
            )
        if not VCI_PATTERN.match(payload.secondary_id.strip()):
            raise HTTPException(
                status_code=422,
                detail="Invalid VCI License format. Expected e.g. MH-VET-2024-8819 or MH-PARA-1234.",
            )

    elif role == "admin":
        if not payload.secondary_id:
            raise HTTPException(
                status_code=422,
                detail="Employee / DVO ID is required for Admin accounts.",
            )
        if payload.secondary_id.strip().upper() not in ADMIN_EMPLOYEE_ALLOWLIST:
            raise HTTPException(
                status_code=403,
                detail="Employee ID not found in authorised DVO registry. Contact AHVD to provision your account.",
            )

    # --- Stamp the Firebase custom claim (authoritative role on the token) ---
    try:
        firebase_auth.set_custom_user_claims(uid, {"role": role})
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to set role claim: {e}")

    # --- Upsert User row in DB ---
    result = await db.execute(select(User).where(User.id == uid))
    user = result.scalar_one_or_none()

    if not user:
        phone_val = payload.phone or ""
        role_titles = {
            "consumer": ("पशुपालक", "पशुपालक", "Livestock Owner"),
            "doctor": ("पशुवैद्यकीय अधिकारी", "पशु चिकित्सा अधिकारी", "Veterinary Officer"),
            "admin": ("जिल्हा पशुसंवर्धन अधिकारी", "जिला पशुपालन अधिकारी", "District Veterinary Officer"),
        }
        titles = role_titles.get(role, (None, None, None))
        user = User(
            id=uid,
            phone_hash=_hash_string(phone_val or uid),
            phone_masked=auth_service.mask_phone(phone_val) if phone_val else "Email Login",
            role=role,
            name=payload.name or f"User {uid[:6]}",
            name_marathi=payload.name,
            name_hindi=payload.name,
            district="Ahmednagar",
            block="Rahuri",
            village=None,
            title_marathi=titles[0],
            title_hindi=titles[1],
            title_english=titles[2],
            license_or_id=payload.secondary_id,
        )
        db.add(user)
    else:
        # Update role + secondary ID on existing user
        user.role = role
        if payload.secondary_id:
            user.license_or_id = payload.secondary_id
        if payload.name:
            user.name = payload.name

    await db.commit()
    await db.refresh(user)

    return RoleCredentialResponse(
        success=True,
        role_confirmed=role,
        message=f"Role '{role}' verified and stamped on token.",
        user=serialize_user(user),
    )


@router.get("/doctors", response_model=List[UserProfileResponse])
async def list_registered_doctors(
    district: Optional[str] = Query(None, description="Filter by district"),
    db: AsyncSession = Depends(get_db),
):
    """Retrieves all registered veterinarians and para-vets from the database."""
    stmt = select(User).where(User.role == "doctor")
    if district:
        stmt = stmt.where(User.district.ilike(f"%{district}%"))
    result = await db.execute(stmt)
    doctors = result.scalars().all()
    return [serialize_user(doc) for doc in doctors]


@router.post("/admin/provision", response_model=AdminProvisionResponse)
async def provision_admin(
    payload: AdminProvisionRequest,
    x_admin_secret: Optional[str] = Header(None, alias="X-Admin-Secret"),
    db: AsyncSession = Depends(get_db),
):
    """
    Internal endpoint — pre-seeds a DVO/Admin Firebase account.
    Protected by X-Admin-Secret header. Must be called by AHVD IT team, not end users.
    """
    from app.config import settings as cfg
    expected_secret = getattr(cfg, "ADMIN_PROVISION_SECRET", None)
    if not expected_secret or x_admin_secret != expected_secret:
        raise HTTPException(status_code=403, detail="Invalid or missing admin provision secret.")

    emp_id = payload.employee_id.strip().upper()

    # Create Firebase user
    try:
        fb_user = firebase_auth.create_user(
            email=payload.email,
            password=payload.password,
            display_name=payload.name,
        )
        firebase_auth.set_custom_user_claims(fb_user.uid, {"role": "admin"})
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Firebase user creation failed: {e}")

    # Add to allowlist + DB
    ADMIN_EMPLOYEE_ALLOWLIST.add(emp_id)

    result = await db.execute(select(User).where(User.id == fb_user.uid))
    existing = result.scalar_one_or_none()
    if not existing:
        user = User(
            id=fb_user.uid,
            phone_hash=_hash_string(fb_user.uid),
            phone_masked="Govt Email",
            role="admin",
            name=payload.name,
            name_marathi=payload.name_marathi or payload.name,
            district=payload.district,
            block=payload.block,
            village="Headquarters",
            license_or_id=emp_id,
            title_english="District Veterinary Officer (DVO)",
            title_marathi="जिल्हा पशुसंवर्धन अधिकारी (DVO)",
            title_hindi="जिला पशुपालन अधिकारी (DVO)",
        )
        db.add(user)
        await db.commit()

    return AdminProvisionResponse(
        success=True,
        uid=fb_user.uid,
        employee_id=emp_id,
        message=f"Admin account provisioned for {payload.email} with Employee ID {emp_id}.",
    )
