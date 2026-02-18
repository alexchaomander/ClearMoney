import asyncio
import contextlib
from collections.abc import AsyncGenerator
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.accounts import router as accounts_router
from app.api.action_approval import router as action_approval_router
from app.api.action_intents import router as action_intents_router
from app.api.action_policy import router as action_policy_router
from app.api.advisor import router as advisor_router
from app.api.agent import router as agent_router
from app.api.banking import router as banking_router
from app.api.calculators import router as calculators_router
from app.api.cash_debt import router as cash_debt_router
from app.api.connections import router as connections_router
from app.api.consent import router as consent_router
from app.api.credit_cards import router as credit_cards_router
from app.api.data import router as data_router
from app.api.health import router as health_router
from app.api.institutions import router as institutions_router
from app.api.memory import router as memory_router
from app.api.notifications import router as notifications_router
from app.api.portability import router as portability_router
from app.api.portfolio import router as portfolio_router
from app.api.share_reports import router as share_reports_router
from app.api.skills import router as skills_router
from app.api.transactions import router as transactions_router
from app.core.config import settings
from app.db.session import close_db
from app.services.jobs.background import start_background_tasks
from app.services.session_store import create_session_store

# Initialise Sentry at module level so import-time and startup errors are
# captured before the ASGI lifespan even begins.
if settings.sentry_dsn:
    import sentry_sdk

    sentry_sdk.init(
        dsn=settings.sentry_dsn,
        traces_sample_rate=0.2,
        environment="production" if not settings.debug else "development",
    )


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None, None]:
    # Session store (Redis or in-memory)
    app.state.session_store = create_session_store(settings.redis_url)

    stop_event = None
    tasks = []
    if settings.enable_background_jobs:
        stop_event, tasks = await start_background_tasks()

    yield

    if stop_event:
        stop_event.set()
    for task in tasks:
        task.cancel()
        with contextlib.suppress(asyncio.CancelledError):
            await task
    await app.state.session_store.close()
    await close_db()


app = FastAPI(
    title=settings.app_name,
    version=settings.version,
    docs_url="/api/docs",
    openapi_url="/api/openapi.json",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_allow_origins,
    allow_credentials=settings.cors_allow_credentials,
    allow_methods=settings.cors_allow_methods,
    allow_headers=settings.cors_allow_headers,
)

# Include routers
app.include_router(health_router, prefix="/api/v1")
app.include_router(connections_router, prefix="/api/v1")
app.include_router(credit_cards_router, prefix="/api/v1/credit-cards", tags=["Credit Cards"])
app.include_router(accounts_router, prefix="/api/v1")
app.include_router(cash_debt_router, prefix="/api/v1")
app.include_router(consent_router, prefix="/api/v1")
app.include_router(institutions_router, prefix="/api/v1")
app.include_router(portfolio_router, prefix="/api/v1")
app.include_router(portability_router, prefix="/api/v1")
app.include_router(transactions_router, prefix="/api/v1")
app.include_router(memory_router, prefix="/api/v1")
app.include_router(notifications_router, prefix="/api/v1")
app.include_router(skills_router, prefix="/api/v1")
app.include_router(advisor_router, prefix="/api/v1")
app.include_router(share_reports_router, prefix="/api/v1")
app.include_router(agent_router, prefix="/api/v1")
app.include_router(action_intents_router, prefix="/api/v1")
app.include_router(action_policy_router, prefix="/api/v1")
app.include_router(action_approval_router, prefix="/api/v1")
app.include_router(banking_router, prefix="/api/v1")
app.include_router(calculators_router, prefix="/api/v1")
app.include_router(data_router, prefix="/api/v1")
