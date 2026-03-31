from decimal import Decimal
from unittest.mock import MagicMock, patch

import pytest

from app.schemas.brokerage import ConnectionCredentials
from app.services.snaptrade_provider import SnapTradeProvider


@pytest.fixture
def mock_credentials() -> ConnectionCredentials:
    return ConnectionCredentials(
        snaptrade_user_id="test_snaptrade_user_id",
        user_secret="test_user_secret",
    )


class MockSymbol:
    def __init__(
        self,
        symbol_id: str,
        ticker: str,
        description: str,
        type_code: str = "EQUITY",
    ):
        self.id = symbol_id
        self.symbol = ticker
        self.description = description
        self.type = MagicMock()
        self.type.code = type_code


class MockHolding:
    def __init__(
        self,
        symbol: MockSymbol,
        units: float,
        price: float | None = None,
        book_value: float | None = None,
        market_value: float | None = None,
    ):
        self.symbol = symbol
        self.units = units
        self.price = price
        self.book_value = book_value
        self.market_value = market_value


class MockBrokerage:
    def __init__(self, brokerage_id: str, name: str):
        self.id = brokerage_id
        self.name = name


class MockBalance:
    def __init__(self, amount: float):
        self.amount = amount


class MockAccountBalance:
    def __init__(self, amount: float):
        self.total = MockBalance(amount)


class MockAccount:
    def __init__(
        self,
        account_id: str,
        name: str,
        account_type: str,
        balance: float,
        brokerage: MockBrokerage,
        currency: str = "USD",
    ):
        self.id = account_id
        self.name = name
        self.type = account_type
        self.balance = MockAccountBalance(balance)
        self.brokerage = brokerage
        self.currency = currency


class MockTransaction:
    def __init__(
        self,
        transaction_id: str,
        transaction_type: str,
        amount: float,
        symbol: MockSymbol | None = None,
        units: float | None = None,
        price: float | None = None,
        currency: str = "USD",
        description: str = "txn",
    ):
        from datetime import datetime, timezone

        self.id = transaction_id
        self.type = transaction_type
        self.amount = amount
        self.symbol = symbol
        self.units = units
        self.price = price
        self.currency = currency
        self.description = description
        self.trade_date = datetime.now(timezone.utc)
        self.settlement_date = datetime.now(timezone.utc)


class TestSnapTradeProvider:
    @patch("app.services.snaptrade_provider.SnapTrade")
    @pytest.mark.asyncio
    async def test_create_link_session(self, mock_snaptrade_class: MagicMock) -> None:
        mock_client = MagicMock()
        mock_snaptrade_class.return_value = mock_client

        mock_register_response = MagicMock()
        mock_register_response.user_secret = "test_secret"
        mock_client.authentication.register_snap_trade_user.return_value = (
            mock_register_response
        )

        mock_login_response = MagicMock()
        mock_login_response.redirect_uri = "https://snaptrade.com/connect/abc123"
        mock_client.authentication.login_snap_trade_user.return_value = (
            mock_login_response
        )

        provider = SnapTradeProvider()
        result = await provider.create_link_session(
            "user_123", "https://app.com/callback"
        )

        assert result.redirect_url == "https://snaptrade.com/connect/abc123"
        assert result.user_secret == "test_secret"

    @patch("app.services.snaptrade_provider.SnapTrade")
    @pytest.mark.asyncio
    async def test_get_accounts(
        self, mock_snaptrade_class: MagicMock, mock_credentials: ConnectionCredentials
    ) -> None:
        mock_client = MagicMock()
        mock_snaptrade_class.return_value = mock_client

        brokerage = MockBrokerage("fidelity_123", "Fidelity Investments")
        mock_client.account_information.get_user_account_details.return_value = [
            MockAccount("acct_1", "Retirement 401k", "401K", 100000.00, brokerage),
            MockAccount("acct_2", "Brokerage", "INDIVIDUAL", 50000.00, brokerage),
        ]

        provider = SnapTradeProvider()
        accounts = await provider.get_accounts(mock_credentials)

        assert len(accounts) == 2
        assert accounts[0].account_type == "401k"
        assert accounts[0].balance == Decimal("100000.0")
        assert accounts[0].institution_name == "Fidelity Investments"
        assert "pdf_generation" in accounts[0].capabilities
        assert accounts[1].account_type == "brokerage"

    @patch("app.services.snaptrade_provider.SnapTrade")
    @pytest.mark.asyncio
    async def test_get_holdings(
        self, mock_snaptrade_class: MagicMock, mock_credentials: ConnectionCredentials
    ) -> None:
        mock_client = MagicMock()
        mock_snaptrade_class.return_value = mock_client
        mock_client.account_information.get_user_holdings.return_value = [
            MockHolding(
                symbol=MockSymbol("sym_1", "AAPL", "Apple Inc.", "EQUITY"),
                units=100.0,
                price=185.50,
                book_value=15000.0,
                market_value=18550.0,
            )
        ]

        provider = SnapTradeProvider()
        holdings = await provider.get_holdings(mock_credentials, "acct_1")

        assert len(holdings) == 1
        assert holdings[0].security.ticker == "AAPL"
        assert holdings[0].security.security_type == "stock"
        assert holdings[0].market_value == Decimal("18550.0")

    @patch("app.services.snaptrade_provider.SnapTrade")
    @pytest.mark.asyncio
    async def test_get_transactions(
        self, mock_snaptrade_class: MagicMock, mock_credentials: ConnectionCredentials
    ) -> None:
        mock_client = MagicMock()
        mock_snaptrade_class.return_value = mock_client
        mock_client.account_information.get_user_account_transactions.return_value = [
            MockTransaction(
                transaction_id="txn_1",
                transaction_type="BUY",
                amount=1000.0,
                symbol=MockSymbol("sym_1", "AAPL", "Apple Inc.", "EQUITY"),
                units=10,
                price=100,
            )
        ]

        provider = SnapTradeProvider()
        transactions = await provider.get_transactions(mock_credentials, "acct_1")

        assert len(transactions) == 1
        assert transactions[0].transaction_type == "buy"
        assert transactions[0].security is not None
        assert transactions[0].security.ticker == "AAPL"

    @patch("app.services.snaptrade_provider.SnapTrade")
    @pytest.mark.asyncio
    async def test_delete_connection(
        self, mock_snaptrade_class: MagicMock, mock_credentials: ConnectionCredentials
    ) -> None:
        mock_client = MagicMock()
        mock_snaptrade_class.return_value = mock_client

        provider = SnapTradeProvider()
        await provider.delete_connection(mock_credentials)

        mock_client.authentication.delete_snap_trade_user.assert_called_once()
