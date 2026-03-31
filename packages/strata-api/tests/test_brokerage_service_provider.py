from decimal import Decimal

import pytest

from app.models.connection import Connection, ConnectionStatus
from app.models.investment_account import InvestmentAccountType
from app.models.security import SecurityType
from app.models.transaction import TransactionType
from app.services.providers.brokerage_service import BrokerageServiceProvider


@pytest.fixture
def mock_connection() -> Connection:
    return Connection(
        provider="snaptrade",
        provider_user_id="snap_user_123",
        credentials={
            "snaptrade_user_id": "test_snaptrade_user_id",
            "user_secret": "test_user_secret",
        },
        status=ConnectionStatus.active,
    )


@pytest.mark.asyncio
async def test_brokerage_service_provider_maps_payload(monkeypatch, mock_connection):
    monkeypatch.setenv("STRATA_BROKERAGE_SERVICE_URL", "http://brokerage.test")
    monkeypatch.setenv("STRATA_BROKERAGE_INTERNAL_TOKEN", "secret")

    provider = BrokerageServiceProvider()

    async def fake_post(path: str, payload: dict):
        if path.endswith("/accounts"):
            return [
                {
                    "provider_account_id": "acct_1",
                    "name": "Brokerage",
                    "account_type": "brokerage",
                    "balance": "1000.00",
                    "currency": "USD",
                    "is_tax_advantaged": False,
                    "institution_name": "Fidelity",
                    "institution_id": "fid-1",
                    "capabilities": ["read_only", "internal_rebalance"],
                }
            ]
        if path.endswith("/holdings"):
            return [
                {
                    "security": {
                        "ticker": "AAPL",
                        "name": "Apple Inc.",
                        "security_type": "stock",
                    },
                    "quantity": "10",
                    "cost_basis": "1000.00",
                    "market_value": "1200.00",
                }
            ]
        if path.endswith("/transactions"):
            return [
                {
                    "provider_transaction_id": "txn_1",
                    "transaction_type": "buy",
                    "quantity": "10",
                    "price": "100.00",
                    "amount": "1000.00",
                    "trade_date": "2026-03-31",
                    "settlement_date": "2026-03-31",
                    "currency": "USD",
                    "description": "Buy AAPL",
                    "security": {
                        "ticker": "AAPL",
                        "name": "Apple Inc.",
                        "security_type": "stock",
                    },
                    "source": "snaptrade",
                }
            ]
        raise AssertionError(f"Unexpected path {path}")

    monkeypatch.setattr(provider, "_post", fake_post)

    accounts = await provider.get_accounts(mock_connection)
    holdings = await provider.get_holdings(mock_connection, "acct_1")
    transactions = await provider.get_transactions(mock_connection, "acct_1")

    assert accounts[0].account_type == InvestmentAccountType.brokerage
    assert accounts[0].balance == Decimal("1000.00")
    assert holdings[0].security.security_type == SecurityType.stock
    assert transactions[0].transaction_type == TransactionType.buy
