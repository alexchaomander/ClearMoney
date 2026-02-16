import hashlib
import hmac
import json
import uuid
from typing import Any

from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.services.financial_context import build_financial_context
from app.schemas.portability import FinancialPassport


class PortabilityService:
    """Service to handle financial data portability and signing (FPP)."""

    async def generate_passport(
        self, user_id: uuid.UUID, db: AsyncSession
    ) -> FinancialPassport:
        """Aggregate all user financial data into a signed FPP Passport."""
        
        # 1. Build the complete financial context
        # This includes profile, accounts, holdings, and portfolio metrics
        context = await build_financial_context(user_id, db)

        # 2. Package into claims schema
        # We explicitly structure this to match the FPP v1 standard
        claims = {
            "financial_summary": {
                "net_worth": context.get("portfolio_metrics", {}).get("net_worth"),
                "total_assets": context.get("portfolio_metrics", {}).get("total_investment_value", 0) + 
                               context.get("portfolio_metrics", {}).get("total_cash_value", 0),
                "total_debt": context.get("portfolio_metrics", {}).get("total_debt_value"),
            },
            "asset_allocation": context.get("portfolio_metrics", {}).get("allocation_by_asset_type", {}),
            "profile_context": context.get("profile", {}),
            "accounts_registry": context.get("accounts", {}),
            "holdings_snapshot": context.get("holdings", []),
            "metadata": {
                "data_freshness": context.get("data_freshness", {}),
                "export_engine": "strata_sal_v1",
            }
        }

        passport = FinancialPassport(claims=claims)

        # 3. Sign the payload for verifiability
        # v0.1 uses a system-level HMAC. v0.2 will move to per-user asymmetric keys.
        passport.signature = self._sign_payload(claims)

        return passport

    def _sign_payload(self, claims: dict[str, Any]) -> str:
        """Generate a cryptographic signature for the claims payload."""
        # Standardize the JSON representation for consistent hashing
        serialized = json.dumps(claims, sort_keys=True, default=str, separators=(',', ':'))
        
        return hmac.new(
            settings.secret_key.encode(),
            serialized.encode(),
            hashlib.sha256
        ).hexdigest()

    def verify_passport(self, passport: FinancialPassport) -> bool:
        """Verify that a passport was issued by this platform and hasn't been tampered with."""
        if not passport.signature:
            return False
            
        expected_signature = self._sign_payload(passport.claims)
        return hmac.compare_digest(passport.signature, expected_signature)
