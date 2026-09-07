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
