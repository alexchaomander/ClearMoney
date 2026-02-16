import uuid
from datetime import datetime
from typing import Any

from pydantic import BaseModel, Field


class FinancialPassport(BaseModel):
    """A standardized, signed package of a user's financial context (JSON-LD)."""

    context: str = Field(
        default="https://strata.platform/schemas/fpp/v1", alias="@context"
    )
    id: uuid.UUID = Field(default_factory=uuid.uuid4)
    issuer: str = "strata_platform_v1"
    issued_at: datetime = Field(default_factory=datetime.utcnow)

    # The Financial Graph
    # Contains: profile, accounts, holdings, decision_traces, and logic_traces
    claims: dict[str, Any]

    # Cryptographic signature for verifiability
    signature: str | None = None

    model_config = {
        "populate_by_name": True,
        "from_attributes": True,
    }
