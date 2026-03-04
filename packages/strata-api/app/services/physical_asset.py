import uuid
import logging
from decimal import Decimal
from datetime import datetime, timezone
from typing import List, Optional

from sqlalchemy import select, update, delete
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.physical_asset import (
    RealEstateAsset, 
    VehicleAsset, 
    CollectibleAsset,
    PreciousMetalAsset,
    ValuationType
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
    PhysicalAssetsSummary
)
from app.services.providers.metal_price import metal_price_service
from app.services.providers.zillow import zillow_service
from app.services.providers.vehicle_valuation import vehicle_valuation_service

logger = logging.getLogger(__name__)

class PhysicalAssetService:
    def __init__(self, session: AsyncSession):
        self.session = session

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
        await self.session.commit()
        await self.session.refresh(asset)
        
        # Trigger initial auto-valuation if requested
        if asset.valuation_type == ValuationType.auto:
            await self.refresh_real_estate_valuation(asset.id)
            
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
        await self.session.commit()
        await self.session.refresh(asset)
        
        # Trigger initial auto-valuation if requested
        if asset.valuation_type == ValuationType.auto:
            await self.refresh_vehicle_valuation(asset.id)
            
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
        await self.session.commit()
        await self.session.refresh(asset)
        
        if asset.valuation_type == ValuationType.auto:
            await self.refresh_collectible_valuation(asset.id)
            
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
        await self.session.commit()
        await self.session.refresh(asset)
        
        # Metals are almost always auto-valued
        if asset.valuation_type == ValuationType.auto:
            await self.refresh_metal_valuation(asset.id)
            
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

    # --- Valuation Logic (Stubs) ---

    async def refresh_real_estate_valuation(self, asset_id: uuid.UUID) -> bool:
        """Fetch current property value from Zillow/Redfin APIs."""
        asset_result = await self.session.execute(
            select(RealEstateAsset).where(RealEstateAsset.id == asset_id)
        )
        asset = asset_result.scalar_one_or_none()
        if not asset:
            return False

        # Try ZPID first
        new_value = None
        if asset.zillow_zpid:
            new_value = await zillow_service.get_zestimate(asset.zillow_zpid)
        
        # If no ZPID or it failed, we could try address search here
        
        if new_value:
            asset.market_value = new_value
            asset.last_valuation_at = datetime.now(timezone.utc)
            await self.session.commit()
            return True
            
        return False

    async def refresh_vehicle_valuation(self, asset_id: uuid.UUID) -> bool:
        """Fetch current vehicle value from Marketcheck APIs."""
        asset_result = await self.session.execute(
            select(VehicleAsset).where(VehicleAsset.id == asset_id)
        )
        asset = asset_result.scalar_one_or_none()
        if not asset:
            return False

        new_value = await vehicle_valuation_service.get_market_value(
            make=asset.make,
            model=asset.model,
            year=asset.year,
            mileage=asset.mileage
        )
        
        if new_value:
            asset.market_value = new_value
            asset.last_valuation_at = datetime.now(timezone.utc)
            await self.session.commit()
            return True
            
        return False

    async def refresh_collectible_valuation(self, asset_id: uuid.UUID) -> bool:
        """Fetch current value for collectibles (Chrono24, CardLadder, etc)."""
        # TODO: Implement 3rd party collectible APIs
        logger.info(f"Refreshing collectible valuation for asset {asset_id}")
        return True

    async def refresh_metal_valuation(self, asset_id: uuid.UUID) -> bool:
        """Fetch current spot price for precious metals."""
        asset_result = await self.session.execute(
            select(PreciousMetalAsset).where(PreciousMetalAsset.id == asset_id)
        )
        asset = asset_result.scalar_one_or_none()
        if not asset:
            return False

        spot_price = await metal_price_service.get_spot_price(asset.metal_type.value)
        if spot_price:
            asset.market_value = spot_price * asset.weight_oz
            asset.last_valuation_at = datetime.now(timezone.utc)
            await self.session.commit()
            return True
            
        return False

    # --- Summary ---

    async def get_physical_assets_summary(self, user_id: uuid.UUID) -> PhysicalAssetsSummary:
        re_assets = await self.get_real_estate_assets(user_id)
        v_assets = await self.get_vehicle_assets(user_id)
        c_assets = await self.get_collectible_assets(user_id)
        m_assets = await self.get_precious_metal_assets(user_id)

        total_value = sum((a.market_value for a in re_assets), Decimal(0)) + \
                      sum((a.market_value for a in v_assets), Decimal(0)) + \
                      sum((a.market_value for a in c_assets), Decimal(0)) + \
                      sum((a.market_value for a in m_assets), Decimal(0))

        return PhysicalAssetsSummary(
            real_estate=re_assets,
            vehicles=v_assets,
            collectibles=c_assets,
            precious_metals=m_assets,
            total_value=total_value
        )

