from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.exc import IntegrityError

from app.api.deps import get_db
from app.models.waitlist import WaitlistUser
from app.schemas.waitlist import WaitlistCreate, WaitlistResponse

router = APIRouter()

@router.post("/", response_model=WaitlistResponse)
async def join_waitlist(
    data: WaitlistCreate,
    db: AsyncSession = Depends(get_db)
):
    """Join the ClearMoney waitlist and collect profile data for hard signals."""
    new_user = WaitlistUser(
        email=data.email,
        role=data.role,
        net_worth_bracket=data.net_worth_bracket,
        interested_tier=data.interested_tier,
        source_tool=data.source_tool,
        referred_by=data.referred_by,
        metadata_json=data.metadata_json
    )
    
    db.add(new_user)
    try:
        await db.commit()
        await db.refresh(new_user)
        return new_user
    except IntegrityError:
        await db.rollback()
        # If already on waitlist, just return the existing record
        result = await db.execute(select(WaitlistUser).where(WaitlistUser.email == data.email))
        existing_user = result.scalar_one()
        return existing_user

@router.get("/{referral_code}", response_model=WaitlistResponse)
async def get_waitlist_status(
    referral_code: str,
    db: AsyncSession = Depends(get_db)
):
    """Get waitlist status by referral code."""
    result = await db.execute(select(WaitlistUser).where(WaitlistUser.referral_code == referral_code))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="Referral code not found")
    return user
