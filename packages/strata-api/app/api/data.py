from fastapi import APIRouter

from app.schemas.data import (
    CreditCardData,
    PointsProgram,
    SavingsProduct,
    InvestmentData,
    RealAssetData,
    LiabilityData,
    IncomeData,
    CreditData,
    ProtectionData,
    ToolPresetBundle,
)
from app.services.data_registry import (
    get_credit_card_data,
    get_points_programs,
    get_liquid_assets,
    get_investment_data,
    get_real_asset_data,
    get_liability_data,
    get_income_data,
    get_credit_data,
    get_protection_data,
    get_tool_presets,
)

router = APIRouter(prefix="/data", tags=["data"])


@router.get("/points-programs", response_model=list[PointsProgram])
async def list_points_programs() -> list[PointsProgram]:
    return get_points_programs()


@router.get("/credit-cards", response_model=list[CreditCardData])
async def list_credit_card_data() -> list[CreditCardData]:
    return get_credit_card_data()


@router.get("/liquid-assets", response_model=list[SavingsProduct])
async def list_liquid_assets() -> list[SavingsProduct]:
    return get_liquid_assets()


@router.get("/investments", response_model=InvestmentData)
async def get_investments() -> InvestmentData:
    return get_investment_data()


@router.get("/real-assets", response_model=RealAssetData)
async def get_real_assets() -> RealAssetData:
    return get_real_asset_data()


@router.get("/liabilities", response_model=LiabilityData)
async def get_liabilities() -> LiabilityData:
    return get_liability_data()


@router.get("/income", response_model=IncomeData)
async def get_income() -> IncomeData:
    return get_income_data()


@router.get("/credit", response_model=CreditData)
async def get_credit() -> CreditData:
    return get_credit_data()


@router.get("/protection", response_model=ProtectionData)
async def get_protection() -> ProtectionData:
    return get_protection_data()


@router.get("/tool-presets", response_model=ToolPresetBundle)
async def get_presets() -> ToolPresetBundle:
    return get_tool_presets()
