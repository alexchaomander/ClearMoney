from __future__ import annotations

import uuid
from datetime import datetime
from typing import Any, Literal

from pydantic import BaseModel, Field


# --- Per-document-type field schemas ---

class W2Fields(BaseModel):
    employer_name: str | None = None
    employer_ein: str | None = None
    wages_tips_compensation: float | None = None
    federal_income_tax_withheld: float | None = None
    social_security_wages: float | None = None
    social_security_tax_withheld: float | None = None
    medicare_wages: float | None = None
    medicare_tax_withheld: float | None = None
    state: str | None = None
    state_wages: float | None = None
    state_income_tax: float | None = None


class Form1099IntFields(BaseModel):
    payer_name: str | None = None
    interest_income: float | None = None
    early_withdrawal_penalty: float | None = None
    federal_income_tax_withheld: float | None = None
    tax_exempt_interest: float | None = None


class Form1099DivFields(BaseModel):
    payer_name: str | None = None
    total_ordinary_dividends: float | None = None
    qualified_dividends: float | None = None
    total_capital_gain: float | None = None
    federal_income_tax_withheld: float | None = None


class Form1099BFields(BaseModel):
    payer_name: str | None = None
    short_term_proceeds: float | None = None
    short_term_cost_basis: float | None = None
    short_term_gain_loss: float | None = None
    long_term_proceeds: float | None = None
    long_term_cost_basis: float | None = None
    long_term_gain_loss: float | None = None
    federal_income_tax_withheld: float | None = None


class K1Fields(BaseModel):
    partnership_name: str | None = None
    partnership_ein: str | None = None
    ordinary_business_income: float | None = None
    net_rental_income: float | None = None
    guaranteed_payments: float | None = None
    interest_income: float | None = None
    dividends: float | None = None
    short_term_capital_gain: float | None = None
    long_term_capital_gain: float | None = None


# --- Core extraction types ---

DocumentType = Literal["w2", "1099-int", "1099-div", "1099-b", "k-1", "1040", "unknown"]
DocumentStatus = Literal["pending", "processing", "completed", "failed", "needs_review"]


class ValidationIssue(BaseModel):
    field: str
    message: str
    severity: Literal["warning", "error"] = "warning"


class ExtractionResult(BaseModel):
    document_type: DocumentType
    tax_year: int | None = None
    fields: dict[str, Any] = Field(default_factory=dict)
    confidence: float = Field(ge=0.0, le=1.0)
    provider_name: str
    raw_provider_response: dict | None = None
    warnings: list[str] = Field(default_factory=list)


# --- API request/response schemas ---

class TaxDocumentResponse(BaseModel):
    id: uuid.UUID
    user_id: uuid.UUID
    original_filename: str
    mime_type: str
    file_size_bytes: int
    document_type: str | None
    tax_year: int | None
    status: str
    provider_used: str | None
    extracted_data: dict[str, Any] | None
    confidence_score: float | None
    validation_errors: list[dict[str, Any]] | None
    error_message: str | None
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class TaxDocumentListResponse(BaseModel):
    id: uuid.UUID
    original_filename: str
    document_type: str | None
    tax_year: int | None
    status: str
    confidence_score: float | None
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class PrefillTaxPlanRequest(BaseModel):
    document_ids: list[uuid.UUID]
    plan_id: uuid.UUID
    label: str = "Imported from documents"


class PrefillTaxPlanResponse(BaseModel):
    version_id: uuid.UUID
    plan_id: uuid.UUID
    fields_populated: list[str]
    warnings: list[str]


# Required fields per document type for validation
REQUIRED_FIELDS: dict[str, list[str]] = {
    "w2": ["wages_tips_compensation"],
    "1099-int": ["interest_income"],
    "1099-div": ["total_ordinary_dividends"],
    "1099-b": [],
    "k-1": ["ordinary_business_income"],
    "1040": [],
}

FIELD_SCHEMAS: dict[str, type[BaseModel]] = {
    "w2": W2Fields,
    "1099-int": Form1099IntFields,
    "1099-div": Form1099DivFields,
    "1099-b": Form1099BFields,
    "k-1": K1Fields,
}
