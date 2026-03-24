import asyncio
import logging
from decimal import Decimal
from typing import Any

import httpx

from app.core.config import settings
from app.models.crypto_wallet import CryptoChain

logger = logging.getLogger(__name__)


class AlchemyProvider:
    """Fetch blockchain balances via Alchemy RPC APIs and public indexers."""

    _SOLANA_TOKEN_SYMBOLS: dict[str, str] = {
        "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v": "USDC",
        "Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB": "USDT",
        "JUPyiwrYJFskR4UtmCBG9cxSshSRX67YkJK36Cg2nE": "JUP",
    }

    def __init__(self):
        self._api_key = settings.alchemy_api_key
        self._base_urls = {
            CryptoChain.ethereum: f"https://eth-mainnet.g.alchemy.com/v2/{self._api_key}",
            CryptoChain.solana: f"https://solana-mainnet.g.alchemy.com/v2/{self._api_key}",
            CryptoChain.polygon: f"https://polygon-mainnet.g.alchemy.com/v2/{self._api_key}",
            CryptoChain.arbitrum: f"https://arb-mainnet.g.alchemy.com/v2/{self._api_key}",
            CryptoChain.base: f"https://base-mainnet.g.alchemy.com/v2/{self._api_key}",
            CryptoChain.optimism: f"https://opt-mainnet.g.alchemy.com/v2/{self._api_key}",
        }
        # BTC uses a separate indexer for simple address balance lookups.
        self._btc_url = "https://blockchain.info/q/addressbalance/"

    async def get_balance(self, chain: CryptoChain, address: str) -> Decimal:
        """Fetch the native token balance for a given address on a specific chain."""
        if chain == CryptoChain.bitcoin:
            return await self._get_btc_balance(address)

        if not self._api_key:
            logger.warning(
                "Alchemy API key not set, returning mock balance for %s on %s",
                address,
                chain,
            )
            return Decimal("0.0")

        if chain == CryptoChain.solana:
            return await self._get_solana_balance(address)
        else:
            return await self._get_evm_balance(chain, address)

    async def get_token_balances(
        self, chain: CryptoChain, address: str
    ) -> list[dict[str, Any]]:
        """
        Discover and fetch balances for non-native tokens (ERC-20, SPL).
        Returns a list of dicts with {symbol, balance, name, logo_url}.
        """
        if not self._api_key:
            return []

        if chain == CryptoChain.solana:
            return await self._get_solana_token_balances(address)
        elif chain in [
            CryptoChain.ethereum,
            CryptoChain.polygon,
            CryptoChain.arbitrum,
            CryptoChain.base,
            CryptoChain.optimism,
        ]:
            return await self._get_evm_token_balances(chain, address)

        return []

    async def _get_btc_balance(self, address: str) -> Decimal:
        """Fetch BTC balance from blockchain.info indexer."""
        try:
            async with httpx.AsyncClient() as client:
                response = await client.get(f"{self._btc_url}{address}")
                response.raise_for_status()
                # Returns balance in satoshis
                satoshis = int(response.text)
                return Decimal(satoshis) / Decimal(10**8)
        except Exception as e:
            logger.error("Error fetching BTC balance for %s: %s", address, str(e))
            return Decimal("0.0")

    async def _get_evm_balance(self, chain: CryptoChain, address: str) -> Decimal:
        """Fetch balance for EVM-compatible chains (ETH, Polygon, Arbitrum, etc.)."""
        url = self._base_urls.get(chain)
        if not url:
            return Decimal("0.0")

        payload = {
            "jsonrpc": "2.0",
            "id": 1,
            "method": "eth_getBalance",
            "params": [address, "latest"],
        }

        try:
            async with httpx.AsyncClient() as client:
                response = await client.post(url, json=payload)
                response.raise_for_status()
                data = response.json()

            if "result" in data:
                hex_val = data["result"]
                wei = int(hex_val, 16)
                return Decimal(wei) / Decimal(10**18)
            return Decimal("0.0")
        except Exception as e:
            logger.error(
                "Error fetching EVM balance for %s on %s: %s", address, chain, str(e)
            )
            return Decimal("0.0")

    async def _get_evm_token_balances(
        self, chain: CryptoChain, address: str
    ) -> list[dict[str, Any]]:
        """Fetch ERC-20 token balances using Alchemy's token API."""
        url = self._base_urls.get(chain)
        if not url:
            return []

        payload = {
            "jsonrpc": "2.0",
            "id": 1,
            "method": "alchemy_getTokenBalances",
            "params": [address],
        }

        tokens: list[dict[str, Any]] = []
        try:
            async with httpx.AsyncClient() as client:
                response = await client.post(url, json=payload)
                response.raise_for_status()
                data = response.json()

            if "result" in data and "tokenBalances" in data["result"]:
                token_balances = [
                    item
                    for item in data["result"]["tokenBalances"]
                    if item["tokenBalance"]
                    != (
                        "0x000000000000000000000000000000000000000000000000"
                        "0000000000000000"
                    )
                ]
                metadata_results = await asyncio.gather(
                    *(
                        self._get_evm_token_metadata(chain, item["contractAddress"])
                        for item in token_balances
                    )
                )

                for item, metadata in zip(
                    token_balances, metadata_results, strict=True
                ):
                    if not metadata:
                        continue

                    decimals = metadata.get("decimals")
                    if decimals is None:
                        continue

                    raw_balance = int(item["tokenBalance"], 16)
                    balance = Decimal(raw_balance) / Decimal(10**decimals)

                    if balance > 0:
                        tokens.append(
                            {
                                "symbol": metadata.get("symbol"),
                                "name": metadata.get("name"),
                                "balance": balance,
                                "logo_url": metadata.get("logo"),
                                "contract_address": item["contractAddress"],
                            }
                        )
            return tokens
        except Exception as e:
            logger.error(
                "Error fetching EVM tokens for %s on %s: %s", address, chain, str(e)
            )
            return []

    async def _get_evm_token_metadata(
        self, chain: CryptoChain, contract: str
    ) -> dict[str, Any] | None:
        """Fetch ERC-20 token metadata (symbol, decimals, logo)."""
        url = self._base_urls.get(chain)
        payload = {
            "jsonrpc": "2.0",
            "id": 1,
            "method": "alchemy_getTokenMetadata",
            "params": [contract],
        }
        try:
            async with httpx.AsyncClient() as client:
                response = await client.post(url, json=payload)
                response.raise_for_status()
                data = response.json()
                return data.get("result")
        except Exception:
            return None

    async def _get_solana_balance(self, address: str) -> Decimal:
        """Fetch balance for Solana."""
        url = self._base_urls.get(CryptoChain.solana)
        payload = {
            "jsonrpc": "2.0",
            "id": 1,
            "method": "getBalance",
            "params": [address],
        }

        try:
            async with httpx.AsyncClient() as client:
                response = await client.post(url, json=payload)
                response.raise_for_status()
                data = response.json()

            if "result" in data and "value" in data["result"]:
                lamports = data["result"]["value"]
                return Decimal(lamports) / Decimal(10**9)
            return Decimal("0.0")
        except Exception as e:
            logger.error("Error fetching Solana balance for %s: %s", address, str(e))
            return Decimal("0.0")

    async def _get_solana_token_balances(self, address: str) -> list[dict[str, Any]]:
        """Fetch SPL token balances for Solana."""
        url = self._base_urls.get(CryptoChain.solana)
        payload = {
            "jsonrpc": "2.0",
            "id": 1,
            "method": "getTokenAccountsByOwner",
            "params": [
                address,
                {"programId": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"},
                {"encoding": "jsonParsed"},
            ],
        }

        tokens: list[dict[str, Any]] = []
        try:
            async with httpx.AsyncClient() as client:
                response = await client.post(url, json=payload)
                response.raise_for_status()
                data = response.json()

            if "result" in data and "value" in data["result"]:
                for item in data["result"]["value"]:
                    info = item["account"]["data"]["parsed"]["info"]
                    mint = info["mint"]
                    ui_amount = info["tokenAmount"]["uiAmount"]

                    if ui_amount and ui_amount > 0:
                        symbol = self._SOLANA_TOKEN_SYMBOLS.get(mint, mint[:8])
                        tokens.append(
                            {
                                "symbol": symbol,
                                "name": symbol,
                                "balance": Decimal(str(ui_amount)),
                                "contract_address": mint,
                            }
                        )
            return tokens
        except Exception as e:
            logger.error("Error fetching Solana tokens for %s: %s", address, str(e))
            return []


# Global instance
alchemy_provider = AlchemyProvider()
