import hashlib
import hmac
import json
import uuid
from datetime import datetime, timedelta, timezone
from typing import Any

from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.services.financial_context import build_financial_context
from app.schemas.verifier import SVPAttestation, SVPCredential


class VerifierService:
    """Service to generate and verify Strata Verification Protocol (SVP) claims."""

    async def create_proof_of_funds(
        self, user_id: uuid.UUID, threshold: float, db: AsyncSession
    ) -> SVPAttestation:
        """Verify if liquid assets exceed a threshold and issue a signed attestation."""
        
        # 1. Fetch current context
        context = await build_financial_context(user_id, db)
        
        # 2. Extract metrics
        total_liquid = context.get("portfolio_metrics", {}).get("total_investment_value", 0) + 
                       context.get("portfolio_metrics", {}).get("total_cash_value", 0)
        
        # 3. Check threshold
        is_verified = total_liquid >= threshold
        
        # 4. Determine data freshness (in hours)
        last_sync_str = context.get("data_freshness", {}).get("last_sync")
        freshness_hours = 24
        if last_sync_str:
            try:
                # Python 3.11+ fromisoformat handles 'Z' suffix correctly
                last_sync = datetime.fromisoformat(last_sync_str)
                delta = datetime.now(timezone.utc) - last_sync
                freshness_hours = int(delta.total_seconds() / 3600)
            except ValueError:
                pass

        # 5. Build Claim
        credential = SVPCredential(
            claim_type="THRESHOLD_PROOF_OF_FUNDS",
            statement=f"Total liquid assets are greater than or equal to ${threshold:,.2f} USD",
            verification_status="VERIFIED" if is_verified else "FAILED",
            data_freshness_hours=freshness_hours
        )

        attestation = SVPAttestation(
            expires_at=datetime.now(timezone.utc) + timedelta(days=1),
            credential=credential
        )

        # 6. Sign the Attestation
        attestation.signature = {
            "type": "HMAC-SHA256",
            "proof_value": self._sign_attestation(attestation)
        }

        return attestation

    def _sign_attestation(self, attestation: SVPAttestation) -> str:
        """Generate HMAC signature for the attestation object."""
        # Canonicalize the credential payload for hashing
        # Use explicit json.dumps with canonical separators and sorted keys
        data = attestation.credential.model_dump(mode="json")
        payload = json.dumps(data, sort_keys=True, separators=(',', ':'))
        
        return hmac.new(
            settings.secret_key.encode(),
            payload.encode(),
            hashlib.sha256
        ).hexdigest()

    def verify_attestation(self, attestation: SVPAttestation) -> bool:
        """Validate the signature and expiration of an attestation."""
        # Check expiration
        if attestation.expires_at < datetime.now(timezone.utc):
            return False
            
        if not attestation.signature or "proof_value" not in attestation.signature:
            return False
            
        expected_sig = self._sign_attestation(attestation)
        return hmac.compare_digest(attestation.signature["proof_value"], expected_sig)
