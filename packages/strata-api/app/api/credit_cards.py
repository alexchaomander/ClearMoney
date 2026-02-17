from typing import Any
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.api.deps import get_current_user, get_db
from app.core.config import settings
from app.models.credit_cards import CardBenefit, CardCredit, CreditCard
from app.models.user import User
from app.schemas.credit_cards import CreditCard as CreditCardSchema

router = APIRouter()

@router.get("/", response_model=list[CreditCardSchema])
async def list_credit_cards(
    skip: int = 0,
    limit: int = 100,
    db: AsyncSession = Depends(get_db),
) -> Any:
    """
    Retrieve credit cards.
    """
    query = (
        select(CreditCard)
        .options(selectinload(CreditCard.credits), selectinload(CreditCard.benefits))
        .offset(skip)
        .limit(limit)
    )
    result = await db.execute(query)
    return result.scalars().all()

@router.get("/{card_id}", response_model=CreditCardSchema)
async def get_credit_card(
    card_id: UUID,
    db: AsyncSession = Depends(get_db),
) -> Any:
    """
    Get credit card by ID.
    """
    query = (
        select(CreditCard)
        .options(selectinload(CreditCard.credits), selectinload(CreditCard.benefits))
        .where(CreditCard.id == card_id)
    )
    result = await db.execute(query)
    card = result.scalar_one_or_none()
    if not card:
        raise HTTPException(status_code=404, detail="Credit card not found")
    return card

@router.post("/seed", response_model=CreditCardSchema)
async def seed_amex_platinum(
    db: AsyncSession = Depends(get_db),
    _current_user: User = Depends(get_current_user),
) -> Any:
    """
    Seed Amex Platinum card data (dev helper).
    """
    if not settings.debug:
        raise HTTPException(
            status_code=403,
            detail="Seeding is only available in debug mode"
        )

    # Check if exists
    query = (
        select(CreditCard)
        .options(selectinload(CreditCard.credits), selectinload(CreditCard.benefits))
        .where(CreditCard.name == "Platinum Card® from American Express")
    )
    result = await db.execute(query)
    existing = result.scalar_one_or_none()

    if existing:
        return existing

    card = CreditCard(
        name="Platinum Card® from American Express",
        issuer="American Express",
        annual_fee=695.00,
        image_url="https://icm.aexp-static.com/Internet/Acquisition/US_en/AppContent/OneSite/category/cardarts/platinum-card.png",
        apply_url="https://www.americanexpress.com/us/credit-cards/card/platinum/"
    )
    db.add(card)
    await db.flush() # get ID

    credits = [
        CardCredit(card_id=card.id, name="Hotel Credit", value=200.00, period="annual", description="Get $200 back in statement credits each year on prepaid Fine Hotels + Resorts® or The Hotel Collection bookings with American Express Travel when you pay with your Platinum Card®."),
        CardCredit(card_id=card.id, name="Airline Fee Credit", value=200.00, period="annual", description="Select one qualifying airline and then receive up to $200 in statement credits per calendar year when incidental fees are charged by the airline to your Platinum Card®."),
        CardCredit(card_id=card.id, name="Uber Cash", value=200.00, period="annual", description="Get up to $15 in Uber Cash for US rides or eats orders each month, plus a bonus $20 in December.", category="transportation"),
        CardCredit(card_id=card.id, name="Digital Entertainment Credit", value=240.00, period="annual", description="Get up to $20 back each month on eligible purchases made with your Platinum Card® on one or more of the following: Disney+, a Disney Bundle, ESPN+, Hulu, The New York Times, Peacock, and The Wall Street Journal."),
        CardCredit(card_id=card.id, name="Walmart+ Credit", value=155.00, period="annual", description="Cover the cost of a $12.95 monthly Walmart+ membership with a statement credit after you pay for $12.95 plus applicable taxes with your Platinum Card®."),
        CardCredit(card_id=card.id, name="Saks Credit", value=100.00, period="annual", description="Get up to $50 in statement credits from January through June and up to $50 in statement credits from July through December."),
        CardCredit(card_id=card.id, name="Equinox Credit", value=300.00, period="annual", description="Get up to $300 back each year on eligible Equinox memberships when you pay with your Platinum Card®."),
        CardCredit(card_id=card.id, name="CLEAR® Plus Credit", value=199.00, period="annual", description="Get up to $199 back per calendar year on your CLEAR® Plus Membership.")
    ]

    db.add_all(credits)

    benefits = [
        CardBenefit(card_id=card.id, name="Global Lounge Collection", description="Access to Centurion Lounges, Priority Pass, and more.", valuation_method="subjective", default_value=400.00),
        CardBenefit(card_id=card.id, name="Marriott & Hilton Gold Status", description="Complimentary Gold status with Marriott Bonvoy and Hilton Honors.", valuation_method="subjective", default_value=100.00),
        CardBenefit(card_id=card.id, name="Travel Insurance", description="Trip Delay, Cancellation, and Interruption Insurance.", valuation_method="subjective", default_value=50.00)
    ]

    db.add_all(benefits)

    await db.commit()
    await db.refresh(card)
    return card
