from app.models.action_intent import ActionIntentType
from app.services.ghost_service import GhostService


def test_generate_ach_manifest():
    service = GhostService()
    payload = {
        "amount": 5000,
        "source_account_name": "Chase Checking",
        "target_account_name": "Strata HYSA",
        "target_account_number": "987654321"
    }

    manifest = service.generate_manifest(
        ActionIntentType.ACH_TRANSFER,
        "chase",
        payload
    )

    assert "steps" in manifest
    assert len(manifest["steps"]) == 3
    assert manifest["steps"][0]["type"] == "NAVIGATION"
    assert "secure05ea.chase.com" in manifest["steps"][0]["url"]

    # Verify snippets
    copy_step = manifest["steps"][1]
    assert copy_step["type"] == "COPY_DATA"
    assert any(s["label"] == "Transfer Amount" and s["copy_value"] == "5000" for s in copy_step["snippets"])

def test_generate_acats_manifest():
    service = GhostService()
    payload = {
        "source_institution": "Fidelity",
        "source_account_number": "Z12345678",
        "source_dtc": "0226"
    }

    manifest = service.generate_manifest(
        ActionIntentType.ACATS_TRANSFER,
        "fidelity",
        payload
    )

    assert len(manifest["steps"]) == 3
    assert "digital.fidelity.com" in manifest["steps"][0]["url"]

    copy_step = manifest["steps"][1]
    assert any(s["label"] == "DTC Number" and s["copy_value"] == "0226" for s in copy_step["snippets"])

def test_fallback_manifest():
    service = GhostService()
    manifest = service.generate_manifest(
        ActionIntentType.CUSTOM,
        "unknown_bank",
        {}
    )

    assert len(manifest["steps"]) == 2
    assert manifest["steps"][0]["url"] == "https://google.com"


def test_generate_manifest_handles_non_numeric_amounts():
    service = GhostService()
    payload = {
        "amount": "not-a-number",
        "sell_amount": "N/A",
        "buy_amount": "",
    }

    ach_manifest = service.generate_manifest(
        ActionIntentType.ACH_TRANSFER,
        "chase",
        payload,
    )
    ach_snippets = ach_manifest["steps"][1]["snippets"]
    assert any(
        s["label"] == "Transfer Amount" and s["value"] == "$0.00"
        for s in ach_snippets
    )

    rebalance_manifest = service.generate_manifest(
        ActionIntentType.REBALANCE,
        "fidelity",
        payload,
    )
    rebalance_steps = rebalance_manifest["steps"]
    sell_snippets = rebalance_steps[1]["snippets"]
    buy_snippets = rebalance_steps[2]["snippets"]
    assert any(
        s["label"] == "Sell Amount" and s["value"] == "$0.00"
        for s in sell_snippets
    )
    assert any(
        s["label"] == "Buy Amount" and s["value"] == "$0.00"
        for s in buy_snippets
    )
