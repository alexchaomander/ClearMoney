import logging
from decimal import Decimal
from typing import Optional

import httpx
from app.core.config import settings

logger = logging.getLogger(__name__)


class ZillowService:
    """Service to fetch real estate valuations via Zillow/Bridge API."""

    def __init__(self):
        self._api_key = settings.zillow_api_key
        # Note: In a real production app, we might use Bridge Interactive (Zillow-owned)
        self._base_url = "https://api.bridgeinteractive.com/api/v1/zestimate"
        self._client = httpx.AsyncClient(timeout=10.0)

    async def close(self):
        await self._client.aclose()

    async def get_zestimate(self, zpid: str) -> Optional[Decimal]:
        """Fetch the Zestimate for a specific Zillow Property ID."""
        if not self._api_key:
            logger.warning("Zillow API key not set, returning mock valuation")
            return None

        params = {
            "zpid": zpid,
            "access_token": self._api_key
        }

        try:
            response = await self._client.get(self._base_url, params=params)
            response.raise_for_status()
            data = response.json()

            # Bridge API structure
            if data.get("success") and "bundle" in data:
                zestimate = data["bundle"].get("zestimate")
                if zestimate:
                    return Decimal(str(zestimate))

            return None
        except Exception as e:
            logger.error("Error fetching Zestimate for ZPID %s: %s", zpid, str(e))
            return None

    async def search_by_address(self, address: str) -> Optional[str]:
        """Search for a property by address and return its ZPID."""
        # TODO: Implement Zillow Search API
        logger.info("Address search not yet fully implemented for Zillow")
        return None


# Global instance
zillow_service = ZillowService()
