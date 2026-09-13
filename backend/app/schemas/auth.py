# ponytail: lean, strictly typed auth schemas for Pashu-Suraksha
from typing import Optional
from pydantic import BaseModel, Field


class OtpRequest(BaseModel):
    phone: str = Field(..., description="10-digit Indian mobile number", pattern=r"^[6-9]\d{9}$")
    role: str = Field("consumer", description="Role: consumer, doctor, admin")
    secondary_id: Optional[str] = Field(None, description="Optional VCI License / Sakhi ID / DVO ID")


class OtpVerifyRequest(BaseModel):
    phone: str = Field(..., description="10-digit Indian mobile number", pattern=r"^[6-9]\d{9}$")
    otp: str = Field(..., description="6-digit verification code", min_length=6, max_length=6)
    role: str = Field("consumer", description="Role: consumer, doctor, admin")
    secondary_id: Optional[str] = None


class PinSetupRequest(BaseModel):
    pin_hash: str = Field(..., description="SHA-256 or hashed 4-digit PIN for offline unlock")


class ProfileUpdateRequest(BaseModel):
    name: Optional[str] = None
    name_marathi: Optional[str] = None
    name_hindi: Optional[str] = None
    district: Optional[str] = None
    block: Optional[str] = None
    village: Optional[str] = None
    license_or_id: Optional[str] = None


class UserProfileResponse(BaseModel):
    id: str
    name: str
    name_marathi: Optional[str] = None
    name_hindi: Optional[str] = None
    role: str
    mobile_number_masked: str
    district: str
    block: str
    village: Optional[str] = None
    title_marathi: Optional[str] = None
    title_hindi: Optional[str] = None
    title_english: Optional[str] = None
    license_or_id: Optional[str] = None
    has_offline_pin: bool = False


class AuthTokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserProfileResponse


class OtpStatusResponse(BaseModel):
    success: bool
    message: str
    phone_masked: str
    expires_in_seconds: int
    test_otp: Optional[str] = None  # Populated in non-production for instant verification


# --- Role-Locked Auth Schemas ---

class RoleCredentialRequest(BaseModel):
    """Sent after Firebase sign-in to verify role-specific secondary credential and set custom claim."""
    uid: str = Field(..., description="Firebase UID of the signed-in user")
    role: str = Field(..., description="Requested role: consumer, doctor, admin")
    secondary_id: Optional[str] = Field(
        None,
        description="VCI License ID for doctor, Employee/DVO ID for admin. Not required for consumer."
    )
    name: Optional[str] = Field(None, description="Display name to persist on first registration")
    phone: Optional[str] = Field(None, description="Mobile number for consumer (masked + hashed)")


class RoleCredentialResponse(BaseModel):
    success: bool
    role_confirmed: str
    message: str
    user: Optional[UserProfileResponse] = None


class AdminProvisionRequest(BaseModel):
    """Internal endpoint only — pre-seeds a DVO/Admin account. Requires X-Admin-Secret header."""
    email: str = Field(..., description="Official government email address")
    employee_id: str = Field(..., description="DVO Employee ID (e.g. DVO-AHM-001)")
    name: str
    name_marathi: Optional[str] = None
    district: str
    block: str = "District Headquarters"
    password: str = Field(..., description="Temporary password — user must change on first login")


class AdminProvisionResponse(BaseModel):
    success: bool
    uid: str
    employee_id: str
    message: str
