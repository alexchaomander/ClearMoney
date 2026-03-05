import uuid
from typing import List

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.api import deps
from app.models.user import User
from app.schemas.physical_asset import (
    RealEstateAsset,
    RealEstateAssetCreate,
    RealEstateAssetUpdate,
    VehicleAsset,
    VehicleAssetCreate,
    VehicleAssetUpdate,
    CollectibleAsset,
    CollectibleAssetCreate,
    CollectibleAssetUpdate,
    PreciousMetalAsset,
    PreciousMetalAssetCreate,
    PreciousMetalAssetUpdate,
    AlternativeAsset,
    AlternativeAssetCreate,
    AlternativeAssetUpdate,
    AssetValuation,
    AssetType,
    PhysicalAssetsSummary,
    ValuationRefreshResponse,
    PropertySearchRequest,
    PropertySearchResult,
    VehicleSearchRequest,
    VehicleSearchResult,
)
from app.services.physical_asset import PhysicalAssetService

router = APIRouter()


@router.get("/summary", response_model=PhysicalAssetsSummary)
async def get_physical_assets_summary(
    db: AsyncSession = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user),
):
    """Get a summary of all physical assets for the current user."""
    service = PhysicalAssetService(db)
    return await service.get_physical_assets_summary(current_user.id)


@router.post("/search-properties", response_model=List[PropertySearchResult])
async def search_properties(
    request: PropertySearchRequest,
    db: AsyncSession = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user),
):
    """Search for properties by address."""
    service = PhysicalAssetService(db)
    return await service.search_properties(request.address, user_id=current_user.id)


@router.post("/search-vehicles", response_model=List[VehicleSearchResult])
async def search_vehicles(
    request: VehicleSearchRequest,
    db: AsyncSession = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user),
):
    """Search for vehicles by VIN or specs."""
    service = PhysicalAssetService(db)
    return await service.search_vehicles(
        vin=request.vin,
        make=request.make,
        model=request.model,
        year=request.year
    )


# --- Real Estate ---

@router.get("/real-estate", response_model=List[RealEstateAsset])
async def get_real_estate_assets(
    db: AsyncSession = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user),
):
    service = PhysicalAssetService(db)
    return await service.get_real_estate_assets(current_user.id)


@router.post("/real-estate", response_model=RealEstateAsset)
async def create_real_estate_asset(
    asset_in: RealEstateAssetCreate,
    db: AsyncSession = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user),
):
    service = PhysicalAssetService(db)
    return await service.create_real_estate_asset(current_user.id, asset_in)


@router.patch("/real-estate/{asset_id}", response_model=RealEstateAsset)
async def update_real_estate_asset(
    asset_id: uuid.UUID,
    asset_in: RealEstateAssetUpdate,
    db: AsyncSession = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user),
):
    service = PhysicalAssetService(db)
    asset = await service.update_real_estate_asset(asset_id, current_user.id, asset_in)
    if not asset:
        raise HTTPException(status_code=404, detail="Real estate asset not found")
    return asset


@router.delete("/real-estate/{asset_id}")
async def delete_real_estate_asset(
    asset_id: uuid.UUID,
    db: AsyncSession = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user),
):
    service = PhysicalAssetService(db)
    success = await service.delete_real_estate_asset(asset_id, current_user.id)
    if not success:
        raise HTTPException(status_code=404, detail="Real estate asset not found")
    return {"status": "success"}


@router.post("/real-estate/{asset_id}/refresh", response_model=ValuationRefreshResponse)
async def refresh_real_estate_valuation(
    asset_id: uuid.UUID,
    db: AsyncSession = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user),
):
    service = PhysicalAssetService(db)
    result = await service.refresh_real_estate_valuation(asset_id, current_user.id)
    if result["status"] == "not_found":
        raise HTTPException(status_code=404, detail=result.get("message", "Real estate asset not found"))
    if result["status"] == "cooldown":
        raise HTTPException(status_code=429, detail=result.get("message", "Too many refresh requests"))
    return result


# --- Vehicles ---

@router.get("/vehicles", response_model=List[VehicleAsset])
async def get_vehicle_assets(
    db: AsyncSession = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user),
):
    service = PhysicalAssetService(db)
    return await service.get_vehicle_assets(current_user.id)


@router.post("/vehicles", response_model=VehicleAsset)
async def create_vehicle_asset(
    asset_in: VehicleAssetCreate,
    db: AsyncSession = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user),
):
    service = PhysicalAssetService(db)
    return await service.create_vehicle_asset(current_user.id, asset_in)


@router.patch("/vehicles/{asset_id}", response_model=VehicleAsset)
async def update_vehicle_asset(
    asset_id: uuid.UUID,
    asset_in: VehicleAssetUpdate,
    db: AsyncSession = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user),
):
    service = PhysicalAssetService(db)
    asset = await service.update_vehicle_asset(asset_id, current_user.id, asset_in)
    if not asset:
        raise HTTPException(status_code=404, detail="Vehicle asset not found")
    return asset


@router.delete("/vehicles/{asset_id}")
async def delete_vehicle_asset(
    asset_id: uuid.UUID,
    db: AsyncSession = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user),
):
    service = PhysicalAssetService(db)
    success = await service.delete_vehicle_asset(asset_id, current_user.id)
    if not success:
        raise HTTPException(status_code=404, detail="Vehicle asset not found")
    return {"status": "success"}


@router.post("/vehicles/{asset_id}/refresh", response_model=ValuationRefreshResponse)
async def refresh_vehicle_valuation(
    asset_id: uuid.UUID,
    db: AsyncSession = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user),
):
    service = PhysicalAssetService(db)
    result = await service.refresh_vehicle_valuation(asset_id, current_user.id)
    if result["status"] == "not_found":
        raise HTTPException(status_code=404, detail=result.get("message", "Vehicle asset not found"))
    if result["status"] == "cooldown":
        raise HTTPException(status_code=429, detail=result.get("message", "Too many refresh requests"))
    return result


# --- Collectibles ---

@router.get("/collectibles", response_model=List[CollectibleAsset])
async def get_collectible_assets(
    db: AsyncSession = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user),
):
    service = PhysicalAssetService(db)
    return await service.get_collectible_assets(current_user.id)


@router.post("/collectibles", response_model=CollectibleAsset)
async def create_collectible_asset(
    asset_in: CollectibleAssetCreate,
    db: AsyncSession = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user),
):
    service = PhysicalAssetService(db)
    return await service.create_collectible_asset(current_user.id, asset_in)


@router.patch("/collectibles/{asset_id}", response_model=CollectibleAsset)
async def update_collectible_asset(
    asset_id: uuid.UUID,
    asset_in: CollectibleAssetUpdate,
    db: AsyncSession = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user),
):
    service = PhysicalAssetService(db)
    asset = await service.update_collectible_asset(asset_id, current_user.id, asset_in)
    if not asset:
        raise HTTPException(status_code=404, detail="Collectible asset not found")
    return asset


@router.delete("/collectibles/{asset_id}")
async def delete_collectible_asset(
    asset_id: uuid.UUID,
    db: AsyncSession = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user),
):
    service = PhysicalAssetService(db)
    success = await service.delete_collectible_asset(asset_id, current_user.id)
    if not success:
        raise HTTPException(status_code=404, detail="Collectible asset not found")
    return {"status": "success"}


@router.post("/collectibles/{asset_id}/refresh", response_model=ValuationRefreshResponse)
async def refresh_collectible_valuation(
    asset_id: uuid.UUID,
    db: AsyncSession = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user),
):
    service = PhysicalAssetService(db)
    result = await service.refresh_collectible_valuation(asset_id, current_user.id)
    if result["status"] == "not_found":
        raise HTTPException(status_code=404, detail=result.get("message", "Collectible asset not found"))
    if result["status"] == "cooldown":
        raise HTTPException(status_code=429, detail=result.get("message", "Too many refresh requests"))
    return result


# --- Precious Metals ---

@router.get("/precious-metals", response_model=List[PreciousMetalAsset])
async def get_precious_metal_assets(
    db: AsyncSession = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user),
):
    service = PhysicalAssetService(db)
    return await service.get_precious_metal_assets(current_user.id)


@router.post("/precious-metals", response_model=PreciousMetalAsset)
async def create_precious_metal_asset(
    asset_in: PreciousMetalAssetCreate,
    db: AsyncSession = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user),
):
    service = PhysicalAssetService(db)
    return await service.create_precious_metal_asset(current_user.id, asset_in)


@router.patch("/precious-metals/{asset_id}", response_model=PreciousMetalAsset)
async def update_precious_metal_asset(
    asset_id: uuid.UUID,
    asset_in: PreciousMetalAssetUpdate,
    db: AsyncSession = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user),
):
    service = PhysicalAssetService(db)
    asset = await service.update_precious_metal_asset(asset_id, current_user.id, asset_in)
    if not asset:
        raise HTTPException(status_code=404, detail="Precious metal asset not found")
    return asset


@router.delete("/precious-metals/{asset_id}")
async def delete_precious_metal_asset(
    asset_id: uuid.UUID,
    db: AsyncSession = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user),
):
    service = PhysicalAssetService(db)
    success = await service.delete_precious_metal_asset(asset_id, current_user.id)
    if not success:
        raise HTTPException(status_code=404, detail="Precious metal asset not found")
    return {"status": "success"}


@router.post("/precious-metals/{asset_id}/refresh", response_model=ValuationRefreshResponse)
async def refresh_precious_metal_valuation(
    asset_id: uuid.UUID,
    db: AsyncSession = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user),
):
    service = PhysicalAssetService(db)
    result = await service.refresh_metal_valuation(asset_id, current_user.id)
    if result["status"] == "not_found":
        raise HTTPException(status_code=404, detail=result.get("message", "Precious metal asset not found"))
    if result["status"] == "cooldown":
        raise HTTPException(status_code=429, detail=result.get("message", "Too many refresh requests"))
    return result


# --- Alternative Assets ---

@router.get("/alternative", response_model=List[AlternativeAsset])
async def get_alternative_assets(
    db: AsyncSession = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user),
):
    service = PhysicalAssetService(db)
    return await service.get_alternative_assets(current_user.id)


@router.post("/alternative", response_model=AlternativeAsset)
async def create_alternative_asset(
    asset_in: AlternativeAssetCreate,
    db: AsyncSession = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user),
):
    service = PhysicalAssetService(db)
    return await service.create_alternative_asset(current_user.id, asset_in)


@router.patch("/alternative/{asset_id}", response_model=AlternativeAsset)
async def update_alternative_asset(
    asset_id: uuid.UUID,
    asset_in: AlternativeAssetUpdate,
    db: AsyncSession = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user),
):
    service = PhysicalAssetService(db)
    asset = await service.update_alternative_asset(asset_id, current_user.id, asset_in)
    if not asset:
        raise HTTPException(status_code=404, detail="Alternative asset not found")
    return asset


@router.delete("/alternative/{asset_id}")
async def delete_alternative_asset(
    asset_id: uuid.UUID,
    db: AsyncSession = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user),
):
    service = PhysicalAssetService(db)
    success = await service.delete_alternative_asset(asset_id, current_user.id)
    if not success:
        raise HTTPException(status_code=404, detail="Alternative asset not found")
    return {"status": "success"}


# --- History ---

@router.get("/{asset_type}/{asset_id}/history", response_model=List[AssetValuation])
async def get_asset_valuation_history(
    asset_type: AssetType,
    asset_id: uuid.UUID,
    db: AsyncSession = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user),
):
    """Get historical valuation data for any asset."""
    service = PhysicalAssetService(db)
    return await service.get_valuation_history(
        user_id=current_user.id,
        asset_id=asset_id,
        asset_type=asset_type
    )
