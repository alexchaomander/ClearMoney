from fastapi import APIRouter, Depends, Query
from typing import Dict, List
from pydantic import BaseModel
from app.services.monte_carlo import MonteCarloService
from app.api.deps import require_scopes
from app.models.user import User

router = APIRouter(prefix="/calculators", tags=["calculators"])

class MonteCarloPercentiles(BaseModel):
    p10: List[float]
    p50: List[float]
    p90: List[float]

class MonteCarloResponse(BaseModel):
    success_rate: float
    iterations: int
    percentiles: MonteCarloPercentiles
    years: List[int]

@router.get("/retirement-monte-carlo", response_model=MonteCarloResponse)
async def run_monte_carlo(
    current_savings: float = Query(..., ge=0),
    monthly_contribution: float = Query(..., ge=0),
    years_to_retirement: int = Query(..., gt=0, le=60),
    retirement_duration_years: int = Query(..., gt=0, le=50),
    desired_annual_income: float = Query(..., ge=0),
    user: User = Depends(require_scopes(["agent:read"])),
) -> MonteCarloResponse:
    """Run a Monte Carlo simulation for retirement."""
    result = MonteCarloService.run_retirement_simulation(
        current_savings=current_savings,
        monthly_contribution=monthly_contribution,
        years_to_retirement=years_to_retirement,
        retirement_duration_years=retirement_duration_years,
        desired_annual_income=desired_annual_income,
    )
    return MonteCarloResponse.model_validate(result)
