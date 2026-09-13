import json
import random
from datetime import datetime, timezone, timedelta
from typing import List, Optional, Dict, Any

from app.schemas.lab import (
    LabRequisitionCreate,
    LabRequisitionResponse,
    LabResultSubmit,
    TemperatureLogCreate,
    ColdChainMetrics,
    ColdChainStatus,
)


def utc_now() -> datetime:
    return datetime.now(timezone.utc)


def compute_cold_chain_sla(
    collected_at: datetime,
    current_temp_c: float,
    now: Optional[datetime] = None,
) -> ColdChainMetrics:
    """
    Computes 48-hour cold chain transit SLA compliance, remaining hours, and thermal preservation status.
    """
    if now is None:
        now = utc_now()

    if collected_at.tzinfo is None:
        collected_at = collected_at.replace(tzinfo=timezone.utc)
    if now.tzinfo is None:
        now = now.replace(tzinfo=timezone.utc)

    diff_seconds = max(0.0, (now - collected_at).total_seconds())
    elapsed_hours = round(diff_seconds / 3600.0, 1)
    remaining_hours = round(max(0.0, 48.0 - elapsed_hours), 1)
    percent_elapsed = round(min(100.0, (elapsed_hours / 48.0) * 100.0), 1)

    # Compliance rules:
    # 2°C - 8°C optimal; 8°C - 12°C or >36h warning; >12°C or >=48h breached
    if current_temp_c > 12.0 or elapsed_hours >= 48.0:
        status: ColdChainStatus = "BREACHED"
        is_breached = True
        advisory = "Cold-chain compromised! Temperature > 12°C or SLA > 48h expired. Sample viability impaired."
        advisory_mr = "कोल्ड-चेन मर्यादा ओलांडली! तापमान १२°C पेक्षा जास्त किंवा ४८ तास उलटून गेले. नमुना खराब होण्याची शक्यता."
    elif current_temp_c > 8.0 or elapsed_hours >= 36.0:
        status = "WARNING"
        is_breached = False
        advisory = "Temperature or transit time elevated. Expedite delivery to diagnostic lab."
        advisory_mr = "तापमान किंवा प्रवासाचा वेळ वाढला आहे. लवकरात लवकर प्रयोगशाळेत नमुना पोहोचवा."
    else:
        status = "OPTIMAL"
        is_breached = False
        advisory = "Optimal cold-chain maintained (2°C–8°C). Sample viability intact."
        advisory_mr = "कोल्ड-चेन योग्य राखली आहे (२°C ते ८°C). नमुना सुरक्षित."

    return ColdChainMetrics(
        elapsed_hours=elapsed_hours,
        remaining_hours=remaining_hours,
        percent_elapsed=percent_elapsed,
        cold_chain_status=status,
        is_breached=is_breached,
        current_temp_c=current_temp_c,
        advisory_message=advisory,
        advisory_message_mr=advisory_mr,
    )


class LabService:
    """
    Electronic Laboratory Requisition Form (e-LRF) & Cold-Chain Management Service.
    Enforces the 48-hour diagnostic SLA and automates case escalation to LAB_CONFIRMED.
    """

    def __init__(self):
        self._store: Dict[str, Dict[str, Any]] = {}

    def clear_store(self):
        """Resets in-memory store for isolated unit tests."""
        self._store.clear()

    def generate_requisition_id(self) -> str:
        date_str = datetime.now(timezone.utc).strftime("%Y%m%d")
        rand_code = f"{random.randint(1000, 9999)}"
        return f"LRF-{date_str}-{rand_code}"

    def create_requisition(self, payload: LabRequisitionCreate) -> LabRequisitionResponse:
        req_id = self.generate_requisition_id()
        collected_at = payload.collected_at or utc_now()
        if collected_at.tzinfo is None:
            collected_at = collected_at.replace(tzinfo=timezone.utc)

        qr_data = {
            "req_id": req_id,
            "tag": payload.animal_tag_id,
            "disease": payload.suspected_disease,
            "sample": payload.sample_type,
            "lab": payload.destination_lab,
            "collected": collected_at.isoformat(),
        }

        record: Dict[str, Any] = {
            "requisition_id": req_id,
            "animal_tag_id": payload.animal_tag_id,
            "incident_id": payload.incident_id,
            "cluster_id": payload.cluster_id,
            "vet_id": payload.vet_id,
            "village_name": payload.village_name,
            "district_name": payload.district_name,
            "sample_type": payload.sample_type,
            "suspected_disease": payload.suspected_disease,
            "preservative": payload.preservative,
            "destination_lab": payload.destination_lab,
            "status": "IN_TRANSIT",
            "transit_temp_c": payload.initial_temp_c,
            "temp_breached": payload.initial_temp_c > 12.0,
            "collected_at": collected_at,
            "dispatched_at": utc_now(),
            "received_at": None,
            "test_type": None,
            "test_result": None,
            "result_notes": None,
            "pathologist_id": None,
            "confirmed_at": None,
            "qr_payload": json.dumps(qr_data),
        }

        self._store[req_id] = record
        return self._to_response(record)

    def get_requisition(self, requisition_id: str) -> Optional[LabRequisitionResponse]:
        if requisition_id not in self._store:
            return None
        return self._to_response(self._store[requisition_id])

    def list_requisitions(
        self,
        status: Optional[str] = None,
        animal_tag_id: Optional[str] = None,
        district_name: Optional[str] = None,
    ) -> List[LabRequisitionResponse]:
        results = []
        for rec in self._store.values():
            if status and rec["status"].lower() != status.lower():
                continue
            if animal_tag_id and rec["animal_tag_id"] != animal_tag_id:
                continue
            if district_name and rec.get("district_name") and rec["district_name"].lower() != district_name.lower():
                continue
            results.append(self._to_response(rec))
        return results

    def log_temperature(
        self,
        requisition_id: str,
        payload: TemperatureLogCreate,
    ) -> Optional[LabRequisitionResponse]:
        if requisition_id not in self._store:
            return None

        rec = self._store[requisition_id]
        rec["transit_temp_c"] = payload.temperature_c
        if payload.temperature_c > 12.0:
            rec["temp_breached"] = True

        return self._to_response(rec)

    def submit_result(
        self,
        requisition_id: str,
        payload: LabResultSubmit,
    ) -> Optional[LabRequisitionResponse]:
        if requisition_id not in self._store:
            return None

        rec = self._store[requisition_id]
        rec["test_type"] = payload.test_type
        rec["test_result"] = payload.test_result
        rec["result_notes"] = payload.notes
        rec["pathologist_id"] = payload.pathologist_id

        # Escalation Logic:
        # If positive, escalate to LAB_CONFIRMED
        if payload.test_result == "POSITIVE":
            rec["status"] = "LAB_CONFIRMED"
            rec["confirmed_at"] = utc_now()
        elif payload.test_result == "NEGATIVE":
            rec["status"] = "NEGATIVE"
        else:
            rec["status"] = "TESTING"

        return self._to_response(rec)

    def _to_response(self, rec: Dict[str, Any]) -> LabRequisitionResponse:
        cold_chain = compute_cold_chain_sla(
            collected_at=rec["collected_at"],
            current_temp_c=rec["transit_temp_c"],
        )
        return LabRequisitionResponse(
            requisition_id=rec["requisition_id"],
            animal_tag_id=rec["animal_tag_id"],
            incident_id=rec.get("incident_id"),
            cluster_id=rec.get("cluster_id"),
            vet_id=rec["vet_id"],
            village_name=rec.get("village_name"),
            district_name=rec.get("district_name"),
            sample_type=rec["sample_type"],
            suspected_disease=rec["suspected_disease"],
            preservative=rec.get("preservative"),
            destination_lab=rec["destination_lab"],
            status=rec["status"],
            transit_temp_c=rec["transit_temp_c"],
            temp_breached=rec["temp_breached"],
            collected_at=rec["collected_at"],
            dispatched_at=rec["dispatched_at"],
            received_at=rec.get("received_at"),
            test_type=rec.get("test_type"),
            test_result=rec.get("test_result"),
            result_notes=rec.get("result_notes"),
            pathologist_id=rec.get("pathologist_id"),
            confirmed_at=rec.get("confirmed_at"),
            qr_payload=rec.get("qr_payload"),
            cold_chain=cold_chain,
        )


lab_service = LabService()
