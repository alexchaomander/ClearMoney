import uuid
from decimal import Decimal
from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field


class RealEstateAssetBase(BaseModel):
    name: str
    address: str
    city: Optional[str] = None
    state: Optional[str] = None
    zip_code: Optional[str] = None
    property_type: str = "primary_residence"
    valuation_type: str = "manual"
    market_value: Decimal = Field(default=Decimal(0))
    purchase_price: Optional[Decimal] = None
    purchase_date: Optional[datetime] = None
    zillow_zpid: Optional[str] = None


class RealEstateAssetCreate(RealEstateAssetBase):
    pass


class RealEstateAssetUpdate(BaseModel):
    name: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    zip_code: Optional[str] = None
    property_type: Optional[str] = None
    valuation_type: Optional[str] = None
    market_value: Optional[Decimal] = None
    purchase_price: Optional[Decimal] = None
    purchase_date: Optional[datetime] = None
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
    vehicle_type: str = "car"
    valuation_type: str = "manual"
    market_value: Decimal = Field(default=Decimal(0))
    purchase_price: Optional[Decimal] = None
    purchase_date: Optional[datetime] = None


class VehicleAssetCreate(VehicleAssetBase):
    pass


class VehicleAssetUpdate(BaseModel):
    name: Optional[str] = None
    make: Optional[str] = None
    model: Optional[str] = None
    year: Optional[int] = None
    vin: Optional[str] = None
    mileage: Optional[int] = None
    vehicle_type: Optional[str] = None
    valuation_type: Optional[str] = None
    market_value: Optional[Decimal] = None
    purchase_price: Optional[Decimal] = None
    purchase_date: Optional[datetime] = None


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
    item_type: str = "other"
    valuation_type: str = "manual"
    market_value: Decimal = Field(default=Decimal(0))
    purchase_price: Optional[Decimal] = None
    purchase_date: Optional[datetime] = None
    metadata_json: Optional[dict] = None


class CollectibleAssetCreate(CollectibleAssetBase):
    pass


class CollectibleAssetUpdate(BaseModel):
    name: Optional[str] = None
    item_type: Optional[str] = None
    valuation_type: Optional[str] = None
    market_value: Optional[Decimal] = None
    purchase_price: Optional[Decimal] = None
    purchase_date: Optional[datetime] = None
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
    metal_type: str
    weight_oz: Decimal
    valuation_type: str = "auto"
    market_value: Decimal = Field(default=Decimal(0))


class PreciousMetalAssetCreate(PreciousMetalAssetBase):
    pass


class PreciousMetalAssetUpdate(BaseModel):
    name: Optional[str] = None
    metal_type: Optional[str] = None
    weight_oz: Optional[Decimal] = None
    valuation_type: Optional[str] = None
    market_value: Optional[Decimal] = None


class PreciousMetalAsset(PreciousMetalAssetBase):
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
    total_value: Decimal
