from decimal import Decimal, InvalidOperation
from typing import Any, Dict

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
            "ach_transfer": "https://app.mercury.com/payments",
        },
        "schwab": {
            "ach_transfer": "https://client.schwab.com/app/transfer/#/transfer",
        },
        "wealthfront": {
            "ach_transfer": "https://www.wealthfront.com/transfers/new",
        }
    }

    def generate_manifest(
        self,
        intent_type: ActionIntentType,
        institution_slug: str | None,
        payload: dict[str, Any]
    ) -> dict[str, Any]:
        """Generate a step-by-step execution manifest for manual copilot assistance."""

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
                    "instruction": (
                        f"Navigate to your account at "
                        f"{institution_slug or 'the institution'}."
                    )
                },
                {
                    "order": 2,
                    "type": "VERIFICATION",
                    "label": "Confirm Completion",
                    "instruction": (
                        "Once you have manually completed the action, "
                        "mark it as done here."
                    )
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
            "wealthfront": "https://www.wealthfront.com/",
        }
        return mapping.get(slug.lower(), "https://google.com")

    def _generate_ach_steps(self, url: str, payload: dict[str, Any]) -> dict[str, Any]:
        return {
            "steps": [
                {
                    "order": 1,
                    "type": "NAVIGATION",
                    "label": "Login & Navigate",
                    "url": url,
                    "instruction": (
                        "Open your bank and navigate to the 'Transfer' "
                        "or 'Move Money' section."
                    )
                },
                {
                    "order": 2,
                    "type": "COPY_DATA",
                    "label": "Enter Transfer Details",
                    "instruction": "Fill in the transfer form using these details exactly.",
                    "snippets": [
                        {
                            "label": "Transfer Amount",
                            "value": self._format_currency(payload.get("amount")),
                            "copy_value": str(payload.get('amount', ''))
                        },
                        {
                            "label": "Source Account",
                            "value": payload.get('source_account_name', 'Checking'),
                            "copy_value": payload.get('source_account_number', '')
                        },
                        {
                            "label": "Target Account",
                            "value": payload.get('target_account_name', 'Savings'),
                            "copy_value": payload.get('target_account_number', '')
                        }
                    ]
                },
                {
                    "order": 3,
                    "type": "VERIFICATION",
                    "label": "Confirm & Finalize",
                    "instruction": (
                        "Complete the transfer on the bank site. "
                        "Return here to mark as done so Strata can verify."
                    )
                }
            ]
        }

    def _generate_acats_steps(self, url: str, payload: dict[str, Any]) -> dict[str, Any]:
        return {
            "steps": [
                {
                    "order": 1,
                    "type": "NAVIGATION",
                    "label": "Open Rollover Tool",
                    "url": url,
                    "instruction": (
                        "Navigate to the 'Transfer an Account' "
                        "or 'Rollover' section of your target brokerage."
                    )
                },
                {
                    "order": 2,
                    "type": "COPY_DATA",
                    "label": "Input Source Account",
                    "instruction": (
                        "Provide your existing account details "
                        "to initiate the ACATS pull."
                    ),
                    "snippets": [
                        {
                            "label": "Source Broker",
                            "value": payload.get('source_institution', 'Fidelity'),
                            "copy_value": payload.get('source_institution', '')
                        },
                        {
                            "label": "DTC Number",
                            "value": payload.get('source_dtc', '0226'),
                            "copy_value": payload.get('source_dtc', '0226')
                        },
                        {
                            "label": "Account Number",
                            "value": payload.get('source_account_number', '***'),
                            "copy_value": payload.get('source_account_number', '')
                        }
                    ]
                },
                {
                    "order": 3,
                    "type": "VERIFICATION",
                    "label": "Mark as Initiated",
                    "instruction": (
                        "Once the request is submitted, mark this intent "
                        "as 'Processing'. ACATS typically takes 5-7 business days."
                    )
                }
            ]
        }

    def _generate_rebalance_steps(self, url: str, payload: dict[str, Any]) -> dict[str, Any]:
        return {
            "steps": [
                {
                    "order": 1,
                    "type": "NAVIGATION",
                    "label": "Open Trading Tab",
                    "url": url,
                    "instruction": (
                        "Navigate to the 'Trade' or 'Portfolio Rebalance' section."
                    )
                },
                {
                    "order": 2,
                    "type": "COPY_DATA",
                    "label": "Execute Sell Order",
                    "instruction": "Sell the overweight positions identified by your agent.",
                    "snippets": [
                        {
                            "label": "Sell Ticker",
                            "value": payload.get('sell_ticker', 'VTI'),
                            "copy_value": payload.get('sell_ticker', '')
                        },
                        {
                            "label": "Sell Amount",
                            "value": self._format_currency(payload.get("sell_amount")),
                            "copy_value": str(payload.get('sell_amount', ''))
                        }
                    ]
                },
                {
                    "order": 3,
                    "type": "COPY_DATA",
                    "label": "Execute Buy Order",
                    "instruction": "Purchase the target positions to restore your allocation.",
                    "snippets": [
                        {
                            "label": "Buy Ticker",
                            "value": payload.get('buy_ticker', 'BND'),
                            "copy_value": payload.get('buy_ticker', '')
                        },
                        {
                            "label": "Buy Amount",
                            "value": self._format_currency(payload.get("buy_amount")),
                            "copy_value": str(payload.get('buy_amount', ''))
                        }
                    ]
                }
            ]
        }

    def _format_currency(self, raw_value: Any) -> str:
        amount = self._to_decimal(raw_value)
        if amount is None:
            return "$0.00"
        return f"${amount:,.2f}"

    def _to_decimal(self, raw_value: Any) -> Decimal | None:
        if raw_value is None:
            return None
        if isinstance(raw_value, Decimal):
            return raw_value
        if isinstance(raw_value, (int, float)):
            return Decimal(str(raw_value))
        if isinstance(raw_value, str):
            cleaned = raw_value.strip().replace("$", "").replace(",", "")
            if not cleaned:
                return None
            try:
                return Decimal(cleaned)
            except InvalidOperation:
                return None
        return None
