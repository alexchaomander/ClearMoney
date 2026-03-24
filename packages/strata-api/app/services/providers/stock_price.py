import logging
import time
from decimal import Decimal

import httpx
from fastapi import HTTPException

from app.core.config import settings

logger = logging.getLogger(__name__)


class StockPriceService:
    """Service to fetch real-time stock prices using Alpha Vantage."""

    _MOCK_CRYPTO_PRICES: dict[str, Decimal] = {
        "ETH": Decimal("2300.00"),
        "SOL": Decimal("100.00"),
        "BTC": Decimal("65000.00"),
        "USDC": Decimal("1.00"),
        "USDT": Decimal("1.00"),
        "MATIC": Decimal("1.00"),
    }

    def __init__(self):
        self._api_key = settings.alpha_vantage_api_key
        self._base_url = "https://www.alphavantage.co/query"
        # Simple in-memory cache to stay within free tier limits
        # symbol -> (price, timestamp)
        self._cache: dict[str, tuple[Decimal, float]] = {}
        self._cache_ttl = 3600  # 1 hour cache for demo purposes

    async def get_price(self, symbol: str) -> Decimal:
        """Fetch the current price for a stock symbol."""
        symbol = symbol.upper()

        # Check cache
        now = time.time()
        if symbol in self._cache:
            price, timestamp = self._cache[symbol]
            if now - timestamp < self._cache_ttl:
                return price

        if not self._api_key:
            logger.warning(
                "Alpha Vantage API key not set, using mock price for %s", symbol
            )
            return Decimal("150.00")  # Mock fallback

        params = {"function": "GLOBAL_QUOTE", "symbol": symbol, "apikey": self._api_key}

        try:
            async with httpx.AsyncClient() as client:
                response = await client.get(self._base_url, params=params)
                response.raise_for_status()
                data = response.json()

            if "Global Quote" in data and "05. price" in data["Global Quote"]:
                price_str = data["Global Quote"]["05. price"]
                price = Decimal(price_str)
                self._cache[symbol] = (price, now)
                return price

            # Handle rate limiting or error messages from Alpha Vantage
            if "Note" in data:
                logger.warning("Alpha Vantage rate limit hit: %s", data["Note"])
            elif "Error Message" in data:
                logger.error(
                    "Alpha Vantage error for %s: %s", symbol, data["Error Message"]
                )

            # Fallback if cache exists but is expired
            if symbol in self._cache:
                return self._cache[symbol][0]

            raise HTTPException(
                status_code=503, detail="Stock price service unavailable"
            )

        except Exception as e:
            logger.error("Error fetching stock price for %s: %s", symbol, str(e))
            # Mock fallback for demo if everything fails
            return Decimal("150.00")

    async def get_crypto_price(self, symbol: str, market: str = "USD") -> Decimal:
        """Fetch the current price for a cryptocurrency in a target market."""
        symbol = symbol.upper()
        market = market.upper()
        cache_key = f"CRYPTO_{symbol}_{market}"

        # Check cache
        now = time.time()
        if cache_key in self._cache:
            price, timestamp = self._cache[cache_key]
            if now - timestamp < self._cache_ttl:
                return price

        if not self._api_key:
            logger.warning(
                "Alpha Vantage API key not set, using mock price for %s", symbol
            )
            return self._MOCK_CRYPTO_PRICES.get(symbol, Decimal("1.00"))

        params = {
            "function": "CURRENCY_EXCHANGE_RATE",
            "from_currency": symbol,
            "to_currency": market,
            "apikey": self._api_key,
        }

        try:
            async with httpx.AsyncClient() as client:
                response = await client.get(self._base_url, params=params)
                response.raise_for_status()
                data = response.json()

            rate_key = "Realtime Currency Exchange Rate"
            if rate_key in data and "5. Exchange Rate" in data[rate_key]:
                price_str = data[rate_key]["5. Exchange Rate"]
                price = Decimal(price_str)
                self._cache[cache_key] = (price, now)
                return price

            if "Note" in data:
                logger.warning("Alpha Vantage rate limit hit: %s", data["Note"])
            elif "Error Message" in data:
                logger.error(
                    "Alpha Vantage error for %s: %s", symbol, data["Error Message"]
                )

            if cache_key in self._cache:
                return self._cache[cache_key][0]

            # Fallback for common cryptos if service is down and no cache
            return self._MOCK_CRYPTO_PRICES.get(symbol, Decimal("1.00"))

        except Exception as e:
            logger.error("Error fetching crypto price for %s: %s", symbol, str(e))
            return self._MOCK_CRYPTO_PRICES.get(symbol, Decimal("1.00"))


# Global instance
stock_price_service = StockPriceService()
