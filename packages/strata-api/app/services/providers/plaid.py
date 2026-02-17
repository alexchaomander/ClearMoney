import hashlib
import logging
from datetime import date
from decimal import Decimal
from typing import Any

try:
    from plaid.api import plaid_api
    from plaid.api_client import ApiClient
    from plaid.configuration import Configuration
    from plaid.model.accounts_get_request import AccountsGetRequest
    from plaid.model.country_code import CountryCode
    from plaid.model.institutions_get_by_id_request import InstitutionsGetByIdRequest
    from plaid.model.item_public_token_exchange_request import (
        ItemPublicTokenExchangeRequest,
    )
    from plaid.model.item_remove_request import ItemRemoveRequest
    from plaid.model.link_token_create_request import LinkTokenCreateRequest
    from plaid.model.link_token_create_request_user import LinkTokenCreateRequestUser
    from plaid.model.products import Products
    from plaid.model.transactions_get_request import TransactionsGetRequest
    from plaid.model.transactions_get_request_options import (
        TransactionsGetRequestOptions,
    )
except ModuleNotFoundError:  # pragma: no cover
    # Plaid is an optional dependency for development/test environments.
    plaid_api = None  # type: ignore[assignment]
    ApiClient = None  # type: ignore[assignment]
    Configuration = None  # type: ignore[assignment]
    AccountsGetRequest = None  # type: ignore[assignment]
    CountryCode = None  # type: ignore[assignment]
    InstitutionsGetByIdRequest = None  # type: ignore[assignment]
    ItemPublicTokenExchangeRequest = None  # type: ignore[assignment]
    ItemRemoveRequest = None  # type: ignore[assignment]
    LinkTokenCreateRequest = None  # type: ignore[assignment]
    LinkTokenCreateRequestUser = None  # type: ignore[assignment]
    Products = None  # type: ignore[assignment]
    TransactionsGetRequest = None  # type: ignore[assignment]
    TransactionsGetRequestOptions = None  # type: ignore[assignment]

from app.core.config import settings
from app.models.cash_account import CashAccountType
from app.models.connection import Connection
from app.schemas.action_capability import ActionCapability
from app.services.providers.base_banking import (
    BaseBankingProvider,
    LinkSession,
    NormalizedBankAccount,
    NormalizedBankTransaction,
)

logger = logging.getLogger(__name__)


def _safe_get(obj: Any, *keys: str, default: Any = None) -> Any:
    """Safely get nested attributes or dict keys from an object."""
    for key in keys:
        if obj is None:
            return default
        if isinstance(obj, dict):
            obj = obj.get(key)
        else:
            obj = getattr(obj, key, None)
    return obj if obj is not None else default


class PlaidProvider(BaseBankingProvider):
    """Plaid banking provider implementation."""

    provider_name: str = "plaid"

    def get_capabilities(self) -> list[ActionCapability]:
        """Return Plaid capabilities."""
        return [ActionCapability.READ_ONLY, ActionCapability.ACH_TRANSFER]

    _ENVIRONMENT_HOSTS = {
        "production": "https://production.plaid.com",
        "development": "https://development.plaid.com",
        "sandbox": "https://sandbox.plaid.com",
    }

    _ACCOUNT_TYPE_MAP = {
        "checking": CashAccountType.checking,
        "savings": CashAccountType.savings,
        "money market": CashAccountType.money_market,
        "cd": CashAccountType.cd,
        "cash management": CashAccountType.checking,
        "paypal": CashAccountType.other,
        "prepaid": CashAccountType.other,
        "hsa": CashAccountType.other,
        "ebt": CashAccountType.other,
    }

    def __init__(self) -> None:
        """Initialize Plaid client."""
        if plaid_api is None:  # pragma: no cover
            raise RuntimeError(
                "Plaid provider is unavailable because the 'plaid' package is not installed. "
                "Install Plaid dependencies to use banking connections."
            )

        host = self._ENVIRONMENT_HOSTS.get(
            settings.plaid_environment, self._ENVIRONMENT_HOSTS["sandbox"]
        )
        configuration = Configuration(
            host=host,
            api_key={
                "clientId": settings.plaid_client_id,
                "secret": settings.plaid_secret,
            },
        )
        api_client = ApiClient(configuration)
        self.client = plaid_api.PlaidApi(api_client)

    def _get_plaid_user_id(self, user_id: str) -> str:
        """Generate deterministic Plaid client_user_id from internal user ID."""
        return hashlib.sha256(f"clearmoney_{user_id}".encode()).hexdigest()[:32]

    async def create_link_token(
        self,
        user_id: str,
        redirect_uri: str | None = None,
    ) -> LinkSession:
        """Create a Plaid Link token for initializing Plaid Link."""
        plaid_user_id = self._get_plaid_user_id(user_id)

        request = LinkTokenCreateRequest(
            user=LinkTokenCreateRequestUser(client_user_id=plaid_user_id),
            client_name="ClearMoney",
            products=[Products("transactions")],
            country_codes=[CountryCode("US")],
            language="en",
            redirect_uri=redirect_uri,
        )

        response = self.client.link_token_create(request)

        return LinkSession(
            link_token=response.link_token,
            expiration=response.expiration if hasattr(response, "expiration") else None,
        )

    async def exchange_public_token(
        self,
        user_id: str,
        public_token: str,
    ) -> dict:
        """Exchange a public token for an access token."""
        request = ItemPublicTokenExchangeRequest(public_token=public_token)
        response = self.client.item_public_token_exchange(request)

        return {
            "access_token": response.access_token,
            "item_id": response.item_id,
            "plaid_user_id": self._get_plaid_user_id(user_id),
        }

    def _map_account_type(self, plaid_subtype: str | None) -> CashAccountType:
        """Map Plaid account subtype to our internal CashAccountType."""
        if not plaid_subtype:
            return CashAccountType.other
        return self._ACCOUNT_TYPE_MAP.get(plaid_subtype.lower(), CashAccountType.other)

    def _get_credentials(self, connection: Connection) -> str:
        """Extract and validate access_token from connection."""
        credentials = connection.credentials or {}
        access_token = credentials.get("access_token")

        if not access_token:
            raise ValueError("Missing Plaid access token")

        return access_token

    def _parse_date(self, value: date | str | None) -> date | None:
        """Parse a date value that may be a string or date object."""
        if value is None:
            return None
        if isinstance(value, str):
            return date.fromisoformat(value)
        return value

    def _normalize_transaction(self, txn: Any) -> NormalizedBankTransaction:
        """Convert a Plaid transaction to normalized format."""
        # Plaid amounts: positive for debits (money leaving account)
        # We want: negative for debits, positive for credits
        amount = Decimal(str(txn.amount)) * -1

        # Extract category info from personal_finance_category
        pfc = getattr(txn, "personal_finance_category", None)
        primary_category = _safe_get(pfc, "primary") if pfc else None
        detailed_category = _safe_get(pfc, "detailed") if pfc else None

        normalized = NormalizedBankTransaction(
            provider_transaction_id=txn.transaction_id,
            amount=amount,
            transaction_date=self._parse_date(txn.date),
            name=txn.name or "Unknown Transaction",
            pending=getattr(txn, "pending", False),
            posted_date=self._parse_date(getattr(txn, "authorized_date", None)),
            primary_category=primary_category,
            detailed_category=detailed_category,
            plaid_category=getattr(txn, "category", None),
            merchant_name=_safe_get(txn, "merchant_name"),
            payment_channel=_safe_get(txn, "payment_channel"),
            iso_currency_code=_safe_get(txn, "iso_currency_code", default="USD"),
        )
        # Store account_id in a temporary attribute for routing
        normalized._account_id = txn.account_id  # type: ignore
        return normalized

    def _get_account_capabilities(self, account_type: CashAccountType) -> list[ActionCapability]:
        """Determine capabilities based on bank account type."""
        caps = [ActionCapability.READ_ONLY]

        # Most depository accounts can do ACH
        if account_type in {CashAccountType.checking, CashAccountType.savings, CashAccountType.money_market}:
            caps.append(ActionCapability.ACH_TRANSFER)

        # Depository accounts are also candidates for switch kits (Era 2 bridge)
        if account_type == CashAccountType.checking:
            caps.append(ActionCapability.SWITCH_KIT)
            caps.append(ActionCapability.PDF_GENERATION)

        return caps

    async def get_accounts(
        self,
        connection: Connection,
    ) -> list[NormalizedBankAccount]:
        """Get all bank accounts from Plaid."""
        access_token = self._get_credentials(connection)

        request = AccountsGetRequest(access_token=access_token)
        response = self.client.accounts_get(request)

        # Get institution name from item if available
        institution_name = None
        if hasattr(response, "item") and response.item:
            institution_id = _safe_get(response.item, "institution_id")
            if institution_id:
                try:
                    inst_request = InstitutionsGetByIdRequest(
                        institution_id=institution_id,
                        country_codes=[CountryCode("US")],
                    )
                    inst_response = self.client.institutions_get_by_id(inst_request)
                    institution_name = inst_response.institution.name
                except Exception as e:
                    logger.warning(f"Failed to get institution name: {e}")

        normalized_accounts = []
        for account in response.accounts:
            # Only include depository (bank) accounts
            if _safe_get(account, "type") != "depository":
                continue

            balance = _safe_get(account, "balances", "current", default=0)
            available = _safe_get(account, "balances", "available")

            normalized_accounts.append(
                NormalizedBankAccount(
                    provider_account_id=account.account_id,
                    name=account.name or "Unknown Account",
                    account_type=self._map_account_type(_safe_get(account, "subtype")),
                    balance=Decimal(str(balance)) if balance is not None else Decimal("0"),
                    available_balance=(
                        Decimal(str(available)) if available is not None else None
                    ),
                    currency=_safe_get(account, "balances", "iso_currency_code", default="USD"),
                    institution_name=institution_name,
                    mask=_safe_get(account, "mask"),
                    capabilities=self._get_account_capabilities(self._map_account_type(_safe_get(account, "subtype"))),
                )
            )

        return normalized_accounts

    async def get_transactions(
        self,
        connection: Connection,
        start_date: date,
        end_date: date,
    ) -> list[NormalizedBankTransaction]:
        """Get transactions for all accounts in a connection."""
        access_token = self._get_credentials(connection)

        all_transactions: list[NormalizedBankTransaction] = []
        offset = 0
        total_transactions = None

        while total_transactions is None or offset < total_transactions:
            request = TransactionsGetRequest(
                access_token=access_token,
                start_date=start_date,
                end_date=end_date,
                options=TransactionsGetRequestOptions(
                    count=500,
                    offset=offset,
                ),
            )
            response = self.client.transactions_get(request)
            total_transactions = response.total_transactions

            for txn in response.transactions:
                normalized = self._normalize_transaction(txn)
                all_transactions.append(normalized)

            offset += len(response.transactions)

        return all_transactions

    async def delete_connection(
        self,
        connection: Connection,
    ) -> None:
        """Delete a Plaid connection (remove Item)."""
        credentials = connection.credentials or {}
        access_token = credentials.get("access_token")

        if not access_token:
            return

        try:
            request = ItemRemoveRequest(access_token=access_token)
            self.client.item_remove(request)
        except Exception as e:
            # Log but don't fail if we can't delete from Plaid
            logger.warning(f"Failed to remove Plaid Item: {e}")
