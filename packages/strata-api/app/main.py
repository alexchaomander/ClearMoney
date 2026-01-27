from fastapi import FastAPI

from app.api.health import router as health_router
from app.core.config import settings

app = FastAPI(
    title=settings.app_name,
    version=settings.version,
    docs_url="/api/docs",
    openapi_url="/api/openapi.json",
)

app.include_router(health_router, prefix="/api/v1")
