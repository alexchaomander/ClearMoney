import pytest
from httpx import AsyncClient, ASGITransport
from sqlalchemy import select

from app.main import app
from app.models.tax_document import TaxDocument
from app.schemas.agent import ContextQualityResponse, DecisionTracePayload, FreshnessStatus
from app.services.public_audit import PublicAuditService

@pytest.mark.asyncio
async def test_manual_audit_input():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        response = await ac.post(
            "/api/v1/public/audit/manual",
            json={"monthly_income": 10000, "monthly_expenses": 5000}
        )
    assert response.status_code == 200
    data = response.json()
    assert "session_id" in data
    assert data["status"] == "success"
    assert data["trace_payload"]["trace_kind"] == "public_manual_audit"

@pytest.mark.asyncio
async def test_upload_audit_document_invalid_type():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        files = {"file": ("test.txt", b"dummy content", "text/plain")}
        response = await ac.post("/api/v1/public/audit/upload", files=files)
    assert response.status_code == 400
    assert response.json()["detail"] == "Unsupported file type"


@pytest.mark.asyncio
async def test_upload_audit_document_too_large():
    oversized = b"x" * (21 * 1024 * 1024)
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        files = {"file": ("large.pdf", oversized, "application/pdf")}
        response = await ac.post("/api/v1/public/audit/upload", files=files)
    assert response.status_code == 400
    assert response.json()["detail"] == "File too large"


@pytest.mark.asyncio
async def test_public_tax_audit_does_not_persist_tax_documents(session, monkeypatch):
    class FakeProvider:
        async def extract(self, _file_bytes, _mime_type, _filename):
            class Result:
                fields = {
                    "wages_tips_compensation": 120000,
                    "federal_income_tax_withheld": 18000,
                }

            return Result()

    service = PublicAuditService(session)
    monkeypatch.setattr(service._extraction_service, "_get_provider", lambda: FakeProvider())

    trace = await service.run_public_tax_audit(
        b"fake-pdf",
        "w2.pdf",
        "application/pdf",
    )

    stored_docs = (await session.execute(select(TaxDocument))).scalars().all()

    assert trace == DecisionTracePayload(
        trace_kind="public_tax_audit",
        title="AI Tax Shield Audit Results",
        summary="We identified $2,100 in potential missing tax shields.",
        recommendation_status="actionable",
        rules_applied=trace.rules_applied,
        confidence_score=0.92,
        determinism_class="deterministic",
        source_tier="ephemeral_upload",
        freshness=FreshnessStatus(is_fresh=True, max_age_hours=24),
        context_quality=ContextQualityResponse(
            continuity_status="healthy",
            recommendation_readiness="ready",
            confidence_score=0.92,
            freshness=FreshnessStatus(is_fresh=True, max_age_hours=24),
            coverage_ratio=1.0,
            active_connection_count=0,
            total_connection_count=0,
            stale_connection_count=0,
            errored_connection_count=0,
        ),
        deterministic={
            "total_impact": 2100.0,
            "wages_detected": 120000.0,
            "withholding_detected": 18000.0,
        },
    )
    assert stored_docs == []
