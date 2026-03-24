import asyncio
import logging
import uuid
from decimal import Decimal
from typing import Any

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.crypto_wallet import CryptoChain, CryptoWallet
from app.schemas.crypto import (
    CryptoAsset,
    CryptoPortfolioResponse,
    CryptoWalletCreate,
    DeFiPosition,
    DeFiPositionType,
)
from app.services.providers.alchemy import alchemy_provider
from app.services.providers.stock_price import stock_price_service

logger = logging.getLogger(__name__)


class CryptoService:
    """Service to handle crypto wallet aggregation and DeFi positions."""

    _NATIVE_ASSET_METADATA: dict[CryptoChain, dict[str, str | None]] = {
        CryptoChain.ethereum: {
            "symbol": "ETH",
            "name": "Ethereum",
            "logo_url": "https://assets.coingecko.com/coins/images/279/small/ethereum.png",
        },
        CryptoChain.solana: {
            "symbol": "SOL",
            "name": "Solana",
            "logo_url": "https://assets.coingecko.com/coins/images/4128/small/solana.png",
        },
        CryptoChain.polygon: {
            "symbol": "MATIC",
            "name": "Polygon",
            "logo_url": "https://assets.coingecko.com/coins/images/4713/small/matic-token.png",
        },
        CryptoChain.arbitrum: {
            "symbol": "ETH",
            "name": "Ethereum",
            "logo_url": "https://assets.coingecko.com/coins/images/279/small/ethereum.png",
        },
        CryptoChain.base: {
            "symbol": "ETH",
            "name": "Ethereum",
            "logo_url": "https://assets.coingecko.com/coins/images/279/small/ethereum.png",
        },
        CryptoChain.optimism: {
            "symbol": "ETH",
            "name": "Ethereum",
            "logo_url": "https://assets.coingecko.com/coins/images/279/small/ethereum.png",
        },
        CryptoChain.bitcoin: {
            "symbol": "BTC",
            "name": "Bitcoin",
            "logo_url": "https://assets.coingecko.com/coins/images/1/small/bitcoin.png",
        },
    }
    _TOKEN_LOGOS: dict[str, str] = {
        "ETH": "https://assets.coingecko.com/coins/images/279/small/ethereum.png",
        "SOL": "https://assets.coingecko.com/coins/images/4128/small/solana.png",
        "MATIC": "https://assets.coingecko.com/coins/images/4713/small/matic-token.png",
        "BTC": "https://assets.coingecko.com/coins/images/1/small/bitcoin.png",
        "USDC": "https://assets.coingecko.com/coins/images/6319/small/USD_Coin_icon.png",
        "USDT": "https://assets.coingecko.com/coins/images/325/small/tether.png",
    }

    def __init__(self, session: AsyncSession):
        self.session = session

    async def add_wallet(
        self, user_id: uuid.UUID, wallet_in: CryptoWalletCreate
    ) -> CryptoWallet:
        """Add a new crypto wallet address to track."""
        existing = await self.session.execute(
            select(CryptoWallet).where(
                CryptoWallet.user_id == user_id,
                CryptoWallet.address == wallet_in.address,
                CryptoWallet.chain == wallet_in.chain,
            )
        )
        if existing.scalar_one_or_none():
            raise ValueError("Wallet already tracked for this address and chain")

        wallet = CryptoWallet(
            user_id=user_id,
            address=wallet_in.address,
            chain=wallet_in.chain,
            label=wallet_in.label,
        )
        self.session.add(wallet)
        await self.session.commit()
        await self.session.refresh(wallet)
        return wallet

    async def list_wallets(self, user_id: uuid.UUID) -> list[CryptoWallet]:
        """List all tracked wallets for a user."""
        result = await self.session.execute(
            select(CryptoWallet).where(CryptoWallet.user_id == user_id)
        )
        return list(result.scalars().all())

    async def delete_wallet(self, user_id: uuid.UUID, wallet_id: uuid.UUID) -> bool:
        """Remove a tracked wallet."""
        result = await self.session.execute(
            select(CryptoWallet).where(
                CryptoWallet.id == wallet_id, CryptoWallet.user_id == user_id
            )
        )
        wallet = result.scalar_one_or_none()
        if not wallet:
            return False
        await self.session.delete(wallet)
        await self.session.commit()
        return True

    async def delete_all_wallets(self, user_id: uuid.UUID) -> int:
        """Remove all tracked wallets for a user. Returns the count deleted."""
        result = await self.session.execute(
            select(CryptoWallet).where(CryptoWallet.user_id == user_id)
        )
        wallets = list(result.scalars().all())
        for wallet in wallets:
            await self.session.delete(wallet)
        if wallets:
            await self.session.commit()
        return len(wallets)

    async def get_portfolio(self, user_id: uuid.UUID) -> CryptoPortfolioResponse:
        """
        Aggregate all crypto assets and DeFi positions across all wallets.
        Uses live wallet balances where providers are configured and gracefully
        degrades when a provider is unavailable.
        """
        wallets = await self.list_wallets(user_id)
        if not wallets:
            return CryptoPortfolioResponse(
                wallets=[],
                total_value_usd=Decimal("0.00"),
                assets=[],
                defi_positions=[],
            )

        asset_map = await self._build_asset_map(wallets)
        assets = await self._build_assets(asset_map)

        # Sort assets by value descending
        assets.sort(key=lambda x: x.balance_usd, reverse=True)

        # DeFi positions are still partially mocked
        defi_positions = []
        chains_present = [w.chain for w in wallets]
        if CryptoChain.ethereum in chains_present or CryptoChain.base in chains_present:
            defi_positions.append(
                DeFiPosition(
                    protocol_name="Aave V3",
                    protocol_logo="https://assets.coingecko.com/markets/images/698/small/aave.png",
                    position_type=DeFiPositionType.LENDING,
                    value_usd=Decimal("0.00"),
                    assets=[],
                )
            )

        total_value = sum((a.balance_usd for a in assets), Decimal("0.00")) + sum(
            (p.value_usd for p in defi_positions), Decimal("0.00")
        )

        return CryptoPortfolioResponse(
            wallets=wallets,
            total_value_usd=total_value,
            assets=assets,
            defi_positions=defi_positions,
        )

    async def _build_asset_map(
        self, wallets: list[CryptoWallet]
    ) -> dict[tuple[str, CryptoChain], dict[str, Any]]:
        wallet_results = await asyncio.gather(
            *(self._fetch_wallet_assets(wallet) for wallet in wallets)
        )
        asset_map: dict[tuple[str, CryptoChain], dict[str, Any]] = {}
        for entries in wallet_results:
            for entry in entries:
                key = (entry["symbol"], entry["chain"])
                if key not in asset_map:
                    asset_map[key] = {
                        "balance": Decimal("0.0"),
                        "name": entry["name"],
                        "logo_url": entry.get("logo_url"),
                        "contract_address": entry.get("contract_address"),
                    }
                asset_map[key]["balance"] += entry["balance"]
                if not asset_map[key].get("logo_url"):
                    asset_map[key]["logo_url"] = entry.get("logo_url")
                if not asset_map[key].get("contract_address"):
                    asset_map[key]["contract_address"] = entry.get("contract_address")
        return asset_map

    async def _fetch_wallet_assets(self, wallet: CryptoWallet) -> list[dict[str, Any]]:
        assets: list[dict[str, Any]] = []
        native_metadata = self._get_native_asset_metadata(wallet.chain)
        native_balance_task = (
            alchemy_provider.get_balance(wallet.chain, wallet.address)
            if native_metadata
            else None
        )
        token_balance_task = (
            alchemy_provider.get_token_balances(wallet.chain, wallet.address)
            if wallet.chain != CryptoChain.bitcoin
            else None
        )

        native_balance = Decimal("0.0")
        tokens: list[dict[str, Any]] = []
        if native_balance_task and token_balance_task:
            native_balance, tokens = await asyncio.gather(
                native_balance_task, token_balance_task
            )
        elif native_balance_task:
            native_balance = await native_balance_task
        elif token_balance_task:
            tokens = await token_balance_task

        if native_metadata and native_balance > 0:
            assets.append(
                {
                    "symbol": native_metadata["symbol"],
                    "name": native_metadata["name"],
                    "balance": native_balance,
                    "chain": wallet.chain,
                    "logo_url": native_metadata["logo_url"],
                    "contract_address": None,
                }
            )

        for token in tokens:
            symbol = token.get("symbol")
            balance = token.get("balance")
            if not symbol or not balance or balance <= 0:
                continue
            assets.append(
                {
                    "symbol": symbol,
                    "name": token.get("name") or symbol,
                    "balance": balance,
                    "chain": wallet.chain,
                    "logo_url": token.get("logo_url") or self._get_token_logo(symbol),
                    "contract_address": token.get("contract_address"),
                }
            )
        return assets

    async def _build_assets(
        self, asset_map: dict[tuple[str, CryptoChain], dict[str, Any]]
    ) -> list[CryptoAsset]:
        if not asset_map:
            return []

        symbols = sorted({symbol for symbol, _ in asset_map})
        prices = await asyncio.gather(
            *(stock_price_service.get_crypto_price(symbol) for symbol in symbols)
        )
        price_map = dict(zip(symbols, prices, strict=True))

        assets: list[CryptoAsset] = []
        for (symbol, chain), data in asset_map.items():
            price = price_map.get(symbol, Decimal("0.0"))
            balance_usd = data["balance"] * price
            assets.append(
                CryptoAsset(
                    symbol=symbol,
                    name=data["name"],
                    balance=data["balance"],
                    balance_usd=balance_usd,
                    current_price=price,
                    chain=chain,
                    contract_address=data.get("contract_address"),
                    logo_url=data.get("logo_url"),
                )
            )
        return assets

    def _get_native_asset_metadata(
        self, chain: CryptoChain
    ) -> dict[str, str | None] | None:
        return self._NATIVE_ASSET_METADATA.get(chain)

    def _get_token_logo(self, symbol: str) -> str | None:
        return self._TOKEN_LOGOS.get(symbol)
