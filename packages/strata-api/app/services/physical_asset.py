import asyncio
import logging
import uuid
from datetime import datetime, timezone
from decimal import Decimal
from typing import Any, Callable, Dict, List, Optional

from pydantic import BaseModel
from sqlalchemy import delete, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.physical_asset import (
    AlternativeAsset,
    AssetType,
    AssetValuation,
    CollectibleAsset,
    PreciousMetalAsset,
    RealEstateAsset,
    ValuationType,
    VehicleAsset,
)
from app.schemas.physical_asset import (
    AlternativeAssetCreate,
    AlternativeAssetUpdate,
    CollectibleAssetCreate,
    CollectibleAssetUpdate,
    PhysicalAssetsSummary,
    PreciousMetalAssetCreate,
    PreciousMetalAssetUpdate,
    PropertySearchResult,
    RealEstateAssetCreate,
    RealEstateAssetUpdate,
    VehicleAssetCreate,
    VehicleAssetUpdate,
    VehicleSearchResult,
)
from app.services.providers.metal_price import metal_price_service

logger = logging.getLogger(__name__)

COOLDOWN_DEFAULT = 86400  # 24 hours for real estate, vehicles, collectibles
COOLDOWN_METALS = 900  # 15 minutes for precious metals


class PhysicalAssetService:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def _record_valuation(
        self,
        user_id: uuid.UUID,
        asset_id: uuid.UUID,
        asset_type: AssetType,
        value: Decimal,
        source: Optional[str] = None,
        notes: Optional[str] = None,
    ) -> None:
        """Record a historical valuation entry."""
        valuation = AssetValuation(
            user_id=user_id,
            asset_id=asset_id,
            asset_type=asset_type,
            value=value,
            source=source,
            notes=notes,
            valuation_date=datetime.now(timezone.utc),
        )
        self.session.add(valuation)
        # We don't commit here, assuming the caller will commit

    async def get_valuation_history(
        self, user_id: uuid.UUID, asset_id: uuid.UUID, asset_type: AssetType
    ) -> List[AssetValuation]:
        """Get the valuation history for a specific asset."""
        result = await self.session.execute(
            select(AssetValuation)
            .where(
                AssetValuation.user_id == user_id,
                AssetValuation.asset_id == asset_id,
                AssetValuation.asset_type == asset_type,
            )
            .order_by(AssetValuation.valuation_date.desc())
        )
        return list(result.scalars().all())

    async def _create_asset(
        self,
        user_id: uuid.UUID,
        asset_model: Any,
        asset_type: AssetType,
        data: BaseModel,
        refresh_func: Optional[Callable[[uuid.UUID, Optional[uuid.UUID]], Any]] = None,
    ) -> Any:
        """Generic asset creation with valuation history and optional auto-refresh."""
        asset = asset_model(user_id=user_id, **data.model_dump())
        self.session.add(asset)
        await self.session.flush()

        # Record initial valuation if provided
        if hasattr(asset, "market_value") and asset.market_value > 0:
            source = "Manual (Initial)"
            if (
                hasattr(asset, "valuation_type")
                and asset.valuation_type == ValuationType.auto
            ):
                source = "Auto (Initial)"

            await self._record_valuation(
                user_id=user_id,
                asset_id=asset.id,
                asset_type=asset_type,
                value=asset.market_value,
                source=source,
            )

        await self.session.commit()
        await self.session.refresh(asset)

        if (
            refresh_func
            and hasattr(asset, "valuation_type")
            and asset.valuation_type == ValuationType.auto
        ):
            result = await refresh_func(asset.id, user_id)
            if result.get("status") == "failed":
                logger.warning(
                    "Initial auto-valuation failed for %s asset %s: %s",
                    asset_type.value,
                    asset.id,
                    result.get("message"),
                )
            await self.session.refresh(asset)

        return asset

    # --- Real Estate ---

    async def get_real_estate_assets(self, user_id: uuid.UUID) -> List[RealEstateAsset]:
        result = await self.session.execute(
            select(RealEstateAsset).where(RealEstateAsset.user_id == user_id)
        )
        return list(result.scalars().all())

    async def create_real_estate_asset(
        self, user_id: uuid.UUID, data: RealEstateAssetCreate
    ) -> RealEstateAsset:
        return await self._create_asset(
            user_id=user_id,
            asset_model=RealEstateAsset,
            asset_type=AssetType.real_estate,
            data=data,
            refresh_func=self.refresh_real_estate_valuation,
        )

    async def update_real_estate_asset(
        self, asset_id: uuid.UUID, user_id: uuid.UUID, data: RealEstateAssetUpdate
    ) -> Optional[RealEstateAsset]:
        asset_result = await self.session.execute(
            select(RealEstateAsset).where(
                RealEstateAsset.id == asset_id, RealEstateAsset.user_id == user_id
            )
        )
        asset = asset_result.scalar_one_or_none()
        if not asset:
            return None

        previous_value = asset.market_value
        for key, value in data.model_dump(exclude_unset=True).items():
            setattr(asset, key, value)

        if data.market_value is not None and data.market_value != previous_value:
            await self._record_valuation(
                user_id=user_id,
                asset_id=asset.id,
                asset_type=AssetType.real_estate,
                value=data.market_value,
                source="Manual Update",
            )
            asset.last_valuation_at = datetime.now(timezone.utc)

        await self.session.commit()
        await self.session.refresh(asset)
        return asset

    async def delete_real_estate_asset(
        self, asset_id: uuid.UUID, user_id: uuid.UUID
    ) -> bool:
        result = await self.session.execute(
            delete(RealEstateAsset).where(
                RealEstateAsset.id == asset_id, RealEstateAsset.user_id == user_id
            )
        )
        await self.session.commit()
        return result.rowcount > 0

    # --- Vehicles ---

    async def get_vehicle_assets(self, user_id: uuid.UUID) -> List[VehicleAsset]:
        result = await self.session.execute(
            select(VehicleAsset).where(VehicleAsset.user_id == user_id)
        )
        return list(result.scalars().all())

    async def create_vehicle_asset(
        self, user_id: uuid.UUID, data: VehicleAssetCreate
    ) -> VehicleAsset:
        return await self._create_asset(
            user_id=user_id,
            asset_model=VehicleAsset,
            asset_type=AssetType.vehicle,
            data=data,
            refresh_func=self.refresh_vehicle_valuation,
        )

    async def update_vehicle_asset(
        self, asset_id: uuid.UUID, user_id: uuid.UUID, data: VehicleAssetUpdate
    ) -> Optional[VehicleAsset]:
        asset_result = await self.session.execute(
            select(VehicleAsset).where(
                VehicleAsset.id == asset_id, VehicleAsset.user_id == user_id
            )
        )
        asset = asset_result.scalar_one_or_none()
        if not asset:
            return None

        previous_value = asset.market_value
        for key, value in data.model_dump(exclude_unset=True).items():
            setattr(asset, key, value)

        if data.market_value is not None and data.market_value != previous_value:
            await self._record_valuation(
                user_id=user_id,
                asset_id=asset.id,
                asset_type=AssetType.vehicle,
                value=data.market_value,
                source="Manual Update",
            )
            asset.last_valuation_at = datetime.now(timezone.utc)

        await self.session.commit()
        await self.session.refresh(asset)
        return asset

    async def delete_vehicle_asset(
        self, asset_id: uuid.UUID, user_id: uuid.UUID
    ) -> bool:
        result = await self.session.execute(
            delete(VehicleAsset).where(
                VehicleAsset.id == asset_id, VehicleAsset.user_id == user_id
            )
        )
        await self.session.commit()
        return result.rowcount > 0

    # --- Collectibles ---

    async def get_collectible_assets(
        self, user_id: uuid.UUID
    ) -> List[CollectibleAsset]:
        result = await self.session.execute(
            select(CollectibleAsset).where(CollectibleAsset.user_id == user_id)
        )
        return list(result.scalars().all())

    async def create_collectible_asset(
        self, user_id: uuid.UUID, data: CollectibleAssetCreate
    ) -> CollectibleAsset:
        return await self._create_asset(
            user_id=user_id,
            asset_model=CollectibleAsset,
            asset_type=AssetType.collectible,
            data=data,
            refresh_func=self.refresh_collectible_valuation,
        )

    async def update_collectible_asset(
        self, asset_id: uuid.UUID, user_id: uuid.UUID, data: CollectibleAssetUpdate
    ) -> Optional[CollectibleAsset]:
        asset_result = await self.session.execute(
            select(CollectibleAsset).where(
                CollectibleAsset.id == asset_id, CollectibleAsset.user_id == user_id
            )
        )
        asset = asset_result.scalar_one_or_none()
        if not asset:
            return None

        previous_value = asset.market_value
        for key, value in data.model_dump(exclude_unset=True).items():
            setattr(asset, key, value)

        if data.market_value is not None and data.market_value != previous_value:
            await self._record_valuation(
                user_id=user_id,
                asset_id=asset.id,
                asset_type=AssetType.collectible,
                value=data.market_value,
                source="Manual Update",
            )
            asset.last_valuation_at = datetime.now(timezone.utc)

        await self.session.commit()
        await self.session.refresh(asset)
        return asset

    async def delete_collectible_asset(
        self, asset_id: uuid.UUID, user_id: uuid.UUID
    ) -> bool:
        result = await self.session.execute(
            delete(CollectibleAsset).where(
                CollectibleAsset.id == asset_id, CollectibleAsset.user_id == user_id
            )
        )
        await self.session.commit()
        return result.rowcount > 0

    # --- Precious Metals ---

    async def get_precious_metal_assets(
        self, user_id: uuid.UUID
    ) -> List[PreciousMetalAsset]:
        result = await self.session.execute(
            select(PreciousMetalAsset).where(PreciousMetalAsset.user_id == user_id)
        )
        return list(result.scalars().all())

    async def create_precious_metal_asset(
        self, user_id: uuid.UUID, data: PreciousMetalAssetCreate
    ) -> PreciousMetalAsset:
        return await self._create_asset(
            user_id=user_id,
            asset_model=PreciousMetalAsset,
            asset_type=AssetType.precious_metal,
            data=data,
            refresh_func=self.refresh_metal_valuation,
        )

    async def update_precious_metal_asset(
        self, asset_id: uuid.UUID, user_id: uuid.UUID, data: PreciousMetalAssetUpdate
    ) -> Optional[PreciousMetalAsset]:
        asset_result = await self.session.execute(
            select(PreciousMetalAsset).where(
                PreciousMetalAsset.id == asset_id, PreciousMetalAsset.user_id == user_id
            )
        )
        asset = asset_result.scalar_one_or_none()
        if not asset:
            return None

        for key, value in data.model_dump(exclude_unset=True).items():
            setattr(asset, key, value)

        await self.session.commit()
        await self.session.refresh(asset)
        return asset

    async def delete_precious_metal_asset(
        self, asset_id: uuid.UUID, user_id: uuid.UUID
    ) -> bool:
        result = await self.session.execute(
            delete(PreciousMetalAsset).where(
                PreciousMetalAsset.id == asset_id, PreciousMetalAsset.user_id == user_id
            )
        )
        await self.session.commit()
        return result.rowcount > 0

    # --- Alternative Assets ---

    async def get_alternative_assets(
        self, user_id: uuid.UUID
    ) -> List[AlternativeAsset]:
        result = await self.session.execute(
            select(AlternativeAsset).where(AlternativeAsset.user_id == user_id)
        )
        return list(result.scalars().all())

    async def create_alternative_asset(
        self, user_id: uuid.UUID, data: AlternativeAssetCreate
    ) -> AlternativeAsset:
        return await self._create_asset(
            user_id=user_id,
            asset_model=AlternativeAsset,
            asset_type=AssetType.alternative,
            data=data,
        )

    async def update_alternative_asset(
        self, asset_id: uuid.UUID, user_id: uuid.UUID, data: AlternativeAssetUpdate
    ) -> Optional[AlternativeAsset]:
        asset_result = await self.session.execute(
            select(AlternativeAsset).where(
                AlternativeAsset.id == asset_id, AlternativeAsset.user_id == user_id
            )
        )
        asset = asset_result.scalar_one_or_none()
        if not asset:
            return None

        previous_value = asset.market_value
        for key, value in data.model_dump(exclude_unset=True).items():
            setattr(asset, key, value)

        # If market value was updated manually, record it
        if data.market_value is not None and data.market_value != previous_value:
            await self._record_valuation(
                user_id=user_id,
                asset_id=asset.id,
                asset_type=AssetType.alternative,
                value=data.market_value,
                source="Manual Update",
            )
            asset.last_valuation_at = datetime.now(timezone.utc)

        await self.session.commit()
        await self.session.refresh(asset)
        return asset

    async def delete_alternative_asset(
        self, asset_id: uuid.UUID, user_id: uuid.UUID
    ) -> bool:
        result = await self.session.execute(
            delete(AlternativeAsset).where(
                AlternativeAsset.id == asset_id, AlternativeAsset.user_id == user_id
            )
        )
        await self.session.commit()
        return result.rowcount > 0

    # --- Search Services ---

    async def search_properties(
        self, address: str, user_id: Optional[uuid.UUID] = None
    ) -> List[PropertySearchResult]:
        """Fetch estimated property value from Zillow API."""
        # Placeholder for real Zillow API integration
        # For MVP, return a mock result
        return [
            PropertySearchResult(
                address=address,
                zillow_zpid="12345",
                city="",
                state="",
                zip_code="",
                market_value=Decimal("750000.00"),
            )
        ]

    async def search_vehicles(
        self,
        vin: Optional[str] = None,
        make: Optional[str] = None,
        model: Optional[str] = None,
        year: Optional[int] = None,
    ) -> List[VehicleSearchResult]:
        """Fetch estimated vehicle value from Marketcheck APIs."""
        # Mock logic
        if vin:
            val = Decimal("25000.00")
            return [
                VehicleSearchResult(
                    vin=vin, make="Toyota", model="Camry", year=2022, market_value=val
                )
            ]
        elif make and model and year:
            val = Decimal("30000.00")
            return [
                VehicleSearchResult(make=make, model=model, year=year, market_value=val)
            ]

        return []

    # --- Cooldown ---

    @staticmethod
    def _check_cooldown(
        last_valuation_at: Optional[datetime], cooldown_seconds: int
    ) -> Optional[int]:
        """Return remaining cooldown seconds, or None if no cooldown applies."""
        if not last_valuation_at:
            return None
        now = datetime.now(timezone.utc)
        elapsed = (now - last_valuation_at).total_seconds()
        if elapsed < cooldown_seconds:
            return int(cooldown_seconds - elapsed)
        return None

    # --- Valuation Refreshes ---

    async def refresh_real_estate_valuation(
        self, asset_id: uuid.UUID, user_id: Optional[uuid.UUID] = None
    ) -> Dict[str, Any]:
        """Fetch current property value from Zillow."""
        query = select(RealEstateAsset).where(RealEstateAsset.id == asset_id)
        if user_id:
            query = query.where(RealEstateAsset.user_id == user_id)
        result = await self.session.execute(query)
        asset = result.scalar_one_or_none()
        if not asset:
            return {"status": "not_found", "message": "Asset not found"}

        cooldown = self._check_cooldown(asset.last_valuation_at, COOLDOWN_DEFAULT)
        if cooldown:
            return {
                "status": "cooldown",
                "message": f"Wait {cooldown}s",
                "remaining": cooldown,
            }

        # Mock Zillow refresh
        new_value = (
            asset.market_value * Decimal("1.01")
            if asset.market_value
            else Decimal("500000.00")
        )
        previous_value = asset.market_value

        if new_value == previous_value:
            asset.last_valuation_at = datetime.now(timezone.utc)
            await self.session.commit()
            return {
                "status": "unchanged",
                "new_value": new_value,
                "previous_value": previous_value,
            }

        asset.market_value = new_value
        asset.last_valuation_at = datetime.now(timezone.utc)

        # Record historical valuation
        await self._record_valuation(
            user_id=asset.user_id,
            asset_id=asset.id,
            asset_type=AssetType.real_estate,
            value=new_value,
            source="Zillow",
        )

        await self.session.commit()
        return {
            "status": "updated",
            "new_value": new_value,
            "previous_value": previous_value,
        }

    async def refresh_vehicle_valuation(
        self, asset_id: uuid.UUID, user_id: Optional[uuid.UUID] = None
    ) -> Dict[str, Any]:
        """Fetch current vehicle value from Marketcheck APIs."""
        query = select(VehicleAsset).where(VehicleAsset.id == asset_id)
        if user_id:
            query = query.where(VehicleAsset.user_id == user_id)
        result = await self.session.execute(query)
        asset = result.scalar_one_or_none()
        if not asset:
            return {"status": "not_found", "message": "Asset not found"}

        cooldown = self._check_cooldown(asset.last_valuation_at, COOLDOWN_DEFAULT)
        if cooldown:
            return {
                "status": "cooldown",
                "message": f"Wait {cooldown}s",
                "remaining": cooldown,
            }

        # Mock refresh
        new_value = (
            asset.market_value * Decimal("0.98")
            if asset.market_value
            else Decimal("20000.00")
        )
        previous_value = asset.market_value

        if new_value == previous_value:
            asset.last_valuation_at = datetime.now(timezone.utc)
            await self.session.commit()
            return {
                "status": "unchanged",
                "new_value": new_value,
                "previous_value": previous_value,
            }

        asset.market_value = new_value
        asset.last_valuation_at = datetime.now(timezone.utc)

        # Record historical valuation
        await self._record_valuation(
            user_id=asset.user_id,
            asset_id=asset.id,
            asset_type=AssetType.vehicle,
            value=new_value,
            source="VehicleValuation",
        )

        await self.session.commit()
        return {
            "status": "updated",
            "new_value": new_value,
            "previous_value": previous_value,
        }

    async def refresh_collectible_valuation(
        self, asset_id: uuid.UUID, user_id: Optional[uuid.UUID] = None
    ) -> Dict[str, Any]:
        """Fetch current value for collectibles (Chrono24, CardLadder, etc)."""
        query = select(CollectibleAsset).where(CollectibleAsset.id == asset_id)
        if user_id:
            query = query.where(CollectibleAsset.user_id == user_id)
        result = await self.session.execute(query)
        asset = result.scalar_one_or_none()
        if not asset:
            return {"status": "not_found", "message": "Asset not found"}

        cooldown = self._check_cooldown(asset.last_valuation_at, COOLDOWN_DEFAULT)
        if cooldown:
            return {
                "status": "cooldown",
                "message": f"Wait {cooldown}s",
                "remaining": cooldown,
            }

        # Mock refresh
        new_value = (
            asset.market_value * Decimal("1.02")
            if asset.market_value
            else Decimal("1000.00")
        )
        previous_value = asset.market_value

        if new_value == previous_value:
            asset.last_valuation_at = datetime.now(timezone.utc)
            await self.session.commit()
            return {
                "status": "unchanged",
                "new_value": new_value,
                "previous_value": previous_value,
            }

        asset.market_value = new_value
        asset.last_valuation_at = datetime.now(timezone.utc)

        # Record historical valuation
        await self._record_valuation(
            user_id=asset.user_id,
            asset_id=asset.id,
            asset_type=AssetType.collectible,
            value=new_value,
            source="Manual (Refresh)",
        )

        await self.session.commit()
        return {
            "status": "updated",
            "new_value": new_value,
            "previous_value": previous_value,
        }

    async def refresh_metal_valuation(
        self, asset_id: uuid.UUID, user_id: Optional[uuid.UUID] = None
    ) -> Dict[str, Any]:
        """Fetch current precious metal value from GoldAPI/Binance."""
        query = select(PreciousMetalAsset).where(PreciousMetalAsset.id == asset_id)
        if user_id:
            query = query.where(PreciousMetalAsset.user_id == user_id)
        result = await self.session.execute(query)
        asset = result.scalar_one_or_none()
        if not asset:
            return {"status": "not_found", "message": "Asset not found"}

        cooldown = self._check_cooldown(asset.last_valuation_at, COOLDOWN_METALS)
        if cooldown:
            return {
                "status": "cooldown",
                "message": f"Wait {cooldown}s",
                "remaining": cooldown,
            }

        spot_price = await metal_price_service.get_spot_price(asset.metal_type.value)
        if not spot_price:
            return {"status": "failed", "message": "Could not fetch spot price"}

        previous_value = asset.market_value
        new_value = spot_price * asset.weight_oz
        if new_value == previous_value:
            asset.last_valuation_at = datetime.now(timezone.utc)
            await self.session.commit()
            return {
                "status": "unchanged",
                "new_value": new_value,
                "previous_value": previous_value,
            }

        asset.market_value = new_value
        asset.last_valuation_at = datetime.now(timezone.utc)

        # Record historical valuation
        await self._record_valuation(
            user_id=asset.user_id,
            asset_id=asset.id,
            asset_type=AssetType.precious_metal,
            value=new_value,
            source=f"Spot Price ({asset.metal_type.value})",
        )

        await self.session.commit()
        return {
            "status": "updated",
            "new_value": new_value,
            "previous_value": previous_value,
        }

    # --- Summary ---

    async def get_physical_assets_summary(
        self, user_id: uuid.UUID
    ) -> PhysicalAssetsSummary:
        (
            re_assets,
            v_assets,
            c_assets,
            m_assets,
            a_assets,
        ) = await asyncio.gather(
            self.get_real_estate_assets(user_id),
            self.get_vehicle_assets(user_id),
            self.get_collectible_assets(user_id),
            self.get_precious_metal_assets(user_id),
            self.get_alternative_assets(user_id),
        )

        total_value = (
            sum((a.market_value for a in re_assets), Decimal(0))
            + sum((a.market_value for a in v_assets), Decimal(0))
            + sum((a.market_value for a in c_assets), Decimal(0))
            + sum((a.market_value for a in m_assets), Decimal(0))
            + sum((a.market_value for a in a_assets), Decimal(0))
        )

        return PhysicalAssetsSummary(
            real_estate=re_assets,
            vehicles=v_assets,
            collectibles=c_assets,
            precious_metals=m_assets,
            alternative_assets=a_assets,
            total_value=total_value,
        )
