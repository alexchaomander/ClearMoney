import { SliderInput } from "@/components/shared/SliderInput";
import type { ChangeEvent, Dispatch, ReactElement, SetStateAction } from "react";
import type {
  CalculatorInputs,
  EquityGrantType,
  FundingPlan,
  LegalEntityType,
  OwnerRole,
  TaxElection,
} from "@/lib/calculators/founder-coverage-planner/types";

interface InputSectionProps {
  inputs: CalculatorInputs;
  setInputs: Dispatch<SetStateAction<CalculatorInputs>>;
}

const ENTITY_LABELS: Record<LegalEntityType, string> = {
  sole_prop: "Sole Proprietor",
  llc: "LLC",
  c_corp: "C-Corp",
};

const FUNDING_LABELS: Record<FundingPlan, string> = {
  bootstrapped: "Bootstrapped",
  vc: "VC-Backed",
  undecided: "Undecided",
};

const ROLE_LABELS: Record<OwnerRole, string> = {
  operator: "Operator",
  investor: "Investor",
};

const TAX_ELECTION_LABELS: Record<TaxElection, string> = {
  none: "No S-Corp election",
  s_corp: "S-Corp election (Form 2553)",
};

const STATE_CODES = [
  "AL",
  "AK",
  "AZ",
  "AR",
  "CA",
  "CO",
  "CT",
  "DE",
  "DC",
  "FL",
  "GA",
  "HI",
  "ID",
  "IL",
  "IN",
  "IA",
  "KS",
  "KY",
  "LA",
  "ME",
  "MD",
  "MA",
  "MI",
  "MN",
  "MS",
  "MO",
  "MT",
  "NE",
  "NV",
  "NH",
  "NJ",
  "NM",
  "NY",
  "NC",
  "ND",
  "OH",
  "OK",
  "OR",
  "PA",
  "RI",
  "SC",
  "SD",
  "TN",
  "TX",
  "UT",
  "VT",
  "VA",
  "WA",
  "WV",
  "WI",
  "WY",
] as const;

const EQUITY_GRANT_TYPE_LABELS: Record<EquityGrantType, string> = {
  options: "Stock options (ISO/NSO)",
  restricted_stock: "Restricted stock / early exercise (83b)",
  rsu: "RSUs",
};

export function InputSection({ inputs, setInputs }: InputSectionProps): ReactElement {
  function handleLegalEntityChange(event: ChangeEvent<HTMLSelectElement>): void {
    const legalEntityType = event.target.value as LegalEntityType;
    setInputs((prev) => ({
      ...prev,
      legalEntityType,
      taxElection: legalEntityType === "c_corp" ? "none" : prev.taxElection,
    }));
  }

  function handleFundingPlanChange(event: ChangeEvent<HTMLSelectElement>): void {
    const fundingPlan = event.target.value as FundingPlan;
    setInputs((prev) => ({
      ...prev,
      fundingPlan,
    }));
  }

  function handleOwnerRoleChange(event: ChangeEvent<HTMLSelectElement>): void {
    const ownerRole = event.target.value as OwnerRole;
    setInputs((prev) => ({
      ...prev,
      ownerRole,
    }));
  }

  function handleFilingStatusChange(event: ChangeEvent<HTMLSelectElement>): void {
    const filingStatus = event.target.value as CalculatorInputs["filingStatus"];
    setInputs((prev) => ({
      ...prev,
      filingStatus,
    }));
  }

  function handleStateCodeChange(event: ChangeEvent<HTMLSelectElement>): void {
    const stateCode = event.target.value;
    setInputs((prev) => ({
      ...prev,
      stateCode,
    }));
  }

  function handleEntityStartDateChange(event: ChangeEvent<HTMLInputElement>): void {
    const entityStartDate = event.target.value;
    setInputs((prev) => ({
      ...prev,
      entityStartDate,
    }));
  }

  function handleTaxYearStartDateChange(event: ChangeEvent<HTMLInputElement>): void {
    const taxYearStartDate = event.target.value;
    setInputs((prev) => ({
      ...prev,
      taxYearStartDate,
    }));
  }

  function handleTaxElectionChange(event: ChangeEvent<HTMLSelectElement>): void {
    const taxElection = event.target.value as TaxElection;
    setInputs((prev) => ({
      ...prev,
      taxElection,
    }));
  }

  function handleCurrentQuarterChange(event: ChangeEvent<HTMLSelectElement>): void {
    const currentQuarter = Number(event.target.value) as 1 | 2 | 3 | 4;
    setInputs((prev) => ({
      ...prev,
      currentQuarter,
    }));
  }

  function handleReimbursementPolicyChange(event: ChangeEvent<HTMLSelectElement>): void {
    const reimbursementPolicy = event.target.value as CalculatorInputs["reimbursementPolicy"];
    setInputs((prev) => ({
      ...prev,
      reimbursementPolicy,
    }));
  }

  function handlePayrollCadenceChange(event: ChangeEvent<HTMLSelectElement>): void {
    const payrollCadence = event.target.value as CalculatorInputs["payrollCadence"];
    setInputs((prev) => ({
      ...prev,
      payrollCadence,
    }));
  }

  function handleHasEquityGrantsChange(event: ChangeEvent<HTMLSelectElement>): void {
    const hasEquityGrants = event.target.value === "yes";
    setInputs((prev) => ({
      ...prev,
      hasEquityGrants,
    }));
  }

  function handleEquityGrantTypeChange(event: ChangeEvent<HTMLSelectElement>): void {
    const equityGrantType = event.target.value as EquityGrantType;
    setInputs((prev) => ({
      ...prev,
      equityGrantType,
    }));
  }

  function handleIsQualifiedBusinessChange(event: ChangeEvent<HTMLSelectElement>): void {
    const isQualifiedBusiness = event.target.value === "yes";
    setInputs((prev) => ({
      ...prev,
      isQualifiedBusiness,
    }));
  }

  return (
    <div className="space-y-10">
      <div className="rounded-2xl bg-neutral-900 p-6">
        <h2 className="text-xl font-semibold text-white mb-6">Founder snapshot</h2>
        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-3">
            <label className="text-sm font-medium text-neutral-200">
              Current legal entity
            </label>
            <select
              className="w-full rounded-xl border border-neutral-800 bg-neutral-950 px-3 py-2 text-sm text-white"
              value={inputs.legalEntityType}
              onChange={handleLegalEntityChange}
            >
              {Object.entries(ENTITY_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
            <p className="text-xs text-neutral-500">
              S-Corp is a tax election. The underlying legal entity is typically an
              LLC or corporation.
            </p>
          </div>

          <div className="space-y-3">
            <label className="text-sm font-medium text-neutral-200">
              Funding plan
            </label>
            <select
              className="w-full rounded-xl border border-neutral-800 bg-neutral-950 px-3 py-2 text-sm text-white"
              value={inputs.fundingPlan}
              onChange={handleFundingPlanChange}
            >
              {Object.entries(FUNDING_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-3">
            <label className="text-sm font-medium text-neutral-200">
              Owner role
            </label>
            <select
              className="w-full rounded-xl border border-neutral-800 bg-neutral-950 px-3 py-2 text-sm text-white"
              value={inputs.ownerRole}
              onChange={handleOwnerRoleChange}
            >
              {Object.entries(ROLE_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-3">
            <label className="text-sm font-medium text-neutral-200">
              Filing status
            </label>
            <select
              className="w-full rounded-xl border border-neutral-800 bg-neutral-950 px-3 py-2 text-sm text-white"
              value={inputs.filingStatus}
              onChange={handleFilingStatusChange}
            >
              <option value="single">Single</option>
              <option value="married">Married Filing Jointly</option>
            </select>
          </div>

          <div className="space-y-3">
            <label className="text-sm font-medium text-neutral-200">
              State
            </label>
            <select
              className="w-full rounded-xl border border-neutral-800 bg-neutral-950 px-3 py-2 text-sm text-white"
              value={inputs.stateCode}
              onChange={handleStateCodeChange}
            >
              {STATE_CODES.map((code) => (
                <option key={code} value={code}>
                  {code}
                </option>
              ))}
            </select>
            <p className="text-xs text-neutral-500">
              Used for context and (later) state-specific deadline guidance.
            </p>
          </div>

          <SliderInput
            label="Annual net business income"
            value={inputs.annualNetIncome}
            onChange={(value) =>
              setInputs((prev) => ({ ...prev, annualNetIncome: value }))
            }
            min={20000}
            max={500000}
            step={5000}
            format="currency"
          />

          <SliderInput
            label="Owner market salary (benchmark)"
            value={inputs.marketSalary}
            onChange={(value) =>
              setInputs((prev) => ({ ...prev, marketSalary: value }))
            }
            min={40000}
            max={300000}
            step={5000}
            format="currency"
          />

          <SliderInput
            label="Planned W-2 salary"
            value={inputs.plannedSalary}
            onChange={(value) =>
              setInputs((prev) => ({ ...prev, plannedSalary: value }))
            }
            min={0}
            max={300000}
            step={5000}
            format="currency"
          />

          <SliderInput
            label="Payroll admin costs (annual)"
            value={inputs.payrollAdminCosts}
            onChange={(value) =>
              setInputs((prev) => ({ ...prev, payrollAdminCosts: value }))
            }
            min={0}
            max={10000}
            step={250}
            format="currency"
          />

          <SliderInput
            label="State payroll tax rate"
            value={inputs.statePayrollTaxRate}
            onChange={(value) =>
              setInputs((prev) => ({ ...prev, statePayrollTaxRate: value }))
            }
            min={0}
            max={10}
            step={0.25}
            format="percent"
          />

          <SliderInput
            label="Social Security wage base"
            value={inputs.ssWageBase}
            onChange={(value) =>
              setInputs((prev) => ({ ...prev, ssWageBase: value }))
            }
            min={100000}
            max={250000}
            step={1000}
            format="currency"
            description="Update annually based on SSA wage-base limits."
          />

          <SliderInput
            label="Owners"
            value={inputs.ownersCount}
            onChange={(value) =>
              setInputs((prev) => ({ ...prev, ownersCount: value }))
            }
            min={1}
            max={5}
            step={1}
            format="number"
          />

          <SliderInput
            label="Employees (excluding owners)"
            value={inputs.employeesCount}
            onChange={(value) =>
              setInputs((prev) => ({ ...prev, employeesCount: value }))
            }
            min={0}
            max={200}
            step={1}
            format="number"
          />
        </div>
      </div>

      <div className="rounded-2xl bg-neutral-900 p-6">
        <h2 className="text-xl font-semibold text-white mb-6">
          Entity + election
        </h2>
        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-3">
            <label className="text-sm font-medium text-neutral-200">
              Entity start date
            </label>
            <input
              type="date"
              className="w-full rounded-xl border border-neutral-800 bg-neutral-950 px-3 py-2 text-sm text-white"
              value={inputs.entityStartDate}
              onChange={handleEntityStartDateChange}
            />
          </div>
          <div className="space-y-3">
            <label className="text-sm font-medium text-neutral-200">
              Tax year start
            </label>
            <input
              type="date"
              className="w-full rounded-xl border border-neutral-800 bg-neutral-950 px-3 py-2 text-sm text-white"
              value={inputs.taxYearStartDate}
              onChange={handleTaxYearStartDateChange}
            />
          </div>
          <div className="space-y-3">
            <label className="text-sm font-medium text-neutral-200">
              Tax election
            </label>
            <select
              className="w-full rounded-xl border border-neutral-800 bg-neutral-950 px-3 py-2 text-sm text-white"
              value={inputs.taxElection}
              onChange={handleTaxElectionChange}
              disabled={inputs.legalEntityType === "c_corp"}
            >
              {Object.entries(TAX_ELECTION_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
            {inputs.legalEntityType === "c_corp" && (
              <p className="text-xs text-neutral-500">
                C-Corps cannot elect S-Corp status.
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="rounded-2xl bg-neutral-900 p-6">
        <h2 className="text-xl font-semibold text-white mb-6">Tax planning</h2>
        <div className="grid gap-6 md:grid-cols-2">
          <SliderInput
            label="Prior year total tax"
            value={inputs.priorYearTax}
            onChange={(value) =>
              setInputs((prev) => ({ ...prev, priorYearTax: value }))
            }
            min={0}
            max={200000}
            step={1000}
            format="currency"
          />
          <SliderInput
            label="Projected current-year tax"
            value={inputs.projectedCurrentTax}
            onChange={(value) =>
              setInputs((prev) => ({ ...prev, projectedCurrentTax: value }))
            }
            min={0}
            max={250000}
            step={1000}
            format="currency"
          />
          <SliderInput
            label="Federal withholding to date"
            value={inputs.federalWithholding}
            onChange={(value) =>
              setInputs((prev) => ({ ...prev, federalWithholding: value }))
            }
            min={0}
            max={150000}
            step={500}
            format="currency"
          />
          <SliderInput
            label="Estimated payments to date"
            value={inputs.estimatedPayments}
            onChange={(value) =>
              setInputs((prev) => ({ ...prev, estimatedPayments: value }))
            }
            min={0}
            max={150000}
            step={500}
            format="currency"
          />
          <div className="space-y-3">
            <label className="text-sm font-medium text-neutral-200">
              Current quarter
            </label>
            <select
              className="w-full rounded-xl border border-neutral-800 bg-neutral-950 px-3 py-2 text-sm text-white"
              value={inputs.currentQuarter}
              onChange={handleCurrentQuarterChange}
            >
              <option value={1}>Q1</option>
              <option value={2}>Q2</option>
              <option value={3}>Q3</option>
              <option value={4}>Q4</option>
            </select>
          </div>
        </div>
      </div>

      <div className="rounded-2xl bg-neutral-900 p-6">
        <h2 className="text-xl font-semibold text-white mb-6">
          Cashflow hygiene
        </h2>
        <div className="grid gap-6 md:grid-cols-2">
          <SliderInput
            label="Business accounts"
            value={inputs.businessAccounts}
            onChange={(value) =>
              setInputs((prev) => ({ ...prev, businessAccounts: value }))
            }
            min={0}
            max={5}
            step={1}
            format="number"
          />
          <SliderInput
            label="Personal accounts"
            value={inputs.personalAccounts}
            onChange={(value) =>
              setInputs((prev) => ({ ...prev, personalAccounts: value }))
            }
            min={0}
            max={5}
            step={1}
            format="number"
          />
          <SliderInput
            label="Mixed transactions per month"
            value={inputs.mixedTransactionsPerMonth}
            onChange={(value) =>
              setInputs((prev) => ({
                ...prev,
                mixedTransactionsPerMonth: value,
              }))
            }
            min={0}
            max={30}
            step={1}
            format="number"
          />
          <div className="space-y-3">
            <label className="text-sm font-medium text-neutral-200">
              Reimbursement policy
            </label>
            <select
              className="w-full rounded-xl border border-neutral-800 bg-neutral-950 px-3 py-2 text-sm text-white"
              value={inputs.reimbursementPolicy}
              onChange={handleReimbursementPolicyChange}
            >
              <option value="none">None</option>
              <option value="manual">Manual reimbursements</option>
              <option value="accountable">Accountable plan</option>
            </select>
          </div>
          <div className="space-y-3">
            <label className="text-sm font-medium text-neutral-200">
              Payroll cadence
            </label>
            <select
              className="w-full rounded-xl border border-neutral-800 bg-neutral-950 px-3 py-2 text-sm text-white"
              value={inputs.payrollCadence}
              onChange={handlePayrollCadenceChange}
            >
              <option value="monthly">Monthly</option>
              <option value="biweekly">Biweekly</option>
              <option value="weekly">Weekly</option>
            </select>
          </div>
        </div>
      </div>

      <div className="rounded-2xl bg-neutral-900 p-6">
        <h2 className="text-xl font-semibold text-white mb-6">
          Equity signals
        </h2>
        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-3">
            <label className="text-sm font-medium text-neutral-200">
              Equity grants issued?
            </label>
            <select
              className="w-full rounded-xl border border-neutral-800 bg-neutral-950 px-3 py-2 text-sm text-white"
              value={inputs.hasEquityGrants ? "yes" : "no"}
              onChange={handleHasEquityGrantsChange}
            >
              <option value="yes">Yes</option>
              <option value="no">No</option>
            </select>
          </div>
          <div className="space-y-3">
            <label className="text-sm font-medium text-neutral-200">
              Equity type
            </label>
            <select
              className="w-full rounded-xl border border-neutral-800 bg-neutral-950 px-3 py-2 text-sm text-white"
              value={inputs.equityGrantType}
              onChange={handleEquityGrantTypeChange}
              disabled={!inputs.hasEquityGrants}
            >
              {Object.entries(EQUITY_GRANT_TYPE_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
            <p className="text-xs text-neutral-500">
              83(b) elections typically apply to restricted stock or early-exercised
              options, not standard option grants or RSUs.
            </p>
          </div>
          <SliderInput
            label={
              inputs.equityGrantType === "restricted_stock"
                ? "Days since restricted stock grant / early exercise (83b)"
                : "Days since grant event"
            }
            value={inputs.daysSinceGrant}
            onChange={(value) =>
              setInputs((prev) => ({ ...prev, daysSinceGrant: value }))
            }
            min={0}
            max={60}
            step={1}
            format="number"
          />
          <div className="space-y-3">
            <label className="text-sm font-medium text-neutral-200">
              Qualified business?
            </label>
            <select
              className="w-full rounded-xl border border-neutral-800 bg-neutral-950 px-3 py-2 text-sm text-white"
              value={inputs.isQualifiedBusiness ? "yes" : "no"}
              onChange={handleIsQualifiedBusinessChange}
            >
              <option value="yes">Yes</option>
              <option value="no">No</option>
            </select>
          </div>
          <SliderInput
            label="Assets at issuance"
            value={inputs.assetsAtIssuance}
            onChange={(value) =>
              setInputs((prev) => ({ ...prev, assetsAtIssuance: value }))
            }
            min={100000}
            max={60000000}
            step={500000}
            format="currency"
          />
          <SliderInput
            label="Expected holding years"
            value={inputs.expectedHoldingYears}
            onChange={(value) =>
              setInputs((prev) => ({ ...prev, expectedHoldingYears: value }))
            }
            min={1}
            max={10}
            step={1}
            format="number"
          />
          <SliderInput
            label="Vesting years"
            value={inputs.vestingYears}
            onChange={(value) =>
              setInputs((prev) => ({ ...prev, vestingYears: value }))
            }
            min={1}
            max={6}
            step={1}
            format="number"
          />
          <SliderInput
            label="Cliff months"
            value={inputs.cliffMonths}
            onChange={(value) =>
              setInputs((prev) => ({ ...prev, cliffMonths: value }))
            }
            min={0}
            max={24}
            step={1}
            format="number"
          />
          <SliderInput
            label="Strike price"
            value={inputs.strikePrice}
            onChange={(value) =>
              setInputs((prev) => ({ ...prev, strikePrice: value }))
            }
            min={0.01}
            max={50}
            step={0.25}
            format="currency"
          />
          <SliderInput
            label="Fair market value (409A)"
            value={inputs.fairMarketValue}
            onChange={(value) =>
              setInputs((prev) => ({ ...prev, fairMarketValue: value }))
            }
            min={0.01}
            max={100}
            step={0.25}
            format="currency"
          />
          <SliderInput
            label="Shares granted"
            value={inputs.sharesGranted}
            onChange={(value) =>
              setInputs((prev) => ({ ...prev, sharesGranted: value }))
            }
            min={1000}
            max={1000000}
            step={1000}
            format="number"
          />
          <SliderInput
            label="Exercise window (months)"
            value={inputs.exerciseWindowMonths}
            onChange={(value) =>
              setInputs((prev) => ({
                ...prev,
                exerciseWindowMonths: value,
              }))
            }
            min={1}
            max={120}
            step={1}
            format="number"
          />
        </div>
      </div>
    </div>
  );
}
