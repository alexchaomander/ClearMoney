from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user, get_db
from app.models.user import User
from app.services.portability import PortabilityService
from app.schemas.portability import FinancialPassport

router = APIRouter(prefix="/portability", tags=["Data Portability"])
portability_service = PortabilityService()


@router.get("/export", response_model=FinancialPassport)
async def export_financial_passport(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> FinancialPassport:
    """
    Generate and download a signed Financial Passport (FPP v1).
    
    This includes your complete financial context, memory, and holdings
    in a standardized machine-readable format for use with other AI agents.
    """
    return await portability_service.generate_passport(current_user.id, db)
