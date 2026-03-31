from fastapi import Request, Response
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.responses import JSONResponse

from app.core.config import settings


class MaintenanceMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next) -> Response:
        if settings.maintenance_mode and request.url.path != "/api/v1/health":
            return JSONResponse(
                status_code=503,
                content={
                    "detail": "System is undergoing scheduled maintenance. Please try again shortly."
                },
            )
        return await call_next(request)
