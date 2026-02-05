import uuid
from datetime import date

from fastapi import APIRouter, Depends, Query
from sqlalchemy import nulls_last, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import require_scopes
from app.db.session import get_async_session
from app.models.investment_account import InvestmentAccount
from app.models.transaction import Transaction
from app.models.user import User
from app.schemas.transaction import TransactionResponse

router = APIRouter(prefix="/transactions", tags=["transactions"])


@router.get("", response_model=list[TransactionResponse])
async def list_transactions(
    account_id: uuid.UUID | None = Query(default=None),
    start_date: date | None = Query(default=None),
    end_date: date | None = Query(default=None),
    limit: int = Query(default=100, ge=1, le=500),
    offset: int = Query(default=0, ge=0),
    user: User = Depends(require_scopes(["transactions:read"])),
    session: AsyncSession = Depends(get_async_session),
) -> list[TransactionResponse]:
    query = (
        select(Transaction)
        .join(InvestmentAccount, Transaction.account_id == InvestmentAccount.id)
        .where(InvestmentAccount.user_id == user.id)
        .order_by(nulls_last(Transaction.trade_date.desc()), Transaction.created_at.desc())
    )

    if account_id:
        query = query.where(Transaction.account_id == account_id)
    if start_date:
        query = query.where(Transaction.trade_date >= start_date)
    if end_date:
        query = query.where(Transaction.trade_date <= end_date)

    query = query.offset(offset).limit(limit)

    result = await session.execute(query)
    transactions = result.scalars().all()

    return [TransactionResponse.model_validate(t) for t in transactions]
