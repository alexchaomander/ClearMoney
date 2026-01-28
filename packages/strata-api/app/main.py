from collections.abc import AsyncGenerator
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.accounts import router as accounts_router
from app.api.connections import router as connections_router
from app.api.health import router as health_router
from app.api.institutions import router as institutions_router
from app.api.portfolio import router as portfolio_router
from app.core.config import settings
from app.db.session import close_db


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None, None]:
    yield
    await close_db()


app = FastAPI(
    title=settings.app_name,
    version=settings.version,
    docs_url="/api/docs",
    openapi_url="/api/openapi.json",
    lifespan=lifespan,
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, restrict this to your frontend domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(health_router, prefix="/api/v1")
app.include_router(connections_router, prefix="/api/v1")
app.include_router(accounts_router, prefix="/api/v1")
app.include_router(institutions_router, prefix="/api/v1")
app.include_router(portfolio_router, prefix="/api/v1")
