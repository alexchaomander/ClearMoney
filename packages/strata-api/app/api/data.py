from fastapi import APIRouter

from app.schemas.data import (
    CreditCardData,
    CreditData,
    DataHealthResponse,
    IncomeData,
    InvestmentData,
    LiabilityData,
    PointsProgram,
    ProtectionData,
    RealAssetData,
    SavingsProduct,
    ToolPresetBundle,
    TransparencyPayload,
)
from app.services.data_registry import (
    get_credit_card_data,
    get_credit_data,
    get_data_health,
    get_income_data,
    get_investment_data,
    get_liability_data,
    get_liquid_assets,
    get_points_programs,
    get_protection_data,
    get_real_asset_data,
    get_tool_presets,
    get_transparency_payload,
)

router = APIRouter(prefix="/data", tags=["data"])


@router.get("/health", response_model=DataHealthResponse)
async def get_data_health_status() -> DataHealthResponse:
    return get_data_health()


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


@router.get("/transparency", response_model=TransparencyPayload)
async def get_transparency() -> TransparencyPayload:
    return get_transparency_payload()
