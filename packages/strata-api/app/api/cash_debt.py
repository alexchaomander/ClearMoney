import uuid

from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_owned_account, require_scopes
from app.db.session import get_async_session
from app.models.cash_account import CashAccount
from app.models.debt_account import DebtAccount
from app.models.user import User
from app.schemas.cash_account import (
    CashAccountCreate,
    CashAccountResponse,
    CashAccountUpdate,
)
from app.schemas.debt_account import (
    DebtAccountCreate,
    DebtAccountResponse,
    DebtAccountUpdate,
)
from app.services.user_refresh import refresh_user_financials

router = APIRouter(prefix="/accounts", tags=["cash_debt"])


# === Cash Accounts ===


@router.post("/cash", response_model=CashAccountResponse, status_code=201)
async def create_cash_account(
    data: CashAccountCreate,
    user: User = Depends(require_scopes(["accounts:write"])),
    session: AsyncSession = Depends(get_async_session),
) -> CashAccountResponse:
    """Create a new cash account."""
    account = CashAccount(
        user_id=user.id,
        name=data.name,
        account_type=data.account_type,
        balance=data.balance,
        apy=data.apy,
        institution_name=data.institution_name,
    )
    session.add(account)
    await session.commit()
    await session.refresh(account)
    await refresh_user_financials(session, user.id)
    return CashAccountResponse.model_validate(account)


@router.get("/cash", response_model=list[CashAccountResponse])
async def list_cash_accounts(
    user: User = Depends(require_scopes(["accounts:read"])),
    session: AsyncSession = Depends(get_async_session),
) -> list[CashAccountResponse]:
    """List all cash accounts for the current user."""
    result = await session.execute(
        select(CashAccount)
        .where(CashAccount.user_id == user.id)
        .order_by(CashAccount.created_at.desc())
    )
    accounts = result.scalars().all()
    return [CashAccountResponse.model_validate(a) for a in accounts]


@router.put("/cash/{account_id}", response_model=CashAccountResponse)
async def update_cash_account(
    account_id: uuid.UUID,
    data: CashAccountUpdate,
    user: User = Depends(require_scopes(["accounts:write"])),
    session: AsyncSession = Depends(get_async_session),
) -> CashAccountResponse:
    """Update a cash account."""
    account = await get_owned_account(
        CashAccount, session, account_id, user.id, "Cash account"
    )

    update_data = data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(account, field, value)

    await session.commit()
    await session.refresh(account)
    await refresh_user_financials(session, user.id)
    return CashAccountResponse.model_validate(account)


@router.delete("/cash/{account_id}")
async def delete_cash_account(
    account_id: uuid.UUID,
    user: User = Depends(require_scopes(["accounts:write"])),
    session: AsyncSession = Depends(get_async_session),
) -> dict:
    """Delete a cash account."""
    account = await get_owned_account(
        CashAccount, session, account_id, user.id, "Cash account"
    )

    await session.delete(account)
    await session.commit()
    await refresh_user_financials(session, user.id)
    return {"status": "deleted"}


# === Debt Accounts ===


@router.post("/debt", response_model=DebtAccountResponse, status_code=201)
async def create_debt_account(
    data: DebtAccountCreate,
    user: User = Depends(require_scopes(["accounts:write"])),
    session: AsyncSession = Depends(get_async_session),
) -> DebtAccountResponse:
    """Create a new debt account."""
    account = DebtAccount(
        user_id=user.id,
        name=data.name,
        debt_type=data.debt_type,
        balance=data.balance,
        interest_rate=data.interest_rate,
        minimum_payment=data.minimum_payment,
        institution_name=data.institution_name,
    )
    session.add(account)
    await session.commit()
    await session.refresh(account)
    await refresh_user_financials(session, user.id)
    return DebtAccountResponse.model_validate(account)


@router.get("/debt", response_model=list[DebtAccountResponse])
async def list_debt_accounts(
    user: User = Depends(require_scopes(["accounts:read"])),
    session: AsyncSession = Depends(get_async_session),
) -> list[DebtAccountResponse]:
    """List all debt accounts for the current user."""
    result = await session.execute(
        select(DebtAccount)
        .where(DebtAccount.user_id == user.id)
        .order_by(DebtAccount.created_at.desc())
    )
    accounts = result.scalars().all()
    return [DebtAccountResponse.model_validate(a) for a in accounts]


@router.put("/debt/{account_id}", response_model=DebtAccountResponse)
async def update_debt_account(
    account_id: uuid.UUID,
    data: DebtAccountUpdate,
    user: User = Depends(require_scopes(["accounts:write"])),
    session: AsyncSession = Depends(get_async_session),
) -> DebtAccountResponse:
    """Update a debt account."""
    account = await get_owned_account(
        DebtAccount, session, account_id, user.id, "Debt account"
    )

    update_data = data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(account, field, value)

    await session.commit()
    await session.refresh(account)
    await refresh_user_financials(session, user.id)
    return DebtAccountResponse.model_validate(account)


@router.delete("/debt/{account_id}")
async def delete_debt_account(
    account_id: uuid.UUID,
    user: User = Depends(require_scopes(["accounts:write"])),
    session: AsyncSession = Depends(get_async_session),
) -> dict:
    """Delete a debt account."""
    account = await get_owned_account(
        DebtAccount, session, account_id, user.id, "Debt account"
    )

    await session.delete(account)
    await session.commit()
    await refresh_user_financials(session, user.id)
    return {"status": "deleted"}
