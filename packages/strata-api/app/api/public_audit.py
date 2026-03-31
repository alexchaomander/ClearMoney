from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from uuid import UUID, uuid4
import asyncio

from app.schemas.public_audit import (
    PublicAuditUploadResponse, 
    PublicAuditStatusResponse,
    PublicAuditManualInput
)
from app.api.deps import get_db
from app.services.public_audit import PublicAuditService
from sqlalchemy.ext.asyncio import AsyncSession

router = APIRouter()

# In-memory store for public sessions (In production, use Redis)
# session_id -> { status, progress, trace_payload }
public_sessions = {}

@router.post("/upload", response_model=PublicAuditUploadResponse)
async def upload_audit_document(
    file: UploadFile = File(...),
    db: AsyncSession = Depends(get_db)
):
    """
    Upload a financial document for public audit (Shot #3).
    Returns a session_id for polling status.
    """
    if not file.filename.lower().endswith((".pdf", ".png", ".jpg", ".jpeg")):
        raise HTTPException(status_code=400, detail="Unsupported file type")
    
    session_id = uuid4()
    public_sessions[session_id] = {"status": "processing", "progress": 10}
    
    file_bytes = await file.read()
    
    # Launch background task (simulated for now, but using real service logic)
    async def run_audit():
        try:
            service = PublicAuditService(db)
            trace = await service.run_public_tax_audit(
                file_bytes, file.filename, file.content_type or "application/pdf"
            )
            public_sessions[session_id] = {
                "status": "success",
                "progress": 100,
                "trace_payload": trace
            }
        except Exception as e:
            public_sessions[session_id] = {
                "status": "error",
                "progress": 100,
                "error_message": str(e)
            }

    asyncio.create_task(run_audit())
    
    return PublicAuditUploadResponse(
        session_id=session_id,
        message="Document uploaded successfully. Audit in progress."
    )

@router.get("/status/{session_id}", response_model=PublicAuditStatusResponse)
async def get_audit_status(session_id: UUID):
    """
    Poll the status of a public audit session.
    """
    session = public_sessions.get(session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    
    return PublicAuditStatusResponse(
        session_id=session_id,
        **session
    )

@router.post("/manual", response_model=PublicAuditStatusResponse)
async def manual_audit_input(data: PublicAuditManualInput):
    """
    Handle manual input for Shot #1 (Founder Runway) or Shot #3 fallback.
    """
    session_id = uuid4()
    # Execute deterministic audit immediately for manual input (Mocked)
    return PublicAuditStatusResponse(
        session_id=session_id,
        status="success",
        progress=100
    )
