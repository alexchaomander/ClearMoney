from datetime import date
from decimal import Decimal

import pytest
from httpx import ASGITransport, AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession

from app.main import app
from app.models import BankTransaction, CashAccount, CashAccountType, User


@pytest.fixture
async def banking_user(session: AsyncSession) -> User:
    user = User(clerk_id="banking_user", email="banking_user@example.com")
    session.add(user)
    await session.commit()
    await session.refresh(user)
    return user


@pytest.fixture
def headers(banking_user: User) -> dict[str, str]:
    return {"x-clerk-user-id": banking_user.clerk_id}


@pytest.fixture
async def bank_tx(session: AsyncSession, banking_user: User) -> BankTransaction:
    account = CashAccount(
        user_id=banking_user.id,
        name="Operating",
        account_type=CashAccountType.checking,
        balance=Decimal("10000.00"),
        is_manual=True,
    )
    session.add(account)
    await session.commit()
    await session.refresh(account)

    tx = BankTransaction(
        cash_account_id=account.id,
        provider_transaction_id="demo_txn_1",
        transaction_date=date(2026, 2, 1),
        name="Uber trip",
        merchant_name="Uber",
        amount=Decimal("-24.70"),
        iso_currency_code="USD",
        primary_category="Travel",
        detailed_category="Taxi",
        reimbursed_at=None,
        reimbursement_memo=None,
    )
    session.add(tx)
    await session.commit()
    await session.refresh(tx)
    return tx


@pytest.mark.asyncio
async def test_patch_reimbursement_sets_and_clears(headers: dict, bank_tx: BankTransaction) -> None:
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        mark = await client.patch(
            f"/api/v1/banking/transactions/{bank_tx.id}",
            headers=headers,
            json={"reimbursed": True, "memo": "  reimbursed via expense report  "},
        )
        assert mark.status_code == 200
        data = mark.json()
        assert data["id"] == str(bank_tx.id)
        assert data["reimbursed_at"] is not None
        assert data["reimbursement_memo"] == "reimbursed via expense report"

        clear = await client.patch(
            f"/api/v1/banking/transactions/{bank_tx.id}",
            headers=headers,
            json={"reimbursed": False, "memo": "ignored"},
        )
        assert clear.status_code == 200
        data2 = clear.json()
        assert data2["id"] == str(bank_tx.id)
        assert data2["reimbursed_at"] is None
        assert data2["reimbursement_memo"] is None


@pytest.mark.asyncio
async def test_patch_reimbursement_requires_ownership(session: AsyncSession, bank_tx: BankTransaction) -> None:
    other_user = User(clerk_id="banking_other", email="banking_other@example.com")
    session.add(other_user)
    await session.commit()
    await session.refresh(other_user)

    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        resp = await client.patch(
            f"/api/v1/banking/transactions/{bank_tx.id}",
            headers={"x-clerk-user-id": other_user.clerk_id},
            json={"reimbursed": True, "memo": "nope"},
        )
        assert resp.status_code == 404
