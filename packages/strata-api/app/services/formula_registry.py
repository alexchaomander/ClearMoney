from dataclasses import dataclass, field


@dataclass(frozen=True)
class FormulaDefinition:
    metric_id: str
    formula_id: str
    version: str
    label: str
    formula: str
    description: str
    determinism_class: str = "deterministic"
    source_tier: str = "derived_context"
    policy_version: str = "context-policy-v1"
    correction_targets: list[dict[str, object]] = field(default_factory=list)


FORMULA_REGISTRY: dict[str, FormulaDefinition] = {
    "netWorth": FormulaDefinition(
        metric_id="netWorth",
        formula_id="portfolio.net_worth",
        version="2.0.0",
        label="Net Worth",
        formula="Total Assets - Total Liabilities",
        description="The total value of everything you own minus everything you owe.",
        correction_targets=[
            {"field": "manual_review", "label": "Request manual review", "input_type": "text", "metric_ids": ["netWorth"]},
        ],
    ),
    "totalAssets": FormulaDefinition(
        metric_id="totalAssets",
        formula_id="portfolio.total_assets",
        version="2.0.0",
        label="Total Assets",
        formula="Cash + Investments + Vested Equity + Physical Assets",
        description="The sum of liquid, invested, and owned asset value currently tracked in ClearMoney.",
        correction_targets=[
            {"field": "manual_review", "label": "Request manual review", "input_type": "text", "metric_ids": ["totalAssets"]},
        ],
    ),
    "savingsRate": FormulaDefinition(
        metric_id="savingsRate",
        formula_id="cashflow.savings_rate",
        version="2.0.0",
        label="Savings Rate",
        formula="(Monthly Income - Monthly Spend) / Monthly Income",
        description="The percentage of monthly income left after current monthly spending.",
        correction_targets=[
            {"field": "monthly_income", "label": "Monthly income", "input_type": "currency", "metric_ids": ["savingsRate"]},
            {"field": "average_monthly_expenses", "label": "Monthly spend", "input_type": "currency", "metric_ids": ["savingsRate", "personalRunway"]},
        ],
    ),
    "personalRunway": FormulaDefinition(
        metric_id="personalRunway",
        formula_id="liquidity.personal_runway",
        version="2.0.0",
        label="Personal Runway",
        formula="Personal Liquid Cash / Monthly Personal Burn",
        description="How many months your personal cash can support current personal spending without new income.",
        correction_targets=[
            {"field": "average_monthly_expenses", "label": "Monthly personal burn", "input_type": "currency", "metric_ids": ["personalRunway", "savingsRate"]},
        ],
    ),
}


def get_formula_definition(metric_id: str) -> FormulaDefinition:
    definition = FORMULA_REGISTRY.get(metric_id)
    if definition is None:
        raise ValueError(f"Unsupported metric trace: {metric_id}")
    return definition
