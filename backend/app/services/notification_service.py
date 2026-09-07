"""
Pashu-Suraksha Notification & Biosecurity Containment Bridge
Dispatches high-priority Firebase Cloud Messaging (FCM) topic broadcasts and
generates statutory biosecurity SMS directives citing Sections 6, 10, and 20
of the Prevention and Control of Infectious and Contagious Diseases in Animals Act, 2009 (PCICDA 2009).
"""

import logging
import uuid
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional

logger = logging.getLogger(__name__)

SYNDROME_NAME_MAP = {
    "SARF": "Anthrax / काळपुळी",
    "VSS": "Foot & Mouth Disease (FMD) / लाळ्या खुरकूत",
    "NSLS": "Lumpy Skin Disease (LSD) / लंपी",
    "HSDS": "Hemorrhagic Septicemia (HS) / घटसर्प",
    "BQ": "Black Quarter (BQ) / एकटांग्या",
    "PPR": "Peste des Petits Ruminants (PPR)",
}


class NotificationService:
    def __init__(self):
        self._dispatched_alerts: List[Dict[str, Any]] = []
        self._messaging_client = None
        self._initialized = False

    def _ensure_firebase_initialized(self):
        if self._initialized:
            return self._messaging_client

        try:
            import firebase_admin
            from firebase_admin import messaging

            if not firebase_admin._apps:
                # If credentials exist, initialize; otherwise dummy app for tests
                try:
                    import os
                    cred_path = os.environ.get("FIREBASE_CREDENTIALS_PATH", "firebase-credentials.json")
                    if os.path.exists(cred_path):
                        from firebase_admin import credentials
                        cred = credentials.Certificate(cred_path)
                        firebase_admin.initialize_app(cred)
                    else:
                        firebase_admin.initialize_app()
                except Exception as ex:
                    logger.debug("Firebase initialize_app non-critical: %s", ex)

            self._messaging_client = messaging
            self._initialized = True
            logger.info("Firebase messaging client initialized successfully.")
        except Exception as e:
            logger.warning("Firebase Admin Messaging unavailable; using simulated push bridge: %s", e)
            self._messaging_client = None
            self._initialized = True

        return self._messaging_client

    def generate_statutory_sms(
        self,
        village: str,
        district: str,
        syndrome_code: str,
        disease_name: Optional[str] = None,
        radius_km: float = 1.0,
    ) -> Dict[str, str]:
        """
        Formulates statutory legal containment directives citing Sections 6, 10, and 20 of PCICDA 2009.
        Returns bilingual English and Marathi SMS text for SMS gateway integration.
        """
        resolved_disease = (
            disease_name
            or SYNDROME_NAME_MAP.get(syndrome_code, f"Syndrome {syndrome_code} Outbreak")
        )

        sms_en = (
            f"STATUTORY ORDER (PCICDA 2009 Sec 6, 10, 20): Contagious disease alert for {resolved_disease} "
            f"in {village}, {district}. Immediate {radius_km:.1f} km biosecurity movement freeze initiated. "
            f"All animal transit, carcass transport, and weekly livestock market gatherings strictly prohibited. "
            f"Violations carry penal consequences under Section 20. District Veterinary Authority / DAHD."
        )

        sms_mr = (
            f"वैधानिक आदेश (PCICDA 2009 कलम ६, १०, २०): {village}, {district} येथे {resolved_disease} संसर्ग "
            f"रोखण्यासाठी {radius_km:.1f} किमी परिसरात तात्काळ जनावरांची हालचाल बंदी लागू करण्यात आली आहे. "
            f"जनावरांची ने-आण, मृतदेह विल्हेवाट आणि आठवडी बाजार पूर्णपणे बंद. उल्लंघनास कलम २० अन्वये दंड व कायदेशीर कारवाई. "
            f"जिल्हा पशुसंवर्धन विभाग."
        )

        return {"en": sms_en, "mr": sms_mr}

    async def dispatch_fcm_alert(
        self,
        topic: str,
        title: str,
        body: str,
        data: Optional[Dict[str, str]] = None,
    ) -> Dict[str, Any]:
        """
        Sends high-priority FCM push notification to a topic (e.g. district_ahmednagar or all_officers).
        Falls back smoothly to in-memory dispatch logging when Firebase network credentials are absent.
        """
        messaging_sdk = self._ensure_firebase_initialized()
        clean_data = {str(k): str(v) for k, v in (data or {}).items()}
        broadcast_id = f"FCM-{uuid.uuid4().hex[:8].upper()}"

        message_id = None
        status = "DISPATCHED"

        if messaging_sdk is not None:
            try:
                message = messaging_sdk.Message(
                    notification=messaging_sdk.Notification(
                        title=title,
                        body=body,
                    ),
                    data=clean_data,
                    topic=topic,
                )
                message_id = messaging_sdk.send(message)
                logger.info("Dispatched FCM message %s to topic %s", message_id, topic)
            except Exception as e:
                logger.warning("FCM send failed (falling back to simulated log): %s", e)
                status = "SIMULATED"
                message_id = f"SIM-{broadcast_id}"
        else:
            status = "SIMULATED"
            message_id = f"SIM-{broadcast_id}"

        record = {
            "broadcast_id": broadcast_id,
            "message_id": message_id,
            "topic": topic,
            "title": title,
            "body": body,
            "data": clean_data,
            "status": status,
            "timestamp": datetime.now(timezone.utc).isoformat(),
        }
        self._dispatched_alerts.append(record)
        return record

    async def broadcast_containment_directive(
        self,
        cluster_id: str,
        syndrome_code: str,
        village_name: str,
        district_name: str,
        epicenter_lat: float,
        epicenter_lon: float,
        movement_freeze_radius_km: float = 1.0,
        ring_vaccination_radius_km: float = 5.0,
        surveillance_radius_km: float = 10.0,
        alert_level: str = "CRITICAL",
        custom_topic: Optional[str] = None,
    ) -> Dict[str, Any]:
        """
        Orchestrates full biosecurity containment broadcast:
        1. Formulates bilingual statutory SMS text under PCICDA 2009.
        2. Dispatches high-priority push alert via FCM to district field officers and veterinarians.
        3. Returns the synthesized broadcast package.
        """
        sanitized_dist = (
            district_name.lower().replace(" ", "_").replace("-", "_")
            if district_name
            else "general"
        )
        topic = custom_topic or f"district_{sanitized_dist}"

        disease_name = SYNDROME_NAME_MAP.get(
            syndrome_code, f"Syndrome {syndrome_code} Outbreak"
        )
        sms_texts = self.generate_statutory_sms(
            village=village_name,
            district=district_name,
            syndrome_code=syndrome_code,
            disease_name=disease_name,
            radius_km=movement_freeze_radius_km,
        )

        title = f"🚨 {alert_level} BIOSECURITY ORDER: {disease_name}"
        body = (
            f"PCICDA 2009 Containment declared for {village_name}, {district_name}. "
            f"{movement_freeze_radius_km:.1f} km Movement Freeze Active."
        )

        data_payload = {
            "cluster_id": cluster_id,
            "syndrome_code": syndrome_code,
            "disease_name": disease_name,
            "village_name": village_name,
            "district_name": district_name,
            "epicenter_lat": str(epicenter_lat),
            "epicenter_lon": str(epicenter_lon),
            "movement_freeze_radius_km": str(movement_freeze_radius_km),
            "ring_vaccination_radius_km": str(ring_vaccination_radius_km),
            "surveillance_radius_km": str(surveillance_radius_km),
            "alert_level": alert_level,
            "action": "BIOSECURITY_CONTAINMENT",
        }

        fcm_result = await self.dispatch_fcm_alert(
            topic=topic,
            title=title,
            body=body,
            data=data_payload,
        )

        return {
            "status": "SUCCESS",
            "broadcast_id": fcm_result["broadcast_id"],
            "cluster_id": cluster_id,
            "fcm_topic": topic,
            "fcm_message_id": fcm_result.get("message_id"),
            "statutory_sms_en": sms_texts["en"],
            "statutory_sms_mr": sms_texts["mr"],
            "timestamp": datetime.now(timezone.utc).isoformat(),
        }

    def get_dispatched_alerts(self) -> List[Dict[str, Any]]:
        return list(self._dispatched_alerts)

    def clear_dispatched_alerts(self) -> None:
        self._dispatched_alerts.clear()


# Global singleton instance
notification_service = NotificationService()
