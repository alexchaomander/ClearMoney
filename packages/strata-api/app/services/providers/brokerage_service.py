from __future__ import annotations

import os
from datetime import date
from decimal import Decimal
from typing import Any

import httpx
from pydantic import BaseModel, Field

from app.core.config import settings
from app.models.connection import Connection
from app.models.investment_account import InvestmentAccountType
from app.models.security import SecurityType
from app.models.transaction import TransactionType
from app.schemas.action_capability import ActionCapability
from app.services.providers.base import (
    BaseProvider,
    LinkSession,
    NormalizedAccount,
    NormalizedHolding,
    NormalizedSecurity,
    NormalizedTransaction,
)


class BrokerageServiceUnavailableError(RuntimeError):
    pass


class _SecurityPayload(BaseModel):
    ticker: str | None = None
    name: str
    security_type: str
    cusip: str | None = None
    isin: str | None = None
    close_price: Decimal | None = None
    close_price_as_of: str | None = None
    provider_security_id: str | None = None


class _HoldingPayload(BaseModel):
    security: _SecurityPayload
    quantity: Decimal
    cost_basis: Decimal | None = None
    market_value: Decimal | None = None
    as_of: str | None = None
    provider_holding_id: str | None = None


class _AccountPayload(BaseModel):
    provider_account_id: str
    name: str
    account_type: str
    balance: Decimal
    currency: str = "USD"
    is_tax_advantaged: bool = False
    institution_name: str | None = None
    institution_id: str | None = None
    capabilities: list[str] = Field(default_factory=list)


class _TransactionPayload(BaseModel):
    provider_transaction_id: str | None = None
    transaction_type: str | None = None
    quantity: Decimal | None = None
    price: Decimal | None = None
    amount: Decimal | None = None
    trade_date: str | None = None
    settlement_date: str | None = None
    currency: str | None = None
    description: str | None = None
    security: _SecurityPayload | None = None
    source: str | None = None


class BrokerageServiceProvider(BaseProvider):
    provider_name = "snaptrade"

    def __init__(
        self,
        *,
        base_url: str | None = None,
        internal_token: str | None = None,
    ) -> None:
        resolved_base_url = (
            base_url
            or os.getenv("STRATA_BROKERAGE_SERVICE_URL")
            or settings.brokerage_service_url
        )
        resolved_internal_token = (
            internal_token
            or os.getenv("STRATA_BROKERAGE_INTERNAL_TOKEN")
            or settings.brokerage_internal_token
        )
        if not resolved_base_url:
            raise BrokerageServiceUnavailableError(
                "STRATA_BROKERAGE_SERVICE_URL is not configured."
            )
        if not resolved_internal_token:
            raise BrokerageServiceUnavailableError(
                "STRATA_BROKERAGE_INTERNAL_TOKEN is not configured."
            )
        self._base_url = resolved_base_url.rstrip("/")
        self._headers = {"X-Internal-Token": resolved_internal_token}

    def get_capabilities(self) -> list[ActionCapability]:
        return [ActionCapability.READ_ONLY, ActionCapability.INTERNAL_REBALANCE]

    async def _post(self, path: str, payload: dict[str, Any]) -> Any:
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.post(
                f"{self._base_url}{path}",
                json=payload,
                headers=self._headers,
            )
        if not response.is_success:
            detail = response.text
            try:
                detail = response.json().get("detail", detail)
            except Exception:
                pass
            raise BrokerageServiceUnavailableError(str(detail))
        return response.json()

    def _credentials_payload(self, connection: Connection) -> dict[str, str]:
        credentials = connection.credentials or {}
        snaptrade_user_id = credentials.get("snaptrade_user_id")
        user_secret = credentials.get("user_secret")
        if not snaptrade_user_id or not user_secret:
            raise ValueError("Missing SnapTrade credentials")
        return {
            "snaptrade_user_id": snaptrade_user_id,
            "user_secret": user_secret,
        }

    def _map_security(self, payload: _SecurityPayload) -> NormalizedSecurity:
        return NormalizedSecurity(
            ticker=payload.ticker,
            name=payload.name,
            security_type=SecurityType(payload.security_type),
            cusip=payload.cusip,
            isin=payload.isin,
            close_price=payload.close_price,
            provider_security_id=payload.provider_security_id,
        )

    async def create_link_session(
        self, user_id: str, redirect_uri: str | None = None
    ) -> LinkSession:
        data = await self._post(
            "/internal/brokerage/link-session",
            {"user_id": user_id, "redirect_uri": redirect_uri},
        )
        return LinkSession(
            redirect_url=data["redirect_url"],
            session_id=data.get("session_id"),
            user_secret=data.get("user_secret"),
        )

    async def handle_callback(
        self,
        user_id: str,
        user_secret: str,
        authorization_id: str | None = None,
    ) -> dict:
        return await self._post(
            "/internal/brokerage/callback",
            {
                "user_id": user_id,
                "user_secret": user_secret,
                "authorization_id": authorization_id,
            },
        )

    async def get_accounts(self, connection: Connection) -> list[NormalizedAccount]:
        payload = await self._post(
            "/internal/brokerage/accounts",
            {"credentials": self._credentials_payload(connection)},
        )
        accounts = [_AccountPayload.model_validate(item) for item in payload]
        return [
            NormalizedAccount(
                provider_account_id=item.provider_account_id,
                name=item.name,
                account_type=InvestmentAccountType(item.account_type),
                balance=item.balance,
                currency=item.currency,
                is_tax_advantaged=item.is_tax_advantaged,
                institution_name=item.institution_name,
                institution_id=item.institution_id,
                capabilities=[ActionCapability(cap) for cap in item.capabilities],
            )
            for item in accounts
        ]

    async def get_holdings(
        self,
        connection: Connection,
        provider_account_id: str,
    ) -> list[NormalizedHolding]:
        payload = await self._post(
            "/internal/brokerage/holdings",
            {
                "credentials": self._credentials_payload(connection),
                "provider_account_id": provider_account_id,
            },
        )
        holdings = [_HoldingPayload.model_validate(item) for item in payload]
        return [
            NormalizedHolding(
                security=self._map_security(item.security),
                quantity=item.quantity,
                cost_basis=item.cost_basis,
                market_value=item.market_value,
                provider_holding_id=item.provider_holding_id,
            )
            for item in holdings
        ]

    async def get_transactions(
        self,
        connection: Connection,
        provider_account_id: str,
    ) -> list[NormalizedTransaction]:
        payload = await self._post(
            "/internal/brokerage/transactions",
            {
                "credentials": self._credentials_payload(connection),
                "provider_account_id": provider_account_id,
            },
        )
        transactions = [_TransactionPayload.model_validate(item) for item in payload]
        normalized: list[NormalizedTransaction] = []
        for item in transactions:
            normalized.append(
                NormalizedTransaction(
                    provider_transaction_id=item.provider_transaction_id,
                    transaction_type=(
                        TransactionType(item.transaction_type)
                        if item.transaction_type
                        else TransactionType.other
                    ),
                    quantity=item.quantity,
                    price=item.price,
                    amount=item.amount,
                    trade_date=(
                        None
                        if item.trade_date is None
                        else date.fromisoformat(item.trade_date)
                    ),
                    settlement_date=(
                        None
                        if item.settlement_date is None
                        else date.fromisoformat(item.settlement_date)
                    ),
                    currency=item.currency,
                    description=item.description,
                    security=(
                        self._map_security(item.security) if item.security else None
                    ),
                    source=item.source,
                )
            )
        return normalized

    async def delete_connection(self, connection: Connection) -> None:
        await self._post(
            "/internal/brokerage/delete",
            {"credentials": self._credentials_payload(connection)},
        )
