import asyncio
import uuid

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.api.deps import get_current_user, get_owned_account
from app.db.session import get_async_session
from app.models.cash_account import CashAccount
from app.models.debt_account import DebtAccount
from app.models.holding import Holding
from app.models.investment_account import InvestmentAccount
from app.models.user import User
from app.schemas.cash_account import CashAccountResponse
from app.schemas.debt_account import DebtAccountResponse
from app.schemas.investment_account import (
    InvestmentAccountCreate,
    InvestmentAccountResponse,
    InvestmentAccountUpdate,
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
    # Run queries concurrently since they are independent
    cash_task = session.execute(
        select(CashAccount)
        .where(CashAccount.user_id == user.id)
        .order_by(CashAccount.created_at.desc())
    )
    debt_task = session.execute(
        select(DebtAccount)
        .where(DebtAccount.user_id == user.id)
        .order_by(DebtAccount.created_at.desc())
    )
    investment_task = session.execute(
        select(InvestmentAccount)
        .where(InvestmentAccount.user_id == user.id)
        .order_by(InvestmentAccount.created_at.desc())
    )

    cash_result, debt_result, investment_result = await asyncio.gather(
        cash_task, debt_task, investment_task
    )

    cash_accounts = cash_result.scalars().all()
    debt_accounts = debt_result.scalars().all()
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


@router.post("/investment", response_model=InvestmentAccountResponse, status_code=201)
async def create_investment_account(
    data: InvestmentAccountCreate,
    user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_async_session),
) -> InvestmentAccountResponse:
    """Create a manual investment account (no connection)."""
    account = InvestmentAccount(
        user_id=user.id,
        connection_id=None,
        institution_id=data.institution_id,
        name=data.name,
        account_type=data.account_type,
        provider_account_id=None,
        balance=data.balance,
        currency=data.currency,
        is_tax_advantaged=data.is_tax_advantaged,
    )
    session.add(account)
    await session.commit()
    await session.refresh(account)
    return InvestmentAccountResponse.model_validate(account)


@router.put(
    "/investment/{account_id}", response_model=InvestmentAccountResponse
)
async def update_investment_account(
    account_id: uuid.UUID,
    data: InvestmentAccountUpdate,
    user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_async_session),
) -> InvestmentAccountResponse:
    """Update an investment account."""
    account = await get_owned_account(
        InvestmentAccount, session, account_id, user.id, "Investment account"
    )

    update_data = data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(account, field, value)

    await session.commit()
    await session.refresh(account)
    return InvestmentAccountResponse.model_validate(account)


@router.delete("/investment/{account_id}")
async def delete_investment_account(
    account_id: uuid.UUID,
    user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_async_session),
) -> dict:
    """Delete an investment account and all its holdings."""
    account = await get_owned_account(
        InvestmentAccount, session, account_id, user.id, "Investment account"
    )

    await session.delete(account)
    await session.commit()
    return {"status": "deleted"}
