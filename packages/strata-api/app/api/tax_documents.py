"""Tax document upload and extraction API."""

from __future__ import annotations

import uuid

from fastapi import APIRouter, Depends, File, Form, HTTPException, Query, UploadFile
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user
from app.db.session import get_async_session
from app.models.tax_document import TaxDocument
from app.models.user import User
from app.schemas.tax_document import (
    PrefillTaxPlanRequest,
    PrefillTaxPlanResponse,
    TaxDocumentListResponse,
    TaxDocumentResponse,
)
from app.services.document_extraction import DocumentExtractionService, MAX_FILE_SIZE

router = APIRouter(prefix="/tax-documents", tags=["tax-documents"])


@router.post("/upload", response_model=TaxDocumentResponse)
async def upload_tax_document(
    file: UploadFile = File(...),
    document_type_hint: str | None = Form(default=None),
    user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_async_session),
) -> TaxDocumentResponse:
    """Upload a tax document for extraction."""
    if not file.content_type:
        raise HTTPException(status_code=422, detail="File content type is required")

    # Read with a hard cap to prevent memory exhaustion from oversized uploads.
    # Read one extra byte beyond the limit so we can detect oversize files
    # without reading the entire body.
    file_bytes = await file.read(MAX_FILE_SIZE + 1)
    if not file_bytes:
        raise HTTPException(status_code=422, detail="Empty file")
    if len(file_bytes) > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=422,
            detail=f"File too large (max {MAX_FILE_SIZE // (1024 * 1024)} MB)",
        )

    service = DocumentExtractionService(session)

    try:
        doc = await service.process_upload(
            user_id=user.id,
            file_bytes=file_bytes,
            filename=file.filename or "unknown",
            mime_type=file.content_type,
            document_type_hint=document_type_hint,
        )
    except ValueError as e:
        raise HTTPException(status_code=422, detail=str(e))

    return TaxDocumentResponse.model_validate(doc)


@router.get("/", response_model=list[TaxDocumentListResponse])
async def list_tax_documents(
    user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_async_session),
    limit: int = Query(50, ge=1, le=200),
) -> list[TaxDocumentListResponse]:
    """List all tax documents for the current user."""
    result = await session.execute(
        select(TaxDocument)
        .where(TaxDocument.user_id == user.id)
        .order_by(TaxDocument.created_at.desc())
        .limit(limit)
    )
    docs = result.scalars().all()
    return [TaxDocumentListResponse.model_validate(doc) for doc in docs]


@router.get("/{document_id}", response_model=TaxDocumentResponse)
async def get_tax_document(
    document_id: uuid.UUID,
    user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_async_session),
) -> TaxDocumentResponse:
    """Get a specific tax document with extracted data."""
    result = await session.execute(
        select(TaxDocument).where(
            TaxDocument.id == document_id,
            TaxDocument.user_id == user.id,
        )
    )
    doc = result.scalar_one_or_none()
    if not doc:
        raise HTTPException(status_code=404, detail="Tax document not found")
    return TaxDocumentResponse.model_validate(doc)


@router.post("/prefill-tax-plan", response_model=PrefillTaxPlanResponse)
async def prefill_tax_plan(
    data: PrefillTaxPlanRequest,
    user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_async_session),
) -> PrefillTaxPlanResponse:
    """Create a tax plan version pre-filled from extracted documents."""
    service = DocumentExtractionService(session)
    try:
        return await service.prefill_tax_plan(
            user_id=user.id,
            document_ids=data.document_ids,
            plan_id=data.plan_id,
            label=data.label,
        )
    except ValueError as e:
        raise HTTPException(status_code=422, detail=str(e))
