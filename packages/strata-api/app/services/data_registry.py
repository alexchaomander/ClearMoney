import json
from functools import lru_cache
from pathlib import Path

from app.core.config import settings
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


def _default_data_dir() -> Path:
    return Path(__file__).resolve().parents[1] / "data"


def _resolve_data_dir() -> Path:
    if settings.data_dir:
        return Path(settings.data_dir)
    return _default_data_dir()


def _load_json(path: Path):
    if not path.exists():
        raise FileNotFoundError(f"Data file not found: {path}")
    with path.open("r", encoding="utf-8") as handle:
        return json.load(handle)


@lru_cache(maxsize=None)
def get_points_programs() -> list[PointsProgram]:
    data_dir = _resolve_data_dir()
    items = _load_json(data_dir / "points_programs.json")
    return [PointsProgram.model_validate(item) for item in items]


@lru_cache(maxsize=None)
def get_credit_card_data() -> list[CreditCardData]:
    data_dir = _resolve_data_dir()
    items = _load_json(data_dir / "credit_cards.json")
    return [CreditCardData.model_validate(item) for item in items]


@lru_cache(maxsize=None)
def get_liquid_assets() -> list[SavingsProduct]:
    data_dir = _resolve_data_dir()
    items = _load_json(data_dir / "liquid_assets.json")
    return [SavingsProduct.model_validate(item) for item in items]


@lru_cache(maxsize=None)
def get_investment_data() -> InvestmentData:
    data_dir = _resolve_data_dir()
    item = _load_json(data_dir / "investments.json")
    return InvestmentData.model_validate(item)


@lru_cache(maxsize=None)
def get_real_asset_data() -> RealAssetData:
    data_dir = _resolve_data_dir()
    item = _load_json(data_dir / "real_assets.json")
    return RealAssetData.model_validate(item)


@lru_cache(maxsize=None)
def get_liability_data() -> LiabilityData:
    data_dir = _resolve_data_dir()
    item = _load_json(data_dir / "liabilities.json")
    return LiabilityData.model_validate(item)


@lru_cache(maxsize=None)
def get_income_data() -> IncomeData:
    data_dir = _resolve_data_dir()
    item = _load_json(data_dir / "income.json")
    return IncomeData.model_validate(item)


@lru_cache(maxsize=None)
def get_credit_data() -> CreditData:
    data_dir = _resolve_data_dir()
    item = _load_json(data_dir / "credit.json")
    return CreditData.model_validate(item)


@lru_cache(maxsize=None)
def get_protection_data() -> ProtectionData:
    data_dir = _resolve_data_dir()
    item = _load_json(data_dir / "protection.json")
    return ProtectionData.model_validate(item)


@lru_cache(maxsize=None)
def get_tool_presets() -> ToolPresetBundle:
    data_dir = _resolve_data_dir()
    item = _load_json(data_dir / "tool_presets.json")
    return ToolPresetBundle.model_validate(item)
