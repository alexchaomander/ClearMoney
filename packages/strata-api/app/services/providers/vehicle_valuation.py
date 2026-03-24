import logging
from decimal import Decimal
from typing import Optional

import httpx

from app.core.config import settings
from app.schemas.physical_asset import VehicleSearchResult

logger = logging.getLogger(__name__)


class VehicleValuationService:
    """Service to fetch vehicle valuations via Marketcheck or similar APIs."""

    def __init__(self):
        self._api_key = settings.kbb_api_key  # Reusing the KBB key slot for now
        self._base_url = "https://marketcheck-prod.apigee.net/v2/stats/car"
        self._client = httpx.AsyncClient(timeout=10.0)

    async def close(self):
        await self._client.aclose()

    async def get_market_value(
        self, make: str, model: str, year: int, mileage: Optional[int] = None
    ) -> Optional[Decimal]:
        """Fetch median market price for a vehicle."""
        if not self._api_key:
            if settings.debug:
                logger.warning(
                    "Vehicle valuation API key not set, returning mock valuation"
                )
                return Decimal("35000.00")
            logger.error("Vehicle valuation API key not configured")
            return None

        params = {
            "api_key": self._api_key,
            "year": year,
            "make": make,
            "model": model,
        }

        try:
            response = await self._client.get(self._base_url, params=params)
            response.raise_for_status()
            data = response.json()

            if "stats" in data and "price_stats" in data["stats"]:
                median = data["stats"]["price_stats"].get("median")
                if median:
                    return Decimal(str(median))

            return None
        except httpx.HTTPStatusError as e:
            logger.error(
                "Marketcheck API error %d: %s", e.response.status_code, e.response.text
            )
            return None
        except Exception as e:
            logger.error("Unexpected error fetching vehicle valuation: %s", str(e))
            return None

    async def search_by_vin(self, vin: str) -> Optional[VehicleSearchResult]:
        """Fetch vehicle specs and market value from VIN."""
        if not self._api_key:
            if settings.debug:
                logger.warning(
                    "Vehicle valuation API key not set, returning mock VIN search"
                )
                return VehicleSearchResult(
                    vin=vin,
                    make="Tesla",
                    model="Model 3",
                    year=2022,
                    market_value=Decimal("38500.00"),
                )
            logger.error("Vehicle valuation API key not configured")
            return None

        try:
            # Marketcheck VIN specs endpoint
            url = f"https://marketcheck-prod.apigee.net/v2/specs/{vin}"
            response = await self._client.get(url, params={"api_key": self._api_key})
            response.raise_for_status()
            data = response.json()

            if data:
                # Get market value using specs
                val = await self.get_market_value(
                    make=data.get("make"),
                    model=data.get("model"),
                    year=data.get("year"),
                )
                return VehicleSearchResult(
                    vin=vin,
                    make=data.get("make"),
                    model=data.get("model"),
                    year=int(data.get("year")),
                    market_value=val,
                )
            return None
        except httpx.HTTPStatusError as e:
            if e.response.status_code == 404:
                logger.warning("Vehicle VIN %s not found in Marketcheck", vin)
            else:
                logger.error("Marketcheck VIN API error %d", e.response.status_code)
            return None
        except Exception as e:
            logger.error(
                "Unexpected error searching vehicle by VIN %s: %s", vin, str(e)
            )
            return None


# Global instance
vehicle_valuation_service = VehicleValuationService()
