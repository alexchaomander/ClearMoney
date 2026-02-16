from enum import Enum


class ActionCapability(str, Enum):
    """Enum for actions a provider or account can support."""

    READ_ONLY = "read_only"
    ACH_TRANSFER = "ach_transfer"
    ACATS_TRANSFER = "acats_transfer"
    INTERNAL_REBALANCE = "internal_rebalance"
    KYC_EXPORT = "kyc_export"
    PDF_GENERATION = "pdf_generation"
    SWITCH_KIT = "switch_kit"
    NATIVE_LEDGER = "native_ledger"
