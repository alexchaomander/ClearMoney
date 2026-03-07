# Data Retention Policy

## Overview

ClearMoney retains user financial data only as long as necessary to provide the service. Users can request data deletion at any time.

## Retention Periods

| Data Category | Retention Period | Notes |
|---------------|-----------------|-------|
| User account info | Until account deletion | Email, Clerk ID, preferences |
| Financial transactions | Until account deletion | Synced from Plaid/SnapTrade |
| Account balances & snapshots | Until account deletion | Historical balance tracking |
| AI advisor conversations | 90 days | Automatically purged after 90 days |
| Session data (Redis) | 15 minutes | Ephemeral, auto-expires via TTL |
| Audit logs | 1 year | Access logs for compliance |
| Analytics events (PostHog) | Per PostHog retention settings | Anonymized, consent-gated |
| Waitlist signups | Until product launch or 1 year | Email + source only |

## Account Deletion

When a user requests account deletion:

1. All user-owned records are permanently deleted from PostgreSQL
2. Redis session data expires naturally (15-minute TTL)
3. Sentry data is retained per Sentry's own retention policy (anonymized)
4. PostHog data is anonymized (user ID stripped)
5. Git history and backups may contain encrypted references — these are purged on the next backup rotation cycle

## Data Export

Users can export their data in JSON format via the account settings page. The export includes:
- Account balances and metadata
- Transaction history
- AI advisor conversation history
- Consent grants

## Compliance Notes

- All credential tokens (Plaid, SnapTrade) are encrypted at rest with Fernet symmetric encryption
- No raw financial credentials are stored — only provider-issued access tokens
- Data is not sold or shared with third parties
- Analytics are consent-gated (PostHog only initializes after user grants consent)
