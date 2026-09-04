import pytest
from fastapi.testclient import TestClient
from app.main import app


def test_get_epi_curve():
    client = TestClient(app)
    resp = client.get("/api/v1/gis/epi-curve?district=Ahmednagar&syndrome=SYN_VESICULAR")
    assert resp.status_code == 200
    data = resp.json()

    assert data["district_name"] == "Ahmednagar"
    assert data["syndrome_code"] == "SYN_VESICULAR"
    assert len(data["points"]) == 14
    assert data["total_suspected"] > 50
    assert data["total_confirmed"] > 20
    assert data["total_deaths"] >= 2
    assert data["peak_day"] != ""

    # Check reproduction number (Rt) trajectory
    first_pt = data["points"][0]
    peak_pt = next(p for p in data["points"] if p["date"] == data["peak_day"])
    last_pt = data["points"][-1]

    # Epidemic curve should show growth -> peak (Rt > 2.0) -> decay post-containment (Rt < 1.0)
    assert peak_pt["reproduction_number"] >= 2.5
    assert last_pt["reproduction_number"] < 1.0


def test_generate_market_closure_memo():
    client = TestClient(app)
    payload = {
        "cluster_id": "CL-SYN_VESICULAR-558301",
        "district_name": "Ahmednagar",
        "magistrate_name": "जिल्हा दंडाधिकारी, अहमदनगर (District Collector & DM)",
        "affected_villages": ["Ashwi Budruk", "Rahuri Rural", "Sangamner Khurd"],
        "closed_haats": ["राहुरी आठवडे पशु बाजार (Rahuri Cattle Haat)", "संगमनेर बैल बाजार"],
        "quarantine_checkpoints": ["SH-10 Rahuri Toll Barrier", "NH-160 Shirdi Checkpost"],
    }

    resp = client.post("/api/v1/gis/market-closure-memo", json=payload)
    assert resp.status_code == 200
    data = resp.json()

    assert data["memo_reference_no"].startswith("ADM/PCICDA/AHM/")
    assert "कलम ६, १० व २०" in data["act_citation"] or "Sections 6, 10 & 20" in data["act_citation"]
    assert "आठवडे पशु बाजार तात्काळ बंदी" in data["order_headline_mr"]
    assert "Immediate Closure of Livestock Markets" in data["order_headline_en"]

    # Verify operative legal clauses in full memos
    assert "नियंत्रित क्षेत्र" in data["full_memo_marathi"]
    assert "राहुरी आठवडे पशु बाजार" in data["full_memo_marathi"]
    assert "CONTROLLED BIOSECURITY ZONE" in data["full_memo_english"]
    assert "Rahuri Cattle Haat" in data["full_memo_english"]


def test_dispatch_idsp_alert():
    client = TestClient(app)
    payload = {
        "cluster_id": "CL-SYN_VESICULAR-558301",
        "syndrome_code": "SYN_VESICULAR",
        "suspected_disease": "Foot-and-Mouth Disease (FMD)",
        "district_name": "Ahmednagar",
        "human_contacts_flagged": 14,
        "risk_level": "HIGH",
    }

    resp = client.post("/api/v1/gis/idsp-dispatch", json=payload)
    assert resp.status_code == 200
    data = resp.json()

    assert data["dispatch_id"].startswith("IDSP-DSU-AHM-")
    assert data["status"] == "DISPATCHED_TO_NCDC_PORTAL"
    assert "National Centre for Disease Control" in data["target_agency"]
    assert len(data["recommended_actions"]) >= 3
    assert any("human fever" in a.lower() for a in data["recommended_actions"])


def test_run_ahmednagar_simulation():
    client = TestClient(app)
    resp = client.post("/api/v1/gis/simulation/run")
    assert resp.status_code == 200
    data = resp.json()

    assert data["total_steps"] == 7
    assert data["final_containment_status"] == "CONTAINED_AND_QUARANTINED"
    assert len(data["steps"]) == 7

    # Verify all 7 key milestones
    step1 = data["steps"][0]
    assert step1["step_number"] == 1
    assert "Ashwi Budruk" in step1["step_title"]

    step2 = data["steps"][1]
    assert step2["step_number"] == 2
    assert "Gemini" in step2["step_title"]

    step3 = data["steps"][2]
    assert step3["step_number"] == 3
    assert "SaTScan" in step3["step_title"]
    assert step3["metrics"]["attack_rate_pct"] > 1.5

    step4 = data["steps"][3]
    assert step4["step_number"] == 4
    assert step4["metrics"]["infected_zone_km"] == 1.0

    step5 = data["steps"][4]
    assert step5["step_number"] == 5
    assert "e-LRF" in step5["step_title"]

    step6 = data["steps"][5]
    assert step6["step_number"] == 6
    assert step6["metrics"]["case_escalation"] == "LAB_CONFIRMED"

    step7 = data["steps"][6]
    assert step7["step_number"] == 7
    assert "PCICDA" in step7["step_title"]
