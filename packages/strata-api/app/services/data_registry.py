import json
from functools import lru_cache
from pathlib import Path
from datetime import datetime, timezone

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
    DataHealthResponse,
    TransparencyPayload,
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


def get_data_health() -> DataHealthResponse:
    data_dir = _resolve_data_dir()
    catalog_files = {
        "points_programs": "points_programs.json",
        "credit_cards": "credit_cards.json",
        "liquid_assets": "liquid_assets.json",
        "investments": "investments.json",
        "real_assets": "real_assets.json",
        "liabilities": "liabilities.json",
        "income": "income.json",
        "credit": "credit.json",
        "protection": "protection.json",
        "tool_presets": "tool_presets.json",
        "transparency_payload": "transparency_payload.json",
    }

    details: dict[str, str] = {}
    latest_mtime = 0.0
    degraded = False

    for key, filename in catalog_files.items():
        path = data_dir / filename
        try:
            _load_json(path)
            details[key] = "ok"
            latest_mtime = max(latest_mtime, path.stat().st_mtime)
        except Exception as exc:
            degraded = True
            details[key] = f"error: {exc}"

    if degraded:
        status = "degraded"
        catalog = "degraded"
    else:
        status = "ok"
        catalog = "ok"

    if latest_mtime:
        last_updated = datetime.fromtimestamp(latest_mtime, tz=timezone.utc).isoformat()
    else:
        last_updated = datetime.fromtimestamp(0, tz=timezone.utc).isoformat()

    return DataHealthResponse(
        status=status,
        database="ok",
        catalog=catalog,
        last_updated=last_updated,
        details=details,
    )


def get_transparency_payload() -> TransparencyPayload:
    data_dir = _resolve_data_dir()
    item = _load_json(data_dir / "transparency_payload.json")
    return TransparencyPayload.model_validate(item)
