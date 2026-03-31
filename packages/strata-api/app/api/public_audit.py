import asyncio
from uuid import UUID, uuid4

from fastapi import APIRouter, Depends, File, HTTPException, Request, UploadFile
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.connections import get_session_store
from app.core.rate_limit import limiter
from app.schemas.public_audit import (
    PublicAuditManualInput,
    PublicAuditStatusResponse,
    PublicAuditUploadResponse,
)
from app.services.session_store import SessionStore
from app.api.deps import get_db
from app.db.session import async_session_factory
from app.services.public_audit import PublicAuditService
from app.services.document_extraction import ALLOWED_MIME_TYPES, MAX_FILE_SIZE

router = APIRouter()

PUBLIC_AUDIT_TTL_SECONDS = 60 * 60 * 24


async def _run_public_audit(
    store: SessionStore,
    session_id: UUID,
    file_bytes: bytes,
    filename: str,
    mime_type: str,
) -> None:
    try:
        async with async_session_factory() as session:
            service = PublicAuditService(session)
            trace = await service.run_public_tax_audit(file_bytes, filename, mime_type)
        await store.set(
            str(session_id),
            {
                "status": "success",
                "progress": 100,
                "trace_payload": trace.model_dump(),
            },
            ttl=PUBLIC_AUDIT_TTL_SECONDS,
        )
    except Exception as exc:
        await store.set(
            str(session_id),
            {
                "status": "error",
                "progress": 100,
                "error_message": str(exc),
            },
            ttl=PUBLIC_AUDIT_TTL_SECONDS,
        )

ALLOWED_FILE_SUFFIXES = (".pdf", ".png", ".jpg", ".jpeg")


@router.post("/upload", response_model=PublicAuditUploadResponse)
@limiter.limit("10/minute")
async def upload_audit_document(
    request: Request,
    file: UploadFile = File(...),
    store: SessionStore = Depends(get_session_store),
):
    """
    Upload a financial document for public audit (Shot #3).
    Returns a session_id for polling status.
    """
    filename = file.filename or "upload"
    if not filename.lower().endswith(ALLOWED_FILE_SUFFIXES):
        raise HTTPException(status_code=400, detail="Unsupported file type")
    if file.content_type and file.content_type not in ALLOWED_MIME_TYPES:
        raise HTTPException(status_code=400, detail="Unsupported MIME type")

    del request
    try:
        file_bytes = await file.read()
        if len(file_bytes) > MAX_FILE_SIZE:
            raise HTTPException(status_code=400, detail="File too large")

        session_id = uuid4()
        await store.set(
            str(session_id),
            {"status": "processing", "progress": 10},
            ttl=PUBLIC_AUDIT_TTL_SECONDS,
        )

        asyncio.create_task(
            _run_public_audit(
                store=store,
                session_id=session_id,
                file_bytes=file_bytes,
                filename=filename,
                mime_type=file.content_type or "application/pdf",
            )
        )

        return PublicAuditUploadResponse(
            session_id=session_id,
            message="Document uploaded successfully. Audit in progress.",
        )
    finally:
        await file.close()


@router.get("/status/{session_id}", response_model=PublicAuditStatusResponse)
@limiter.limit("60/minute")
async def get_audit_status(
    request: Request,
    session_id: UUID,
    store: SessionStore = Depends(get_session_store),
):
    """
    Poll the status of a public audit session.
    """
    del request
    session = await store.get(str(session_id))
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    return PublicAuditStatusResponse(session_id=session_id, **session)


@router.post("/manual", response_model=PublicAuditStatusResponse)
@limiter.limit("20/minute")
async def manual_audit_input(
    request: Request,
    data: PublicAuditManualInput,
    db: AsyncSession = Depends(get_db),
):
    """
    Handle manual input for public calculator fallbacks.
    """
    del request
    session_id = uuid4()
    service = PublicAuditService(db)
    trace = await service.run_public_manual_audit(data.model_dump())
    return PublicAuditStatusResponse(
        session_id=session_id,
        status="success",
        progress=100,
        trace_payload=trace,
    )
