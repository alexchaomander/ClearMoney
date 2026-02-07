# Founder Coverage: Product + Policy Baseline (as of Feb 6, 2026)

## Goal
Build comprehensive founder-specific coverage that bridges **business setup, tax elections, payroll/compliance, and personal financial optimization**. This document defines the minimum policy logic and the product surface needed to support solo founders, bootstrappers, and VC-backed entities.

> **Scope note:** This document focuses on U.S. founders and U.S. federal tax/compliance baselines. State-specific rules should be handled via a configuration layer and local guidance surfaces.

---

## Founder personas + core needs

| Persona | Typical entity | Financial needs | High-risk gaps today |
|---|---|---|---|
| Solo founder (services, consulting) | Sole prop → LLC → S-Corp election | S-Corp savings, quarterly tax planning, payroll/distributions | Overpaying self-employment tax, missed deadlines |
| Bootstrapped SaaS | LLC or S-Corp | Clean books, payroll compliance, retirement plan optimization | Commingling cash, missed estimated taxes |
| Venture-backed startup | C-Corp (Delaware) | Founder equity, QSBS eligibility, 83(b) elections, payroll | Missed 83(b) deadline, QSBS disqualification |
| Agency w/ contractors | LLC or S-Corp | 1099s, contractor compliance, payroll for owners | 1099 penalties, wage misclassification |

---

## Coverage map: entity choice → tax elections → payroll → personal finance

### 1) Entity selection + tax election guidance
**Decision points to model**
- **Sole prop vs LLC** (liability protection, admin burden).
- **LLC tax classification**: default pass-through vs **S-Corp election**.
- **C-Corp vs pass-through** for VC-backed fundraising, equity incentives, QSBS potential, and double-tax tradeoffs.

**Product requirements**
- Entity decision flow that captures:
  - Revenue, margins, expected distributions, funding plan, ownership count.
  - State of formation + operating state.
  - Funding/exit goals (bootstrapped vs VC-funded).
- Decision rationale output: **why** a given entity is recommended, including compliance cost implications and tax tradeoffs.

**Baseline policy logic (U.S.)**
- **S-Corp election** is a tax status (Form 2553) for eligible entities (LLCs or corporations). It’s not a distinct entity type.
- **S-Corp election deadline**: generally **2 months + 15 days** after start of the tax year (or entity formation), with late-election relief available in some cases.
- **C-Corp** is required for most venture-backed startups and standard equity incentive structures; double-tax applies but QSBS may offset for qualified shareholders.

---

### 2) S-Corp savings estimator + election checklist
**Why it matters:** Founders often overpay self-employment taxes; S-Corp status can reduce payroll tax exposure by splitting wages vs distributions (subject to reasonable compensation).

**Product requirements**
- **S-Corp savings calculator** with inputs:
  - Net income, owner role, hours, market salary estimate.
  - State payroll tax rates + unemployment taxes.
  - Estimated accounting/payroll costs.
- Output:
  - Estimated payroll taxes vs pass-through self-employment tax.
  - Net savings after admin costs.
  - Compliance checklist + deadlines.

**Compliance checklist (minimum)**
- Form **2553** (S-Corp election).
- **Payroll setup** (W-2, withholdings).
- **Quarterly payroll filings** + state payroll setup.
- **1120-S** filing + owner **K-1**.
- **Reasonable compensation** documentation (job role, market comparables, time commitment).

---

### 3) Founder payroll + distribution planning
**Goal:** Prevent compliance risk and under-withholding.

**Product requirements**
- Founder pay configuration:
  - Salary (W-2) vs distributions/draws.
  - Automatic “reasonable compensation” guardrails.
- Integration with payroll vendors (Gusto Embedded or similar).
- Alerts for under-withholding and quarter-end payroll tax obligations.

**Baseline policy logic**
- S-Corp owners must take **reasonable compensation** as W-2 wages before distributions.
- Distributions are generally not subject to self-employment tax (but remain taxable as income).

---

### 4) Quarterly estimated tax planner (safe-harbor)
**Goal:** Avoid underpayment penalties and reduce cashflow surprises.

**Product requirements**
- Quarterly tax planner that aggregates:
  - W-2 wages, K-1/owner income, dividends/interest/capital gains.
  - State tax estimates.
  - Credits/deductions and expected retirement contributions.
- **Safe-harbor calculator** with reminders.

**Baseline policy logic**
- Safe-harbor generally satisfied if payments meet **100% of prior year tax** (or **110% for high-income filers**) or **90% of current year** tax.
- Reminders: quarterly estimated tax due dates (April, June, September, January).

---

### 5) Founder retirement + benefits optimization
**Goal:** Match entity type with the right retirement plan and maximize tax-advantaged options.

**Product requirements**
- Retirement plan decision guide:
  - **Solo 401(k)** vs **SEP IRA** vs **SIMPLE IRA**.
  - Eligibility rules, admin complexity, and contribution mechanics.
- HSA eligibility check (HDHP required).
- Suggest entity structures that unlock higher contributions (S-Corp wage base).

**Baseline policy logic**
- Solo 401(k) generally available if no full-time employees other than spouse.
- Contribution limits update annually; tool should pull **current IRS limits** dynamically.
- Solo 401(k) typically requires plan adoption by year-end for employee deferrals; employer contributions can be made by tax filing deadline (including extensions).

---

### 6) Compliance checklist + document vault
**Goal:** Centralize founder compliance and reduce missed filings.

**Product requirements**
- Checklist covering:
  - Formation docs, EIN, operating agreement/bylaws.
  - State annual reports and franchise tax.
  - 1099 issuance and contractor compliance.
  - Corporate minutes and cap table updates.
- “Document vault” with secure storage + reminders.

---

### 7) Business vs personal cashflow separation
**Goal:** Reduce audit risk and maintain clean books.

**Product requirements**
- Tag accounts as **business** or **personal**.
- Warn on commingling (owner purchases from business accounts).
- Automated transfer recommendations (payroll, draws, reimbursements).

---

### 8) Founder equity lifecycle (QSBS + 83(b))
**Goal:** Support founder equity decisions with deadlines and tax implications.

**Product requirements**
- Founder equity dashboard:
  - Stock issuance, vesting schedule, exercise price, FMV/409A.
  - **83(b)** election countdown (30-day deadline).
- **QSBS eligibility checker** (Section 1202):
  - C-Corp status, qualified trade/business, asset thresholds, 5-year holding period.
- Education + decision trace to show tradeoffs.

---

## Product surfaces to build

1. **Founder onboarding flow**
   - Entity selection + tax election recommendations.
2. **S-Corp savings calculator**
   - Provide savings estimate + election checklist + next steps.
3. **Quarterly tax planner**
   - Safe-harbor guidance + payment reminders.
4. **Founder payroll + distribution planner**
   - “Reasonable compensation” guidance + W-2 integration.
5. **Compliance hub + document vault**
   - State filings, 1099s, annual reports, cap table records.
6. **Founder equity planner**
   - 83(b) timer + QSBS eligibility + vesting insights.
7. **Business vs personal cashflow separation**
   - Automated hygiene recommendations.

---

## Data model extensions (platform)

- `entity` (type, state, tax_classification)
- `owner_comp` (salary, distributions, draws, role, reasonable_comp_assumption)
- `tax_election` (type, filing_date, effective_year)
- `compliance_task` (type, due_date, status)
- `estimated_tax` (quarter, amount, status, method)
- `equity_issuance` (grant_date, vesting, 83b_deadline)
- `qsbs_eligibility` (status, reasons, holding_period_start)

---

## Risks + disclaimers
- **Tax advice disclaimer** required; advice should be positioned as educational with inputs-driven calculations.
- **State and local tax variation** must be modeled as configuration with region-specific guidance.
- **Reasonable compensation** is subjective; provide ranges + citations and encourage CPA review.

---

## Recommended references (for implementation)
- IRS Form 2553 (S-Corp election)
- IRS guidance on estimated tax safe-harbor rules
- IRS publications on self-employment tax and payroll tax
- IRS Section 1202 (QSBS) and 83(b) election guidance
- IRS retirement plan contribution limit tables (annual)
