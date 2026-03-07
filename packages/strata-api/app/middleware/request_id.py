"""Middleware that attaches a unique request ID to every request/response.

The ID is propagated via the ``X-Request-Id`` header so that frontend and
backend logs can be correlated.  If the caller already supplies the header
(e.g. from a frontend trace), that value is reused.
"""

import uuid
from collections.abc import Callable

from starlette.types import ASGIApp, Message, Receive, Scope, Send

REQUEST_ID_HEADER = b"x-request-id"


class RequestIdMiddleware:
    def __init__(self, app: ASGIApp) -> None:
        self.app = app

    async def __call__(self, scope: Scope, receive: Receive, send: Send) -> None:
        if scope["type"] not in ("http", "websocket"):
            await self.app(scope, receive, send)
            return

        # Extract or generate request ID
        request_id: str = ""
        for key, value in scope.get("headers", []):
            if key == REQUEST_ID_HEADER:
                request_id = value.decode()
                break
        if not request_id:
            request_id = str(uuid.uuid4())

        # Store on scope state so handlers can access via request.state.request_id
        scope.setdefault("state", {})["request_id"] = request_id

        async def send_with_request_id(message: Message) -> None:
            if message["type"] == "http.response.start":
                headers = list(message.get("headers", []))
                headers.append((REQUEST_ID_HEADER, request_id.encode()))
                message["headers"] = headers
            await send(message)

        await self.app(scope, receive, send_with_request_id)
