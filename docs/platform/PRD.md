# Strata API — Platform PRD

**Version:** 1.0
**Author:** Product Team
**Last Updated:** January 2026
**Status:** Draft

---

## 1. Executive Summary

The Strata API is a multi-tenant financial connectivity platform that enables consumer applications to access, normalize, and analyze their users' financial data from multiple institutions. By abstracting the complexity of integrating with data providers (Plaid, MX, Finicity, FDX), the platform provides a unified API that any app can consume to deliver personalized, data-driven financial guidance. The platform differentiates through its decision trace system—a transparency layer that explains exactly how recommendations are generated, building user trust through explainability.

**Key Value Propositions:**

1. **Unified API**: Single integration point for all financial data providers, eliminating the need for apps to manage multiple provider SDKs
2. **Multi-Tenant Architecture**: Complete data isolation between apps with per-app API keys, enabling multiple consumer applications to share infrastructure
3. **Explainable Recommendations**: Decision trace system that shows users exactly what data and rules drove each recommendation, building trust through transparency
4. **Provider Resilience**: Automatic failover between providers with health-based routing, ensuring high availability even when individual providers have outages
5. **Compliance-Ready**: Built-in consent management, audit logging, and data lifecycle controls to meet SOC 2, GDPR, and CCPA requirements

---

## 2. Problem Statement

### What problem are we solving?

Consumer financial applications need access to users' financial data to provide personalized guidance. Today, each app must:
- Integrate with multiple data aggregation providers (Plaid, MX, Finicity, etc.)
- Build and maintain normalization logic for each provider's data format
- Handle connection failures, re-authentication flows, and data freshness
- Manage consent and comply with privacy regulations
- Explain recommendations to users in a trustworthy way

This creates significant engineering overhead and inconsistent user experiences across apps.

### Who experiences this problem?

1. **App Development Teams**: Spend 3-6 months integrating financial data providers instead of building core product features
2. **End Users**: Experience inconsistent data quality, unexplained recommendations, and confusion about how their data is used
3. **Compliance Teams**: Struggle to audit data access patterns across multiple provider integrations
4. **Product Managers**: Cannot quickly test hypotheses because data infrastructure takes too long to build

### What's the cost of not solving it?

- **Time to Market**: Apps delay launch by 3-6 months to build data infrastructure
- **Engineering Cost**: Each app spends $200K-$500K on aggregation infrastructure that could be shared
- **User Trust**: 67% of users report discomfort with financial apps that don't explain how recommendations are generated (internal research)
- **Compliance Risk**: Ad-hoc integrations often miss consent requirements, creating regulatory exposure
- **Fragmented Experience**: Users connecting the same accounts to multiple apps have inconsistent data quality

---

## 3. Goals and Non-Goals

### Goals (in priority order)

1. **G1: Unified Multi-Provider API**: Abstracting Plaid, SnapTrade, and others.
2. **G2: Strata Action Layer (SAL)**: Standardizing financial actions (ACH, ACATS) as programmable primitives.
3. **G3: Radical Transparency**: Decision trace system for trust and auditability.
4. **G4: Agentic Interoperability**: Financial Portability Protocol (FPP) for cross-agent data mobility.

### Non-Goals (explicitly out of scope)

- **NG1: Building a competing aggregator**: We use Plaid/SnapTrade.
- **NG2: Storing raw transaction descriptions**: We prioritize privacy and normalization.
- **NG3: Non-US support in MVP**.

---

## 4. User Personas

### Persona 1: Alex Chen — App Developer

**Background:**
- Senior software engineer at a fintech startup building a budgeting app
- 8 years of experience, primarily in backend development
- Has integrated with Plaid before but found it time-consuming

**Goals:**
- Ship the MVP in 3 months, not 6
- Avoid becoming an expert in financial data normalization
- Focus on building unique product features, not infrastructure

**Pain Points:**
- Previous Plaid integration took 6 weeks and still has edge cases
- Different providers return data in incompatible formats
- Handling connection errors gracefully is surprisingly complex
- Documentation is scattered across multiple provider sites

**How We Help:**
- Single SDK with unified data models
- Comprehensive documentation with code samples
- Built-in error handling and retry logic
- Sandbox environment with realistic test data

---

### Persona 2: Sarah Martinez — End User

**Background:**
- 34-year-old marketing manager using a financial wellness app
- Has 5 financial accounts across 3 institutions
- Wants to improve her savings rate but doesn't know where to start

**Goals:**
- Get personalized recommendations based on her actual spending
- Understand why recommendations are relevant to her situation
- Feel confident her financial data is secure

**Pain Points:**
- Manual budgeting is tedious and she stops after 2 weeks
- Generic advice doesn't account for her specific situation
- Doesn't trust apps that feel like "black boxes"
- Worried about connecting her bank accounts

**How We Help:**
- Automatic data sync eliminates manual entry
- Recommendations based on real transaction patterns
- "Why this?" explains exactly how recommendations are generated
- Clear consent flows and ability to revoke access anytime

---

### Persona 3: Jennifer Park — Compliance Officer

**Background:**
- Head of Compliance at a Series B fintech company
- Responsible for SOC 2, GDPR, and state privacy law compliance
- Previously worked at a bank with strict data governance requirements

**Goals:**
- Ensure user data is handled according to regulations
- Maintain audit trail for all data access
- Respond quickly to user data requests (access, deletion)

**Pain Points:**
- Engineering teams implement data handling inconsistently
- Audit logs are incomplete or hard to query
- User consent records are scattered across systems
- Data deletion requests take weeks to process

**How We Help:**
- Centralized consent ledger with full history
- Automatic audit logging of all API calls
- Built-in data export and deletion APIs
- Compliance dashboard with real-time visibility

---

### Persona 4: Marcus Thompson — Platform Admin

**Background:**
- DevOps engineer responsible for the Strata platform
- Monitors system health, onboards new apps, and manages provider relationships
- Previously managed infrastructure at an ad-tech company

**Goals:**
- Ensure platform uptime and performance SLAs
- Quickly identify and resolve provider issues
- Efficiently onboard new app customers

**Pain Points:**
- Provider health varies and affects downstream apps
- Manual onboarding process is error-prone
- Alert fatigue from noisy monitoring
- Difficult to attribute issues to specific providers

**How We Help:**
- Provider health dashboard with real-time metrics
- Automated failover between providers
- Streamlined app onboarding workflow
- Intelligent alerting based on impact, not just symptoms

---

### Persona 5: David Kim — Product Manager (App Company)

**Background:**
- PM at a personal finance app with 50K monthly active users
- Focused on improving activation and retention metrics
- Wants to launch new features based on connected account data

**Goals:**
- Understand which features drive engagement
- Measure the impact of data-driven recommendations
- Iterate quickly on new recommendation types

**Pain Points:**
- Can't tell which recommendations users find valuable
- Feature experiments take too long to implement
- Limited visibility into data quality issues affecting users
- Hard to correlate data freshness with user satisfaction

**How We Help:**
- Decision trace analytics show recommendation performance
- Webhook events enable real-time feature measurement
- Data quality dashboard surfaces freshness issues
- A/B testing support for recommendation rules

---

## 5. Use Cases

### UC1: App Registration and API Key Generation

**Actor:** App Developer (Alex)

**Precondition:**
- Developer has signed platform terms of service
- Developer has a verified business email

**Flow:**
1. Developer accesses the Platform Admin Console
2. Developer creates a new app, providing name, description, and redirect URLs
3. Platform generates a unique `app_id` and API key pair (public/secret)
4. Developer configures allowed scopes (balances, transactions, holdings, etc.)
5. Platform provisions isolated data stores for the app
6. Developer downloads SDK and begins integration

**Postcondition:**
- App is registered with unique credentials
- Isolated data stores are provisioned
- Developer can make authenticated API calls

**Success Criteria:**
- Registration completes in <5 minutes
- API key works immediately (no propagation delay)
- Sandbox environment is available for testing

---

### UC2: First-Time Account Connection (End User)

**Actor:** End User (Sarah) via Consumer App

**Precondition:**
- User has installed the consumer app
- App has integrated the Strata SDK
- User has at least one financial institution account

**Flow:**
1. User taps "Connect Account" in the app
2. App calls Platform API to initiate connection flow
3. Platform returns a secure connection URL
4. User is redirected to institution selection screen
5. User selects their institution (e.g., Chase)
6. Platform routes to best available provider based on health and coverage
7. User authenticates with their institution credentials
8. User reviews and grants consent for requested data scopes
9. Platform stores consent record and initiates data sync
10. User is redirected back to app with success confirmation
11. Platform syncs initial data (balances, transactions) in background
12. App receives webhook notification when sync completes

**Postcondition:**
- Connection record exists in platform
- Consent is recorded with timestamp and scopes
- Initial data sync is complete or in progress
- User sees their accounts in the app

**Success Criteria:**
- End-to-end flow completes in <60 seconds
- Connection success rate >90%
- User understands what data they're sharing

---

### UC3: Viewing Synced Financial Data (App Queries Platform)

**Actor:** Consumer App (on behalf of user)

**Precondition:**
- User has connected at least one account
- Initial sync has completed
- App has valid API credentials

**Flow:**
1. App calls `GET /v1/users/{user_id}/accounts` with app API key
2. Platform validates app credentials and user association
3. Platform checks data freshness and returns accounts with freshness metadata
4. App requests balances: `GET /v1/users/{user_id}/balances`
5. Platform returns normalized balances with confidence scores
6. App requests transactions: `GET /v1/users/{user_id}/transactions?start_date=...`
7. Platform returns categorized transactions with merchant normalization
8. App renders data in user interface with freshness indicators

**Postcondition:**
- App has current financial data for the user
- API calls are logged for audit
- Freshness metadata allows app to show data age

**Success Criteria:**
- API response time p95 <500ms
- Data includes freshness timestamps
- Consistent data format regardless of underlying provider

---

### UC4: Receiving Data-Driven Recommendation

**Actor:** End User (Sarah) via Consumer App

**Precondition:**
- User has connected accounts with recent data
- App has configured recommendation rules
- User has sufficient data for the recommendation type

**Flow:**
1. App requests recommendations: `GET /v1/users/{user_id}/recommendations`
2. Platform evaluates user's financial data against configured rules
3. Platform generates decision trace for each applicable recommendation
4. Platform calculates confidence score based on data freshness and completeness
5. Platform returns recommendations with traces and confidence
6. App displays recommendations sorted by priority and confidence
7. User sees "Build your emergency fund" with confidence 92%
8. User taps recommendation to see details

**Postcondition:**
- User received personalized recommendations
- Each recommendation has an associated decision trace
- Recommendation event is logged for analytics

**Success Criteria:**
- Recommendations are relevant (user rating >4.0/5.0)
- Confidence scores accurately reflect data quality
- Low-confidence recommendations are appropriately flagged

---

### UC5: Exploring "Why This Recommendation?" (Decision Trace)

**Actor:** End User (Sarah) via Consumer App

**Precondition:**
- User has received a recommendation
- Recommendation includes a decision trace
- App has implemented the trace viewer UI

**Flow:**
1. User taps "Why this?" on a recommendation
2. App calls `GET /v1/recommendations/{id}/trace`
3. Platform returns full decision trace including:
   - Input data used (with sources and timestamps)
   - Rules evaluated (with pass/fail status)
   - Assumptions made (with source: default, calculated, user-provided)
   - Confidence breakdown by factor
4. App renders trace in an explainer drawer
5. User sees: "Based on your Chase Savings balance of $8,500..."
6. User understands the recommendation is based on real data
7. User can see which assumptions they could override

**Postcondition:**
- User understands why recommendation was generated
- Trust is built through transparency
- User knows what data to update for different results

**Success Criteria:**
- Trace is complete and understandable
- All data sources are attributed
- User can identify actionable changes

---

### UC6: Revoking Consent and Deleting Data

**Actor:** End User (Sarah) via Consumer App

**Precondition:**
- User has an active connection
- User wants to disconnect and remove their data
- App provides consent management UI

**Flow:**
1. User navigates to "Connected Accounts" in app settings
2. User selects a connection and taps "Disconnect"
3. App calls `DELETE /v1/connections/{id}` with user confirmation
4. Platform records consent revocation with timestamp
5. Platform initiates data deletion workflow:
   - Mark connection as revoked
   - Queue deletion of associated data
   - Notify provider to revoke access tokens
6. Platform deletes all user data for that connection within 24 hours
7. App receives webhook confirming deletion complete
8. User sees confirmation that their data has been removed

**Postcondition:**
- Connection is revoked and recorded in consent ledger
- All associated data is deleted
- Provider access tokens are invalidated
- Audit trail preserved (without PII)

**Success Criteria:**
- Deletion completes within 24 hours
- No residual user data remains
- Audit trail shows compliant handling

---

### UC7: Handling Connection Errors and Re-Authentication

**Actor:** End User (Sarah) via Consumer App

**Precondition:**
- User has an existing connection
- Institution credentials have changed or session expired
- Platform has detected authentication failure

**Flow:**
1. Platform detects authentication error during scheduled sync
2. Platform updates connection status to `needs_reauth`
3. Platform sends webhook to app: `connection.needs_reauth`
4. App displays notification to user: "Chase connection needs attention"
5. User taps notification to reconnect
6. App initiates re-authentication flow via Platform SDK
7. User re-enters credentials at institution
8. Platform validates new credentials and resumes sync
9. Platform updates connection status to `active`
10. App receives webhook: `connection.reconnected`
11. User sees refreshed data in app

**Postcondition:**
- Connection is restored to active status
- Data sync resumes from where it left off
- User experience disruption is minimized

**Success Criteria:**
- User notified within 15 minutes of auth failure
- Re-authentication flow completes in <30 seconds
- Data sync resumes automatically after re-auth

---

## 6. User Stories

### Epic: App Onboarding

| ID | User Story | Priority |
|----|------------|----------|
| AO-1 | As an **app developer**, I want to register my app in under 5 minutes so that I can start integrating immediately | P0 |
| AO-2 | As an **app developer**, I want API keys that work in both sandbox and production so that I can test before going live | P0 |
| AO-3 | As an **app developer**, I want comprehensive documentation with code samples so that I can integrate without contacting support | P0 |
| AO-4 | As an **app developer**, I want to configure allowed data scopes so that I only request data my app needs | P1 |
| AO-5 | As a **platform admin**, I want to review and approve app registrations so that we maintain platform quality | P1 |

### Epic: Account Connection

| ID | User Story | Priority |
|----|------------|----------|
| AC-1 | As an **end user**, I want to connect my bank account in under 60 seconds so that I can start using the app quickly | P0 |
| AC-2 | As an **end user**, I want to understand what data I'm sharing before I connect so that I feel confident about my privacy | P0 |
| AC-3 | As an **end user**, I want to see which accounts were connected so that I can verify the right ones were linked | P0 |
| AC-4 | As an **app developer**, I want automatic provider selection based on reliability so that users have the best experience | P1 |
| AC-5 | As an **end user**, I want to connect multiple institutions so that I get a complete financial picture | P1 |

### Epic: Data Sync

| ID | User Story | Priority |
|----|------------|----------|
| DS-1 | As an **app developer**, I want to receive webhooks when syncs complete so that I can update my UI | P0 |
| DS-2 | As an **end user**, I want my data to refresh automatically so that recommendations stay current | P0 |
| DS-3 | As an **app developer**, I want to know how fresh the data is so that I can show appropriate warnings | P0 |
| DS-4 | As an **end user**, I want to manually refresh my data so that I can see recent transactions | P1 |
| DS-5 | As an **app developer**, I want historical transaction data (90+ days) so that I can analyze spending patterns | P1 |

### Epic: Recommendations

| ID | User Story | Priority |
|----|------------|----------|
| RC-1 | As an **end user**, I want personalized recommendations based on my actual data so that advice is relevant to me | P0 |
| RC-2 | As an **end user**, I want to understand why I received a recommendation so that I can trust it | P0 |
| RC-3 | As an **app developer**, I want to configure recommendation rules so that I can customize advice for my users | P1 |
| RC-4 | As an **end user**, I want to see how confident the system is in each recommendation so that I can prioritize | P1 |
| RC-5 | As a **product manager**, I want to measure recommendation engagement so that I can improve relevance | P2 |

### Epic: Consent Management

| ID | User Story | Priority |
|----|------------|----------|
| CM-1 | As an **end user**, I want to revoke access to my data at any time so that I stay in control | P0 |
| CM-2 | As a **compliance officer**, I want a complete audit trail of consent actions so that we can demonstrate compliance | P0 |
| CM-3 | As an **end user**, I want to export all my data so that I can see what the app knows about me | P1 |
| CM-4 | As an **end user**, I want to delete all my data so that I can exercise my privacy rights | P0 |
| CM-5 | As a **compliance officer**, I want consent records to include scope and timestamp so that we know exactly what was agreed | P1 |

### Epic: Developer Experience

| ID | User Story | Priority |
|----|------------|----------|
| DX-1 | As an **app developer**, I want SDK libraries for JavaScript and Python so that I can integrate in my stack | P0 |
| DX-2 | As an **app developer**, I want a sandbox environment with test data so that I can develop without real accounts | P0 |
| DX-3 | As an **app developer**, I want clear error messages so that I can debug issues quickly | P0 |
| DX-4 | As an **app developer**, I want rate limit information in responses so that I can implement appropriate backoff | P1 |
| DX-5 | As an **app developer**, I want OpenAPI specs so that I can generate type-safe clients | P1 |

---

## 7. Requirements

### Functional Requirements

| ID | Requirement | Priority | Notes |
|----|-------------|----------|-------|
| FR-01 | Platform shall support app registration with unique API credentials | P0 | MVP |
| FR-02 | Platform shall provide account connection flow supporting Plaid, MX, and Finicity | P0 | FDX in Phase 2 |
| FR-03 | Platform shall normalize financial data into unified schema | P0 | MVP |
| FR-04 | Platform shall sync data automatically on configurable schedule | P0 | Default: 4h for balances, 24h for transactions |
| FR-05 | Platform shall provide webhook notifications for sync events | P0 | MVP |
| FR-06 | Platform shall maintain consent ledger with full history | P0 | MVP |
| FR-07 | Platform shall support data deletion within 24 hours of request | P0 | GDPR/CCPA requirement |
| FR-08 | Platform shall generate decision traces for all recommendations | P0 | Core differentiator |
| FR-09 | Platform shall calculate confidence scores based on data quality | P1 | Phase 1 |
| FR-10 | Platform shall support manual data refresh via API | P1 | Rate limited |
| FR-11 | Platform shall provide provider health metrics | P1 | Admin dashboard |
| FR-12 | Platform shall support automatic failover between providers | P1 | Phase 2 |
| FR-13 | Platform shall support data export in JSON format | P1 | User right to access |
| FR-14 | Platform shall provide sandbox environment with test data | P0 | MVP |
| FR-15 | Platform shall support OAuth 2.0 for app authentication | P0 | MVP |

### Non-Functional Requirements

| ID | Requirement | Target | Notes |
|----|-------------|--------|-------|
| NFR-01 | API read latency | p95 < 500ms | Excluding provider calls |
| NFR-02 | API write latency | p95 < 1000ms | Including validation |
| NFR-03 | Platform availability | 99.9% uptime | Excluding scheduled maintenance |
| NFR-04 | Connection success rate | > 90% | Averaged across providers |
| NFR-05 | Data sync freshness | 95% within SLA | Balances: 4h, Transactions: 24h |
| NFR-06 | Webhook delivery | 99% within 30s | Retry for 24h |
| NFR-07 | Data deletion | 100% within 24h | From request to completion |
| NFR-08 | Horizontal scalability | 10x current load | Without architecture changes |
| NFR-09 | Recovery time objective (RTO) | < 4 hours | From major incident |
| NFR-10 | Recovery point objective (RPO) | < 1 hour | Maximum data loss |

---

## 8. API Boundaries

### What the Platform Provides

1. **Unified Financial Data API**
   - Accounts, balances, transactions, holdings, liabilities
   - Normalized schema regardless of underlying provider
   - Freshness metadata and confidence scores

2. **Connection Lifecycle Management**
   - Account linking flows with provider abstraction
   - Re-authentication handling
   - Connection status monitoring

3. **Recommendation Engine**
   - Configurable rule evaluation
   - Decision trace generation
   - Confidence scoring

4. **Consent and Compliance**
   - Consent ledger with full history
   - Audit logging
   - Data export and deletion APIs

5. **Developer Tools**
   - SDKs for JavaScript, Python
   - Sandbox environment
   - Webhook management
   - Admin console

### What the Platform Does NOT Provide

1. **Consumer-Facing UI**
   - No embedded widgets or pre-built components
   - Apps build their own UX using our APIs

2. **Money Movement**
   - No payment initiation
   - No fund transfers
   - Read-only data access

3. **Financial Advice**
   - Provides data and decision traces
   - Apps interpret and present to users
   - No fiduciary responsibility

4. **Direct Bank Integrations**
   - Uses aggregator providers (Plaid, MX, etc.)
   - Does not connect directly to bank APIs

5. **Non-Financial Data**
   - No identity verification
   - No credit reports
   - Focus on financial accounts only

### Integration Patterns

| Pattern | Use Case | Implementation |
|---------|----------|----------------|
| **Sync API** | Fetching current data | REST API with pagination |
| **Async Webhooks** | Event notifications | HTTPS POST with retry |
| **Polling** | Fallback for webhook failures | Recommended interval: 60s |
| **SDK** | Preferred for connection flows | JavaScript (MVP); Python (Phase 2); iOS, Android (Phase 3) |
| **REST API** | Direct integration | OpenAPI 3.0 spec available |

---

## 9. Privacy and Security Posture

### Data Handling Principles

1. **Minimization**: Only collect and store data necessary for requested functionality
2. **Purpose Limitation**: Use data only for the purpose consented to by the user
3. **Encryption**: All data encrypted at rest (AES-256) and in transit (TLS 1.3)
4. **Isolation**: Complete data separation between apps (tenants)
5. **Auditability**: Every data access logged with purpose and actor
6. **Retention**: Data retained only while consent is active; deleted within 24h of revocation

### Compliance Requirements

| Framework | Applicability | Status |
|-----------|---------------|--------|
| SOC 2 Type II | All apps | Required for launch |
| GDPR | EU users | Required for EU expansion |
| CCPA | California users | Required for US launch |
| PCI DSS | N/A | Not applicable (no payment data) |
| GLBA | Financial data | Covered via provider compliance |

### User Rights

| Right | Implementation | SLA |
|-------|----------------|-----|
| **Right to Access** | `GET /v1/users/{id}/export` returns all user data in JSON | Within 48 hours |
| **Right to Delete** | `DELETE /v1/users/{id}` removes all user data | Within 24 hours |
| **Right to Revoke** | `DELETE /v1/connections/{id}` revokes specific consent | Immediate |
| **Right to Portability** | Export includes standard schema for interoperability | Same as access |
| **Right to Know** | Decision traces explain all data usage | Real-time |

### Security Controls

| Control | Implementation |
|---------|----------------|
| Authentication | API keys + JWT tokens; OAuth 2.0 for apps |
| Authorization | Role-based access control; scope-limited tokens |
| Encryption at Rest | AES-256 with customer-managed keys (enterprise) |
| Encryption in Transit | TLS 1.3 minimum; certificate pinning in SDKs |
| Secrets Management | AWS KMS for key management; HSM for token vault |
| Vulnerability Scanning | Weekly automated scans; annual penetration test |
| Access Logging | All API calls logged with retention of 2 years |

---

## 10. Phased Rollout Plan

### Phase 1: MVP (Weeks 1-8)

**Scope:**
- Single provider integration (Plaid)
- Core data types: accounts, balances, transactions
- Basic recommendation engine with decision traces
- Consent ledger and audit logging
- JavaScript SDK
- Sandbox environment

**Success Criteria:**
- 1 pilot app (ClearMoney) successfully integrated
- >90% connection success rate
- API latency p95 <500ms
- Zero security incidents

**Team Size:** 4 engineers, 1 PM, 1 designer

**Key Milestones:**
- Week 2: API design complete
- Week 4: Plaid integration working
- Week 6: SDK and documentation ready
- Week 8: Pilot app launched

---

### Phase 2: Multi-Provider (Weeks 9-16)

**Scope:**
- Add MX and Finicity providers
- Provider health monitoring and routing
- Automatic failover between providers
- Holdings and liabilities data types
- Python SDK
- Admin console for provider management

**Success Criteria:**
- 3 providers integrated with automatic routing
- >95% connection success rate (improved via failover)
- 2 additional apps onboarded
- Provider health dashboard operational

**Team Size:** 6 engineers, 1 PM, 1 designer

**Key Milestones:**
- Week 10: MX integration complete
- Week 12: Finicity integration complete
- Week 14: Health-based routing operational
- Week 16: 2 new apps in production

---

### Phase 3: Advisor-Grade (Weeks 17-24)

**Scope:**
- FDX direct connections (where available)
- Advanced recommendation rules (A/B testing)
- Enterprise features (SSO, custom encryption keys)
- Self-service app registration
- Mobile SDKs (iOS, Android)
- Comprehensive analytics dashboard

**Success Criteria:**
- FDX connections available for 50+ institutions
- 5+ apps in production
- Self-service onboarding <1 hour
- Recommendation engagement rate >30%

**Team Size:** 8 engineers, 1 PM, 1 designer, 1 DevRel

**Key Milestones:**
- Week 18: FDX integration complete
- Week 20: Self-service registration live
- Week 22: Mobile SDKs released
- Week 24: 5 apps in production

---

## 11. Success Metrics

### North Star Metric

**Recommendation Engagement Rate: >30%**

The percentage of users who take action on at least one recommendation within 30 days of receiving it. This metric captures both the relevance of recommendations (do users find them valuable?) and the trust in the platform (do users believe the recommendations?).

### Supporting Metrics

| Metric | Current | Target | Timeline |
|--------|---------|--------|----------|
| Connection success rate | N/A | >90% | MVP |
| Time to first insight | N/A | <5 minutes | MVP |
| API latency (p95) | N/A | <500ms | MVP |
| Data freshness (within SLA) | N/A | 95% | MVP |
| Decision trace "Why this?" click rate | N/A | >15% | Phase 1 |
| App integration time | N/A | <8 hours | Phase 1 |
| User trust score (survey)* | N/A | >4.0/5.0 | Phase 2 |
| Provider failover success rate | N/A | >99% | Phase 2 |
| Self-service onboarding completion | N/A | >80% | Phase 3 |

*\*User Trust Score Survey Methodology: Measured via in-app survey triggered after 30 days of active usage. Survey includes 3 questions on a 5-point Likert scale: (1) "I trust the recommendations this app provides" (2) "I understand why recommendations are made for me" (3) "I feel my financial data is secure." Score is the average across all three questions.*

### Guardrail Metrics (things we don't want to hurt)

| Metric | Threshold | Action if Breached |
|--------|-----------|-------------------|
| Security incidents | 0 critical/high | Immediate war room |
| Data deletion compliance | 100% within 24h | Engineering priority |
| API error rate | <1% | On-call investigation |
| User-reported privacy concerns | <0.1% of users | PM review and response |
| Provider cost per connection | <$0.50/month | Renegotiate or optimize |

---

## 12. Risks and Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| **Provider API deprecation** | Medium | High | Abstraction layer isolates changes; version pinning; monitor provider changelogs |
| **Provider pricing increases** | Medium | Medium | Multi-provider strategy enables negotiation; usage optimization |
| **Connection reliability issues** | High | High | Health-based routing; automatic failover; graceful degradation |
| **User privacy concerns** | Medium | High | Transparent consent flows; decision traces; easy revocation |
| **Regulatory changes** | Low | High | Compliance-first architecture; legal monitoring; modular consent |
| **Competitor launches similar offering** | Medium | Medium | Differentiate on transparency (decision traces); developer experience |
| **Scaling challenges** | Medium | Medium | Horizontal architecture from day 1; load testing; capacity planning |
| **Provider data quality issues** | High | Medium | Normalization layer; confidence scoring; data validation |
| **SDK adoption friction** | Medium | Medium | Comprehensive docs; quick-start guides; developer support |
| **Key employee departure** | Low | Medium | Documentation; cross-training; modular codebase |

---

## 13. Open Questions

- [ ] **Provider priority**: Should we prioritize MX or Finicity for Phase 2? Need coverage analysis.
- [ ] **FDX timeline**: When will FDX coverage be sufficient for direct connections? Monitor adoption.
- [ ] **Pricing model**: Per-connection, per-API-call, or flat fee? Need market research.
- [ ] **International expansion**: Which country after US? UK, Canada, or EU? Regulatory analysis needed.
- [ ] **Enterprise features**: What SSO providers should we support? Okta, Azure AD, others?
- [ ] **Recommendation rules**: How much customization should apps have? Build vs. configure tradeoff.
- [ ] **Historical data**: How far back should we support? 90 days, 1 year, 2 years?
- [ ] **Real-time updates**: Should we support push notifications for transactions? Provider capability varies.

---

## 14. Appendix

### Glossary

| Term | Definition |
|------|------------|
| **App** | A consumer application that integrates with the Strata API (tenant) |
| **Connection** | A link between an end user and a financial institution via a provider |
| **Provider** | A financial data aggregator (Plaid, MX, Finicity, FDX) |
| **Decision Trace** | A record of inputs, rules, and assumptions used to generate a recommendation |
| **Consent Ledger** | Immutable log of all user consent actions with timestamps and scopes |
| **Confidence Score** | A 0-1 value indicating reliability of data or recommendation based on freshness and completeness |
| **Token Vault** | Encrypted storage for provider access tokens with envelope encryption |

### Related Documents

| Document | Location | Description |
|----------|----------|-------------|
| Provider Abstraction Interface | `docs/platform/provider-interface.md` | Technical spec for provider integration |
| Provider Routing Strategy | `docs/platform/provider-routing.md` | Health-based routing and failover logic |
| Consent and Token Vault | `docs/platform/consent-and-vault.md` | Consent management and encryption |
| Decision Trace Model | `docs/platform/strata-events.md` | Event schema and replay semantics |
| Sync and Freshness | `docs/platform/sync-and-freshness.md` | Data sync cadence and confidence scoring |

### Competitive Analysis Summary

| Competitor | Strengths | Weaknesses | Our Differentiation |
|------------|-----------|------------|---------------------|
| **Plaid (direct)** | Market leader; wide coverage | Complex to integrate; no recommendation layer | Unified API; decision traces |
| **MX** | Strong analytics | Smaller coverage | Multi-provider routing |
| **Finicity** | Good for lending | Limited real-time | Better developer experience |
| **Yodlee** | Enterprise focus | Dated API; slow innovation | Modern architecture; transparency |
| **Akoya (FDX)** | Direct bank connections | Limited adoption | Hybrid approach; fallback to aggregators |

### Infrastructure Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              Consumer Apps                                   │
│                    (ClearMoney, App B, App C, ...)                          │
└─────────────────────────────────────┬───────────────────────────────────────┘
                                      │ REST API / SDK
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                         Strata API Gateway                            │
│                   (Authentication, Rate Limiting, Routing)                   │
└─────────────────────────────────────┬───────────────────────────────────────┘
                                      │
         ┌────────────────────────────┼────────────────────────────┐
         ▼                            ▼                            ▼
┌─────────────────┐        ┌─────────────────┐        ┌─────────────────┐
│  Connection     │        │  Data           │        │  Recommendation │
│  Service        │        │  Service        │        │  Engine         │
│                 │        │                 │        │                 │
│ - Link accounts │        │ - Sync data     │        │ - Evaluate rules│
│ - Manage tokens │        │ - Normalize     │        │ - Generate trace│
│ - Health check  │        │ - Store         │        │ - Score conf.   │
└────────┬────────┘        └────────┬────────┘        └────────┬────────┘
         │                          │                          │
         ▼                          ▼                          ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                           Provider Abstraction Layer                         │
│                    (Unified interface for all providers)                     │
└─────────────────────────────────────┬───────────────────────────────────────┘
                                      │
         ┌────────────┬───────────────┼───────────────┬────────────┐
         ▼            ▼               ▼               ▼            ▼
    ┌─────────┐  ┌─────────┐   ┌───────────┐   ┌─────────┐   ┌─────────┐
    │  Plaid  │  │   MX    │   │ Finicity  │   │   FDX   │   │ Future  │
    └─────────┘  └─────────┘   └───────────┘   └─────────┘   └─────────┘
```

---

*Document version 1.0. For questions, contact the Platform Product team.*
