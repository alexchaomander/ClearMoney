import hashlib
from datetime import datetime
from decimal import Decimal
from typing import Any

from snaptrade_client import SnapTrade

from app.core.config import settings
from app.models.connection import Connection
from app.models.investment_account import InvestmentAccountType
from app.models.security import SecurityType
from app.services.providers.base import (
    BaseProvider,
    LinkSession,
    NormalizedAccount,
    NormalizedHolding,
    NormalizedSecurity,
)


def _safe_getattr(obj: Any, *attrs: str, default: Any = None) -> Any:
    """Safely get nested attributes from an object."""
    for attr in attrs:
        if obj is None:
            return default
        obj = getattr(obj, attr, None)
    return obj if obj is not None else default


class SnapTradeProvider(BaseProvider):
    """SnapTrade provider implementation."""

    provider_name: str = "snaptrade"

    # Account type mappings
    _ACCOUNT_TYPE_MAP = {
        "TFSA": InvestmentAccountType.other,
        "RRSP": InvestmentAccountType.ira,
        "INDIVIDUAL": InvestmentAccountType.brokerage,
        "JOINT": InvestmentAccountType.brokerage,
        "IRA": InvestmentAccountType.ira,
        "ROTH_IRA": InvestmentAccountType.roth_ira,
        "ROTH IRA": InvestmentAccountType.roth_ira,
        "401K": InvestmentAccountType.k401,
        "403B": InvestmentAccountType.k403b,
        "HSA": InvestmentAccountType.hsa,
        "SEP_IRA": InvestmentAccountType.sep_ira,
        "SIMPLE_IRA": InvestmentAccountType.simple_ira,
        "PENSION": InvestmentAccountType.pension,
        "TRUST": InvestmentAccountType.trust,
        "MARGIN": InvestmentAccountType.brokerage,
        "CASH": InvestmentAccountType.brokerage,
    }

    # Security type mappings
    _SECURITY_TYPE_MAP = {
        "EQUITY": SecurityType.stock,
        "STOCK": SecurityType.stock,
        "ETF": SecurityType.etf,
        "MUTUAL_FUND": SecurityType.mutual_fund,
        "BOND": SecurityType.bond,
        "CRYPTOCURRENCY": SecurityType.crypto,
        "CRYPTO": SecurityType.crypto,
        "CASH": SecurityType.cash,
        "OPTION": SecurityType.option,
    }

    # Tax-advantaged account types
    _TAX_ADVANTAGED_TYPES = frozenset({
        InvestmentAccountType.ira,
        InvestmentAccountType.roth_ira,
        InvestmentAccountType.k401,
        InvestmentAccountType.k403b,
        InvestmentAccountType.hsa,
        InvestmentAccountType.sep_ira,
        InvestmentAccountType.simple_ira,
    })

    def __init__(self) -> None:
        """Initialize SnapTrade client."""
        self.client = SnapTrade(
            consumer_key=settings.snaptrade_consumer_key,
            client_id=settings.snaptrade_client_id,
        )

    def _get_snaptrade_user_id(self, user_id: str) -> str:
        """Generate deterministic SnapTrade user ID from internal user ID."""
        return hashlib.sha256(f"strata_{user_id}".encode()).hexdigest()[:32]

    async def create_link_session(
        self,
        user_id: str,
        redirect_uri: str | None = None,
    ) -> LinkSession:
        """Create a SnapTrade link session."""
        snaptrade_user_id = self._get_snaptrade_user_id(user_id)

        # Register the user (idempotent)
        try:
            register_response = self.client.authentication.register_snap_trade_user(
                user_id=snaptrade_user_id
            )
        except Exception as e:
            raise ValueError(f"Failed to register SnapTrade user: {e}") from e

        user_secret = register_response.user_secret

        # Create the login link
        link_response = self.client.authentication.login_snap_trade_user(
            user_id=snaptrade_user_id,
            user_secret=user_secret,
            custom_redirect=redirect_uri,
        )

        return LinkSession(
            redirect_url=link_response.redirect_uri,
            session_id=None,
            user_secret=user_secret,
        )

    async def handle_callback(
        self,
        user_id: str,
        user_secret: str,
        authorization_id: str | None = None,
    ) -> dict:
        """Handle the OAuth callback from SnapTrade."""
        return {
            "snaptrade_user_id": self._get_snaptrade_user_id(user_id),
            "user_secret": user_secret,
            "authorization_id": authorization_id,
        }

    def _map_account_type(self, snaptrade_type: str | None) -> InvestmentAccountType:
        """Map SnapTrade account type to our internal type."""
        if not snaptrade_type:
            return InvestmentAccountType.other
        return self._ACCOUNT_TYPE_MAP.get(snaptrade_type.upper(), InvestmentAccountType.other)

    def _map_security_type(self, snaptrade_type: str | None) -> SecurityType:
        """Map SnapTrade security type to our internal type."""
        if not snaptrade_type:
            return SecurityType.other
        return self._SECURITY_TYPE_MAP.get(snaptrade_type.upper(), SecurityType.other)

    def _get_credentials(self, connection: Connection) -> tuple[str, str]:
        """Extract and validate credentials from connection."""
        credentials = connection.credentials or {}
        snaptrade_user_id = credentials.get("snaptrade_user_id")
        user_secret = credentials.get("user_secret")

        if not snaptrade_user_id or not user_secret:
            raise ValueError("Missing SnapTrade credentials")

        return snaptrade_user_id, user_secret

    async def get_accounts(
        self,
        connection: Connection,
    ) -> list[NormalizedAccount]:
        """Get all investment accounts from SnapTrade."""
        snaptrade_user_id, user_secret = self._get_credentials(connection)

        accounts_response = self.client.account_information.get_user_account_details(
            user_id=snaptrade_user_id,
            user_secret=user_secret,
        )

        normalized_accounts = []
        for account in accounts_response:
            account_type = self._map_account_type(_safe_getattr(account, "type"))
            balance = Decimal(str(_safe_getattr(account, "balance", "total", "amount", default=0) or 0))
            brokerage = _safe_getattr(account, "brokerage")

            normalized_accounts.append(
                NormalizedAccount(
                    provider_account_id=str(account.id),
                    name=account.name or "Unknown Account",
                    account_type=account_type,
                    balance=balance,
                    currency=_safe_getattr(account, "currency", default="USD") or "USD",
                    is_tax_advantaged=account_type in self._TAX_ADVANTAGED_TYPES,
                    institution_name=_safe_getattr(brokerage, "name"),
                    institution_id=str(brokerage.id) if brokerage and hasattr(brokerage, "id") else None,
                )
            )

        return normalized_accounts

    def _extract_security_type_code(self, symbol: Any) -> str | None:
        """Extract security type code from symbol object."""
        symbol_type = _safe_getattr(symbol, "type")
        if isinstance(symbol_type, dict):
            return symbol_type.get("code")
        return _safe_getattr(symbol_type, "code")

    async def get_holdings(
        self,
        connection: Connection,
        provider_account_id: str,
    ) -> list[NormalizedHolding]:
        """Get holdings for a specific SnapTrade account."""
        snaptrade_user_id, user_secret = self._get_credentials(connection)

        holdings_response = self.client.account_information.get_user_holdings(
            user_id=snaptrade_user_id,
            user_secret=user_secret,
            account_id=provider_account_id,
        )

        normalized_holdings = []
        for holding in holdings_response:
            symbol = _safe_getattr(holding, "symbol")

            # Extract security info
            ticker = _safe_getattr(symbol, "symbol")
            security_name = _safe_getattr(symbol, "description") or ticker or "Unknown"
            security_type = self._map_security_type(self._extract_security_type_code(symbol))
            close_price = Decimal(str(holding.price)) if _safe_getattr(holding, "price") is not None else None

            security = NormalizedSecurity(
                ticker=ticker,
                name=security_name,
                security_type=security_type,
                close_price=close_price,
                provider_security_id=str(symbol.id) if symbol and hasattr(symbol, "id") else None,
            )

            # Extract holding values
            book_value = _safe_getattr(holding, "book_value")
            market_value = _safe_getattr(holding, "market_value")

            normalized_holdings.append(
                NormalizedHolding(
                    security=security,
                    quantity=Decimal(str(_safe_getattr(holding, "units", default=0) or 0)),
                    cost_basis=Decimal(str(book_value)) if book_value is not None else None,
                    market_value=Decimal(str(market_value)) if market_value is not None else None,
                    as_of=datetime.utcnow(),
                )
            )

        return normalized_holdings

    async def delete_connection(
        self,
        connection: Connection,
    ) -> None:
        """Delete a SnapTrade connection."""
        credentials = connection.credentials or {}
        snaptrade_user_id = credentials.get("snaptrade_user_id")
        user_secret = credentials.get("user_secret")

        if not snaptrade_user_id or not user_secret:
            return

        try:
            self.client.authentication.delete_snap_trade_user(
                user_id=snaptrade_user_id,
                user_secret=user_secret,
            )
        except Exception:
            pass  # Log but don't fail if we can't delete from SnapTrade
