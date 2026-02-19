import os
from collections.abc import AsyncGenerator

# Set a test encryption key before app modules are imported
os.environ.setdefault(
    "STRATA_CREDENTIALS_ENCRYPTION_KEY",
    "mkAPXR0pVobXiUOdyOROwMx-Cn_o17eqzjjHUBWUURM=",  # test-only key
)
os.environ.setdefault("STRATA_ENABLE_BACKGROUND_JOBS", "false")
os.environ.setdefault("STRATA_AUTO_CONSENT_ON_MISSING", "true")

import pytest  # noqa: E402
from sqlalchemy.ext.asyncio import (
    AsyncSession,
    async_sessionmaker,
    create_async_engine,
)

from app.db.base import Base
from app.db.session import get_async_session
from app.main import app

# Import all models so Base.metadata is populated
from app.models import (  # noqa: F401
    AgentSession,
    BankTransaction,
    CashAccount,
    Connection,
    ConsentGrant,
    DebtAccount,
    FinancialMemory,
    Holding,
    IncomeSource,
    Institution,
    InvestmentAccount,
    MemoryEvent,
    PortfolioSnapshot,
    Recommendation,
    Security,
    ShareReport,
    Transaction,
    User,
)

TEST_DATABASE_URL = "sqlite+aiosqlite:///:memory:"

engine = create_async_engine(TEST_DATABASE_URL, echo=False)
TestSessionFactory = async_sessionmaker(
    engine, class_=AsyncSession, expire_on_commit=False
)


@pytest.fixture(autouse=True)
async def setup_database() -> AsyncGenerator[None, None]:
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)


@pytest.fixture
async def session() -> AsyncGenerator[AsyncSession, None]:
    async with TestSessionFactory() as session:
        yield session


@pytest.fixture(autouse=True)
def override_get_async_session() -> None:
    async def _override() -> AsyncGenerator[AsyncSession, None]:
        async with TestSessionFactory() as session:
            yield session

    app.dependency_overrides[get_async_session] = _override


@pytest.fixture(autouse=True)
def setup_session_store() -> None:
    from app.services.session_store import InMemorySessionStore

    store = InMemorySessionStore()
    app.state.session_store = store
    yield
    app.state.session_store = InMemorySessionStore()
