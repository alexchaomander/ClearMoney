from datetime import datetime
from decimal import Decimal
from unittest.mock import MagicMock, patch
import uuid

import pytest

from app.models.connection import Connection, ConnectionStatus
from app.models.investment_account import InvestmentAccountType
from app.models.security import SecurityType
from app.services.providers.snaptrade import SnapTradeProvider


@pytest.fixture
def mock_connection() -> Connection:
    """Create a mock connection with SnapTrade credentials."""
    conn = Connection(
        id=uuid.uuid4(),
        user_id=uuid.uuid4(),
        provider="snaptrade",
        provider_user_id="snap_user_123",
        credentials={
            "snaptrade_user_id": "test_snaptrade_user_id",
            "user_secret": "test_user_secret",
        },
        status=ConnectionStatus.active,
    )
    return conn


class MockSymbol:
    """Mock SnapTrade symbol object."""

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
    """Mock SnapTrade holding object."""

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
    """Mock SnapTrade brokerage object."""

    def __init__(self, brokerage_id: str, name: str):
        self.id = brokerage_id
        self.name = name


class MockBalance:
    """Mock SnapTrade balance object."""

    def __init__(self, amount: float):
        self.amount = amount


class MockAccountBalance:
    """Mock SnapTrade account balance object."""

    def __init__(self, amount: float):
        self.total = MockBalance(amount)


class MockAccount:
    """Mock SnapTrade account object."""

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


class TestSnapTradeProvider:
    """Tests for SnapTradeProvider."""

    @patch("app.services.providers.snaptrade.SnapTrade")
    def test_create_link_session(self, mock_snaptrade_class: MagicMock) -> None:
        """Test creating a link session."""
        # Setup mock
        mock_client = MagicMock()
        mock_snaptrade_class.return_value = mock_client

        mock_register_response = MagicMock()
        mock_register_response.user_secret = "test_secret"
        mock_client.authentication.register_snap_trade_user.return_value = mock_register_response

        mock_login_response = MagicMock()
        mock_login_response.redirect_uri = "https://snaptrade.com/connect/abc123"
        mock_client.authentication.login_snap_trade_user.return_value = mock_login_response

        # Test
        provider = SnapTradeProvider()
        import asyncio
        result = asyncio.get_event_loop().run_until_complete(
            provider.create_link_session("user_123", "https://app.com/callback")
        )

        # Verify
        assert result.redirect_url == "https://snaptrade.com/connect/abc123"
        assert result.user_secret == "test_secret"
        mock_client.authentication.register_snap_trade_user.assert_called_once()
        mock_client.authentication.login_snap_trade_user.assert_called_once()

    @patch("app.services.providers.snaptrade.SnapTrade")
    def test_get_accounts(
        self, mock_snaptrade_class: MagicMock, mock_connection: Connection
    ) -> None:
        """Test getting accounts from SnapTrade."""
        # Setup mock
        mock_client = MagicMock()
        mock_snaptrade_class.return_value = mock_client

        brokerage = MockBrokerage("fidelity_123", "Fidelity Investments")
        mock_accounts = [
            MockAccount("acct_1", "Retirement 401k", "401K", 100000.00, brokerage),
            MockAccount("acct_2", "Brokerage", "INDIVIDUAL", 50000.00, brokerage),
            MockAccount("acct_3", "Roth IRA", "ROTH_IRA", 25000.00, brokerage),
        ]
        mock_client.account_information.get_user_account_details.return_value = mock_accounts

        # Test
        provider = SnapTradeProvider()
        import asyncio
        accounts = asyncio.get_event_loop().run_until_complete(
            provider.get_accounts(mock_connection)
        )

        # Verify
        assert len(accounts) == 3

        # 401k account
        assert accounts[0].provider_account_id == "acct_1"
        assert accounts[0].name == "Retirement 401k"
        assert accounts[0].account_type == InvestmentAccountType.k401
        assert accounts[0].balance == Decimal("100000.00")
        assert accounts[0].is_tax_advantaged is True
        assert accounts[0].institution_name == "Fidelity Investments"

        # Brokerage account
        assert accounts[1].provider_account_id == "acct_2"
        assert accounts[1].account_type == InvestmentAccountType.brokerage
        assert accounts[1].is_tax_advantaged is False

        # Roth IRA
        assert accounts[2].account_type == InvestmentAccountType.roth_ira
        assert accounts[2].is_tax_advantaged is True

    @patch("app.services.providers.snaptrade.SnapTrade")
    def test_get_holdings(
        self, mock_snaptrade_class: MagicMock, mock_connection: Connection
    ) -> None:
        """Test getting holdings from SnapTrade."""
        # Setup mock
        mock_client = MagicMock()
        mock_snaptrade_class.return_value = mock_client

        mock_holdings = [
            MockHolding(
                symbol=MockSymbol("sym_1", "AAPL", "Apple Inc.", "EQUITY"),
                units=100.0,
                price=185.50,
                book_value=15000.0,
                market_value=18550.0,
            ),
            MockHolding(
                symbol=MockSymbol("sym_2", "VTI", "Vanguard Total Stock Market ETF", "ETF"),
                units=50.0,
                price=250.0,
                book_value=10000.0,
                market_value=12500.0,
            ),
            MockHolding(
                symbol=MockSymbol("sym_3", "BTC", "Bitcoin", "CRYPTOCURRENCY"),
                units=0.5,
                price=60000.0,
                market_value=30000.0,
            ),
        ]
        mock_client.account_information.get_user_holdings.return_value = mock_holdings

        # Test
        provider = SnapTradeProvider()
        import asyncio
        holdings = asyncio.get_event_loop().run_until_complete(
            provider.get_holdings(mock_connection, "acct_1")
        )

        # Verify
        assert len(holdings) == 3

        # Apple stock
        assert holdings[0].security.ticker == "AAPL"
        assert holdings[0].security.name == "Apple Inc."
        assert holdings[0].security.security_type == SecurityType.stock
        assert holdings[0].quantity == Decimal("100.0")
        assert holdings[0].cost_basis == Decimal("15000.0")
        assert holdings[0].market_value == Decimal("18550.0")

        # VTI ETF
        assert holdings[1].security.ticker == "VTI"
        assert holdings[1].security.security_type == SecurityType.etf
        assert holdings[1].quantity == Decimal("50.0")

        # Bitcoin crypto
        assert holdings[2].security.ticker == "BTC"
        assert holdings[2].security.security_type == SecurityType.crypto

    @patch("app.services.providers.snaptrade.SnapTrade")
    def test_delete_connection(
        self, mock_snaptrade_class: MagicMock, mock_connection: Connection
    ) -> None:
        """Test deleting a SnapTrade connection."""
        # Setup mock
        mock_client = MagicMock()
        mock_snaptrade_class.return_value = mock_client

        # Test
        provider = SnapTradeProvider()
        import asyncio
        asyncio.get_event_loop().run_until_complete(
            provider.delete_connection(mock_connection)
        )

        # Verify
        mock_client.authentication.delete_snap_trade_user.assert_called_once()

    @patch("app.services.providers.snaptrade.SnapTrade")
    def test_delete_connection_missing_credentials(
        self, mock_snaptrade_class: MagicMock
    ) -> None:
        """Test deleting a connection with missing credentials doesn't fail."""
        # Setup mock
        mock_client = MagicMock()
        mock_snaptrade_class.return_value = mock_client

        # Connection without credentials
        conn = Connection(
            id=uuid.uuid4(),
            user_id=uuid.uuid4(),
            provider="snaptrade",
            provider_user_id="snap_user_123",
            credentials={},
            status=ConnectionStatus.active,
        )

        # Test - should not raise
        provider = SnapTradeProvider()
        import asyncio
        asyncio.get_event_loop().run_until_complete(provider.delete_connection(conn))

        # Verify - should not call delete since no credentials
        mock_client.authentication.delete_snap_trade_user.assert_not_called()

    def test_map_account_types(self) -> None:
        """Test account type mapping."""
        provider = SnapTradeProvider()

        assert provider._map_account_type("401K") == InvestmentAccountType.k401
        assert provider._map_account_type("401k") == InvestmentAccountType.k401
        assert provider._map_account_type("IRA") == InvestmentAccountType.ira
        assert provider._map_account_type("ROTH_IRA") == InvestmentAccountType.roth_ira
        assert provider._map_account_type("ROTH IRA") == InvestmentAccountType.roth_ira
        assert provider._map_account_type("HSA") == InvestmentAccountType.hsa
        assert provider._map_account_type("INDIVIDUAL") == InvestmentAccountType.brokerage
        assert provider._map_account_type("UNKNOWN") == InvestmentAccountType.other
        assert provider._map_account_type(None) == InvestmentAccountType.other

    def test_map_security_types(self) -> None:
        """Test security type mapping."""
        provider = SnapTradeProvider()

        assert provider._map_security_type("EQUITY") == SecurityType.stock
        assert provider._map_security_type("STOCK") == SecurityType.stock
        assert provider._map_security_type("ETF") == SecurityType.etf
        assert provider._map_security_type("MUTUAL_FUND") == SecurityType.mutual_fund
        assert provider._map_security_type("BOND") == SecurityType.bond
        assert provider._map_security_type("CRYPTOCURRENCY") == SecurityType.crypto
        assert provider._map_security_type("CRYPTO") == SecurityType.crypto
        assert provider._map_security_type("OPTION") == SecurityType.option
        assert provider._map_security_type("UNKNOWN") == SecurityType.other
        assert provider._map_security_type(None) == SecurityType.other

    def test_get_snaptrade_user_id_deterministic(self) -> None:
        """Test that SnapTrade user ID generation is deterministic."""
        provider = SnapTradeProvider()

        user_id = "user_abc123"
        result1 = provider._get_snaptrade_user_id(user_id)
        result2 = provider._get_snaptrade_user_id(user_id)

        assert result1 == result2
        assert len(result1) == 32  # SHA256 truncated to 32 chars

    def test_get_snaptrade_user_id_unique(self) -> None:
        """Test that different users get different SnapTrade IDs."""
        provider = SnapTradeProvider()

        result1 = provider._get_snaptrade_user_id("user_1")
        result2 = provider._get_snaptrade_user_id("user_2")

        assert result1 != result2

    @patch("app.services.providers.snaptrade.SnapTrade")
    def test_get_accounts_missing_credentials(
        self, mock_snaptrade_class: MagicMock
    ) -> None:
        """Test getting accounts with missing credentials raises error."""
        mock_client = MagicMock()
        mock_snaptrade_class.return_value = mock_client

        conn = Connection(
            id=uuid.uuid4(),
            user_id=uuid.uuid4(),
            provider="snaptrade",
            provider_user_id="snap_user_123",
            credentials={},
            status=ConnectionStatus.active,
        )

        provider = SnapTradeProvider()
        import asyncio
        with pytest.raises(ValueError, match="Missing SnapTrade credentials"):
            asyncio.get_event_loop().run_until_complete(provider.get_accounts(conn))

    @patch("app.services.providers.snaptrade.SnapTrade")
    def test_handle_callback(self, mock_snaptrade_class: MagicMock) -> None:
        """Test handling OAuth callback."""
        mock_client = MagicMock()
        mock_snaptrade_class.return_value = mock_client

        provider = SnapTradeProvider()
        import asyncio
        result = asyncio.get_event_loop().run_until_complete(
            provider.handle_callback(
                user_id="user_123",
                user_secret="secret_abc",
                authorization_id="auth_xyz",
            )
        )

        assert "snaptrade_user_id" in result
        assert result["user_secret"] == "secret_abc"
        assert result["authorization_id"] == "auth_xyz"
