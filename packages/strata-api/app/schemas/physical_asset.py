import uuid
from decimal import Decimal
from datetime import datetime
from typing import Optional

import re

from pydantic import BaseModel, Field, model_validator, field_validator

from app.models.physical_asset import (
    CollectibleType,
    MetalType,
    RealEstateType,
    ValuationType,
    VehicleType,
    AlternativeAssetType,
    AssetType,
)


class AssetValuationBase(BaseModel):
    asset_id: uuid.UUID
    asset_type: AssetType
    value: Decimal
    valuation_date: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    source: Optional[str] = None
    notes: Optional[str] = None


class AssetValuation(AssetValuationBase):
    id: uuid.UUID
    user_id: uuid.UUID
    created_at: datetime

    class Config:
        from_attributes = True


class RealEstateAssetBase(BaseModel):
    name: str
    address: str
    city: Optional[str] = None
    state: Optional[str] = None
    zip_code: Optional[str] = None
    property_type: RealEstateType = RealEstateType.primary_residence
    valuation_type: ValuationType = ValuationType.manual
    market_value: Decimal = Field(default=Decimal(0))
    purchase_price: Optional[Decimal] = None
    purchase_date: Optional[datetime] = None
    estimated_annual_growth_rate: Optional[Decimal] = None
    zillow_zpid: Optional[str] = None


class RealEstateAssetCreate(RealEstateAssetBase):
    pass


class RealEstateAssetUpdate(BaseModel):
    name: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    zip_code: Optional[str] = None
    property_type: Optional[RealEstateType] = None
    valuation_type: Optional[ValuationType] = None
    market_value: Optional[Decimal] = None
    purchase_price: Optional[Decimal] = None
    purchase_date: Optional[datetime] = None
    estimated_annual_growth_rate: Optional[Decimal] = None
    zillow_zpid: Optional[str] = None


class RealEstateAsset(RealEstateAssetBase):
    id: uuid.UUID
    user_id: uuid.UUID
    last_valuation_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class VehicleAssetBase(BaseModel):
    name: str
    make: str
    model: str
    year: int
    vin: Optional[str] = None
    mileage: Optional[int] = None
    vehicle_type: VehicleType = VehicleType.car
    valuation_type: ValuationType = ValuationType.manual
    market_value: Decimal = Field(default=Decimal(0))
    purchase_price: Optional[Decimal] = None
    purchase_date: Optional[datetime] = None
    estimated_annual_growth_rate: Optional[Decimal] = None


class VehicleAssetCreate(VehicleAssetBase):
    pass


class VehicleAssetUpdate(BaseModel):
    name: Optional[str] = None
    make: Optional[str] = None
    model: Optional[str] = None
    year: Optional[int] = None
    vin: Optional[str] = None
    mileage: Optional[int] = None
    vehicle_type: Optional[VehicleType] = None
    valuation_type: Optional[ValuationType] = None
    market_value: Optional[Decimal] = None
    purchase_price: Optional[Decimal] = None
    purchase_date: Optional[datetime] = None
    estimated_annual_growth_rate: Optional[Decimal] = None


class VehicleAsset(VehicleAssetBase):
    id: uuid.UUID
    user_id: uuid.UUID
    last_valuation_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# Collectibles

class CollectibleAssetBase(BaseModel):
    name: str
    item_type: CollectibleType = CollectibleType.other
    valuation_type: ValuationType = ValuationType.manual
    market_value: Decimal = Field(default=Decimal(0))
    purchase_price: Optional[Decimal] = None
    purchase_date: Optional[datetime] = None
    estimated_annual_growth_rate: Optional[Decimal] = None
    metadata_json: Optional[dict] = None


class CollectibleAssetCreate(CollectibleAssetBase):
    pass


class CollectibleAssetUpdate(BaseModel):
    name: Optional[str] = None
    item_type: Optional[CollectibleType] = None
    valuation_type: Optional[ValuationType] = None
    market_value: Optional[Decimal] = None
    purchase_price: Optional[Decimal] = None
    purchase_date: Optional[datetime] = None
    estimated_annual_growth_rate: Optional[Decimal] = None
    metadata_json: Optional[dict] = None


class CollectibleAsset(CollectibleAssetBase):
    id: uuid.UUID
    user_id: uuid.UUID
    last_valuation_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# Precious Metals

class PreciousMetalAssetBase(BaseModel):
    name: str
    metal_type: MetalType
    weight_oz: Decimal
    valuation_type: ValuationType = ValuationType.auto
    market_value: Decimal = Field(default=Decimal(0))


class PreciousMetalAssetCreate(PreciousMetalAssetBase):
    pass


class PreciousMetalAssetUpdate(BaseModel):
    name: Optional[str] = None
    metal_type: Optional[MetalType] = None
    weight_oz: Optional[Decimal] = None
    valuation_type: Optional[ValuationType] = None
    market_value: Optional[Decimal] = None


class PreciousMetalAsset(PreciousMetalAssetBase):
    id: uuid.UUID
    user_id: uuid.UUID
    last_valuation_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# Alternative Assets

class AlternativeAssetBase(BaseModel):
    name: str
    asset_type: AlternativeAssetType = AlternativeAssetType.other
    description: Optional[str] = None
    market_value: Decimal = Field(default=Decimal(0))
    cost_basis: Optional[Decimal] = None
    purchase_date: Optional[datetime] = None
    estimated_annual_growth_rate: Optional[Decimal] = None
    metadata_json: Optional[dict] = None


class AlternativeAssetCreate(AlternativeAssetBase):
    pass


class AlternativeAssetUpdate(BaseModel):
    name: Optional[str] = None
    asset_type: Optional[AlternativeAssetType] = None
    description: Optional[str] = None
    market_value: Optional[Decimal] = None
    cost_basis: Optional[Decimal] = None
    purchase_date: Optional[datetime] = None
    estimated_annual_growth_rate: Optional[Decimal] = None
    metadata_json: Optional[dict] = None


class AlternativeAsset(AlternativeAssetBase):
    id: uuid.UUID
    user_id: uuid.UUID
    last_valuation_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class PhysicalAssetsSummary(BaseModel):
    real_estate: list[RealEstateAsset]
    vehicles: list[VehicleAsset]
    collectibles: list[CollectibleAsset]
    precious_metals: list[PreciousMetalAsset]
    alternative_assets: list[AlternativeAsset]
    total_value: Decimal



class ValuationRefreshResponse(BaseModel):
    status: str  # updated | unchanged | failed | cooldown | not_found
    new_value: Optional[Decimal] = None
    previous_value: Optional[Decimal] = None
    message: Optional[str] = None


class PropertySearchResult(BaseModel):
    zillow_zpid: str
    address: str
    city: str
    state: str
    zip_code: str
    market_value: Optional[Decimal] = None
    last_valuation_at: Optional[datetime] = None


class PropertySearchRequest(BaseModel):
    address: str


class VehicleSearchResult(BaseModel):
    vin: Optional[str] = None
    make: str
    model: str
    year: int
    market_value: Optional[Decimal] = None
    last_valuation_at: Optional[datetime] = None


class VehicleSearchRequest(BaseModel):
    vin: Optional[str] = None
    make: Optional[str] = None
    model: Optional[str] = None
    year: Optional[int] = None

    @field_validator("vin")
    @classmethod
    def validate_vin(cls, v: Optional[str]) -> Optional[str]:
        if v is not None and not re.match(r'^[A-HJ-NPR-Z0-9]{17}$', v, re.IGNORECASE):
            raise ValueError("Invalid VIN format: must be 17 alphanumeric characters (excluding I, O, Q)")
        return v

    @model_validator(mode="after")
    def require_vin_or_specs(self) -> "VehicleSearchRequest":
        if not self.vin and not (self.make and self.model and self.year):
            raise ValueError("Either 'vin' or all of 'make', 'model', and 'year' must be provided")
        return self
