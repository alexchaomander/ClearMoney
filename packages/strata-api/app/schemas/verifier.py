import uuid
from datetime import datetime

from pydantic import BaseModel, Field


class SVPCredential(BaseModel):
    """The specific financial claim being verified."""
    claim_type: str
    statement: str
    verification_status: str = "VERIFIED"
    as_of: datetime = Field(default_factory=datetime.utcnow)
    data_freshness_hours: int


class SVPAttestation(BaseModel):
    """A signed, privacy-preserving financial attestation (SVP v1)."""

    context: str = Field(
        default="https://strata.platform/schemas/svp/v1", alias="@context"
    )
    type: str = "FinancialAttestation"
    id: uuid.UUID = Field(default_factory=uuid.uuid4)
    issuer: str = "strata_platform_v1"
    issued_at: datetime = Field(default_factory=datetime.utcnow)
    expires_at: datetime

    # The verified claim (selective disclosure)
    credential: SVPCredential

    # Cryptographic signature
    signature: dict[str, str] | None = None

    model_config = {
        "populate_by_name": True,
        "from_attributes": True,
    }
