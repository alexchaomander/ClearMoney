import uuid
from typing import Sequence
 
from fastapi import APIRouter, Depends, HTTPException, Response
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
 
from app.api.deps import get_current_user, get_db
from app.models.action_intent import ActionIntent, ActionIntentStatus
from app.models.decision_trace import DecisionTrace
from app.models.user import User
from app.schemas.action_intent import (
    ActionIntentCreate,
    ActionIntentResponse,
    ActionIntentUpdate,
)
from app.services.pdf_generator import PDFGenerator
from app.services.ghost_service import GhostService
 
router = APIRouter(tags=["Action Intents"])
pdf_service = PDFGenerator()
ghost_service = GhostService()



@router.post("/action-intents", response_model=ActionIntentResponse)
async def create_action_intent(
    intent_in: ActionIntentCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> ActionIntent:
    """Create a new action intent (Draft)."""
    if intent_in.decision_trace_id:
        trace_query = select(DecisionTrace).where(
            DecisionTrace.id == intent_in.decision_trace_id,
            DecisionTrace.user_id == current_user.id
        )
        trace_result = await db.execute(trace_query)
        if not trace_result.scalar_one_or_none():
            raise HTTPException(status_code=400, detail="Invalid decision_trace_id")

    # Generate Ghost Navigation Manifest (Era 2 bridge)
    # Enforce consistent key extraction from payload
    institution_slug = intent_in.payload.get("source_institution_slug") or \
                       intent_in.payload.get("institution_slug")
    
    manifest = ghost_service.generate_manifest(
        intent_type=intent_in.intent_type,
        institution_slug=institution_slug,
        payload=intent_in.payload
    )

    intent = ActionIntent(
        user_id=current_user.id,
        intent_type=intent_in.intent_type,
        status=ActionIntentStatus.DRAFT,
        title=intent_in.title,
        description=intent_in.description,
        payload=intent_in.payload,
        impact_summary=intent_in.impact_summary,
        decision_trace_id=intent_in.decision_trace_id,
        execution_manifest=manifest,
    )
    db.add(intent)
    await db.commit()
    await db.refresh(intent)
    return intent


@router.get("/action-intents", response_model=list[ActionIntentResponse])
async def list_action_intents(
    status: ActionIntentStatus | None = None,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> Sequence[ActionIntent]:
    """List all action intents for the user."""
    query = select(ActionIntent).where(ActionIntent.user_id == current_user.id)
    
    if status:
        query = query.where(ActionIntent.status == status)
        
    query = query.order_by(ActionIntent.created_at.desc())
    result = await db.execute(query)
    return result.scalars().all()


@router.get("/action-intents/{intent_id}", response_model=ActionIntentResponse)
async def get_action_intent(
    intent_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> ActionIntent:
    """Get a specific action intent."""
    query = select(ActionIntent).where(
        ActionIntent.id == intent_id, ActionIntent.user_id == current_user.id
    )
    result = await db.execute(query)
    intent = result.scalar_one_or_none()
    
    if not intent:
        raise HTTPException(status_code=404, detail="Action intent not found")
        
    return intent


@router.patch("/action-intents/{intent_id}", response_model=ActionIntentResponse)
async def update_action_intent(
    intent_id: uuid.UUID,
    update_in: ActionIntentUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> ActionIntent:
    """Update an action intent (e.g. mark as executed)."""
    query = select(ActionIntent).where(
        ActionIntent.id == intent_id, ActionIntent.user_id == current_user.id
    )
    result = await db.execute(query)
    intent = result.scalar_one_or_none()
    
    if not intent:
        raise HTTPException(status_code=404, detail="Action intent not found")
        
    update_data = update_in.model_dump(exclude_unset=True)
    allowed_fields = {"status", "payload", "impact_summary", "execution_manifest"}
    for field, value in update_data.items():
        if field in allowed_fields:
            setattr(intent, field, value)
        
    await db.commit()
    await db.refresh(intent)
    return intent


@router.get("/{intent_id}/manifest")
async def get_intent_manifest(
    intent_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Generate and return the PDF manifest for an action intent."""
    query = select(ActionIntent).where(
        ActionIntent.id == intent_id, ActionIntent.user_id == current_user.id
    )
    result = await db.execute(query)
    intent = result.scalar_one_or_none()
    
    if not intent:
        raise HTTPException(status_code=404, detail="Action intent not found")
        
    pdf_bytes = pdf_service.generate_action_manifest(intent)
    
    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={
            "Content-Disposition": f"attachment; filename=strata_intent_{intent_id}.pdf"
        },
    )
