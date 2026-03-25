from fastapi import APIRouter, Header, Request, Depends
from app.api.deps import get_db
from sqlalchemy.ext.asyncio import AsyncSession
from app.services.billing import BillingService

router = APIRouter(prefix="/webhooks", tags=["Webhooks"])

@router.post("/stripe")
async def stripe_webhook(
    request: Request,
    stripe_signature: str = Header(None),
    db: AsyncSession = Depends(get_db)
):
    payload = await request.body()
    billing_service = BillingService(db)
    return await billing_service.handle_webhook(payload, stripe_signature)
