import asyncio
import uuid
import logging
from decimal import Decimal
from datetime import datetime, timezone
from typing import Dict, List, Optional

from sqlalchemy import select, update, delete
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.physical_asset import (
    RealEstateAsset,
    VehicleAsset,
    CollectibleAsset,
    PreciousMetalAsset,
    AlternativeAsset,
    AssetValuation,
    ValuationType,
    AssetType
)
from app.schemas.physical_asset import (
    RealEstateAssetCreate,
    RealEstateAssetUpdate,
    VehicleAssetCreate,
    VehicleAssetUpdate,
    CollectibleAssetCreate,
    CollectibleAssetUpdate,
    PreciousMetalAssetCreate,
    PreciousMetalAssetUpdate,
    AlternativeAssetCreate,
    AlternativeAssetUpdate,
    PhysicalAssetsSummary,
    PropertySearchResult,
    VehicleSearchResult,
)
from app.services.providers.metal_price import metal_price_service
from app.services.providers.zillow import zillow_service
from app.services.providers.vehicle_valuation import vehicle_valuation_service

logger = logging.getLogger(__name__)

# Cooldown windows in seconds
COOLDOWN_STANDARD = 300   # 5 minutes for real estate, vehicles, collectibles
COOLDOWN_METALS = 900     # 15 minutes for precious metals

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
        notes: Optional[str] = None
    ):
        """Record a historical valuation entry."""
        valuation = AssetValuation(
            user_id=user_id,
            asset_id=asset_id,
            asset_type=asset_type,
            value=value,
            source=source,
            notes=notes,
            valuation_date=datetime.now(timezone.utc)
        )
        self.session.add(valuation)
        # We don't commit here, assuming the caller will commit

    async def get_valuation_history(
        self,
        user_id: uuid.UUID,
        asset_id: uuid.UUID,
        asset_type: AssetType
    ) -> List[AssetValuation]:
        """Get the valuation history for a specific asset."""
        result = await self.session.execute(
            select(AssetValuation).where(
                AssetValuation.user_id == user_id,
                AssetValuation.asset_id == asset_id,
                AssetValuation.asset_type == asset_type
            ).order_by(AssetValuation.valuation_date.desc())
        )
        return list(result.scalars().all())

    # --- Real Estate ---

    async def get_real_estate_assets(self, user_id: uuid.UUID) -> List[RealEstateAsset]:
        result = await self.session.execute(
            select(RealEstateAsset).where(RealEstateAsset.user_id == user_id)
        )
        return list(result.scalars().all())

    async def create_real_estate_asset(
        self, user_id: uuid.UUID, data: RealEstateAssetCreate
    ) -> RealEstateAsset:
        asset = RealEstateAsset(
            user_id=user_id,
            **data.model_dump()
        )
        self.session.add(asset)
        await self.session.flush()

        # Record initial valuation if provided
        if asset.market_value > 0:
            await self._record_valuation(
                user_id=user_id,
                asset_id=asset.id,
                asset_type=AssetType.real_estate,
                value=asset.market_value,
                source="Manual (Initial)" if asset.valuation_type == ValuationType.manual else "Auto (Initial)"
            )

        await self.session.commit()
        await self.session.refresh(asset)

        if asset.valuation_type == ValuationType.auto:
            result = await self.refresh_real_estate_valuation(asset.id)
            if result["status"] == "failed":
                logger.warning("Initial auto-valuation failed for real estate asset %s: %s", asset.id, result.get("message"))
            await self.session.refresh(asset)

        return asset

    async def update_real_estate_asset(
        self, asset_id: uuid.UUID, user_id: uuid.UUID, data: RealEstateAssetUpdate
    ) -> Optional[RealEstateAsset]:
        asset_result = await self.session.execute(
            select(RealEstateAsset).where(
                RealEstateAsset.id == asset_id, 
                RealEstateAsset.user_id == user_id
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

    async def delete_real_estate_asset(self, asset_id: uuid.UUID, user_id: uuid.UUID) -> bool:
        result = await self.session.execute(
            delete(RealEstateAsset).where(
                RealEstateAsset.id == asset_id, 
                RealEstateAsset.user_id == user_id
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
        asset = VehicleAsset(
            user_id=user_id,
            **data.model_dump()
        )
        self.session.add(asset)
        await self.session.flush()

        # Record initial valuation if provided
        if asset.market_value > 0:
            await self._record_valuation(
                user_id=user_id,
                asset_id=asset.id,
                asset_type=AssetType.vehicle,
                value=asset.market_value,
                source="Manual (Initial)" if asset.valuation_type == ValuationType.manual else "Auto (Initial)"
            )

        await self.session.commit()
        await self.session.refresh(asset)

        if asset.valuation_type == ValuationType.auto:
            result = await self.refresh_vehicle_valuation(asset.id)
            if result["status"] == "failed":
                logger.warning("Initial auto-valuation failed for vehicle asset %s: %s", asset.id, result.get("message"))
            await self.session.refresh(asset)

        return asset

    async def update_vehicle_asset(
        self, asset_id: uuid.UUID, user_id: uuid.UUID, data: VehicleAssetUpdate
    ) -> Optional[VehicleAsset]:
        asset_result = await self.session.execute(
            select(VehicleAsset).where(
                VehicleAsset.id == asset_id, 
                VehicleAsset.user_id == user_id
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

    async def delete_vehicle_asset(self, asset_id: uuid.UUID, user_id: uuid.UUID) -> bool:
        result = await self.session.execute(
            delete(VehicleAsset).where(
                VehicleAsset.id == asset_id, 
                VehicleAsset.user_id == user_id
            )
        )
        await self.session.commit()
        return result.rowcount > 0

    # --- Search Services ---

    async def search_properties(self, address: str, user_id: Optional[uuid.UUID] = None) -> List[PropertySearchResult]:
        """Search for candidate properties by address."""
        return await zillow_service.search_by_address(address)

    async def search_vehicles(self, vin: Optional[str] = None, make: Optional[str] = None, model: Optional[str] = None, year: Optional[int] = None) -> List[VehicleSearchResult]:
        """Search for a vehicle by VIN or Specs."""
        if vin:
            result = await vehicle_valuation_service.search_by_vin(vin)
            return [result] if result else []

        if make and model and year:
            val = await vehicle_valuation_service.get_market_value(make, model, year)
            if val is not None:
                return [VehicleSearchResult(
                    make=make,
                    model=model,
                    year=year,
                    market_value=val
                )]

        return []

    # --- Collectibles ---

    async def get_collectible_assets(self, user_id: uuid.UUID) -> List[CollectibleAsset]:
        result = await self.session.execute(
            select(CollectibleAsset).where(CollectibleAsset.user_id == user_id)
        )
        return list(result.scalars().all())

    async def create_collectible_asset(
        self, user_id: uuid.UUID, data: CollectibleAssetCreate
    ) -> CollectibleAsset:
        asset = CollectibleAsset(
            user_id=user_id,
            **data.model_dump()
        )
        self.session.add(asset)
        await self.session.flush()

        # Record initial valuation if provided
        if asset.market_value > 0:
            await self._record_valuation(
                user_id=user_id,
                asset_id=asset.id,
                asset_type=AssetType.collectible,
                value=asset.market_value,
                source="Manual (Initial)" if asset.valuation_type == ValuationType.manual else "Auto (Initial)"
            )

        await self.session.commit()
        await self.session.refresh(asset)

        if asset.valuation_type == ValuationType.auto:
            result = await self.refresh_collectible_valuation(asset.id)
            if result["status"] == "failed":
                logger.warning("Initial auto-valuation failed for collectible asset %s: %s", asset.id, result.get("message"))
            await self.session.refresh(asset)

        return asset

    async def update_collectible_asset(
        self, asset_id: uuid.UUID, user_id: uuid.UUID, data: CollectibleAssetUpdate
    ) -> Optional[CollectibleAsset]:
        asset_result = await self.session.execute(
            select(CollectibleAsset).where(
                CollectibleAsset.id == asset_id, 
                CollectibleAsset.user_id == user_id
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

    async def delete_collectible_asset(self, asset_id: uuid.UUID, user_id: uuid.UUID) -> bool:
        result = await self.session.execute(
            delete(CollectibleAsset).where(
                CollectibleAsset.id == asset_id, 
                CollectibleAsset.user_id == user_id
            )
        )
        await self.session.commit()
        return result.rowcount > 0

    # --- Precious Metals ---

    async def get_precious_metal_assets(self, user_id: uuid.UUID) -> List[PreciousMetalAsset]:
        result = await self.session.execute(
            select(PreciousMetalAsset).where(PreciousMetalAsset.user_id == user_id)
        )
        return list(result.scalars().all())

    async def create_precious_metal_asset(
        self, user_id: uuid.UUID, data: PreciousMetalAssetCreate
    ) -> PreciousMetalAsset:
        asset = PreciousMetalAsset(
            user_id=user_id,
            **data.model_dump()
        )
        self.session.add(asset)
        await self.session.flush()

        # Record initial valuation if provided
        if asset.market_value > 0:
            await self._record_valuation(
                user_id=user_id,
                asset_id=asset.id,
                asset_type=AssetType.precious_metal,
                value=asset.market_value,
                source="Manual (Initial)" if asset.valuation_type == ValuationType.manual else "Auto (Initial)"
            )

        await self.session.commit()
        await self.session.refresh(asset)

        if asset.valuation_type == ValuationType.auto:
            result = await self.refresh_metal_valuation(asset.id)
            if result["status"] == "failed":
                logger.warning("Initial auto-valuation failed for metal asset %s: %s", asset.id, result.get("message"))
            await self.session.refresh(asset)

        return asset

    async def update_precious_metal_asset(
        self, asset_id: uuid.UUID, user_id: uuid.UUID, data: PreciousMetalAssetUpdate
    ) -> Optional[PreciousMetalAsset]:
        asset_result = await self.session.execute(
            select(PreciousMetalAsset).where(
                PreciousMetalAsset.id == asset_id, 
                PreciousMetalAsset.user_id == user_id
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

    async def delete_precious_metal_asset(self, asset_id: uuid.UUID, user_id: uuid.UUID) -> bool:
        result = await self.session.execute(
            delete(PreciousMetalAsset).where(
                PreciousMetalAsset.id == asset_id, 
                PreciousMetalAsset.user_id == user_id
            )
        )
        await self.session.commit()
        return result.rowcount > 0

    # --- Alternative Assets ---

    async def get_alternative_assets(self, user_id: uuid.UUID) -> List[AlternativeAsset]:
        result = await self.session.execute(
            select(AlternativeAsset).where(AlternativeAsset.user_id == user_id)
        )
        return list(result.scalars().all())

    async def create_alternative_asset(
        self, user_id: uuid.UUID, data: AlternativeAssetCreate
    ) -> AlternativeAsset:
        asset = AlternativeAsset(
            user_id=user_id,
            **data.model_dump()
        )
        self.session.add(asset)
        await self.session.flush()

        # Record initial valuation if provided
        if asset.market_value > 0:
            await self._record_valuation(
                user_id=user_id,
                asset_id=asset.id,
                asset_type=AssetType.alternative,
                value=asset.market_value,
                source="Manual (Initial)"
            )

        await self.session.commit()
        await self.session.refresh(asset)
        return asset

    async def update_alternative_asset(
        self, asset_id: uuid.UUID, user_id: uuid.UUID, data: AlternativeAssetUpdate
    ) -> Optional[AlternativeAsset]:
        asset_result = await self.session.execute(
            select(AlternativeAsset).where(
                AlternativeAsset.id == asset_id, 
                AlternativeAsset.user_id == user_id
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
                source="Manual Update"
            )
            asset.last_valuation_at = datetime.now(timezone.utc)

        await self.session.commit()
        await self.session.refresh(asset)
        return asset

    async def delete_alternative_asset(self, asset_id: uuid.UUID, user_id: uuid.UUID) -> bool:
        result = await self.session.execute(
            delete(AlternativeAsset).where(
                AlternativeAsset.id == asset_id, 
                AlternativeAsset.user_id == user_id
            )
        )
        await self.session.commit()
        return result.rowcount > 0

    # --- Cooldown ---

    @staticmethod
    def _check_cooldown(last_valuation_at: Optional[datetime], cooldown_seconds: int) -> Optional[int]:
        """Return remaining cooldown seconds, or None if no cooldown applies."""
        if last_valuation_at is None:
            return None
        now = datetime.now(timezone.utc)
        last = last_valuation_at if last_valuation_at.tzinfo else last_valuation_at.replace(tzinfo=timezone.utc)
        elapsed = (now - last).total_seconds()
        if elapsed < cooldown_seconds:
            return int(cooldown_seconds - elapsed)
        return None

    # --- Valuation Logic ---

    async def refresh_real_estate_valuation(self, asset_id: uuid.UUID, user_id: uuid.UUID | None = None) -> Dict:
        """Fetch current property value from Zillow/Redfin APIs."""
        query = select(RealEstateAsset).where(RealEstateAsset.id == asset_id)
        if user_id is not None:
            query = query.where(RealEstateAsset.user_id == user_id)
        asset_result = await self.session.execute(query)
        asset = asset_result.scalar_one_or_none()
        if not asset:
            return {"status": "not_found", "message": "Real estate asset not found"}

        remaining = self._check_cooldown(asset.last_valuation_at, COOLDOWN_STANDARD)
        if remaining is not None:
            return {"status": "cooldown", "message": f"Please wait {remaining}s before refreshing again"}

        previous_value = asset.market_value
        new_value = None
        if asset.zillow_zpid:
            try:
                new_value = await zillow_service.get_zestimate(asset.zillow_zpid)
            except Exception as e:
                return {"status": "failed", "previous_value": previous_value, "message": str(e)}

        if new_value is None:
            return {"status": "failed", "previous_value": previous_value, "message": "Provider returned no value"}

        if new_value == previous_value:
            asset.last_valuation_at = datetime.now(timezone.utc)
            await self.session.commit()
            return {"status": "unchanged", "new_value": new_value, "previous_value": previous_value}

        asset.market_value = new_value
        asset.last_valuation_at = datetime.now(timezone.utc)
        
        # Record historical valuation
        await self._record_valuation(
            user_id=asset.user_id,
            asset_id=asset.id,
            asset_type=AssetType.real_estate,
            value=new_value,
            source="Zillow"
        )
        
        await self.session.commit()
        return {"status": "updated", "new_value": new_value, "previous_value": previous_value}

    async def refresh_vehicle_valuation(self, asset_id: uuid.UUID, user_id: uuid.UUID | None = None) -> Dict:
        """Fetch current vehicle value from Marketcheck APIs."""
        query = select(VehicleAsset).where(VehicleAsset.id == asset_id)
        if user_id is not None:
            query = query.where(VehicleAsset.user_id == user_id)
        asset_result = await self.session.execute(query)
        asset = asset_result.scalar_one_or_none()
        if not asset:
            return {"status": "not_found", "message": "Vehicle asset not found"}

        remaining = self._check_cooldown(asset.last_valuation_at, COOLDOWN_STANDARD)
        if remaining is not None:
            return {"status": "cooldown", "message": f"Please wait {remaining}s before refreshing again"}

        previous_value = asset.market_value
        try:
            new_value = await vehicle_valuation_service.get_market_value(
                make=asset.make,
                model=asset.model,
                year=asset.year,
                mileage=asset.mileage
            )
        except Exception as e:
            return {"status": "failed", "previous_value": previous_value, "message": str(e)}

        if new_value is None:
            return {"status": "failed", "previous_value": previous_value, "message": "Provider returned no value"}

        if new_value == previous_value:
            asset.last_valuation_at = datetime.now(timezone.utc)
            await self.session.commit()
            return {"status": "unchanged", "new_value": new_value, "previous_value": previous_value}

        asset.market_value = new_value
        asset.last_valuation_at = datetime.now(timezone.utc)
        
        # Record historical valuation
        await self._record_valuation(
            user_id=asset.user_id,
            asset_id=asset.id,
            asset_type=AssetType.vehicle,
            value=new_value,
            source="VehicleValuation"
        )
        
        await self.session.commit()
        return {"status": "updated", "new_value": new_value, "previous_value": previous_value}

    async def refresh_collectible_valuation(self, asset_id: uuid.UUID, user_id: uuid.UUID | None = None) -> Dict:
        """Fetch current value for collectibles (Chrono24, CardLadder, etc)."""
        query = select(CollectibleAsset).where(CollectibleAsset.id == asset_id)
        if user_id is not None:
            query = query.where(CollectibleAsset.user_id == user_id)
        asset_result = await self.session.execute(query)
        asset = asset_result.scalar_one_or_none()
        if not asset:
            return {"status": "not_found", "message": "Collectible asset not found"}

        remaining = self._check_cooldown(asset.last_valuation_at, COOLDOWN_STANDARD)
        if remaining is not None:
            return {"status": "cooldown", "message": f"Please wait {remaining}s before refreshing again"}

        # TODO: Implement 3rd party collectible APIs
        return {"status": "unchanged", "new_value": asset.market_value, "previous_value": asset.market_value, "message": "No collectible valuation provider configured yet"}

    async def refresh_metal_valuation(self, asset_id: uuid.UUID, user_id: uuid.UUID | None = None) -> Dict:
        """Fetch current spot price for precious metals."""
        query = select(PreciousMetalAsset).where(PreciousMetalAsset.id == asset_id)
        if user_id is not None:
            query = query.where(PreciousMetalAsset.user_id == user_id)
        asset_result = await self.session.execute(query)
        asset = asset_result.scalar_one_or_none()
        if not asset:
            return {"status": "not_found", "message": "Precious metal asset not found"}

        remaining = self._check_cooldown(asset.last_valuation_at, COOLDOWN_METALS)
        if remaining is not None:
            return {"status": "cooldown", "message": f"Please wait {remaining}s before refreshing again"}

        previous_value = asset.market_value
        try:
            spot_price = await metal_price_service.get_spot_price(asset.metal_type.value)
        except Exception as e:
            return {"status": "failed", "previous_value": previous_value, "message": str(e)}

        new_value = spot_price * asset.weight_oz
        if new_value == previous_value:
            asset.last_valuation_at = datetime.now(timezone.utc)
            await self.session.commit()
            return {"status": "unchanged", "new_value": new_value, "previous_value": previous_value}

        asset.market_value = new_value
        asset.last_valuation_at = datetime.now(timezone.utc)
        
        # Record historical valuation
        await self._record_valuation(
            user_id=asset.user_id,
            asset_id=asset.id,
            asset_type=AssetType.precious_metal,
            value=new_value,
            source=f"Spot Price ({asset.metal_type.value})"
        )
        
        await self.session.commit()
        return {"status": "updated", "new_value": new_value, "previous_value": previous_value}

    # --- Summary ---

    async def get_physical_assets_summary(self, user_id: uuid.UUID) -> PhysicalAssetsSummary:
        re_assets, v_assets, c_assets, m_assets, a_assets = await asyncio.gather(
            self.get_real_estate_assets(user_id),
            self.get_vehicle_assets(user_id),
            self.get_collectible_assets(user_id),
            self.get_precious_metal_assets(user_id),
            self.get_alternative_assets(user_id),
        )

        total_value = sum((a.market_value for a in re_assets), Decimal(0)) + \
                      sum((a.market_value for a in v_assets), Decimal(0)) + \
                      sum((a.market_value for a in c_assets), Decimal(0)) + \
                      sum((a.market_value for a in m_assets), Decimal(0)) + \
                      sum((a.market_value for a in a_assets), Decimal(0))

        return PhysicalAssetsSummary(
            real_estate=re_assets,
            vehicles=v_assets,
            collectibles=c_assets,
            precious_metals=m_assets,
            alternative_assets=a_assets,
            total_value=total_value
        )

