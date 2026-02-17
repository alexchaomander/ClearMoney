from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user, get_db
from app.models.user import User
from app.services.portability import PortabilityService
from app.services.verifier import VerifierService
from app.schemas.portability import FinancialPassport
from app.schemas.verifier import SVPAttestation

router = APIRouter(prefix="/portability", tags=["Data Portability"])
portability_service = PortabilityService()
verifier_service = VerifierService()


class ProofOfFundsRequest(BaseModel):
    threshold: float


@router.get("/export", response_model=FinancialPassport)
async def export_financial_passport(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> FinancialPassport:
    """
    Generate and download a signed Financial Passport (FPP v1).
    
    This includes your complete financial context, memory, and holdings
    in a standardized machine-readable format for use with other AI agents.
    """
    return await portability_service.generate_passport(current_user.id, db)


@router.post("/verify/proof-of-funds", response_model=SVPAttestation)
async def generate_proof_of_funds(
    request: ProofOfFundsRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> SVPAttestation:
    """Generate a signed Proof of Funds attestation."""
    return await verifier_service.create_proof_of_funds(
        current_user.id, request.threshold, db
    )


@router.post("/verify/validate")
async def validate_attestation(
    attestation: SVPAttestation,
):
    """
    Public endpoint to verify an SVP attestation's signature and expiration.
    Used by 3rd parties (landlords, lenders) to validate a claim.
    
    TODO: Add rate-limiting to this public endpoint to prevent brute-force attacks.
    """
    is_valid = verifier_service.verify_attestation(attestation)
    return {
        "valid": is_valid,
        "statement": attestation.credential.statement if is_valid else None,
        "issued_at": attestation.issued_at,
        "expires_at": attestation.expires_at,
    }
