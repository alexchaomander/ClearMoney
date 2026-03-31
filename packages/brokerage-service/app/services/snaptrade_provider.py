import hashlib
import logging
from datetime import datetime, timezone
from decimal import Decimal
from typing import Any

from snaptrade_client import SnapTrade

from app.core.config import settings
from app.schemas.brokerage import (
    ConnectionCredentials,
    CredentialsResponse,
    LinkSessionResponse,
    NormalizedAccountResponse,
    NormalizedHoldingResponse,
    NormalizedSecurityResponse,
    NormalizedTransactionResponse,
)

logger = logging.getLogger(__name__)


def _safe_getattr(obj: Any, *attrs: str, default: Any = None) -> Any:
    for attr in attrs:
        if obj is None:
            return default
        obj = getattr(obj, attr, None)
    return obj if obj is not None else default


class SnapTradeProvider:
    provider_name = "snaptrade"

    _ACCOUNT_TYPE_MAP = {
        "TFSA": "other",
        "RRSP": "ira",
        "INDIVIDUAL": "brokerage",
        "JOINT": "brokerage",
        "IRA": "ira",
        "ROTH_IRA": "roth_ira",
        "ROTH IRA": "roth_ira",
        "401K": "401k",
        "403B": "403b",
        "HSA": "hsa",
        "SEP_IRA": "sep_ira",
        "SIMPLE_IRA": "simple_ira",
        "PENSION": "pension",
        "TRUST": "trust",
        "MARGIN": "brokerage",
        "CASH": "brokerage",
    }

    _SECURITY_TYPE_MAP = {
        "EQUITY": "stock",
        "STOCK": "stock",
        "ETF": "etf",
        "MUTUAL_FUND": "mutual_fund",
        "BOND": "bond",
        "CRYPTOCURRENCY": "crypto",
        "CRYPTO": "crypto",
        "CASH": "cash",
        "OPTION": "option",
    }

    _TRANSACTION_TYPE_MAP = {
        "BUY": "buy",
        "SELL": "sell",
        "DIVIDEND": "dividend",
        "INTEREST": "interest",
        "FEE": "fee",
        "TRANSFER": "transfer",
    }

    _TAX_ADVANTAGED_TYPES = frozenset(
        {"ira", "roth_ira", "401k", "403b", "hsa", "sep_ira", "simple_ira"}
    )

    def __init__(self) -> None:
        self.client = SnapTrade(
            consumer_key=settings.snaptrade_consumer_key,
            client_id=settings.snaptrade_client_id,
        )

    def _get_snaptrade_user_id(self, user_id: str) -> str:
        return hashlib.sha256(f"strata_{user_id}".encode()).hexdigest()[:32]

    def _get_credentials(
        self, credentials: ConnectionCredentials
    ) -> tuple[str, str]:
        return credentials.snaptrade_user_id, credentials.user_secret

    def _map_account_type(self, snaptrade_type: str | None) -> str:
        if not snaptrade_type:
            return "other"
        return self._ACCOUNT_TYPE_MAP.get(snaptrade_type.upper(), "other")

    def _map_security_type(self, snaptrade_type: str | None) -> str:
        if not snaptrade_type:
            return "other"
        return self._SECURITY_TYPE_MAP.get(snaptrade_type.upper(), "other")

    def _map_transaction_type(self, snaptrade_type: str | None) -> str:
        if not snaptrade_type:
            return "other"
        return self._TRANSACTION_TYPE_MAP.get(snaptrade_type.upper(), "other")

    def _extract_security_type_code(self, symbol: Any) -> str | None:
        symbol_type = _safe_getattr(symbol, "type")
        if isinstance(symbol_type, dict):
            return symbol_type.get("code")
        return _safe_getattr(symbol_type, "code")

    def _account_capabilities(self, account_type: str) -> list[str]:
        caps = ["read_only"]
        if account_type in {"brokerage", "ira", "roth_ira"}:
            caps.append("internal_rebalance")
        if account_type in {"ira", "roth_ira", "401k"}:
            caps.extend(["acats_transfer", "pdf_generation"])
        return caps

    async def create_link_session(
        self, user_id: str, redirect_uri: str | None = None
    ) -> LinkSessionResponse:
        snaptrade_user_id = self._get_snaptrade_user_id(user_id)
        register_response = self.client.authentication.register_snap_trade_user(
            user_id=snaptrade_user_id
        )
        user_secret = register_response.user_secret
        link_response = self.client.authentication.login_snap_trade_user(
            user_id=snaptrade_user_id,
            user_secret=user_secret,
            custom_redirect=redirect_uri,
        )
        return LinkSessionResponse(
            redirect_url=link_response.redirect_uri,
            session_id=None,
            user_secret=user_secret,
        )

    async def handle_callback(
        self,
        user_id: str,
        user_secret: str,
        authorization_id: str | None = None,
    ) -> CredentialsResponse:
        return CredentialsResponse(
            snaptrade_user_id=self._get_snaptrade_user_id(user_id),
            user_secret=user_secret,
            authorization_id=authorization_id,
        )

    async def get_accounts(
        self,
        credentials: ConnectionCredentials,
    ) -> list[NormalizedAccountResponse]:
        snaptrade_user_id, user_secret = self._get_credentials(credentials)
        accounts_response = self.client.account_information.get_user_account_details(
            user_id=snaptrade_user_id,
            user_secret=user_secret,
        )
        normalized_accounts: list[NormalizedAccountResponse] = []
        for account in accounts_response:
            account_type = self._map_account_type(_safe_getattr(account, "type"))
            brokerage = _safe_getattr(account, "brokerage")
            normalized_accounts.append(
                NormalizedAccountResponse(
                    provider_account_id=str(account.id),
                    name=account.name or "Unknown Account",
                    account_type=account_type,
                    balance=Decimal(
                        str(
                            _safe_getattr(
                                account, "balance", "total", "amount", default=0
                            )
                            or 0
                        )
                    ),
                    currency=_safe_getattr(account, "currency", default="USD") or "USD",
                    is_tax_advantaged=account_type in self._TAX_ADVANTAGED_TYPES,
                    institution_name=_safe_getattr(brokerage, "name"),
                    institution_id=(
                        str(brokerage.id)
                        if brokerage is not None and hasattr(brokerage, "id")
                        else None
                    ),
                    capabilities=self._account_capabilities(account_type),
                )
            )
        return normalized_accounts

    async def get_holdings(
        self,
        credentials: ConnectionCredentials,
        provider_account_id: str,
    ) -> list[NormalizedHoldingResponse]:
        snaptrade_user_id, user_secret = self._get_credentials(credentials)
        holdings_response = self.client.account_information.get_user_holdings(
            user_id=snaptrade_user_id,
            user_secret=user_secret,
            account_id=provider_account_id,
        )
        normalized_holdings: list[NormalizedHoldingResponse] = []
        for holding in holdings_response:
            symbol = _safe_getattr(holding, "symbol")
            ticker = _safe_getattr(symbol, "symbol")
            security_name = _safe_getattr(symbol, "description") or ticker or "Unknown"
            security = NormalizedSecurityResponse(
                ticker=ticker,
                name=security_name,
                security_type=self._map_security_type(
                    self._extract_security_type_code(symbol)
                ),
                close_price=(
                    Decimal(str(holding.price))
                    if _safe_getattr(holding, "price") is not None
                    else None
                ),
                provider_security_id=(
                    str(symbol.id) if symbol is not None and hasattr(symbol, "id") else None
                ),
            )
            book_value = _safe_getattr(holding, "book_value")
            market_value = _safe_getattr(holding, "market_value")
            normalized_holdings.append(
                NormalizedHoldingResponse(
                    security=security,
                    quantity=Decimal(
                        str(_safe_getattr(holding, "units", default=0) or 0)
                    ),
                    cost_basis=Decimal(str(book_value)) if book_value is not None else None,
                    market_value=(
                        Decimal(str(market_value)) if market_value is not None else None
                    ),
                    as_of=datetime.now(timezone.utc),
                )
            )
        return normalized_holdings

    async def get_transactions(
        self,
        credentials: ConnectionCredentials,
        provider_account_id: str,
    ) -> list[NormalizedTransactionResponse]:
        snaptrade_user_id, user_secret = self._get_credentials(credentials)
        transactions_response = (
            self.client.account_information.get_user_account_transactions(
                user_id=snaptrade_user_id,
                user_secret=user_secret,
                account_id=provider_account_id,
            )
        )
        normalized: list[NormalizedTransactionResponse] = []
        for transaction in transactions_response:
            symbol = _safe_getattr(transaction, "symbol")
            ticker = _safe_getattr(symbol, "symbol")
            security = None
            if ticker:
                security = NormalizedSecurityResponse(
                    ticker=ticker,
                    name=_safe_getattr(symbol, "description") or ticker or "Unknown",
                    security_type=self._map_security_type(
                        self._extract_security_type_code(symbol)
                    ),
                )
            trade_date = _safe_getattr(transaction, "trade_date")
            settlement_date = _safe_getattr(transaction, "settlement_date")
            normalized.append(
                NormalizedTransactionResponse(
                    provider_transaction_id=(
                        str(_safe_getattr(transaction, "id"))
                        if _safe_getattr(transaction, "id") is not None
                        else None
                    ),
                    transaction_type=self._map_transaction_type(
                        _safe_getattr(transaction, "type")
                    ),
                    quantity=(
                        Decimal(str(_safe_getattr(transaction, "units")))
                        if _safe_getattr(transaction, "units") is not None
                        else None
                    ),
                    price=(
                        Decimal(str(_safe_getattr(transaction, "price")))
                        if _safe_getattr(transaction, "price") is not None
                        else None
                    ),
                    amount=(
                        Decimal(str(_safe_getattr(transaction, "amount")))
                        if _safe_getattr(transaction, "amount") is not None
                        else None
                    ),
                    trade_date=trade_date.date() if isinstance(trade_date, datetime) else trade_date,
                    settlement_date=(
                        settlement_date.date()
                        if isinstance(settlement_date, datetime)
                        else settlement_date
                    ),
                    currency=_safe_getattr(transaction, "currency"),
                    description=_safe_getattr(transaction, "description"),
                    security=security,
                    source="snaptrade",
                )
            )
        return normalized

    async def delete_connection(self, credentials: ConnectionCredentials) -> None:
        snaptrade_user_id, user_secret = self._get_credentials(credentials)
        try:
            self.client.authentication.delete_snap_trade_user(
                user_id=snaptrade_user_id,
                user_secret=user_secret,
            )
        except Exception as exc:
            logger.warning(
                "Failed to delete SnapTrade user %s: %s",
                snaptrade_user_id,
                exc,
            )
