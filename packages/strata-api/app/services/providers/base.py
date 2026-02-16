from abc import ABC, abstractmethod
from dataclasses import dataclass
from datetime import date, datetime
from decimal import Decimal

from app.models.connection import Connection
from app.models.investment_account import InvestmentAccountType
from app.models.security import SecurityType
from app.models.transaction import TransactionType
from app.schemas.action_capability import ActionCapability


@dataclass
class LinkSession:
    """Data returned when creating a link session."""

    redirect_url: str
    session_id: str | None = None
    user_secret: str | None = None


@dataclass
class NormalizedSecurity:
    """Normalized security data from any provider."""

    ticker: str | None
    name: str
    security_type: SecurityType
    cusip: str | None = None
    isin: str | None = None
    close_price: Decimal | None = None
    close_price_as_of: datetime | None = None
    provider_security_id: str | None = None


@dataclass
class NormalizedHolding:
    """Normalized holding data from any provider."""

    security: NormalizedSecurity
    quantity: Decimal
    cost_basis: Decimal | None = None
    market_value: Decimal | None = None
    as_of: datetime | None = None
    provider_holding_id: str | None = None


@dataclass
class NormalizedAccount:
    """Normalized account data from any provider."""

    provider_account_id: str
    name: str
    account_type: InvestmentAccountType
    balance: Decimal
    currency: str = "USD"
    is_tax_advantaged: bool = False
    institution_name: str | None = None
    institution_id: str | None = None
    capabilities: list[ActionCapability] | None = None


@dataclass
class NormalizedTransaction:
    """Normalized transaction data from any provider."""

    provider_transaction_id: str | None
    transaction_type: TransactionType | None
    quantity: Decimal | None
    price: Decimal | None
    amount: Decimal | None
    trade_date: date | None
    settlement_date: date | None
    currency: str | None
    description: str | None
    security: NormalizedSecurity | None = None
    source: str | None = None


class BaseProvider(ABC):
    """Base class for investment data providers."""

    provider_name: str = "base"

    @abstractmethod
    def get_capabilities(self) -> list[ActionCapability]:
        """Return list of supported actions for this provider."""
        ...

    @abstractmethod
    async def create_link_session(
        self,
        user_id: str,
        redirect_uri: str | None = None,
    ) -> LinkSession:
        """Create a link session for connecting an account.

        Args:
            user_id: Internal user ID for tracking.
            redirect_uri: Optional URI to redirect after connection.

        Returns:
            LinkSession with redirect URL and session details.
        """
        ...

    @abstractmethod
    async def handle_callback(
        self,
        user_id: str,
        user_secret: str,
        authorization_id: str | None = None,
    ) -> dict:
        """Handle the OAuth callback from the provider.

        Args:
            user_id: Internal user ID.
            user_secret: Provider-specific user secret.
            authorization_id: Optional authorization ID from callback.

        Returns:
            Dict containing connection credentials to store.
        """
        ...

    @abstractmethod
    async def get_accounts(
        self,
        connection: Connection,
    ) -> list[NormalizedAccount]:
        """Get all investment accounts for a connection.

        Args:
            connection: The connection object with credentials.

        Returns:
            List of normalized account data.
        """
        ...

    @abstractmethod
    async def get_holdings(
        self,
        connection: Connection,
        provider_account_id: str,
    ) -> list[NormalizedHolding]:
        """Get holdings for a specific account.

        Args:
            connection: The connection object with credentials.
            provider_account_id: Provider's account identifier.

        Returns:
            List of normalized holding data.
        """
        ...

    @abstractmethod
    async def get_transactions(
        self,
        connection: Connection,
        provider_account_id: str,
    ) -> list[NormalizedTransaction]:
        """Get transactions for a specific account.

        Args:
            connection: The connection object with credentials.
            provider_account_id: Provider's account identifier.

        Returns:
            List of normalized transaction data.
        """
        ...

    @abstractmethod
    async def delete_connection(
        self,
        connection: Connection,
    ) -> None:
        """Delete a connection from the provider.

        Args:
            connection: The connection object with credentials.
        """
        ...
