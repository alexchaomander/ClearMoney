import uuid
from datetime import date
from decimal import Decimal

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import joinedload

from app.models.action_intent import ActionIntent, ActionIntentStatus, ActionIntentType
from app.models.bank_transaction import BankTransaction
from app.models.cash_account import CashAccount
from app.models.decision_trace import DecisionTrace, DecisionTraceType
from app.models.entity import EntityType
from app.models.financial_memory import FinancialMemory


class TaxShieldService:
    def __init__(self, session: AsyncSession):
        self._session = session

    async def get_tax_shield_metrics(self, user_id: uuid.UUID) -> dict:
        """Estimate quarterly tax obligations based on progressive brackets and income streams."""
        today = date.today()
        year_start = date(today.year, 1, 1)
        current_quarter = (today.month - 1) // 3 + 1

        # 1. Fetch all credits for the current year
        result = await self._session.execute(
            select(BankTransaction)
            .join(CashAccount)
            .outerjoin(CashAccount.entity)
            .options(
                joinedload(BankTransaction.cash_account).joinedload(CashAccount.entity)
            )
            .where(
                CashAccount.user_id == user_id,
                BankTransaction.amount > 0,  # Credits
                BankTransaction.transaction_date >= year_start,
                BankTransaction.primary_category != "TRANSFER_IN",
            )
        )
        all_credits = result.scalars().all()

        biz_credits = []
        w2_credits = []

        for tx in all_credits:
            acct = tx.cash_account
            is_biz_account = (
                (acct.entity and acct.entity.entity_type != EntityType.personal)
                or acct.is_business
            )
            cat = (tx.detailed_category or "").upper()
            prim_cat = (tx.primary_category or "").upper()

            if is_biz_account:
                # All income in business accounts is 1099/biz income
                biz_credits.append(tx)
            elif "PAYROLL" in cat or "WAGES" in prim_cat or "WAGES" in cat:
                # Payroll deposits into personal accounts are W2
                w2_credits.append(tx)
            elif "FREELANCE" in cat or "INCOME_OTHER" in prim_cat:
                # Freelance/1099 into personal account
                biz_credits.append(tx)

        ytd_1099_income = sum((tx.amount for tx in biz_credits), Decimal("0.00"))
        ytd_w2_income = sum((tx.amount for tx in w2_credits), Decimal("0.00"))

        # 2. Get tax preferences from memory
        result = await self._session.execute(
            select(FinancialMemory).where(FinancialMemory.user_id == user_id)
        )
        memory = result.scalar_one_or_none()

        state_rate = memory.state_tax_rate if memory and memory.state_tax_rate else Decimal("0.07")

        # 3. Calculate 2026 Progressive Taxes (Single Filer)
        std_deduction = Decimal("15000.00")
        brackets = [
            (Decimal("11600.00"), Decimal("0.10")),
            (Decimal("47150.00"), Decimal("0.12")),
            (Decimal("100525.00"), Decimal("0.22")),
            (Decimal("191950.00"), Decimal("0.24")),
            (Decimal("243725.00"), Decimal("0.32")),
            (Decimal("609350.00"), Decimal("0.35")),
            (Decimal("float('inf')"), Decimal("0.37")),
        ]

        def calc_federal_tax(taxable_income: Decimal) -> Decimal:
            if taxable_income <= 0:
                return Decimal("0.00")
            tax = Decimal("0.00")
            prev_bracket = Decimal("0.00")
            for limit, rate in brackets:
                chunk = min(taxable_income - prev_bracket, limit - prev_bracket)
                if chunk > 0:
                    tax += chunk * rate
                if taxable_income <= limit:
                    break
                prev_bracket = limit
            return tax

        # SE Tax = 15.3% on 92.35% of 1099 profit
        se_taxable = ytd_1099_income * Decimal("0.9235")
        estimated_se_tax = se_taxable * Decimal("0.153")
        half_se_tax_deduction = estimated_se_tax * Decimal("0.5")

        total_income = ytd_w2_income + ytd_1099_income
        adjusted_gross_income = total_income - half_se_tax_deduction
        taxable_income = max(Decimal("0.00"), adjusted_gross_income - std_deduction)

        total_federal_tax = calc_federal_tax(taxable_income)
        total_state_tax = total_income * state_rate

        # Calculate W2 withholding assumption (we assume W2 was properly withheld)
        w2_agi = ytd_w2_income
        w2_taxable = max(Decimal("0.00"), w2_agi - std_deduction)
        w2_federal_tax = calc_federal_tax(w2_taxable)
        w2_state_tax = ytd_w2_income * state_rate

        # The 1099 liability is the incremental tax caused by 1099 income
        estimated_1099_federal_tax = max(Decimal("0.00"), total_federal_tax - w2_federal_tax)
        estimated_1099_state_tax = max(Decimal("0.00"), total_state_tax - w2_state_tax)

        total_1099_liability = estimated_1099_federal_tax + estimated_1099_state_tax + estimated_se_tax
        quarterly_estimate = total_1099_liability / Decimal(str(current_quarter)) if total_1099_liability > 0 else Decimal("0.00")

        return {
            "ytd_1099_income": float(ytd_1099_income),
            "ytd_w2_income": float(ytd_w2_income),
            "estimated_federal_tax": float(estimated_1099_federal_tax),
            "estimated_state_tax": float(estimated_1099_state_tax),
            "estimated_self_employment_tax": float(estimated_se_tax),
            "total_tax_liability_ytd": float(total_1099_liability),
            "next_quarterly_payment": float(quarterly_estimate),
            "current_quarter": current_quarter,
            "safe_harbor_met": False,
        }

    async def generate_tax_withholding_intent(
        self, user_id: uuid.UUID
    ) -> ActionIntent | None:
        """Generate an ActionIntent to move estimated tax to a withholding account."""
        metrics = await self.get_tax_shield_metrics(user_id)
        amount = metrics["next_quarterly_payment"]

        if amount <= 0:
            return None

        quarter = metrics["current_quarter"]

        # 1. Create a Decision Trace for the reasoning
        trace = DecisionTrace(
            user_id=user_id,
            trace_type=DecisionTraceType.rebalance,  # We can reuse rebalance or similar
            title="Quarterly Tax Withholding",
            reasoning=f"Based on YTD 1099 income of ${metrics['ytd_1099_income']:,.2f}, you should set aside ${amount:,.2f} for Q{quarter} estimated taxes.",
            data_snapshot=metrics,
        )
        self._session.add(trace)
        await self._session.flush()

        # 2. Create the Action Intent
        intent = ActionIntent(
            user_id=user_id,
            decision_trace_id=trace.id,
            intent_type=ActionIntentType.ACH_TRANSFER,
            title="Fund Tax Withholding Account",
            description=f"Transfer ${amount:,.2f} to your dedicated tax holding account.",
            payload={"amount": float(amount), "memo": "Estimated Tax Withholding"},
            impact_summary={
                "liability_covered": float(amount),
                "safe_harbor_impact": f"Will meet Q{quarter} requirement",
            },
            status=ActionIntentStatus.DRAFT,
        )
        self._session.add(intent)
        await self._session.commit()
        await self._session.refresh(intent)

        return intent
