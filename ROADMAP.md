# ClearMoney Roadmap

*Last updated: March 12, 2026*

---

## Vision

**Build the most transparent, actionable, and founder-aware financial operating system on the planet.**

ClearMoney is the financial operating system for people who want to see the math. While AI advisors give you answers in a black box, ClearMoney shows you the inputs, the formula, and the confidence score behind every number. While traditional advisors charge 1% and work for their commissions, ClearMoney proves its independence with published payout data and open methodology. And while every other platform stops at "here's what you should do," ClearMoney drafts the paperwork, generates the switch kit, and executes the action -- with you in control at every step.

We exist because the financial advisory industry has two failure modes:
1. **Black-box AI advisors** (CFO Silvia, Wealthfront, Betterment) that give you answers without showing the math
2. **Affiliate-driven content mills** (The Points Guy, NerdWallet, Bankrate) that optimize for ad revenue, not outcomes

ClearMoney rejects both.

---

## Brand Identity

> For the full brand guide -- including voice examples, visual identity, messaging framework, competitive positioning one-liners, and marketing channel strategy -- see [BRANDING.md](./BRANDING.md).

**Name:** ClearMoney -- clarity applied to money.

**Tagline:** *See the math. Make the move.*

**Pillars:** Radical Transparency | Financial Empowerment | Intellectual Honesty | Action Over Advice | Respect for Intelligence

**Target Audience:**
- **Primary:** Startup founders (seed to Series B) managing personal + company finances
- **Secondary:** HNW individuals with $250k-$5M+ across multiple institutions
- **Tertiary:** Informed consumers tired of affiliate-driven financial content

---

## Competitive Positioning: ClearMoney vs. CFO Silvia

CFO Silvia (Pompliano / ProCap Financial) is our closest competitor. They launched May 2025, hit 10,000+ users and $30B+ tracked assets, and are being acquired to become a publicly traded "agentic finance" company. They have distribution (Pompliano's audience), a free price point, and multi-channel access (chat, call, email).

**We win by being better where it matters most, not by copying what they do.**

### Our Strategic Moats (Double Down)

| Moat | Why Silvia Can't Copy It Easily |
|------|--------------------------------|
| **Radical Transparency** | Their entire UX is a black-box chat. Retrofitting "show the math" traces into a conversational interface is an architecture rewrite. |
| **Founder Operating Room** | They serve general consumers. Building founder-specific tooling (runway, commingling, tax shields, entity separation) requires deep domain expertise and different data models. |
| **Action Execution (War Room)** | Silvia is read-only advisory. We draft ACATS paperwork, generate switch kits, and execute intents with biometric authorization. Going from "advice" to "execution" is a regulatory and engineering leap. |
| **Trust Protocol** | Our affiliate payout transparency, independence audits, and methodology audit logs create verifiable trust. Silvia's free model raises unanswered questions about monetization. |
| **Decision Traces** | Every ClearMoney recommendation writes a full logic tree (inputs, rules, assumptions, confidence). This is not a feature -- it's our data model. |

### Where We Must Close the Gap

| Silvia Advantage | Our Response | Priority |
|-----------------|-------------|----------|
| **Phone/SMS/Email access** | Build multi-channel AI (SMS via Twilio, voice via Vapi/Bland, email ingestion) | P0 |
| **Physical asset tracking** | Add real estate (Zillow API), vehicles (KBB/Edmunds), collectibles with depreciation/appreciation | P0 |
| **Completely free** | Free core tier with premium for execution, advanced modeling, and founder tools | P1 |
| **10,000+ users / $30B AUM** | Leverage founder niche, transparency story, and content engine for organic growth | P1 |
| **Native mobile apps** | Progressive Web App first, then React Native apps | P2 |
| **Push notifications / market alerts** | Real-time alert system via web push, SMS, and email | P1 |
| **Tax return upload** | PDF/image ingestion with AI extraction for tax optimization | P1 |
| **Web research in scenarios** | Agentic web search integrated into scenario analysis and advisor chat | P1 |

---

## Agent-Context Alignment: Path to 10/10

The next stage of ClearMoney is not "more AI features." It is the deliberate construction of a **Context Operating System** that turns fragmented financial data, user corrections, domain heuristics, policies, and provenance into a maintained substrate for every recommendation and action.

Today, ClearMoney already has the beginnings of this system:
- Structured financial context assembled from accounts, memory, holdings, transactions, physical assets, and freshness metadata
- Derived memory fields with change history
- Skill-specific advisor prompts with required context
- Decision traces, guardrails, and consent-aware access
- Live metric provenance for core financial metrics with formula versioning, continuity status, confidence decomposition, and correction entry points
- First-class correction objects for deterministically fixable metric inputs

To reach a true 10/10 alignment with the strongest context-engineering principles, we must close four gaps:

| Gap | Current State | 10/10 Standard |
|-----|---------------|----------------|
| **Living context** | Context is assembled well, but much of it is rebuilt at request time and only partially promoted into durable memory | Every important fact, inference, exception, and override has a durable home, owner, and lifecycle |
| **Runtime provenance** | Recommendation traces are strong, but many metric explanations remain static methodology rather than live per-user lineage | Every number, recommendation, and action can point to exact inputs, transforms, timestamps, assumptions, and policy checks |
| **Correction loops** | Users can update memory and traces are stored, but mistakes and overrides are not yet systematically folded back into the context layer | User corrections, advisor misses, and ops reviews automatically improve future context and reasoning |
| **Institutional knowledge** | Skills and deterministic rules exist, but house knowledge is still thin and fragmented | ClearMoney has a governed, versioned corpus of heuristics, exception policies, definitions, and reviewable playbooks |

### 10/10 Alignment Criteria

ClearMoney reaches 10/10 alignment when:

1. Every agent call is grounded in a canonical financial context graph rather than ad hoc prompt assembly.
2. Every user-facing metric has live provenance, not static explanatory copy.
3. Every recommendation records not just rationale, but the exact data lineage, rule lineage, policy lineage, and confidence decomposition.
4. Every user correction produces a durable context update, with clear source attribution and downstream invalidation.
5. Every important domain heuristic lives in a versioned registry, with review history and test coverage.
6. Every stale, missing, conflicting, or low-confidence input is surfaced explicitly to both the agent and the user.
7. Every automated or drafted action is backed by context completeness thresholds and policy checks.
8. Every context object can be exported, shared, and ported with machine-readable semantics.

### Core Program: Build the ClearMoney Context Operating System

This program cuts across product, data, AI, trust, and platform. It is now a P0 alongside execution and founder tooling.

**Workstream A: Canonical Context Graph**
- Formalize a canonical schema for assets, liabilities, income, tax posture, entities, obligations, goals, preferences, policies, consents, documents, and derived observations
- Add stable entity IDs and relationship edges so every recommendation references the same object graph
- Distinguish raw facts, derived facts, inferred facts, and user-declared facts at the schema level
- Add per-node ownership metadata: source system, ingestion time, freshness SLA, confidence, reviewer status, and invalidation rules

**Workstream B: Provenance and Lineage**
- Replace static "show the math" traces on key metrics with live, per-user provenance trees
- Store formula versions, transformation steps, source records, timestamps, and confidence contributors for every computed metric
- Make provenance queryable via API for dashboard metrics, advisor answers, exports, and support tooling
Status:
- Metric-level provenance is now live for net worth, total assets, savings rate, and personal runway
- Recommendation traces still need to converge on the same contract

**Workstream C: Correction and Learning Loops**
- Capture user corrections as first-class objects, not just generic memory writes
- Add "why this was wrong" labels for advisor misses, support escalations, and overridden recommendations
- Feed accepted corrections back into derivation rules, categorization models, and prompt-time context assembly
- Track whether future recommendations improved after a correction event
Status:
- v1 correction objects and deterministic application flows are live for monthly income, monthly expenses, and transaction category corrections
- Reviewer tooling and recommendation-miss handling remain open

**Workstream D: House Knowledge Registry**
- Build a governed registry of heuristics, planning rules, scenario templates, exception policies, and review playbooks
- Version every rule and skill with effective dates, owner, evidence, and test cases
- Separate broad educational guidance from ClearMoney-specific execution policies and founder-specific house views

**Workstream E: Context Quality and Eval**
- Define completeness, freshness, consistency, and conflict metrics for context
- Block or degrade recommendations when context quality falls below policy thresholds
- Build evaluation suites for recommendation quality, trace fidelity, provenance completeness, and correction handling
Status:
- v1 continuity states and recommendation readiness are implemented
- evaluation coverage still needs expansion beyond current targeted API tests

**Workstream F: Human Review and Trust**
- Create ops tooling to inspect context nodes, lineage, conflicts, and stale dependencies
- Add reviewer workflows for sensitive inferences: tax posture, equity assumptions, entity classification, and commingling decisions
- Publish methodology version history and confidence methodology as part of the trust layer
Next concrete build sequence:
- recommendation review objects and reviewer APIs: implemented
- internal reviewer console for trace triage and adjudication: implemented in v1
- user-facing recommendation dispute actions in decision traces: implemented
- advisor continuity hooks so unresolved reviews suppress or reframe future recommendations: implemented in v1

**Workstream G: Deterministic Financial Core**
- Keep the LLM layer probabilistic only at the explanation and orchestration layer, not the numerical truth layer
- Build deterministic engines for taxes, runway, debt payoff, allocation drift, liability prioritization, and recommendation readiness
- Require every high-impact recommendation to identify which parts are deterministic, inferred, or speculative

**Workstream H: Connectivity Resilience**
- Treat aggregators as unreliable dependencies and design for revocations, broken auth, missing coverage, and degraded syncs
- Blend aggregator data, uploaded documents, manual assertions, and screen-/portal-assisted recovery into one continuity model
- Make data continuity and recovery a visible product feature instead of a hidden support problem

**Workstream I: Trust and Deployment Modes**
- Support hosted, private workspace, and future local-first / sovereign deployment modes for sensitive users and partners
- Design execution isolation, skill sandboxing, and explicit filesystem/network boundaries for agents touching sensitive data
- Add a trust score and capability score to every integration and external source

**Workstream J: Behavioral and Preference Intelligence**
- Capture not only what the user has, but how they decide: risk style, decision latency, override patterns, planning cadence, and aversions
- Make recommendations adapt to behavioral context instead of assuming purely rational optimization

**Workstream K: Regional Execution Strategy**
- Separate advisory markets from execution markets
- Prioritize jurisdictions with strong open-finance rails for action-layer expansion
- Treat the U.S. as a trust-heavy, fragmented market and regions like Brazil as earlier action-execution candidates where regulated rails are stronger

---

## Strategic Pillars

### Pillar 1: Radical Transparency (Existing Moat -- Deepen)

Every number on ClearMoney is auditable. This is not a feature; it is the product.

- **Metric Traces**: Hover any number to see raw inputs, formula, confidence score, data freshness
- **Decision Narratives**: Full logic trees for every AI recommendation
- **Affiliate Payout Disclosure**: Show what we earn and prove our rankings are independent
- **Methodology Audit Log**: Public changelog of every calculation change
- **Independence Reports**: Quarterly proof that recommendations != highest payout

### Pillar 2: Context Operating System (New P0)

ClearMoney must become the best-maintained financial context system in the market. This is the foundation for trustworthy agents, not a backend detail.

- **Canonical Financial Graph**: One semantic model for facts, relationships, and derived observations across personal, founder, and entity finance
- **Context Registry**: Versioned definitions for metrics, heuristics, assumptions, exception policies, and skill prerequisites
- **Lineage Everywhere**: Every metric and recommendation links back to exact inputs, transforms, timestamps, and policy checks
- **Correction Engine**: User edits, overrides, and support resolutions become durable context improvements
- **Context Quality Gates**: Recommendation strength depends on completeness, freshness, conflict level, and evidence quality
- **Human-in-the-Loop Review**: High-risk inferences can be reviewed, approved, disputed, or reverted with audit history
- **Deterministic Financial Core**: Numerical truth comes from tested engines, not model improvisation
- **Connectivity Resilience**: The system remains useful even when Plaid/Yodlee/SnapTrade break or revoke access
- **Trust-Scored Infrastructure Layer**: APIs, skills, connectors, and sources are graded before they are allowed to influence decisions

### Immediate Planning Priority

The next planning and execution focus is **Recommendation Review + Continuity**.

This means ClearMoney must support:
- first-class recommendation disputes, not just metric corrections: implemented in v1
- an internal reviewer console to resolve or supersede questionable guidance: implemented in v1
- trace-level review status and audit history: implemented in v1
- advisor continuity that knows when a prior recommendation is unresolved, stale, or superseded: partially implemented, with duplicate-title suppression and caution-state injection live

We should treat this as the bridge between "explainable recommendations" and "governed financial chief of staff."

### Pillar 3: Multi-Surface Intelligence (Close the Gap)

Meet users where they are, not just in a dashboard.

- **SMS/Text**: "What's my net worth?" via text message
- **Voice**: Call your ClearMoney advisor for complex questions
- **Email**: Forward financial documents, ask questions, get analysis
- **Web Dashboard**: Full institutional-grade experience
- **Mobile (PWA -> Native)**: On-the-go access to alerts and key metrics
- **Advisor Continuity**: ClearMoney behaves like a persistent financial chief of staff, not a stateless chatbot
- **Ambient Briefings**: Daily/weekly summaries, watchlists, and "what changed since last time" digests across channels

### Pillar 4: Founder-First Financial OS (Niche Dominance)

No competitor serves founders. This is our beachhead.

- **Entity Separation**: Personal vs. business accounts with commingling alerts
- **Runway Intelligence**: Real-time burn rate, runway projections, fundraising triggers
- **Tax Shield Monitoring**: Quarterly estimates, safe harbor checks, deduction tracking
- **Subscription Audit**: SaaS spend analysis with ROI scoring
- **Cap Table Awareness**: Equity comp (RSUs, options, SAFEs) integrated into net worth

### Pillar 5: Action Execution (Our Biggest Moat)

Silvia tells you what to do. We do it.

- **Action Intents**: Structured primitives for every financial maneuver
- **Switch Kits**: Auto-generated ACATS/ACH transfer documents
- **War Room**: Queue, review, authorize, and execute with biometric approval
- **Ghost Navigation**: Step-by-step guides for legacy bank UIs
- **Agent Execution**: Autonomous rebalancing within user-defined guardrails
- **Mandate-Based Controls**: The agent can only observe, draft, or act within user-defined authority
- **Interaction Layer**: Where APIs do not exist, ClearMoney can guide or operate brittle legacy portals with explicit approval and audit

### Pillar 6: Comprehensive Wealth Picture (Parity + Beyond)

Track everything, not just financial accounts.

- **Financial Accounts**: Brokerage, retirement, banking, crypto via Plaid + SnapTrade
- **Real Estate**: Property values (Zillow), rental income, mortgage tracking, appreciation
- **Vehicles**: KBB/Edmunds valuations with depreciation curves
- **Alternative Assets**: Collectibles, art, jewelry, wine with manual + API valuations
- **Equity Compensation**: RSU vesting schedules, option exercise modeling, AMT impact
- **Debt Complete Picture**: Student loans, mortgages, auto loans, credit cards with payoff strategies
- **Tax Documents**: Upload W-2s, 1099s, K-1s, tax returns for comprehensive tax planning
- **Cross-Border / High-Income Complexity**: Families with multiple jurisdictions, entities, accounts, and reporting obligations

### Pillar 7: Publication & Distribution Engine (Organic Growth Moat)

ClearMoney's publication arm is our primary distribution channel. Silvia relies on Pompliano's personal brand for distribution. We build organic, compounding reach through independent financial content that earns trust and drives product adoption.

**The ClearMoney Publication** operates as an editorially independent arm of the platform. It covers the full spectrum of personal finance -- from credit card rewards and points optimization to portfolio strategy, tax planning, and founder finance. Every piece applies the same "show the math" standard as the product itself.

**Content Verticals:**

| Vertical | Audience | Examples |
|----------|----------|---------|
| **Credit Cards & Rewards** | Broad consumer (SEO + social) | Card comparisons, points valuations, rewards math, industry criticism |
| **Portfolio & Tax Strategy** | Investors, HNW individuals | Tax-loss harvesting explainers, allocation frameworks, fee analysis |
| **Founder Finance** | Startup founders | Runway planning, equity comp, 409A decisions, fundraising math |
| **Industry Accountability** | Everyone | Exposing affiliate conflicts, black-box AI criticism, devaluation tracking |
| **Tool Explainers** | ClearMoney users + prospects | Calculator walkthroughs, methodology deep-dives, feature tutorials |

**Content Principles:**
- Every opinion backed by open, verifiable math
- Take clear positions -- no hedge language ("it depends")
- Keep it concise (800-1,200 words max for written, 5-8 min for video)
- Call out bad actors by name when warranted
- Admit uncertainty when it exists
- Never recommend a product because of its affiliate payout

**Distribution Channels:**

| Channel | Format | Cadence |
|---------|--------|---------|
| Blog (clearmoney.com/blog) | Long-form analysis, tool explainers, methodology docs | 2x/week |
| Newsletter ("Show the Math") | Weekly digest: 1 featured piece, 3 market takes, community highlights | Weekly |
| YouTube | Tool walkthroughs, market analysis, founder finance, industry criticism | 1x/week |
| TikTok / Reels / Shorts | "60-second math" series, myth busting, hot takes | 3x/week |
| Twitter/X | Quick takes, tool announcements, data drops, threads | Daily |
| Podcast ("Show the Math") | Long-form interviews with founders about their financial operating systems | 2x/month |
| Reddit | Genuine, helpful participation in r/personalfinance, r/creditcards, r/startups, r/fatFIRE | Ongoing |

**Credit Card & Rewards Coverage (Specific Niche)**

This vertical deserves special attention because it's a high-traffic, high-intent space dominated by affiliate-compromised content (The Points Guy, NerdWallet, Bankrate). ClearMoney's publication is uniquely positioned to be the honest alternative:

- **Card comparison calculators** that use the reader's actual spending, not inflated valuations
- **Points valuation methodology** that's open and conservative (vs. TPG's inflated estimates)
- **"Is it worth it?" verdicts** that take clear stances, including "no" for popular high-fee cards
- **Devaluation tracking** with real dollar-impact analysis
- **Affiliate payout disclosure** on every recommendation, proving editorial independence
- **Contrarian takes** that other publications won't publish because they'd hurt affiliate revenue

This content drives top-of-funnel awareness (SEO + social) and builds trust that converts readers into ClearMoney product users.

**Community:**
- Discord server for peer discussion, knowledge sharing, and product feedback
- Crowdsourced data (card approval odds, redemption values, bonus data points)
- Community-powered accountability (users hold us to our independence pledge)
- Open methodology (community can suggest and vote on calculation improvements)

---

## Phased Roadmap

### Phase 0: Current State (Completed)

What we've already built:

- [x] Unified dashboard with net worth, allocation, and holdings
- [x] Initial financial context assembly spanning memory, accounts, holdings, transactions, and freshness
- [x] Initial decision trace system for recommendations and advisor analyses
- [x] Founder Operating Room (runway, commingling, tax shields, subscription audit)
- [x] AI Advisor with specialized financial skills (Claude-based)
- [x] War Room with action intent lifecycle and switch kit generation
- [x] Scenario Lab with Monte Carlo simulations
- [x] Command Center with prioritized actions
- [x] Decision Narrative with full audit trails
- [x] Trust Hub with payout transparency and independence audits
- [x] Vanish Mode, redacted sharing, ephemeral links
- [x] Financial Memory Wizard (conversational onboarding)
- [x] Plaid integration for account linking
- [x] Light/dark mode with Strata design system
- [x] Blog infrastructure with editorial content

What is only partially complete and must not be treated as finished:

- [ ] Live provenance-backed "show the math" on all key metrics
- [ ] Durable correction loops from user override -> improved future reasoning
- [ ] Versioned registry for heuristics, exception policies, and context definitions
- [ ] Context quality scoring with hard gates for low-confidence advice

---

### Phase 1: Context OS Foundation + Competitive Parity (Months 1-3)

**Goal: Build the foundation for 10/10 agent-context alignment while still closing core market gaps.**

#### 1.1 Context Operating System Foundation (P0)

| Workstream | Detailed Deliverables |
|------------|-----------------------|
| Canonical context schema | Define the v1 graph for people, households, legal entities, accounts, positions, debts, income streams, tax documents, goals, policies, consents, documents, observations, and recommendations. Split raw facts vs. derived facts vs. inferred facts vs. user assertions. |
| Context node metadata | Every node and edge gets `source`, `source_type`, `collected_at`, `effective_at`, `freshness_sla`, `confidence`, `review_status`, `owner`, `supersedes`, and `invalidates` metadata. |
| Context registry | Add versioned registries for metric definitions, heuristic rules, assumptions, prompt fragments, execution policies, and skill prerequisites. Every registry item gets owner, status, evidence, and tests. |
| Provenance service | Build a backend provenance service that can answer: "why is this number what it is?" with the exact chain of inputs, transforms, and timestamps. |
| Trace schema v2 | Expand decision traces to include data lineage, formula lineage, skill version, rule version, policy version, and confidence decomposition. |
| Context quality model | Introduce `completeness_score`, `freshness_score`, `conflict_score`, `evidence_score`, and `recommendation_readiness` for every major advisory domain. |
| Invalidation model | Define how new documents, user edits, provider syncs, and reviewer actions invalidate stale derivations and trigger recomputation. |
| Privacy architecture modes | Offer clear trust modes: hosted default, hardened private workspace, and future local-first / personal vault options for users who want tighter control over sensitive financial context. |
| Source quality tiers | Classify sources into authoritative, user-declared, inferred, speculative, and external research tiers so the system never presents weak data with false certainty. |
| Deterministic computation boundary | Define exactly which outputs must be computed by deterministic services versus LLM-assisted synthesis. |
| Connectivity resilience layer | Add continuity states for aggregator broken, stale, revoked, partially covered, manually substituted, and screen-assisted recovery. |

**Phase 1.1 acceptance criteria**
- Every recommendation can reference stable context node IDs rather than only serialized blobs
- Top 10 key dashboard metrics have live provenance payloads available from the API
- Every advisor session records which skill version, heuristic version, and policy version were used
- Recommendation generation is degraded or blocked when context quality falls below configured thresholds
- Users can see whether a fact came from an authoritative integration, a document extraction, user input, or lower-confidence external research
- Every high-impact recommendation declares which claims are deterministic, inferred, or speculative
- The product remains useful when a major aggregator connection is broken, revoked, or unsupported

#### 1.1.1 User Correction and Feedback Loop (P0)

| Capability | Detailed Deliverables |
|------------|-----------------------|
| Correction object model | Add first-class objects for corrections, disputes, overrides, confirmations, and suppressions with domain-specific types |
| UX for correction | Let users mark a metric, categorization, assumption, or recommendation as wrong, stale, incomplete, or missing context |
| Reviewer workflow | Support agents and internal ops can triage correction events, resolve them, and attach root-cause labels |
| Rule feedback ingestion | Corrections can be routed into categorization retraining, heuristic rule changes, prompt updates, or source suppression |
| Post-correction measurement | Track whether future recommendations improved in the corrected domain |
| Preference and behavior capture | Distinguish between "the model was wrong" and "the user intentionally prefers a non-optimal path" so the system learns style as well as facts |

**Phase 1.1.1 acceptance criteria**
- Users can dispute at least metrics, transactions, derived spending, debt classification, and recommendation rationale
- Each correction event can be traced to downstream recomputation or explicit dismissal
- We can measure correction resolution time and repeat-error rate by domain

#### 1.1.2 Live "Show the Math" Upgrade (P0)

| Capability | Detailed Deliverables |
|------------|-----------------------|
| Runtime metric traces | Replace static frontend methodology cards with live trace payloads for net worth, total assets, runway, savings rate, tax-advantaged ratio, and concentration risk |
| Confidence methodology | Compute confidence from freshness, source coverage, conflict count, and inference depth instead of hand-authored static percentages |
| Formula versioning | Every formula used in a metric trace is versioned and queryable |
| User-facing gaps | Trace UI explicitly shows missing sources, stale dependencies, unresolved conflicts, and manual overrides |

**Phase 1.1.2 acceptance criteria**
- The dashboard no longer relies on hard-coded methodology for the top financial metrics
- Users can see which exact accounts, transactions, or memory fields drove a metric
- Confidence can be explained numerically and reproduced server-side

#### 1.2 Physical & Alternative Asset Tracking (P0)

| Task | Details |
|------|---------|
| Real estate integration | Zillow API for property valuations, manual entry for rental income, mortgage linking, appreciation tracking |
| Vehicle tracking | KBB/Edmunds API for current values, depreciation curves, insurance and maintenance cost tracking |
| Manual asset registry | Structured entry for jewelry, art, collectibles, wine, crypto hardware wallets with custom valuation methods |
| Net worth recalculation | Include all asset classes in net worth, allocation charts, and trace calculations |

#### 1.3 Multi-Channel AI Access (P0)

| Channel | Implementation | Priority |
|---------|---------------|----------|
| SMS/Text | Twilio integration, natural language processing, balance/metric queries, alert responses | P0 |
| Voice | Vapi or Bland.ai for inbound/outbound calls, complex financial conversations, hands-free access | P0 |
| Email | Inbound email parsing (SendGrid/Postmark), forward documents for analysis, receive weekly digests | P1 |
| Web Push | Browser push notifications for alerts, market events, action reminders | P0 |
| Mobile PWA | Service worker, app manifest, offline-capable dashboard, installable on iOS/Android | P1 |

#### 1.3.1 Advisor Continuity and Briefing Layer (P0)

| Capability | Detailed Deliverables |
|------------|-----------------------|
| Persistent advisor memory | Maintain open questions, pending recommendations, recent changes, and user goals across channels |
| Morning / weekly briefings | Summaries of what changed, what matters now, and what needs review |
| Session continuity | Voice, SMS, dashboard, and email all reference the same current advisory state |
| Priority inbox | Surface the top 3-5 items that matter instead of forcing users to query the system manually |

#### 1.4 Proactive Alert System (P1)

| Alert Type | Trigger |
|------------|---------|
| Market events | FOMC decisions, major index movements (>2%), sector-specific alerts |
| Portfolio alerts | Concentration drift >5%, single position >20% of portfolio, cost basis opportunities |
| Account alerts | Unusual transactions, large deposits/withdrawals, fee charges |
| Tax alerts | Tax-loss harvesting opportunities, quarterly estimate due dates, wash sale warnings |
| Founder alerts | Runway below 6 months, commingling detected, burn rate spike |

#### 1.5 Tax Document Ingestion (P1)

| Feature | Details |
|---------|---------|
| Upload tax returns | PDF/image upload with AI extraction (OCR + Claude) |
| W-2/1099/K-1 parsing | Structured data extraction from tax documents |
| Tax optimization report | AI analysis comparing current strategy to optimal, with specific dollar amounts |
| YoY comparison | Track tax efficiency improvements across years |

#### 1.6 Web Research in Advisor (P1)

- Equip AI advisor with web search tool for real-time market data, news, and research
- Integrate financial data APIs (Alpha Vantage, Polygon, FRED) for live pricing and economic data
- Enable scenario analysis to pull real-world data (current rates, market conditions, inflation)

#### 1.6.1 Source Curation and Consumer "Bloomberg Terminal" Discipline (P0)

| Capability | Detailed Deliverables |
|------------|-----------------------|
| Authoritative-source registry | Maintain an explicit registry of approved financial, market, tax, and research sources with confidence and permitted use cases |
| Data quality labeling | Tag all external data as authoritative, contextual, speculative, stale, or unsupported for decisioning |
| Research vs decision boundary | Separate "interesting context" from "safe for recommendation" so news, social sentiment, and noisy third-party data never silently drive strong guidance |
| Backtestability standard | For any metric or recommendation that claims historical rigor, record the historical dataset, period coverage, and known gaps |
| Consumer Bloomberg discipline | Position ClearMoney as a high-signal personal finance command system, not a noisy wrapper around too many APIs |
| Competitor / company monitoring | Limit to founder-relevant and portfolio-relevant use cases with explicit reliability and actionability standards |

#### 1.6.2 Compliance and Trust Architecture (P0)

| Capability | Detailed Deliverables |
|------------|-----------------------|
| Capability-to-regulation matrix | Map every product capability to regulatory, custody, privacy, and liability constraints before launch |
| HITL defaults | Make human approval the default for sensitive actions and recommendation escalation |
| Sensitive-data execution isolation | Sandbox risky agent tasks and connectors with explicit mount/network scopes |
| Password and credential minimization | Prefer tokenized aggregators and delegated auth; avoid raw credential handling wherever possible |
| Audit-ready controls | Produce logs and artifacts suitable for compliance review and partner due diligence |

#### 1.7 Domain Knowledge Registry (P0)

| Capability | Detailed Deliverables |
|------------|-----------------------|
| Skill hardening | Move all advisor skills into a governed registry with owners, review dates, required context checks, and evaluation cases |
| Heuristic packs | Encode reusable financial rule sets for emergency funds, debt payoff, concentration, equity comp, tax posture, and founder runway |
| Exception policies | Document when standard heuristics should not apply: founders with illiquid equity, seasonal income, intentional leverage, bridge financing, etc. |
| Jurisdiction support | Begin state-specific and filing-status-specific rule packs for tax and entity behavior |
| Research linkage | Each rule references internal research or cited source material and has a review cadence |
| Behavioral overlays | Encode when behaviorally realistic recommendations should override purely mathematical optimization |

#### 1.8 Regional / Rails Strategy (P1)

| Market | Implication |
|--------|-------------|
| United States | Rich advice market, fragmented execution, trust-heavy rollout, draft-first posture |
| Brazil / Pix / Open Finance-like markets | Better candidate for earlier action execution due to stronger rails and regulated infrastructure |
| EU / UK / AU open banking ecosystems | Evaluate for medium-term expansion where permissions and payment rails are cleaner |

**Phase 1 Success Metrics:**
- Canonical context graph v1 deployed
- Top 10 metrics support live provenance
- 90%+ of recommendations include lineage, freshness, and policy metadata
- Correction workflow live in product and ops tooling
- All Silvia feature gaps on P0 items closed
- 100% of high-impact recommendations identify deterministic vs inferred components
- Aggregator outage / revocation does not collapse the user's advisory continuity
- SMS/voice channel live with <2s response time
- 5+ alternative asset types trackable
- Tax return upload processing 95%+ of common forms

---

### Phase 2: Niche Dominance + Premium Value (Months 3-6)

**Goal: Make ClearMoney indispensable for founders. Launch premium tier.**

#### 2.0 Context Quality, Review, and Learning Systems

| Capability | Detailed Deliverables |
|------------|-----------------------|
| Context health dashboard | Internal and user-facing views for completeness, freshness, conflict, missing sources, and recommendation readiness by domain |
| Review queue | Ops console for unresolved conflicts, high-impact low-confidence recommendations, stale critical context, and disputed derivations |
| Evaluation harness | Automated eval suites for recommendation quality, trace completeness, correction handling, and provenance fidelity |
| House view management | Allow ClearMoney to ship versioned "house views" on budgeting, equity risk, tax buffers, emergency fund policy, and founder cash management |
| Recommendation memory | Track which recommendations were accepted, dismissed, snoozed, ignored, or manually modified and use that to tune future suggestions |
| Advisor continuity model | Maintain continuity across sessions so the user feels like they are working with one persistent advisor who remembers objectives, open questions, pending actions, and prior decisions |
| Behavior model | Track decision styles, compliance with prior plans, and change-aversion so advice can be realistic rather than purely optimal |

**Phase 2.0 acceptance criteria**
- We can quantify recommendation quality by context completeness tier
- Internal reviewers can inspect and resolve context conflicts without direct DB access
- Recommendation recurrence and user follow-through are available as training signals

#### 2.1 Founder Operating Room v2

| Feature | Details |
|---------|---------|
| Multi-entity support | Track multiple companies, SPVs, trusts with cross-entity reporting |
| Cap table integration | Carta/Pulley integration or manual entry for equity, SAFEs, convertible notes |
| Fundraising intelligence | Runway-to-raise triggers, dilution modeling, term sheet analysis |
| Board-ready reports | One-click generation of financial snapshots for board meetings |
| 409A integration | Track fair market value for stock option exercise decisions |
| Compensation benchmarking | Compare founder salary/equity against market data |

#### 2.2 Advanced Modeling Engine

| Feature | Details |
|---------|---------|
| Multi-scenario comparison | Side-by-side comparison of 3+ scenarios with diff highlighting |
| Stress testing | Model recession, market crash, job loss, medical emergency impacts |
| Goal-based planning | Backwards planning from goals (buy house, retire, exit) with required actions |
| Probabilistic forecasting | Confidence intervals on all projections, not just point estimates |
| Custom assumption sets | Save and share assumption profiles (optimistic, base case, conservative) |

#### 2.3 Premium Tier Launch

| Free Tier | Premium ($29/mo) | Founder Pro ($79/mo) |
|-----------|-----------------|---------------------|
| Dashboard + net worth tracking | Everything in Free | Everything in Premium |
| 3 connected accounts | Unlimited accounts | Multi-entity support |
| Basic AI advisor (5 queries/day) | Unlimited AI advisor | Cap table + equity comp |
| Show the Math traces | SMS/Voice/Email access | Board-ready reports |
| Basic scenario analysis | Advanced modeling + stress tests | Fundraising intelligence |
| Blog + educational content | Tax document ingestion | Dedicated founder advisor mode |
| Manual asset tracking | Push alerts + market monitoring | Priority support |
| | Action execution (War Room) | API access |
| | Full Monte Carlo simulations | Custom integrations |

#### 2.4 Integrations Expansion

| Integration | Purpose |
|-------------|---------|
| Coinbase / Kraken / Phantom | Direct crypto wallet and exchange connections |
| Carta / Pulley | Cap table and equity data |
| Stripe / Mercury | Business revenue and banking for founders |
| QuickBooks / Xero | Business accounting data |
| Zillow / Redfin | Real estate valuations |
| KBB / Edmunds | Vehicle valuations |
| Recovery / screen-assisted connectors | Fallback acquisition when official APIs are absent or broken |

**Phase 2 Success Metrics:**
- 500+ founder users with Founder Pro subscriptions
- Premium conversion rate >8% of free users
- 3+ integrations live beyond Plaid
- NPS >60 among founder users
- 95%+ of high-priority recommendations pass trace completeness checks
- <5% repeat-error rate on previously corrected context domains
- Users report that the advisor feels continuous and context-aware across sessions and channels

---

### Phase 3: Action Layer + Trust Protocol (Months 6-12)

**Goal: Execute financial actions, not just advise. Establish ClearMoney as a verifiable financial identity.**

#### 3.0 Context-Gated Execution

| Capability | Detailed Deliverables |
|------------|-----------------------|
| Action readiness policies | Every action type defines minimum freshness, completeness, evidence, and reviewer thresholds before it can be drafted or executed |
| Pre-execution simulation | Show expected outcome, dependencies, failure modes, and confidence before authorization |
| Context freeze | Snapshot the exact context used for an executed action so the action can be audited later even if upstream data changes |
| Disagreement handling | When user intent conflicts with recommendation logic, persist the divergence and treat it as a valuable context signal |
| Post-action learning | Compare expected vs. actual result and feed deltas into action heuristics and trust scoring |
| User control plane | Give users explicit knobs for autonomy: inform only, draft only, require approval, pre-authorize bounded actions, and emergency stop |
| Mandate templates | Family-office style authorization profiles for households, founders, and high-income professionals |

**Phase 3.0 acceptance criteria**
- No high-impact action can execute without an auditable context freeze
- Users can see why an action is blocked, degraded, or requires review
- Action result deltas are fed into future confidence calculations
- Users can always inspect and change the current autonomy mode before any action leaves draft state

#### 3.1 Action Execution Engine v2

| Feature | Details |
|---------|---------|
| One-click rollover | AI pre-fills ACATS transfer forms, e-signature integration (DocuSign/HelloSign) |
| Automated rebalancing drafts | Agent proposes rebalancing trades based on target allocation + tax awareness |
| Bill negotiation intents | Draft cancellation/negotiation scripts for subscriptions and services |
| Guided execution | Step-by-step overlays for completing actions on legacy bank websites |
| Action audit trail | Complete history of every action taken, with before/after snapshots |

#### 3.2 Strata Verification Protocol (SVP)

| Feature | Details |
|---------|---------|
| Proof of Funds | Cryptographically signed attestation of account balances without revealing exact amounts |
| Income Stability Proof | Verifiable claim of income consistency for landlords, lenders |
| Net Worth Attestation | Privacy-preserving proof for investment minimums, accredited investor status |
| Public verification portal | `/verify` endpoint for third parties to validate ClearMoney-signed claims |
| Privacy-preserving sharing | ZK-proof generation for financial claims |

#### 3.3 Publication Launch (Full Scale)

Scale the ClearMoney publication from blog-only to full multi-channel content operation:

| Initiative | Details |
|------------|---------|
| YouTube channel | Weekly 5-8 min videos: tool walkthroughs, market analysis, founder finance, industry criticism |
| Short-form content | TikTok/Reels: "60-second math" series, myth busting, credit card hot takes |
| Newsletter | "Show the Math" weekly: 1 featured analysis, 3 market takes, community highlights |
| Podcast | "Show the Math" podcast: interviews with founders about their financial operating systems |
| SEO content engine | Programmatic card comparison pages, investment product analysis, points valuation dashboards |
| Credit card vertical | Full launch of the honest card reviews, points valuations, and rewards math content |

#### 3.4 Community Platform

| Feature | Purpose |
|---------|---------|
| Discord server | Peer discussion: #founders, #credit-cards, #portfolio-strategy, #tax, #feature-requests |
| Data point submissions | Crowdsource card approval odds, redemption values, bonus data |
| User reviews | Real experiences with financial products and strategies |
| Independence watchdog | Community holds us accountable to our transparency pledge |
| Open methodology | Community can suggest and vote on calculation improvements |

**Phase 3 Success Metrics:**
- First 100 financial actions executed through ClearMoney
- SVP attestations used by 50+ users for real-world verification
- 10,000+ newsletter subscribers
- YouTube channel at 5,000+ subscribers
- Community with 500+ active members
- 6+ SEO-optimized credit card articles published targeting specific long-tail keywords, with top-3 ranking for at least 2 long-tail terms
- 100% of executed actions have full pre/post context snapshots and auditability
- 80%+ of blocked actions provide machine-readable remediation steps to improve context quality

---

### Phase 4: The Agentic Ledger (Months 12-24)

**Goal: Autonomous financial operations within user-defined guardrails. ClearMoney becomes the system of record.**

#### 4.0 Portable Context Network

| Feature | Details |
|---------|---------|
| Financial context passport | Export a signed, portable representation of facts, derivations, provenance, reviewer states, and user overrides |
| Delegated agent access | Third-party agents consume scoped slices of the context graph with explicit consent and policy boundaries |
| Cross-agent memory | Preserve corrections, preferences, and house rules across channels and specialized agents |
| Context interoperability | Map ClearMoney context to FPP / JSON-LD representations and support import from external tools where feasible |
| Trust scoring layer | External consumers can verify not just claims, but also evidence quality and freshness characteristics |
| Infrastructure layer products | Expose parts of Strata as infrastructure for other apps needing trust-scored connectors, context graphs, or mandate-based controls |

#### 4.1 Smart Accounts

| Feature | Details |
|---------|---------|
| Agent-managed accounts | Integration with Safe (Gnosis) for programmable smart accounts |
| Programmable guardrails | User-defined rules: "Rebalance if drift >5%", "Max single trade $10k", "Never sell tax lots held <1yr" |
| Multi-sig authorization | High-value actions require multiple approval factors |
| Autonomous tax-loss harvesting | Agent continuously monitors and executes TLH within guardrails |
| Auto-rebalancing | Drift-based rebalancing with tax-aware lot selection |

#### 4.2 Agent Economy

| Feature | Details |
|---------|---------|
| Skyfire integration | Agent-to-agent payments for specialized financial services |
| L402 micropayments | Machine-to-machine payments for data and computation |
| Agentic API | Third-party financial agents can interact with user's ClearMoney context (with consent) |
| Agent marketplace | Specialized agents for tax, real estate, crypto, estate planning |

#### 4.3 Native Ledger

| Feature | Details |
|---------|---------|
| Internal double-entry ledger | Assets held directly within ClearMoney ecosystem |
| Instant settlement | Bypass ACH/ACATS delays for internal transfers |
| Context-native execution | Tax-loss harvesting, rebalancing, and transfers without leaving the platform |
| Financial Portability Protocol (FPP) | JSON-LD schema for exporting your entire financial context to any platform |

#### 4.4 Native Mobile Apps

| Platform | Details |
|----------|---------|
| iOS (React Native) | Full dashboard, biometric auth, push notifications, Siri integration |
| Android (React Native) | Full parity with iOS, widget support for net worth and alerts |
| Apple Watch / Wear OS | Quick glance at net worth, runway, and critical alerts |

**Phase 4 Success Metrics:**
- 80% of routine rebalancing executed autonomously
- Internal ledger processing $10M+ in managed assets
- FPP protocol adopted by 3+ third-party platforms
- Native apps with 4.5+ star ratings
- 50,000+ total users
- Context passport accepted by at least 3 external counterparties or partner workflows
- Third-party agent access operates with zero policy-breach incidents

---

## Monetization Strategy

### Revenue Model

| Stream | Phase | Details |
|--------|-------|---------|
| **Premium subscriptions** | Phase 2+ | $29/mo individual, $79/mo founder |
| **Ethical affiliate revenue** | Phase 1+ | Credit card and financial product recommendations with full payout disclosure |
| **Action execution fees** | Phase 3+ | Small fee for executed financial actions (ACATS, rebalancing) |
| **API access** | Phase 3+ | Third-party developers and agents consuming ClearMoney data |
| **Enterprise / Family Office** | Phase 4+ | White-label or dedicated instances for wealth managers |

### Independence Pledge

```
WE WILL NEVER:
1. Recommend a product because of its affiliate payout
2. Inflate valuations to make products look better
3. Suppress negative reviews of products that pay us
4. Accept editorial input from financial product issuers
5. Hide affiliate relationships from users
6. Prioritize revenue over user outcomes

WE WILL ALWAYS:
1. Show our math so users can verify our claims
2. Include non-affiliate options when they're better
3. Publish negative reviews even if it costs us revenue
4. Disclose exactly how we make money
5. Recommend AGAINST products when appropriate
6. Publish quarterly Independence Reports with full data
```

---

## Operating Principles

1. **Transparency is the product.** Every number is traceable. Every recommendation has a logic tree. If we can't show the math, we don't show the number.

2. **Execution path first.** To build the action layer, we must be in the decision loop. Read-only advisory is table stakes.

3. **Founders are our beachhead.** The founder niche is underserved, high-value, and word-of-mouth driven. Win founders, then expand.

4. **Meet users where they are.** Dashboard-only is a limitation. SMS, voice, email, and push are required channels.

5. **Data minimization + consent.** Users see, control, and revoke every data scope. Privacy is a feature, not a checkbox.

6. **Context is the product substrate.** Agents, dashboards, exports, notifications, and actions all read from the same governed context layer.

7. **Be the financial chief of staff, not a chat wrapper.** Continuity, memory, and relevance matter more than breadth of integrations for their own sake.

8. **Decision traces are the data model.** Every recommendation writes a trace that captures inputs, lineage, policy, rationale, and confidence. This is our moat and our audit trail.

9. **Corrections are gold.** Every user override, reviewer fix, and failed recommendation is a chance to harden the context system.

10. **Deterministic core, probabilistic shell.** The model explains, orchestrates, and prioritizes; tested engines compute critical financial truth.

11. **Source quality beats source quantity.** We do not ingest data just because it is available; we ingest it when we can explain how it should and should not influence decisions.

12. **Trust architecture is the product.** Compliance, isolation, privacy modes, and user control are category-defining capabilities, not back-office concerns.

13. **Earn trust through proof, not promises.** Independence reports, payout transparency, and open methodology. Trust is built with data, not marketing.

---

## Key Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Silvia/ProCap acquires distribution dominance | High | Focus on founder niche where distribution is word-of-mouth; transparency story creates organic press |
| Silvia copies our transparency features | Medium | Our traces are architectural (data model), not a UI layer. Retrofitting is hard. |
| Regulatory risk on action execution | High | Partner with licensed broker-dealers; implement robust compliance framework |
| User acquisition cost too high | Medium | Content engine + SEO + founder community creates organic growth |
| Plaid/SnapTrade reliability | Medium | Multi-provider strategy; graceful degradation; manual entry fallback |
| Free pricing pressure from Silvia | Medium | Premium value justifies cost; founders already pay for specialized tools |
| Context graph complexity slows shipping | Medium | Treat context work as platform leverage; ship by domain slices with explicit quality gates |
| Provenance UX overwhelms users | Medium | Progressive disclosure: simple summary first, deep trace on demand |
| Feedback loops create noisy training signals | Medium | Typed correction taxonomy, reviewer adjudication, and confidence weighting |
| Weak external data creates false confidence | High | Source-tiering, research/decision separation, and explicit unsupported-data policies |
| Privacy concerns block adoption of full-context advisor | High | Clear trust modes, local/private deployment paths, granular consent, and strong user-visible controls |
| Users reject autonomous actions | Medium | Default to draft-only, make autonomy user-configurable, and prove control before increasing automation |
| Aggregators break or revoke access | High | Build connectivity resilience, fallback capture, continuity modes, and productized recovery workflows |
| Compliance blocks speed | High | Capability-to-regulation mapping, launch sequencing by risk class, and partner-first execution strategy |
| Open-source / plugin ecosystems introduce malware risk | High | Signed skills, sandboxed execution, explicit mounts, trust scoring, and private-by-default connector policies |

---

## 5-Year North Star

**By 2031, ClearMoney is the financial operating system that:**

- Manages $100B+ in tracked assets across 100,000+ users
- Executes 80%+ of routine financial operations autonomously
- Is the standard for transparent, auditable financial AI
- Has forced the industry to adopt "show the math" as a baseline expectation
- Operates the Financial Portability Protocol used by 10+ platforms
- Is the default financial OS for startup founders
- Has saved users $100M+ through optimized decisions and avoided fees

**The ClearMoney Publication is the trusted independent voice that:**

- Is the go-to alternative to affiliate-compromised financial media
- Reaches 1M+ monthly readers across blog, video, and social
- Has published the industry's most cited points valuation methodology
- Drives 40%+ of new product signups through organic content
- Has forced competitors to disclose affiliate payouts and show their math

**Success is not** maximizing our revenue. **Success is** people making measurably better financial decisions because every number they see is auditable, every recommendation is traceable, and every action is executable.

---

*This roadmap is a living document. Updated quarterly with progress and competitive intelligence.*
