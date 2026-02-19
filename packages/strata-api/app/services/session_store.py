"""Session store abstraction for SnapTrade link sessions.

Uses Redis when STRATA_REDIS_URL is configured, falls back to in-memory for local dev.
"""

from __future__ import annotations

import json
import logging
from abc import ABC, abstractmethod
from datetime import datetime, timezone
from typing import Any

import redis.asyncio as aioredis

logger = logging.getLogger(__name__)

DEFAULT_TTL_SECONDS = 900  # 15 minutes


class SessionStore(ABC):
    @abstractmethod
    async def set(self, key: str, value: dict[str, Any], ttl: int = DEFAULT_TTL_SECONDS) -> None: ...

    @abstractmethod
    async def get(self, key: str) -> dict[str, Any] | None: ...

    @abstractmethod
    async def delete(self, key: str) -> None: ...

    @abstractmethod
    async def close(self) -> None: ...


class InMemorySessionStore(SessionStore):
    """Simple dict-backed store for local development."""

    def __init__(self) -> None:
        self._store: dict[str, tuple[dict[str, Any], float]] = {}

    async def set(self, key: str, value: dict[str, Any], ttl: int = DEFAULT_TTL_SECONDS) -> None:
        expires_at = datetime.now(timezone.utc).timestamp() + ttl
        self._store[key] = (value, expires_at)

    async def get(self, key: str) -> dict[str, Any] | None:
        entry = self._store.get(key)
        if entry is None:
            return None
        value, expires_at = entry
        if datetime.now(timezone.utc).timestamp() > expires_at:
            del self._store[key]
            return None
        return value

    async def delete(self, key: str) -> None:
        self._store.pop(key, None)

    async def close(self) -> None:
        self._store.clear()


class RedisSessionStore(SessionStore):
    """Redis-backed store for production."""

    def __init__(self, redis_url: str) -> None:
        self._redis = aioredis.from_url(redis_url, decode_responses=True)

    async def set(self, key: str, value: dict[str, Any], ttl: int = DEFAULT_TTL_SECONDS) -> None:
        await self._redis.set(f"session:{key}", json.dumps(value), ex=ttl)

    async def get(self, key: str) -> dict[str, Any] | None:
        raw = await self._redis.get(f"session:{key}")
        if raw is None:
            return None
        return json.loads(raw)

    async def delete(self, key: str) -> None:
        await self._redis.delete(f"session:{key}")

    async def close(self) -> None:
        await self._redis.aclose()


def create_session_store(redis_url: str = "") -> SessionStore:
    """Factory: returns Redis store if URL is set, else in-memory."""
    if redis_url:
        logger.info("Using Redis session store")
        return RedisSessionStore(redis_url)
    logger.info("Using in-memory session store (set STRATA_REDIS_URL for production)")
    return InMemorySessionStore()
