import logging
import time
from decimal import Decimal

import httpx

from app.core.config import settings

logger = logging.getLogger(__name__)


class MetalPriceService:
    """Service to fetch real-time precious metal prices using Alpha Vantage."""

    def __init__(self):
        self._api_key = settings.alpha_vantage_api_key
        self._base_url = "https://www.alphavantage.co/query"
        # symbol -> (price, timestamp)
        self._cache: dict[str, tuple[Decimal, float]] = {}
        self._cache_ttl = 3600  # 1 hour

        # Metal symbols to Alpha Vantage currency codes
        self._symbol_map = {
            "gold": "XAU",
            "silver": "XAG",
            "platinum": "XPT",
            "palladium": "XPD",
        }
        
        # Mock prices for fallback
        self._mock_prices = {
            "gold": Decimal("2150.50"),
            "silver": Decimal("24.20"),
            "platinum": Decimal("920.00"),
            "palladium": Decimal("1050.00"),
        }

    async def get_spot_price(self, metal: str) -> Decimal:
        """Fetch the current spot price per troy ounce in USD."""
        metal = metal.lower()
        av_symbol = self._symbol_map.get(metal)
        
        if not av_symbol:
            raise ValueError(f"Unsupported metal: {metal}")

        # Check cache
        now = time.time()
        if av_symbol in self._cache:
            price, timestamp = self._cache[av_symbol]
            if now - timestamp < self._cache_ttl:
                return price

        if not self._api_key:
            logger.warning(
                "Alpha Vantage API key not set, using mock price for %s", metal
            )
            return self._mock_prices.get(metal, Decimal("0.00"))

        params = {
            "function": "CURRENCY_EXCHANGE_RATE",
            "from_currency": av_symbol,
            "to_currency": "USD",
            "apikey": self._api_key
        }

        try:
            async with httpx.AsyncClient() as client:
                response = await client.get(self._base_url, params=params)
                response.raise_for_status()
                data = response.json()

            rate_data = data.get("Realtime Currency Exchange Rate")
            if rate_data and "5. Exchange Rate" in rate_data:
                price = Decimal(rate_data["5. Exchange Rate"])
                self._cache[av_symbol] = (price, now)
                return price

            # Error handling
            if "Note" in data:
                logger.warning("Alpha Vantage rate limit hit: %s", data["Note"])
            
            # Fallback to cache if expired
            if av_symbol in self._cache:
                return self._cache[av_symbol][0]
                
            return self._mock_prices.get(metal, Decimal("0.00"))

        except Exception as e:
            logger.error("Error fetching metal price for %s: %s", metal, str(e))
            return self._mock_prices.get(metal, Decimal("0.00"))


# Global instance
metal_price_service = MetalPriceService()
