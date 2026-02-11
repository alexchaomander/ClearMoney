# Tax Plan Workspace Roadmap

## 1. Product Vision

Build ClearMoney Tax Plan Workspace as a unified tax planning product where:

- Individuals can self-serve with transparent, easy-to-understand tax strategy recommendations.
- Human advisors can generate repeatable, client-ready tax plans quickly.
- AI advisors/agents can run deterministic tax scenarios with clear assumptions, confidence, and guardrails.

The workspace should feel simple and elegant on first use, while scaling to professional-grade planning depth.

## 2. MVP (Shipped)

### What is included

- New tool route: `/tools/tax-plan-workspace`
- Dual mode: `Individual` or `Advisor / AI Advisor`
- Baseline tax context inputs (income, gains, filing status, state, withholding)
- Strategy toggles:
  - HSA
  - Pre-tax retirement deferrals
  - Tax-loss harvesting
  - Donation bunching
- Deterministic scenario engine:
  - Baseline vs projected tax
  - Estimated annual savings
  - Withholding gap
  - Safe-harbor gap
  - Confidence score
- Prioritized action list with owner and urgency
- Advisor-ready brief generator (copy-to-clipboard)
- Local snapshot persistence (save/load/delete tax plan snapshots in browser)
- Server-backed version history using Share Reports (`tool_id: tax-plan-workspace`)
- Scenario compare panel (A/B snapshot comparison on savings and projected tax)
- Downloadable plan packet export (`.md`) for current plan and saved snapshots
- Team sharing via secure generated share links + shared report import support
- Methodology + guardrails section
- Tool catalog registration in taxes category

### Why this MVP matters

- Immediate user value: one place to run actionable tax planning scenarios.
- Immediate advisor value: reusable summary output for client communication.
- Foundation for AI orchestration: deterministic outputs + explainable assumptions.

## 3. Product North Star

A "Tax Operating System" for households and advisors:

- Continuous plan lifecycle (onboarding -> planning -> execution -> monitoring)
- Shared workspace state across user, advisor, and AI
- Explainable recommendations with source-level confidence
- Action tracking and measurable tax outcome improvement year over year

## 4. Full Product Surface

### 4.1 Workspace Core

- Unified plan object with:
  - Household profile
  - Entity/filer context
  - Income streams
  - Holdings/lots
  - Prior-year tax data
  - Active strategy set
  - Open action checklist
- Multi-scenario planning:
  - Base
  - Conservative
  - Aggressive
  - Advisor custom variants
- Scenario comparison views and deltas

### 4.2 Ingestion + Data Quality

- Document ingestion:
  - 1040
  - W-2 / 1099
  - Brokerage statements / 1099-B
  - Payroll summaries
- Structured extraction pipelines with confidence and field-level provenance
- Reconciliation panel:
  - Mismatched values
  - Missing fields
  - Duplicate source conflict resolution

### 4.3 Strategy Engine Expansion

- Add strategy packs:
  - Roth conversions (multi-year)
  - Qualified charitable distributions
  - Equity comp timing (RSU/ISO/NSO)
  - Asset location and tax-aware rebalancing
  - NIIT/AMT and bracket management
  - State relocation what-if modeling
  - Quarterly estimated payments and safe-harbor automation
- Constraint-aware planning:
  - Liquidity limits
  - Contribution limits
  - Household goals and risk preferences

### 4.4 Advisor & Team Workflows

- Workspace roles:
  - Client
  - Lead advisor
  - Paraplanner
  - Reviewer
  - AI copilot
- Collaboration tools:
  - Comments and mentions
  - Change history + audit trail
  - Plan approval and lock checkpoints
- Deliverables:
  - Client summary (1-page)
  - Meeting prep brief
  - Follow-up action packet
  - PDF export + share links

### 4.5 AI Advisor Layer

- AI plan co-pilot with deterministic tool calls only
- Explainability envelope for each recommendation:
  - Data inputs used
  - Formula path
  - Confidence + limitations
- Safety controls:
  - Hard guardrails for tax/legal advice framing
  - Risky strategy escalation and mandatory human review

### 4.6 Monitoring & Execution

- Ongoing plan health feed:
  - Income drift
  - Realized gains/losses changes
  - Withholding drift
  - Estimated payment deadlines
- Smart alerts and reminders
- Task completion tracking with observed impact

## 5. UX Roadmap

### UX principles

- Simple at first touch, deep on demand
- Fewer screens, stronger defaults
- Every recommendation has: "why", "math", "next step"

### Planned UX modules

- Guided onboarding wizard
- Plan board (prioritized tasks)
- Scenario lab (visual comparisons)
- Document inbox and review queue
- Advisor handoff hub
- Annual tax season timeline view

## 6. Technical Architecture

### Frontend (Next.js)

- New workspace module under `packages/web/src/app/tools/tax-plan-workspace`
- Extract reusable components:
  - Strategy cards
  - Confidence indicator
  - Action plan timeline
  - Brief/packet generator
- Shared state via typed plan model and query cache

### Backend (FastAPI target)

- Planned API domain: `/api/v1/tax-plan-workspace`
- Core services:
  - Plan service
  - Scenario service
  - Strategy engine
  - Document extraction service
  - Recommendation trace service
- Persistence:
  - Plans
  - Scenarios
  - Actions
  - Source documents
  - Recommendation traces

### Data model (high-level)

- `tax_plan`
- `tax_plan_scenario`
- `tax_plan_strategy`
- `tax_plan_action`
- `tax_plan_data_source`
- `tax_plan_recommendation_trace`

## 7. Security, Compliance, and Trust

- PII and tax document encryption at rest and in transit
- Strict role-based access and workspace sharing controls
- Full audit logs for data access and plan edits
- Mandatory educational/tax-advice disclaimers in all user-facing outputs
- Configurable retention + deletion policy for uploaded tax documents

## 8. Metrics and Success Criteria

### Product metrics

- Workspace activation rate
- Plan completion rate
- Strategy adoption rate
- Action completion rate
- Advisor brief export/share rate

### Outcome metrics

- Estimated tax savings surfaced per household
- Confirmed savings (self-reported or reconciled) per tax year
- Reduction in withholding/safe-harbor gaps
- Time-to-first-plan for individuals and advisors

## 9. Delivery Plan (Post-MVP)

### Phase 1: Workflow hardening (2-4 weeks)

- Persist workspace state
- Add saved scenarios
- Improve strategy explanations and confidence signals
- Add PDF/markdown plan export

### Phase 2: Data ingestion + quality (4-6 weeks)

- 1040/W-2 ingestion MVP
- Field-level confidence + review UI
- Data conflict resolution workflows

### Phase 3: Advisor collaboration (4-6 weeks)

- Multi-user roles and comments
- Approval states and plan versioning
- Advisor dashboard for multi-client queue management

### Phase 4: Advanced engine + AI copilot (6-10 weeks)

- Multi-year scenario modeling
- Expanded strategy packs
- AI copilot with deterministic tool traces and safety policies

## 10. Open Questions

- Should first advisor integrations target Altruist ecosystem workflows or remain platform-agnostic initially?
- What minimum document set is required for "advisor-grade" confidence?
- Which compliance boundary is needed for generated recommendations by jurisdiction/state?
- Should plan outputs support household-level optimization first or advisor-firm-wide batch optimization first?

## 11. Immediate Next Build Targets

1. Expand scenario compare to baseline/optimized/custom with richer metric matrix.
2. Add PDF packet rendering from the markdown export and branded client handout templates.
3. Add intake templates for advisor onboarding.
4. Add first ingestion path for 1040 + W-2.
5. Add multi-user role permissions and audit views over server version history.
