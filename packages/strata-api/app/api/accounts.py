import uuid

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.api.deps import get_current_user
from app.db.session import get_async_session
from app.models.cash_account import CashAccount
from app.models.debt_account import DebtAccount
from app.models.holding import Holding
from app.models.investment_account import InvestmentAccount
from app.models.security import Security
from app.models.user import User
from app.schemas.cash_account import CashAccountResponse
from app.schemas.debt_account import DebtAccountResponse
from app.schemas.holding import HoldingWithSecurityResponse
from app.schemas.investment_account import (
    InvestmentAccountResponse,
    InvestmentAccountWithHoldingsResponse,
)
from app.schemas.security import SecurityResponse

router = APIRouter(prefix="/accounts", tags=["accounts"])


@router.get("", response_model=dict)
async def list_all_accounts(
    user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_async_session),
) -> dict:
    """List all accounts (cash, debt, investment) for the current user."""
    # Get cash accounts
    cash_result = await session.execute(
        select(CashAccount)
        .where(CashAccount.user_id == user.id)
        .order_by(CashAccount.created_at.desc())
    )
    cash_accounts = cash_result.scalars().all()

    # Get debt accounts
    debt_result = await session.execute(
        select(DebtAccount)
        .where(DebtAccount.user_id == user.id)
        .order_by(DebtAccount.created_at.desc())
    )
    debt_accounts = debt_result.scalars().all()

    # Get investment accounts
    investment_result = await session.execute(
        select(InvestmentAccount)
        .where(InvestmentAccount.user_id == user.id)
        .order_by(InvestmentAccount.created_at.desc())
    )
    investment_accounts = investment_result.scalars().all()

    return {
        "cash_accounts": [CashAccountResponse.model_validate(a) for a in cash_accounts],
        "debt_accounts": [DebtAccountResponse.model_validate(a) for a in debt_accounts],
        "investment_accounts": [
            InvestmentAccountResponse.model_validate(a) for a in investment_accounts
        ],
    }


@router.get("/investment", response_model=list[InvestmentAccountResponse])
async def list_investment_accounts(
    user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_async_session),
) -> list[InvestmentAccountResponse]:
    """List all investment accounts for the current user."""
    result = await session.execute(
        select(InvestmentAccount)
        .where(InvestmentAccount.user_id == user.id)
        .order_by(InvestmentAccount.created_at.desc())
    )
    accounts = result.scalars().all()

    return [InvestmentAccountResponse.model_validate(a) for a in accounts]


@router.get("/investment/{account_id}", response_model=InvestmentAccountWithHoldingsResponse)
async def get_investment_account(
    account_id: uuid.UUID,
    user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_async_session),
) -> InvestmentAccountWithHoldingsResponse:
    """Get a specific investment account with its holdings."""
    result = await session.execute(
        select(InvestmentAccount)
        .options(
            selectinload(InvestmentAccount.holdings).selectinload(Holding.security)
        )
        .where(
            InvestmentAccount.id == account_id,
            InvestmentAccount.user_id == user.id,
        )
    )
    account = result.scalar_one_or_none()

    if not account:
        raise HTTPException(status_code=404, detail="Investment account not found")

    # Manually construct the response with holdings
    holdings_data = []
    for holding in account.holdings:
        security_data = SecurityResponse.model_validate(holding.security)
        holding_data = {
            "id": holding.id,
            "account_id": holding.account_id,
            "security_id": holding.security_id,
            "quantity": holding.quantity,
            "cost_basis": holding.cost_basis,
            "market_value": holding.market_value,
            "as_of": holding.as_of,
            "created_at": holding.created_at,
            "updated_at": holding.updated_at,
            "security": security_data.model_dump(),
        }
        holdings_data.append(holding_data)

    response_data = InvestmentAccountResponse.model_validate(account).model_dump()
    response_data["holdings"] = holdings_data

    return InvestmentAccountWithHoldingsResponse(**response_data)
