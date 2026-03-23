import logging
import uuid
from decimal import Decimal

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

    def __init__(self, session: AsyncSession):
        self.session = session

    async def add_wallet(self, user_id: uuid.UUID, wallet_in: CryptoWalletCreate) -> CryptoWallet:
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
        Uses real data from Alchemy, Alpha Vantage, and public indexers.
        """
        wallets = await self.list_wallets(user_id)
        if not wallets:
            return CryptoPortfolioResponse(
                wallets=[],
                total_value_usd=Decimal("0.00"),
                assets=[],
                defi_positions=[]
            )

        # (symbol, chain) -> {balance, name, logo_url}
        asset_map: dict[tuple[str, CryptoChain], dict] = {}

        for wallet in wallets:
            # 1. Fetch Native Balance
            native_symbol = self._get_native_symbol(wallet.chain)
            if native_symbol:
                native_balance = await alchemy_provider.get_balance(wallet.chain, wallet.address)
                if native_balance > 0:
                    key = (native_symbol, wallet.chain)
                    if key not in asset_map:
                        asset_map[key] = {
                            "balance": Decimal("0.0"),
                            "name": self._get_chain_display_name(wallet.chain),
                            "logo_url": self._get_token_logo(native_symbol)
                        }
                    asset_map[key]["balance"] += native_balance

            # 2. Fetch Token Balances (ERC-20, SPL)
            # Only if chain supports tokens
            if wallet.chain != CryptoChain.bitcoin:
                tokens = await alchemy_provider.get_token_balances(wallet.chain, wallet.address)
                for token in tokens:
                    symbol = token["symbol"]
                    if not symbol:
                        continue
                    key = (symbol, wallet.chain)
                    if key not in asset_map:
                        asset_map[key] = {
                            "balance": Decimal("0.0"),
                            "name": token.get("name") or symbol,
                            "logo_url": token.get("logo_url") or self._get_token_logo(symbol)
                        }
                    asset_map[key]["balance"] += token["balance"]

        # 3. Fetch prices and create final asset list
        assets = []
        for (symbol, chain), data in asset_map.items():
            price = await stock_price_service.get_crypto_price(symbol)
            balance_usd = data["balance"] * price
            
            assets.append(CryptoAsset(
                symbol=symbol,
                name=data["name"],
                balance=data["balance"],
                balance_usd=balance_usd,
                current_price=price,
                chain=chain,
                logo_url=data["logo_url"]
            ))

        # Sort assets by value descending
        assets.sort(key=lambda x: x.balance_usd, reverse=True)

        # DeFi positions are still partially mocked
        defi_positions = []
        chains_present = [w.chain for w in wallets]
        if CryptoChain.ethereum in chains_present or CryptoChain.base in chains_present:
             defi_positions.append(DeFiPosition(
                protocol_name="Aave V3",
                protocol_logo="https://assets.coingecko.com/markets/images/698/small/aave.png",
                position_type=DeFiPositionType.LENDING,
                value_usd=Decimal("0.00"), 
                assets=[]
            ))

        total_value = sum((a.balance_usd for a in assets), Decimal("0.00"))

        return CryptoPortfolioResponse(
            wallets=wallets,
            total_value_usd=total_value,
            assets=assets,
            defi_positions=defi_positions
        )

    def _get_native_symbol(self, chain: CryptoChain) -> str | None:
        mapping = {
            CryptoChain.ethereum: "ETH",
            CryptoChain.solana: "SOL",
            CryptoChain.polygon: "MATIC",
            CryptoChain.arbitrum: "ETH",
            CryptoChain.base: "ETH",
            CryptoChain.optimism: "ETH",
            CryptoChain.bitcoin: "BTC",
        }
        return mapping.get(chain)

    def _get_chain_display_name(self, chain: CryptoChain) -> str:
        mapping = {
            CryptoChain.ethereum: "Ethereum",
            CryptoChain.solana: "Solana",
            CryptoChain.polygon: "Polygon",
            CryptoChain.arbitrum: "Arbitrum",
            CryptoChain.base: "Base",
            CryptoChain.optimism: "Optimism",
            CryptoChain.bitcoin: "Bitcoin",
        }
        return mapping.get(chain, chain.value.capitalize())

    def _get_token_logo(self, symbol: str) -> str | None:
        mapping = {
            "ETH": "https://assets.coingecko.com/coins/images/279/small/ethereum.png",
            "SOL": "https://assets.coingecko.com/coins/images/4128/small/solana.png",
            "MATIC": "https://assets.coingecko.com/coins/images/4713/small/matic-token.png",
            "BTC": "https://assets.coingecko.com/coins/images/1/small/bitcoin.png",
            "USDC": "https://assets.coingecko.com/coins/images/6319/small/USD_Coin_icon.png",
            "USDT": "https://assets.coingecko.com/coins/images/325/small/tether.png",
        }
        return mapping.get(symbol)
