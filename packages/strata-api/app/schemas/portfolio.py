from decimal import Decimal
from typing import Any

from pydantic import BaseModel


class AssetAllocation(BaseModel):
    """Asset allocation by category."""

    category: str
    value: Decimal
    percentage: Decimal


class PortfolioSummary(BaseModel):
    """Portfolio summary with aggregate data."""

    total_investment_value: Decimal
    total_cash_value: Decimal
    total_debt_value: Decimal
    net_worth: Decimal
    tax_advantaged_value: Decimal
    taxable_value: Decimal
    allocation_by_asset_type: list[AssetAllocation]
    allocation_by_account_type: list[AssetAllocation]
    top_holdings: list[dict[str, Any]]
    concentration_alerts: list[dict[str, Any]]
