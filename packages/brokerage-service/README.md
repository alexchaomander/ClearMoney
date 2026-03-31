# Brokerage Service

Internal FastAPI service for brokerage connectivity. This package owns:

- SnapTrade link-session creation
- SnapTrade callback credential shaping
- Brokerage account, holding, and transaction normalization
- SnapTrade-side connection deletion

It is intended to run as a separate deployable service from `packages/strata-api`
so provider-specific dependencies and security posture are isolated from the core API.

## Local Setup

```bash
cd packages/brokerage-service
uv venv --python 3.12
uv pip install --python .venv/bin/python -e ".[dev]"
uvicorn app.main:app --reload --port 8010
```

## Required Environment Variables

- `BROKERAGE_INTERNAL_TOKEN`
- `BROKERAGE_SNAPTRADE_CLIENT_ID`
- `BROKERAGE_SNAPTRADE_CONSUMER_KEY`
