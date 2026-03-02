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
)

logger = logging.getLogger(__name__)


class CryptoService:
    """Service to handle crypto wallet aggregation and DeFi positions."""

    def __init__(self, session: AsyncSession):
        self.session = session

    async def add_wallet(self, user_id: uuid.UUID, wallet_in: CryptoWalletCreate) -> CryptoWallet:
        """Add a new crypto wallet address to track."""
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

    async def get_portfolio(self, user_id: uuid.UUID) -> CryptoPortfolioResponse:
        """
        Aggregate all crypto assets and DeFi positions across all wallets.
        Currently uses simulated data for a 'premium' initial experience.
        """
        wallets = await self.list_wallets(user_id)
        if not wallets:
            return CryptoPortfolioResponse(
                wallets=[],
                total_value_usd=Decimal("0.00"),
                assets=[],
                defi_positions=[]
            )

        # In a real implementation, we would call Moralis, Zapper, or Alchemy here.
        # For this high-fidelity prototype, we'll simulate a rich portfolio if addresses exist.
        
        # Determine chains present
        chains = list(set(w.chain for w in wallets))
        
        assets = []
        defi_positions = []
        
        # Mocking ETH assets
        if CryptoChain.ethereum in chains or CryptoChain.base in chains:
            assets.append(CryptoAsset(
                symbol="ETH",
                name="Ethereum",
                balance=Decimal("4.25"),
                balance_usd=Decimal("9850.50"),
                current_price=Decimal("2317.76"),
                chain=CryptoChain.ethereum,
                logo_url="https://assets.coingecko.com/coins/images/279/small/ethereum.png"
            ))
            assets.append(CryptoAsset(
                symbol="USDC",
                name="USD Coin",
                balance=Decimal("12500.00"),
                balance_usd=Decimal("12500.00"),
                current_price=Decimal("1.00"),
                chain=CryptoChain.ethereum,
                logo_url="https://assets.coingecko.com/coins/images/6319/small/USD_Coin_icon.png"
            ))
            
            # Mocking DeFi
            defi_positions.append(DeFiPosition(
                protocol_name="Aave V3",
                protocol_logo="https://assets.coingecko.com/markets/images/698/small/aave.png",
                position_type="Lending",
                value_usd=Decimal("25400.00"),
                assets=[
                    CryptoAsset(
                        symbol="WETH",
                        name="Wrapped Ether",
                        balance=Decimal("10.0"),
                        balance_usd=Decimal("23177.60"),
                        current_price=Decimal("2317.76"),
                        chain=CryptoChain.ethereum
                    )
                ]
            ))

        # Mocking Solana assets
        if CryptoChain.solana in chains:
            assets.append(CryptoAsset(
                symbol="SOL",
                name="Solana",
                balance=Decimal("142.5"),
                balance_usd=Decimal("14535.00"),
                current_price=Decimal("102.00"),
                chain=CryptoChain.solana,
                logo_url="https://assets.coingecko.com/coins/images/4128/small/solana.png"
            ))
            assets.append(CryptoAsset(
                symbol="JUP",
                name="Jupiter",
                balance=Decimal("5000.0"),
                balance_usd=Decimal("2500.00"),
                current_price=Decimal("0.50"),
                chain=CryptoChain.solana,
                logo_url="https://assets.coingecko.com/coins/images/34188/small/jup.png"
            ))

        total_value = sum((a.balance_usd for a in assets), Decimal("0.00")) + sum((p.value_usd for p in defi_positions), Decimal("0.00"))
        
        return CryptoPortfolioResponse(
            wallets=wallets,
            total_value_usd=total_value,
            assets=assets,
            defi_positions=defi_positions
        )
