# Agent Context Systems Alignment

*Last updated: March 11, 2026*

## Purpose

This document translates the strongest current thinking on agent context systems into concrete product, data, and platform requirements for ClearMoney.

It exists to answer one question:

**What would it take for ClearMoney to be a category-defining example of a context-native financial agent platform rather than "an AI advisor with account integrations"?**

---

## Executive Summary

ClearMoney already has several foundations that many agent products lack:
- A structured financial context object
- Durable financial memory
- Decision traces
- Consent-aware access controls
- Skill-specific advisor behaviors
- Freshness guardrails

That is a strong starting point. It is not yet the finish line.

The delta between "good" and "best in class" is not better prompting. It is building a **maintained context operating system** with:
- Canonical semantic entities
- Durable provenance
- Versioned institutional knowledge
- Typed correction loops
- Context quality scoring
- Human-review workflows
- Portable context exports

The highest-priority research conclusion is simple:

**ClearMoney should treat context as a first-class product surface, governance layer, and platform primitive.**

---

## Market Feedback: Andrew Chen LinkedIn Thread

This section captures product signal from the full post and comment set provided by the user for Andrew Chen's LinkedIn thread about building an "OpenClaw for personal finance."

Post URL:
- https://www.linkedin.com/posts/andrewchen_whos-working-on-this-idea-openclaw-for-share-7431152362750390272-f5j3

### Source notes

The user supplied the thread text directly, including comments from operators building in:
- personal finance
- wealth management
- accounting / finance ops
- open-source / local-first AI
- infrastructure / sovereign compute
- risk, compliance, and fintech

This is a valuable qualitative sample because it includes both builders enthusiastic about the opportunity and experienced operators skeptical of the execution and trust profile.

### Observable market themes

#### 1. People want a persistent financial advisor, not another generic chatbot

The strongest positive reaction was to the idea of software that feels like a financially literate companion with current awareness of the user's real situation.

Implication for ClearMoney:
- continuity and memory are core product value
- recurring briefings and "what changed" summaries matter
- a stateless question-answering experience is not enough

#### 2. Privacy remains a gating issue

Several comments raised concern about giving an AI system broad visibility into highly sensitive personal finance data.

Implication for ClearMoney:
- privacy must be explicit, configurable, and productized
- hosted-only trust assumptions will limit adoption for some users
- local-first, private workspace, or hardened vault options deserve roadmap weight even if they are not day-one defaults

#### 3. Users are interested in insight, but wary of autonomous action without control

The thread showed enthusiasm for richer guidance, but not unconditional trust in systems making money moves autonomously.

Implication for ClearMoney:
- draft-first action design is correct
- autonomy needs clear user-selectable modes
- "always ask before acting" should remain an easy default

#### 4. Source quality matters more than source count

A visible line of discussion compared the concept to a consumer Bloomberg Terminal. The useful takeaway is not "ingest everything." It is "assemble high-signal, current, decision-relevant context."

Implication for ClearMoney:
- curate authoritative data aggressively
- separate research context from decision-grade context
- avoid pretending weak external data is equal to linked-account or reviewed-document data

#### 5. The market wants orchestration and synthesis

The excitement was less about one more dashboard and more about software that can synthesize many moving parts into timely, useful judgment.

Implication for ClearMoney:
- the system should prioritize coordination across accounts, goals, taxes, entities, and pending actions
- "what matters now?" is a better experience target than "show me all my data"

#### 6. Deterministic layers are seen as mandatory

Multiple operators in the thread independently made the same point: the LLM layer can help orchestrate or explain, but the financial truth layer needs to be deterministic.

Signal examples from the thread:
- "all the context is computed deterministically"
- "AI doesn't solve it without a proper deterministic layer"
- "there's not much room to be wrong if you want to maintain trust"
- "LLMs have limitations today (time-series data)"

Implication for ClearMoney:
- deterministic calculators should be treated as core IP
- the product should explicitly separate deterministic facts from inferred or speculative judgment
- recommendation confidence should reflect this boundary

#### 7. Compliance is viewed as the gating function, not an edge concern

Many comments effectively said the same thing in different language:
- compliance is the killer word
- the trust layer is the actual product challenge
- technology is not the bottleneck

Implication for ClearMoney:
- compliance architecture must shape the roadmap, not trail behind it
- every proposed capability should be classified by execution, custody, advice, privacy, and liability risk
- trust mode, permissioning, and auditability are category primitives

#### 8. Aggregators are considered a structural weakness

Several comments called out Plaid/Yodlee-style fragility directly:
- connections break
- auth flows change
- OAuth revocations wipe out continuity
- consumer-scale local data access is still underserved

Implication for ClearMoney:
- connectivity resilience needs to be treated as a product feature
- the context layer must survive partial connectivity loss
- manual, document-based, and screen-/portal-assisted recovery deserve deliberate roadmap weight

#### 9. Local-first and sovereign deployment have real demand

The thread included open-source and local-hosted examples, with explicit selling points:
- no cloud sync
- no third-party data sharing
- owner-controlled compute

Implication for ClearMoney:
- local-first is not just a hobbyist curiosity; it is a trust and adoption wedge for a meaningful segment
- even if ClearMoney remains primarily hosted, private workspace / sovereign deployment should stay on the roadmap

#### 10. Infrastructure may be more durable than a standalone app

Comments argued this should not be "just an app," but an infrastructure layer:
- verified APIs with trust scores
- mandate-based controls
- identity banks can verify
- owner-controlled compute

Implication for ClearMoney:
- Strata should continue evolving as a platform, not just an internal backend
- trust-scored connectors, context graphs, and mandate controls could become platform products

#### 11. Human behavior matters, not just optimization

One commenter called out the need for a crystal-clear understanding of human behavior. This aligns with existing financial-planning reality: mathematically optimal advice often fails if it ignores the user's actual decision style.

Implication for ClearMoney:
- behavioral context should be modeled alongside financial context
- the system should distinguish "incorrect" from "intentionally chosen"
- recommendation quality should include adoptability, not just theoretical optimality

#### 12. Execution feasibility is jurisdiction-dependent

Comments pointed out that some markets are much better positioned for real execution because of stronger financial rails and regulated open-finance infrastructure, for example Brazil with Pix and Open Finance.

Implication for ClearMoney:
- advisory and execution should have different geographic rollout logic
- the U.S. can remain draft-first longer
- markets with better rails may become earlier action-layer opportunities

#### 13. "Consumer Bloomberg Terminal" is both useful and dangerous framing

The framing resonated, but sophisticated commenters warned that most data APIs are too weak or noisy to support high-confidence decisioning unless curated heavily.

Implication for ClearMoney:
- the right target is not maximal data breadth
- the right target is high-signal, backtestable, decision-relevant context
- market/news/social/alternative data should be explicitly marked as contextual, not silently elevated to decision-grade evidence

#### 14. The interaction layer is an underappreciated moat

Several comments highlighted a practical truth: many financial workflows still live in portals, PDFs, and brittle interfaces.

Implication for ClearMoney:
- the action layer should support both API-native actions and guided or semi-automated interaction flows
- "software that can operate software the way a human analyst would" is strategically important for legacy finance surfaces

#### 15. The market is already crowded at the feature level

Boldin, Mezzi, Kudos, Worthy, Goin, Xero-adjacent products, NettWorth, and open-source projects all appeared in the thread. That means this category will not be won by saying "we connect to your accounts and use AI."

Implication for ClearMoney:
- differentiation must come from trust, rigor, continuity, and execution quality
- ClearMoney should not compete as a generic feature bundle
- it should compete as the most trustworthy full-context financial chief-of-staff system

### Product conclusions from the thread

The LinkedIn discussion reinforces and expands ClearMoney's direction:

1. Build the product around a persistent financial chief-of-staff experience.
2. Treat privacy architecture as a core product feature, not a compliance afterthought.
3. Keep user control in front of action autonomy.
4. Curate external sources instead of maximizing source breadth.
5. Invest in synthesis, prioritization, and continuity rather than just chat access.
6. Make the deterministic computation layer a first-class product and platform asset.
7. Treat aggregator fragility as a primary systems problem.
8. Support private / sovereign deployment paths for trust-sensitive segments.
9. Build Strata as infrastructure, not just app plumbing.
10. Model behavior and preference, not just financial facts.
11. Sequence execution rollouts by jurisdiction and rail maturity.

### Research note

This section now reflects the full comment set supplied by the user on March 11, 2026. It is still directional qualitative market signal rather than a statistically representative sample.

---

## Core Thesis

Useful data agents do not emerge from model quality alone. They depend on a maintained layer that gives them:
- The right facts
- The right definitions
- The right exceptions
- The right freshness guarantees
- The right permissions
- The right feedback loops

For ClearMoney, this matters even more than in general enterprise analytics because:
- financial recommendations are high-stakes
- data arrives from fragmented, messy, and stale sources
- users have intentional exceptions that look like "bad data" unless captured properly
- trust requires showing not just conclusions, but evidence chains
- execution requires policy gating, not just plausible answers
- privacy concerns can block adoption even when utility is obvious
- users want synthesis and continuity, not just data access
- aggregator and rail quality often determine product reality more than model quality does
- behaviorally realistic guidance is often more valuable than mathematically pure guidance

---

## Current ClearMoney Assessment

### What ClearMoney already does well

#### 1. Structured context assembly

ClearMoney already consolidates:
- user profile and financial memory
- investment, cash, debt, and physical assets
- holdings and recent transactions
- portfolio metrics
- freshness metadata

This is materially better than a text-only prompt or naive SQL lookup model.

#### 2. Durable derived memory

The platform already derives and stores:
- retirement savings
- debt profile
- mortgage details
- portfolio summary

This is the beginning of a durable context layer rather than purely ephemeral analysis.

#### 3. Traceability and guardrails

Decision traces, freshness checks, consent scopes, and action policies give ClearMoney a strong trust substrate relative to most consumer AI finance products.

#### 4. Domain packaging

Skill files and deterministic rules show the correct instinct: financial expertise should be packaged into reusable context-aware components.

#### 5. Human-in-the-loop action posture

ClearMoney's current emphasis on action intents, approval, and review is aligned with market feedback that users want control before autonomy.

### Where ClearMoney is still deficient

#### 1. Context is not yet fully durable

Important facts are still assembled on demand instead of being promoted into a governed, persistent graph with lifecycle states.

#### 2. Provenance is mixed

Recommendation traces are real, but some user-facing "show the math" experiences are still static methodology content rather than live per-user provenance.

#### 3. Corrections are under-modeled

Users can update memory, but corrections, disputes, overrides, and confirmed exceptions are not yet a first-class system with downstream learning.

#### 4. House knowledge is thin

Skills and heuristics exist, but there is not yet a sufficiently rich, versioned registry of:
- standard operating rules
- exception conditions
- founder-specific heuristics
- tax posture rules
- context prerequisites
- review playbooks

#### 5. Context quality is not visible enough

The system tracks freshness, but it does not yet fully quantify:
- completeness
- consistency
- evidence quality
- conflict levels
- recommendation readiness by domain

#### 6. Deterministic boundaries are not explicit enough

The system already contains deterministic checks, but it does not yet clearly productize which outputs are computed deterministically versus inferred by the model.

#### 7. Connectivity resilience is not yet strong enough

The current direction assumes integrations are available, but market feedback makes it clear that broken aggregators, revoked auth, and legacy portals are first-order problems.

---

## 10/10 Alignment Definition

ClearMoney reaches 10/10 alignment when the following statements are true:

1. Every major user-facing metric is backed by live provenance.
2. Every recommendation references canonical context objects and versioned rules.
3. Every context fact has source attribution, timestamping, and confidence semantics.
4. Every user correction becomes a durable context event with downstream effects.
5. Every high-risk inference can be reviewed, disputed, approved, or suppressed.
6. Every action is gated by context quality thresholds and policy checks.
7. Every skill, heuristic, and assumption is versioned and testable.
8. Every context slice can be exported portably with semantics and lineage.
9. Every high-impact financial claim explicitly declares whether it is deterministic, inferred, or speculative.
10. The system remains useful and context-preserving during partial integration failure.
11. Users can choose the trust mode and autonomy mode that match their risk tolerance.

---

## Required System Capabilities

### 1. Canonical Financial Context Graph

ClearMoney needs a canonical graph, not just a convenient assembled payload.

### Required node families
- Person
- Household
- Legal entity
- Account
- Position / holding
- Liability
- Income stream
- Expense pattern
- Tax document
- Equity grant
- Property / vehicle / alternative asset
- Goal
- Policy
- Consent
- Observation
- Recommendation
- Action intent
- Correction
- Review decision

### Required node semantics

Each node should explicitly distinguish:
- raw fact
- derived fact
- inferred fact
- user-declared fact
- reviewer-confirmed fact

### Required edge semantics
- belongs_to
- sourced_from
- derived_from
- supersedes
- invalidates
- supports
- conflicts_with
- reviewed_by
- gated_by

### Required metadata
- source system
- source type
- source reliability tier
- collected at
- effective at
- freshness SLA
- confidence
- reviewer status
- owner
- version
- invalidation trigger
- determinism class

---

### 2. Provenance Everywhere

ClearMoney should not settle for static explanatory UI.

Provenance also has a market-facing purpose: it is how ClearMoney can feel like a trustworthy "consumer Bloomberg Terminal" without becoming a noisy or over-claimed one.

### Provenance requirements by surface

#### Dashboard metrics
- exact inputs used
- formula version
- transformation steps
- stale dependencies
- missing dependencies
- confidence contributors

#### Advisor recommendations
- canonical context nodes used
- skill version
- heuristic versions
- policy version
- recommendation rationale
- blocked alternatives or rejected paths

#### Action intents
- action prerequisites
- readiness score
- context freeze snapshot
- expected outcome
- policy checks

#### Verification products
- evidence basis
- freshness window
- reviewer status
- proof generation method

#### Trust mode overlay
- whether context is hosted, private workspace, or local-first
- whether the source is direct integration, document extraction, manual input, or external research
- whether the output is safe for recommendation, draft execution, or informational context only

---

### 3. Typed Correction Loops

Generic "edit profile" support is necessary but insufficient.

### Correction types ClearMoney should model
- wrong fact
- stale fact
- missing fact
- wrong categorization
- wrong assumption
- wrong recommendation
- intentional exception
- disputed inference
- source mistrust
- execution mismatch

### Required correction lifecycle
1. User or reviewer reports issue
2. System classifies domain and severity
3. Related derivations are invalidated
4. Owner or automation resolves root cause
5. Affected recommendations and metrics are recomputed
6. Repeat-error rate is tracked

### Additional required distinction
- factual correction
- preference / behavior signal

The system must not collapse these into one bucket.

### Why this matters

Without typed correction loops, the system learns almost nothing from failure and cannot become more trustworthy over time.

---

### 4. Institutional Knowledge Registry

ClearMoney needs a maintained corpus of knowledge that outlives any one prompt or engineer.

### Registry categories
- metric definitions
- deterministic rules
- heuristic rules
- exception policies
- founder-specific playbooks
- tax posture guidance
- context prerequisites
- execution policies
- reviewer playbooks
- prompt fragments

### Required fields per registry item
- name
- type
- owner
- status
- jurisdiction
- effective dates
- evidence / research basis
- required context
- excluded scenarios
- tests / eval cases
- changelog

### Example

Instead of a vague emergency fund heuristic, the registry should encode:
- default threshold
- founder override logic
- seasonal-income exceptions
- high-interest debt precedence
- confidence downgrade rules when expense visibility is incomplete
- behavioral exceptions for users who knowingly prioritize liquidity, optionality, or debt aversion over mathematical optimization

---

### 5. Context Quality Scoring

ClearMoney should compute context quality, not imply it vaguely.

### Domain-level quality dimensions
- completeness
- freshness
- consistency
- evidence quality
- override density
- review coverage
- recommendation readiness

### Domains to score separately
- cash flow
- debt
- investment allocation
- retirement
- tax
- founder runway
- commingling
- equity compensation
- physical assets
- connectivity continuity
- behavioral fit

### Product implications
- low-quality domains should produce softer advice, clearer warnings, or explicit blocks
- high-quality domains should unlock stronger recommendations and execution capabilities
- authoritative-source domains should be visually distinguished from speculative or research-only domains

---

### 5.1 Privacy and Trust Modes

Because personal finance is unusually sensitive, context-native systems need explicit trust modes.

### Recommended trust modes
- hosted default
- hardened private workspace
- future local-first / personal vault mode
- ephemeral / vanish mode for sensitive exploratory conversations
- sovereign / enterprise-controlled deployment for partners or regulated channels

### Requirements
- clear explanation of where context lives
- clear explanation of what is persisted vs. ephemeral
- scoped consent by capability and surface
- easy export and revocation

---

### 5.2 User Control Over Autonomy

Users may want an advisor with full context without wanting full automation.

### Recommended autonomy modes
- observe only
- summarize only
- recommend only
- draft actions
- require approval for every action
- bounded pre-authorization for specific action classes
- market-specific execution profiles depending on local rails and regulatory posture

### Product rule

ClearMoney should default to a mode that preserves user trust and progressively earn the right to automate more.

---

### 5.3 Connectivity Resilience

Given the market feedback on broken aggregators and brittle portals, connectivity resilience must be its own design concern.

### Requirements
- surface connection health prominently
- preserve advisory continuity when a source goes stale
- support manual and document-based substitution
- support screen-/portal-assisted recovery where appropriate
- record degraded-confidence states instead of silently dropping context

---

### 6. Human Review Infrastructure

High-trust financial agents need reviewable decision infrastructure.

### Internal review surfaces required
- unresolved conflicts
- high-impact low-confidence recommendations
- sensitive tax inferences
- entity separation disputes
- commingling risk classifications
- source reliability issues
- repeat correction clusters

### Review actions required
- approve
- reject
- suppress
- attach exception
- change owner
- request user clarification
- mark as training signal

---

### 7. Portability and Interoperability

If ClearMoney wants to become the system of record, its context must travel.

### Export requirements
- semantic structure
- provenance metadata
- reviewer status
- user overrides
- confidence data
- policy bindings where relevant

### Strategic value
- enables trust products
- supports third-party agents
- strengthens user ownership posture
- creates platform leverage for Strata

---

## Roadmap Implications

### P0 Research-Backed Product Moves

### Move 1: Upgrade "Show the Math" from static methodology to live provenance

Why:
- This is the cleanest way to make ClearMoney visibly more honest than competitors.

Needed:
- metric provenance API
- formula versioning
- confidence decomposition
- UI for stale and missing dependencies

### Move 2: Create a correction engine

Why:
- Without it, the context layer does not improve when users disagree.

Needed:
- correction taxonomy
- invalidation logic
- resolution workflows
- repeat-error analytics

### Move 3: Build the knowledge registry

Why:
- Skills alone are too shallow for long-term defensibility.

Needed:
- versioned heuristic storage
- review ownership
- research linkage
- eval harness

### Move 4: Introduce context quality gates

Why:
- ClearMoney should sometimes refuse to act or should explicitly downgrade certainty.

Needed:
- per-domain quality scores
- thresholds for recommendation strength
- action readiness policies

### Move 5: Add explicit source-tiering and privacy modes

Why:
- market demand exists, but trust fails when privacy and source quality are vague

Needed:
- source quality taxonomy
- research-vs-decision boundary
- user-visible trust mode controls
- roadmap path for hardened private or local-first deployments

### Move 6: Productize the deterministic core

Why:
- the market clearly expects LLM orchestration to sit on top of deterministic financial truth

Needed:
- determinism classification in trace payloads
- deterministic services for taxes, liabilities, runway, and allocation
- UI that explains what is computed versus inferred

### Move 7: Build connectivity resilience as a feature

Why:
- aggregator failure is common enough to be a category-level problem

Needed:
- connection continuity states
- recovery workflows
- fallback data ingestion
- degraded-confidence recommendation policies

---

## Open Research Questions

These need follow-up research before full implementation:

1. Which financial domains benefit most from full graph modeling first: tax, runway, debt, or allocation?
2. What is the smallest useful correction taxonomy that still yields high-quality learning signals?
3. How should confidence be computed so it is rigorous without becoming incomprehensible to users?
4. Which provenance surfaces should be public-facing versus support-only?
5. Which parts of the knowledge registry should be encoded deterministically versus prompt-guided?
6. How should founder/entity exceptions be represented so they improve recommendations without creating policy ambiguity?
7. What interoperability standard should be the base for portable context: internal schema first, JSON-LD first, or FPP-first?

---

## Recommended Follow-On Research Docs

The following documents should be created or expanded next:

1. `docs/research/context-graph-schema.md`
2. `docs/research/provenance-and-trace-model.md`
3. `docs/research/correction-taxonomy.md`
4. `docs/research/house-knowledge-registry.md`
5. `docs/research/context-quality-scoring.md`
6. `docs/research/founder-exception-policies.md`
7. `docs/research/portable-context-and-fpp.md`

---

## Product Principle Derived from This Research

**If ClearMoney cannot explain a recommendation in terms of durable context, live lineage, current policy, and explicit uncertainty, it should not present that recommendation as strong guidance.**
