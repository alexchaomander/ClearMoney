from abc import ABC, abstractmethod
from dataclasses import dataclass
from datetime import date
from decimal import Decimal

from app.models.cash_account import CashAccountType
from app.models.connection import Connection


@dataclass
class LinkSession:
    """Data returned when creating a Plaid Link token."""

    link_token: str
    expiration: str | None = None


@dataclass
class NormalizedBankAccount:
    """Normalized bank account data from any banking provider."""

    provider_account_id: str
    name: str
    account_type: CashAccountType
    balance: Decimal
    available_balance: Decimal | None = None
    currency: str = "USD"
    institution_name: str | None = None
    mask: str | None = None


@dataclass
class NormalizedBankTransaction:
    """Normalized bank transaction data from any banking provider."""

    provider_transaction_id: str
    amount: Decimal  # Negative=debit, Positive=credit
    transaction_date: date
    name: str
    pending: bool = False
    posted_date: date | None = None
    primary_category: str | None = None
    detailed_category: str | None = None
    plaid_category: list[str] | None = None
    merchant_name: str | None = None
    payment_channel: str | None = None
    iso_currency_code: str = "USD"


class BaseBankingProvider(ABC):
    """Base class for banking data providers (e.g., Plaid)."""

    provider_name: str = "base_banking"

    @abstractmethod
    async def create_link_token(
        self,
        user_id: str,
        redirect_uri: str | None = None,
    ) -> LinkSession:
        """Create a link token for initializing Plaid Link.

        Args:
            user_id: Internal user ID for tracking.
            redirect_uri: Optional URI to redirect after connection (for OAuth).

        Returns:
            LinkSession with link_token for initializing Plaid Link.
        """
        ...

    @abstractmethod
    async def exchange_public_token(
        self,
        user_id: str,
        public_token: str,
    ) -> dict:
        """Exchange a public token for an access token.

        Args:
            user_id: Internal user ID.
            public_token: Public token from Plaid Link success callback.

        Returns:
            Dict containing credentials (access_token, item_id) to store.
        """
        ...

    @abstractmethod
    async def get_accounts(
        self,
        connection: Connection,
    ) -> list[NormalizedBankAccount]:
        """Get all bank accounts for a connection.

        Args:
            connection: The connection object with credentials.

        Returns:
            List of normalized bank account data.
        """
        ...

    @abstractmethod
    async def get_transactions(
        self,
        connection: Connection,
        start_date: date,
        end_date: date,
    ) -> list[NormalizedBankTransaction]:
        """Get transactions for all accounts in a connection.

        Args:
            connection: The connection object with credentials.
            start_date: Start date for transaction history.
            end_date: End date for transaction history.

        Returns:
            List of normalized transaction data with account_id populated.
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
