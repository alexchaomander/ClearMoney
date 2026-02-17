from typing import Any, Dict, List
from app.models.action_intent import ActionIntentType


class GhostService:
    """Service to generate Ghost Navigation manifests for legacy institutions."""

    # Deep-Link Registry (DLR)
    # Maps institution slugs to workflow URLs
    DLR = {
        "fidelity": {
            "ach_transfer": "https://digital.fidelity.com/ftgw/digital/transfer/",
            "acats_transfer": "https://digital.fidelity.com/ftgw/digital/transfer/",
            "rebalance": "https://digital.fidelity.com/ftgw/digital/trade/rebalance",
        },
        "vanguard": {
            "ach_transfer": "https://holdings.vanguard.com/move-money/transfer",
            "rebalance": "https://holdings.vanguard.com/trade/rebalance",
        },
        "chase": {
            "ach_transfer": "https://secure05ea.chase.com/web/auth/dashboard#/dashboard/transfer/index",
        },
        "mercury": {
            "ach_transfer": "https://app.mercury.com/transfer",
        },
        "schwab": {
            "ach_transfer": "https://client.schwab.com/app/transfer/#/transfer",
        },
    }

    def generate_manifest(
        self, intent_type: ActionIntentType, institution_slug: str | None, payload: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Generate a step-by-step execution manifest."""
        
        # Determine the target URL from the DLR
        url = "https://google.com"  # Ultimate fallback
        if institution_slug:
            url = self.DLR.get(institution_slug.lower(), {}).get(
                intent_type.value, 
                self._get_base_url(institution_slug)
            )

        # Generate type-specific steps
        if intent_type == ActionIntentType.ACH_TRANSFER:
            return self._generate_ach_steps(url, payload)
        elif intent_type == ActionIntentType.ACATS_TRANSFER:
            return self._generate_acats_steps(url, payload)
        elif intent_type == ActionIntentType.REBALANCE:
            return self._generate_rebalance_steps(url, payload)
        
        # Generic fallback
        return {
            "steps": [
                {
                    "order": 1,
                    "type": "NAVIGATION",
                    "label": "Open Institution",
                    "url": url,
                    "instruction": f"Navigate to your account at {institution_slug or 'the institution'}."
                }
            ]
        }

    def _get_base_url(self, slug: str) -> str:
        """Heuristic for institution base login URLs."""
        mapping = {
            "fidelity": "https://www.fidelity.com/",
            "vanguard": "https://www.vanguard.com/",
            "chase": "https://www.chase.com/",
            "mercury": "https://www.mercury.com/",
            "schwab": "https://www.schwab.com/",
        }
        return mapping.get(slug.lower(), "https://google.com")

    def _generate_ach_steps(self, url: str, payload: Dict[str, Any]) -> Dict[str, Any]:
        return {
            "steps": [
                {
                    "order": 1,
                    "type": "NAVIGATION",
                    "label": "Login & Navigate",
                    "url": url,
                    "instruction": "Open your bank and navigate to the 'Transfer' or 'Move Money' section."
                },
                {
                    "order": 2,
                    "type": "COPY_DATA",
                    "label": "Enter Transfer Details",
                    "instruction": "Fill in the transfer form using these details.",
                    "snippets": [
                        {"label": "Amount", "value": f"${payload.get('amount', '0.00'):,}", "copy_value": str(payload.get('amount', ''))},
                        {"label": "From Account", "value": payload.get('source_account_name', 'Source'), "copy_value": payload.get('source_account_number', '')},
                        {"label": "To Account", "value": payload.get('target_account_name', 'Target'), "copy_value": payload.get('target_account_number', '')}
                    ]
                },
                {
                    "order": 3,
                    "type": "VERIFICATION",
                    "label": "Confirm & Finalize",
                    "instruction": "Complete the transfer on the bank site. Return here to mark as done."
                }
            ]
        }

    def _generate_acats_steps(self, url: str, payload: Dict[str, Any]) -> Dict[str, Any]:
        return {
            "steps": [
                {
                    "order": 1,
                    "type": "NAVIGATION",
                    "label": "Open Rollover Tool",
                    "url": url,
                    "instruction": "Navigate to the 'Transfer an Account' or 'Rollover' section of your brokerage."
                },
                {
                    "order": 2,
                    "type": "COPY_DATA",
                    "label": "Deliver Account Info",
                    "instruction": "Provide your existing account details to initiate the ACATS pull.",
                    "snippets": [
                        {"label": "Current Broker", "value": payload.get('source_institution', 'Fidelity'), "copy_value": payload.get('source_institution', '')},
                        {"label": "Account Number", "value": payload.get('source_account_number', '***'), "copy_value": payload.get('source_account_number', '')}
                    ]
                },
                {
                    "order": 3,
                    "type": "VERIFICATION",
                    "label": "Mark as Initiated",
                    "instruction": "Once the request is submitted, mark this intent as 'Processing'. ACATS typically takes 5-7 business days."
                }
            ]
        }

    def _generate_rebalance_steps(self, url: str, payload: Dict[str, Any]) -> Dict[str, Any]:
        return {
            "steps": [
                {
                    "order": 1,
                    "type": "NAVIGATION",
                    "label": "Open Trading Tab",
                    "url": url,
                    "instruction": "Navigate to the 'Trade' or 'Portfolio Rebalance' section."
                },
                {
                    "order": 2,
                    "type": "COPY_DATA",
                    "label": "Execute Trades",
                    "instruction": "Sell the overweight positions and buy the target ETFs.",
                    "snippets": [
                        {"label": "Sell Ticker", "value": payload.get('sell_ticker', 'VTI'), "copy_value": payload.get('sell_ticker', '')},
                        {"label": "Sell Amount", "value": f"${payload.get('sell_amount', '0.00'):,}", "copy_value": str(payload.get('sell_amount', ''))},
                        {"label": "Buy Ticker", "value": payload.get('buy_ticker', 'BND'), "copy_value": payload.get('buy_ticker', '')}
                    ]
                }
            ]
        }
