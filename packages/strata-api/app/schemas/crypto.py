import uuid
from datetime import date, datetime
from decimal import Decimal
from typing import Any

from pydantic import BaseModel, ConfigDict, Field

from app.models.crypto_wallet import CryptoChain


class CryptoWalletBase(BaseModel):
    address: str
    chain: CryptoChain = CryptoChain.ethereum
    label: str | None = None


class CryptoWalletCreate(CryptoWalletBase):
    pass


class CryptoWalletUpdate(BaseModel):
    address: str | None = None
    chain: CryptoChain | None = None
    label: str | None = None


class CryptoWallet(CryptoWalletBase):
    id: uuid.UUID
    user_id: uuid.UUID
    last_balance_usd: Decimal | None = Decimal("0.00")
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class CryptoAsset(BaseModel):
    symbol: str
    name: str
    balance: Decimal
    balance_usd: Decimal
    current_price: Decimal
    chain: CryptoChain
    contract_address: str | None = None
    logo_url: str | None = None


class DeFiPosition(BaseModel):
    protocol_name: str
    protocol_logo: str | None = None
    position_type: str  # e.g., "lending", "liquidity_pool", "staking"
    value_usd: Decimal
    assets: list[CryptoAsset]


class CryptoPortfolioResponse(BaseModel):
    wallets: list[CryptoWallet]
    total_value_usd: Decimal
    assets: list[CryptoAsset]
    defi_positions: list[DeFiPosition]
