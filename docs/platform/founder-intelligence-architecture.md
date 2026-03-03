# Founder Intelligence & Multi-Entity Architecture

*Last Updated: March 2026*

This document outlines the technical architecture powering ClearMoney's "Founder Operating Room," specifically focusing on how we model and serve complex multi-entity financial lives.

## 1. The Multi-Entity Foundation
At the core of the Founder Operating Room is the realization that power users (founders, real estate investors, high-net-worth individuals) do not have a single monolithic "Net Worth." They have complex structures.

### Data Model: `LegalEntity`
We have introduced a `LegalEntity` model in `packages/strata-api/app/models/entity.py`.

```python
class EntityType(str, enum.Enum):
    personal = "personal"
    c_corp = "c_corp"
    llc = "llc"
    spv = "spv"
    trust = "trust"
```

All financial accounts (`CashAccount`, `DebtAccount`, `InvestmentAccount`) now link to an `entity_id` via a foreign key, allowing complete isolation of assets and liabilities.

## 2. Core Intelligence Layers

### Runway Intelligence (`RunwayService`)
Instead of a simple boolean flag, `RunwayService` now calculates runway metrics discretely for:
- **Personal Entity**: Based on personal burn (fallback to Financial Memory targets).
- **Business Entities**: Aggregates all non-personal entities to calculate the business runway cliff.

### Commingling Detection (`ComminglingDetectionEngine`)
To protect the Corporate Veil, the engine actively scans for cross-contamination:
- **Personal Accounts**: Scanned against `BUSINESS_MERCHANTS` (e.g., AWS, Gusto, Delaware Franchise Tax) to find reimbursable expenses.
- **Business Accounts**: Scanned against `PERSONAL_MERCHANTS` (e.g., DoorDash, Equinox) to flag unauthorized withdrawals.
Generates a `risk_score` metric for the UI.

### Tax Shield (`TaxShieldService`)
Analyzes incoming business credits to estimate quarterly pass-through tax liabilities. 
It integrates directly with the **Action Layer** to generate `ActionIntents`.

## 3. The Action Layer: Automated Withholding
When `TaxShieldService.generate_tax_withholding_intent(user_id)` is called, the platform:
1. Calculates the Q3/Q4 estimated liability based on real-time YTD cash flow.
2. Generates a `DecisionTrace` explaining the math.
3. Drafts an `ActionIntent` of type `ACH_TRANSFER` to move exactly that amount from the operating checking account to a designated tax holding account.

## Future Work (Phase 4)
- **UI Context Switcher**: Add a global dropdown to pivot the entire dashboard between "Global View", "Personal", and specific business entities.
- **Cap Table Ingestion**: Extend the `LegalEntity` model to track equity distribution and SAFE notes.
