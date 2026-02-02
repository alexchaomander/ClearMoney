from datetime import datetime, timezone

from app.core.config import settings


def evaluate_freshness(context: dict, max_age_hours: float | None = None) -> dict:
    max_age = max_age_hours or settings.agent_freshness_max_hours
    freshness = context.get("data_freshness", {})
    last_sync_raw = freshness.get("last_sync")

    if not last_sync_raw:
        return {
            "is_fresh": False,
            "age_hours": None,
            "max_age_hours": max_age,
            "last_sync": None,
            "warning": "No sync information available. Refresh account data before relying on recommendations.",
        }

    try:
        last_sync = datetime.fromisoformat(last_sync_raw)
        if last_sync.tzinfo is None:
            last_sync = last_sync.replace(tzinfo=timezone.utc)
    except ValueError:
        return {
            "is_fresh": False,
            "age_hours": None,
            "max_age_hours": max_age,
            "last_sync": last_sync_raw,
            "warning": "Unable to parse last sync time. Refresh account data before relying on recommendations.",
        }

    now = datetime.now(timezone.utc)
    age_hours = (now - last_sync).total_seconds() / 3600
    is_fresh = age_hours <= max_age
    warning = None
    if not is_fresh:
        warning = (
            f"Data is {age_hours:.1f} hours old. Refresh your accounts to get safe, up-to-date guidance."
        )

    return {
        "is_fresh": is_fresh,
        "age_hours": round(age_hours, 2),
        "max_age_hours": max_age,
        "last_sync": last_sync_raw,
        "warning": warning,
    }
