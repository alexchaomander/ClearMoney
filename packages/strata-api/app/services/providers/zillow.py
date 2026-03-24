import logging
from decimal import Decimal
from typing import List, Optional

import httpx

from app.core.config import settings
from app.schemas.physical_asset import PropertySearchResult

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
            if settings.debug:
                logger.warning("Zillow API key not set, returning mock valuation")
                return Decimal("750000.00")
            logger.error("Zillow API key not configured")
            return None

        params = {"zpid": zpid, "access_token": self._api_key}

        try:
            response = await self._client.get(self._base_url, params=params)
            response.raise_for_status()
            data = response.json()

            if data.get("success") and "bundle" in data:
                zestimate = data["bundle"].get("zestimate")
                if zestimate:
                    return Decimal(str(zestimate))

            return None
        except httpx.HTTPStatusError as e:
            if e.response.status_code == 429:
                logger.error("Zillow API rate limit exceeded")
            elif e.response.status_code == 404:
                logger.warning("Zillow ZPID %s not found", zpid)
            else:
                logger.error(
                    "Zillow API error %d: %s", e.response.status_code, e.response.text
                )
            return None
        except Exception as e:
            logger.error(
                "Unexpected error fetching Zestimate for ZPID %s: %s", zpid, str(e)
            )
            return None

    async def search_by_address(self, address: str) -> List[PropertySearchResult]:
        """Search for properties by address and return a list of candidate results."""
        if not self._api_key:
            if settings.debug:
                logger.warning("Zillow API key not set, returning mock search result")
                return [
                    PropertySearchResult(
                        zillow_zpid="12345678",
                        address=address or "123 Main St",
                        city="San Francisco",
                        state="CA",
                        zip_code="94105",
                        market_value=Decimal("1250000.00"),
                    )
                ]
            logger.error("Zillow API key not configured")
            return []

        try:
            # Example search endpoint (Bridge API Search)
            search_url = "https://api.bridgeinteractive.com/api/v1/zestimate/search"
            params = {"address": address, "access_token": self._api_key}
            response = await self._client.get(search_url, params=params)
            response.raise_for_status()
            data = response.json()

            results = []
            if data.get("success") and "bundle" in data:
                for item in data["bundle"]:
                    results.append(
                        PropertySearchResult(
                            zillow_zpid=str(item.get("zpid")),
                            address=item.get("address"),
                            city=item.get("city"),
                            state=item.get("state"),
                            zip_code=item.get("zip"),
                            market_value=Decimal(str(item.get("zestimate")))
                            if item.get("zestimate")
                            else None,
                        )
                    )
            return results
        except httpx.HTTPStatusError as e:
            logger.error(
                "Zillow Search API error %d for address %s",
                e.response.status_code,
                address,
            )
            return []
        except Exception as e:
            logger.error(
                "Unexpected error searching Zillow for address %s: %s", address, str(e)
            )
            return []


# Global instance
zillow_service = ZillowService()
