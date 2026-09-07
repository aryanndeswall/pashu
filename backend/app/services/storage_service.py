import os
import base64
import logging
from abc import ABC, abstractmethod
from datetime import datetime, timedelta, timezone
from pathlib import Path
from typing import Optional, Tuple
from pydantic import BaseModel

from app.config import settings

logger = logging.getLogger(__name__)


class StorageUploadResult(BaseModel):
    media_id: str
    sync_id: str
    stored_uri: str
    gs_uri: str
    https_url: str
    file_size_kb: int
    content_type: str
    is_cloud: bool = False


class BaseStorageService(ABC):
    @abstractmethod
    async def upload_media(
        self,
        media_id: str,
        sync_id: str,
        data_bytes: bytes,
        media_type: str = "PHOTO_WEBP",
        content_type: Optional[str] = None,
    ) -> StorageUploadResult:
        """Persists binary data and returns canonical gs:// and HTTPS access URLs."""
        pass

    @abstractmethod
    def generate_presigned_upload_url(
        self,
        media_id: str,
        sync_id: str,
        content_type: str = "image/webp",
        expires_minutes: int = 15,
    ) -> str:
        """Generates a presigned PUT URL for direct client-to-storage upload."""
        pass

    @abstractmethod
    def get_signed_download_url(
        self,
        media_id: str,
        sync_id: str,
        media_type: str = "PHOTO_WEBP",
        expires_minutes: int = 60,
    ) -> str:
        """Generates a secure temporary download URL."""
        pass

    @abstractmethod
    def is_cloud_active(self) -> bool:
        """Returns True if live Google Cloud / Firebase bucket is active."""
        pass


class FirebaseStorageService(BaseStorageService):
    """
    Production storage service integrating Google Cloud Storage via Firebase Admin SDK.
    Directly produces canonical gs:// URIs for Gemini 3.7 / 2.5 Flash multimodal ingestion
    and v4 signed URLs for secure client display.
    """

    def __init__(self, bucket_name: str, credentials_path: str):
        self.bucket_name = bucket_name
        self.credentials_path = credentials_path
        self._bucket = None
        self._initialize()

    def _initialize(self):
        import firebase_admin
        from firebase_admin import credentials, storage

        if not firebase_admin._apps:
            cred = credentials.Certificate(self.credentials_path)
            firebase_admin.initialize_app(
                cred,
                {"storageBucket": self.bucket_name},
            )
            logger.info("Initialized Firebase Admin SDK app with bucket %s", self.bucket_name)

        self._bucket = storage.bucket(self.bucket_name)
        logger.info("Connected to Firebase Storage bucket %s", self.bucket_name)

    def _get_extension_and_content_type(
        self, media_type: str, content_type: Optional[str] = None
    ) -> Tuple[str, str]:
        if "AUDIO" in media_type.upper():
            c_type = content_type or "audio/webm"
            ext = "webm" if "webm" in c_type else "m4a"
            return ext, c_type
        else:
            c_type = content_type or "image/webp"
            ext = "webp" if "webp" in c_type else "jpg"
            return ext, c_type

    async def upload_media(
        self,
        media_id: str,
        sync_id: str,
        data_bytes: bytes,
        media_type: str = "PHOTO_WEBP",
        content_type: Optional[str] = None,
    ) -> StorageUploadResult:
        ext, resolved_content_type = self._get_extension_and_content_type(media_type, content_type)
        blob_path = f"incidents/{sync_id}/{media_id}.{ext}"

        blob = self._bucket.blob(blob_path)
        blob.upload_from_string(data_bytes, content_type=resolved_content_type)

        gs_uri = f"gs://{self.bucket_name}/{blob_path}"
        file_size_kb = max(1, len(data_bytes) // 1024)

        try:
            https_url = blob.generate_signed_url(
                version="v4",
                expiration=timedelta(hours=24),
                method="GET",
            )
        except Exception as e:
            logger.warning("Failed to generate signed download URL: %s. Using public bucket URL.", e)
            https_url = f"https://storage.googleapis.com/{self.bucket_name}/{blob_path}"

        return StorageUploadResult(
            media_id=media_id,
            sync_id=sync_id,
            stored_uri=gs_uri,
            gs_uri=gs_uri,
            https_url=https_url,
            file_size_kb=file_size_kb,
            content_type=resolved_content_type,
            is_cloud=True,
        )

    def generate_presigned_upload_url(
        self,
        media_id: str,
        sync_id: str,
        content_type: str = "image/webp",
        expires_minutes: int = 15,
    ) -> str:
        ext = "webp" if "webp" in content_type else ("webm" if "audio" in content_type else "bin")
        blob_path = f"incidents/{sync_id}/{media_id}.{ext}"
        blob = self._bucket.blob(blob_path)

        return blob.generate_signed_url(
            version="v4",
            expiration=timedelta(minutes=expires_minutes),
            method="PUT",
            content_type=content_type,
        )

    def get_signed_download_url(
        self,
        media_id: str,
        sync_id: str,
        media_type: str = "PHOTO_WEBP",
        expires_minutes: int = 60,
    ) -> str:
        ext, _ = self._get_extension_and_content_type(media_type)
        blob_path = f"incidents/{sync_id}/{media_id}.{ext}"
        blob = self._bucket.blob(blob_path)

        return blob.generate_signed_url(
            version="v4",
            expiration=timedelta(minutes=expires_minutes),
            method="GET",
        )

    def is_cloud_active(self) -> bool:
        return True


class LocalStorageService(BaseStorageService):
    """
    Resilient offline and test runner fallback storage service.
    Persists media assets to the local filesystem and generates deterministic simulated gs://
    and API stream URLs, ensuring 100% test pass rates in zero-credential environments.
    """

    def __init__(self, base_dir: Optional[str] = None):
        self.base_dir = Path(base_dir or os.path.join(os.path.dirname(__file__), "..", "..", "uploads"))
        self.base_dir.mkdir(parents=True, exist_ok=True)
        logger.info("LocalStorageService active at %s", self.base_dir.resolve())

    def _get_extension_and_content_type(
        self, media_type: str, content_type: Optional[str] = None
    ) -> Tuple[str, str]:
        if "AUDIO" in media_type.upper():
            c_type = content_type or "audio/webm"
            ext = "webm" if "webm" in c_type else "m4a"
            return ext, c_type
        else:
            c_type = content_type or "image/webp"
            ext = "webp" if "webp" in c_type else "jpg"
            return ext, c_type

    async def upload_media(
        self,
        media_id: str,
        sync_id: str,
        data_bytes: bytes,
        media_type: str = "PHOTO_WEBP",
        content_type: Optional[str] = None,
    ) -> StorageUploadResult:
        ext, resolved_content_type = self._get_extension_and_content_type(media_type, content_type)
        sync_dir = self.base_dir / sync_id
        sync_dir.mkdir(parents=True, exist_ok=True)

        file_path = sync_dir / f"{media_id}.{ext}"
        file_path.write_bytes(data_bytes)

        gs_uri = f"gs://pashu-suraksha-assets/{sync_id}/{media_id}.{ext}"
        https_url = f"{settings.API_PREFIX}/sync/media/stream/{media_id}"
        file_size_kb = max(1, len(data_bytes) // 1024)

        return StorageUploadResult(
            media_id=media_id,
            sync_id=sync_id,
            stored_uri=gs_uri,
            gs_uri=gs_uri,
            https_url=https_url,
            file_size_kb=file_size_kb,
            content_type=resolved_content_type,
            is_cloud=False,
        )

    def generate_presigned_upload_url(
        self,
        media_id: str,
        sync_id: str,
        content_type: str = "image/webp",
        expires_minutes: int = 15,
    ) -> str:
        return f"{settings.API_PREFIX}/sync/media/upload-direct?media_id={media_id}&sync_id={sync_id}"

    def get_signed_download_url(
        self,
        media_id: str,
        sync_id: str,
        media_type: str = "PHOTO_WEBP",
        expires_minutes: int = 60,
    ) -> str:
        return f"{settings.API_PREFIX}/sync/media/stream/{media_id}"

    def is_cloud_active(self) -> bool:
        return False

    def get_local_path(self, media_id: str) -> Optional[Path]:
        for path in self.base_dir.rglob(f"{media_id}.*"):
            if path.is_file():
                return path
        return None


def get_storage_service() -> BaseStorageService:
    """Factory function providing FirebaseStorageService or LocalStorageService fallback."""
    cred_path = settings.FIREBASE_CREDENTIALS_PATH
    bucket = settings.FIREBASE_STORAGE_BUCKET

    if cred_path:
        # Resolve relative path if needed
        resolved_cred_path = cred_path
        if not os.path.isabs(resolved_cred_path):
            backend_root = os.path.dirname(os.path.dirname(os.path.dirname(__file__)))
            candidate = os.path.join(backend_root, cred_path.lstrip("./"))
            if os.path.exists(candidate):
                resolved_cred_path = candidate

        if os.path.exists(resolved_cred_path) and bucket:
            try:
                return FirebaseStorageService(
                    bucket_name=bucket,
                    credentials_path=resolved_cred_path,
                )
            except Exception as e:
                logger.warning(
                    "Failed to initialize FirebaseStorageService: %s. Falling back to LocalStorageService.",
                    e,
                )

    return LocalStorageService()


storage_service = get_storage_service()
