import asyncio
import logging
from datetime import datetime, timedelta, timezone

from sqlalchemy import or_, select

from app.core.config import settings
from app.db.session import async_session_factory
from app.models.connection import Connection, ConnectionStatus
from app.services.connection_sync import sync_connection_accounts
from app.services.portfolio_snapshots import create_daily_snapshots
from app.services.providers.snaptrade import SnapTradeProvider

logger = logging.getLogger(__name__)


def _get_provider_for_connection(connection: Connection) -> SnapTradeProvider:
    if connection.provider == SnapTradeProvider.provider_name:
        return SnapTradeProvider()
    return SnapTradeProvider()


async def run_connection_sync() -> None:
    cutoff = datetime.now(timezone.utc) - timedelta(
        minutes=settings.sync_stale_minutes
    )

    async with async_session_factory() as session:
        result = await session.execute(
            select(Connection).where(
                Connection.status == ConnectionStatus.active,
                or_(Connection.last_synced_at.is_(None), Connection.last_synced_at < cutoff),
            )
        )
        connections = result.scalars().all()

        for connection in connections:
            provider = _get_provider_for_connection(connection)
            try:
                await sync_connection_accounts(session, connection, provider)
                connection.status = ConnectionStatus.active
                connection.last_synced_at = datetime.now(timezone.utc)
                connection.error_code = None
                connection.error_message = None
            except Exception as exc:
                logger.warning("Sync failed for connection %s: %s", connection.id, exc)
                connection.status = ConnectionStatus.error
                connection.error_code = "SYNC_FAILED"
                connection.error_message = str(exc)[:1000]

        await session.commit()


async def run_daily_snapshots() -> None:
    async with async_session_factory() as session:
        created = await create_daily_snapshots(session)
        logger.info("Created %s portfolio snapshots", created)


async def _run_periodic_task(
    name: str,
    interval_seconds: int,
    task_fn,
    stop_event: asyncio.Event,
) -> None:
    while not stop_event.is_set():
        try:
            await task_fn()
        except Exception as exc:
            logger.exception("Background task %s failed: %s", name, exc)

        try:
            await asyncio.wait_for(stop_event.wait(), timeout=interval_seconds)
        except asyncio.TimeoutError:
            continue


async def start_background_tasks() -> tuple[asyncio.Event, list[asyncio.Task]]:
    stop_event = asyncio.Event()
    tasks = [
        asyncio.create_task(
            _run_periodic_task(
                "connection_sync",
                settings.sync_interval_seconds,
                run_connection_sync,
                stop_event,
            )
        ),
        asyncio.create_task(
            _run_periodic_task(
                "portfolio_snapshots",
                settings.snapshot_interval_seconds,
                run_daily_snapshots,
                stop_event,
            )
        ),
    ]
    return stop_event, tasks
