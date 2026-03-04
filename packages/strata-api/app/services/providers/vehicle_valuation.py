import logging
from decimal import Decimal
from typing import Optional

import httpx
from app.core.config import settings

logger = logging.getLogger(__name__)


class VehicleValuationService:
    """Service to fetch vehicle valuations via Marketcheck or similar APIs."""

    def __init__(self):
        self._api_key = settings.kbb_api_key  # Reusing the KBB key slot for now
        self._base_url = "https://marketcheck-prod.apigee.net/v2/stats/car"

    async def get_market_value(
        self, make: str, model: str, year: int, mileage: Optional[int] = None
    ) -> Optional[Decimal]:
        """Fetch median market price for a vehicle."""
        if not self._api_key:
            logger.warning("Vehicle valuation API key not set")
            return None

        params = {
            "api_key": self._api_key,
            "year": year,
            "make": make,
            "model": model,
        }

        try:
            async with httpx.AsyncClient() as client:
                response = await client.get(self._base_url, params=params)
                response.raise_for_status()
                data = response.json()

            # Marketcheck stats structure
            if "stats" in data and "price_stats" in data["stats"]:
                median = data["stats"]["price_stats"].get("median")
                if median:
                    return Decimal(str(median))

            return None
        except Exception as e:
            logger.error("Error fetching vehicle valuation: %s", str(e))
            return None


# Global instance
vehicle_valuation_service = VehicleValuationService()
