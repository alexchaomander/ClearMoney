import { SliderInput } from "@/components/shared/SliderInput";
import type {
  CalculatorInputs,
  EntityType,
  FundingPlan,
  OwnerRole,
} from "@/lib/calculators/founder-coverage-planner/types";

interface InputSectionProps {
  inputs: CalculatorInputs;
  setInputs: React.Dispatch<React.SetStateAction<CalculatorInputs>>;
}

const ENTITY_LABELS: Record<EntityType, string> = {
  sole_prop: "Sole Proprietor",
  llc: "LLC",
  s_corp: "S-Corp",
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

export function InputSection({ inputs, setInputs }: InputSectionProps) {
  return (
    <div className="space-y-10">
      <div className="rounded-2xl bg-neutral-900 p-6">
        <h2 className="text-xl font-semibold text-white mb-6">Founder snapshot</h2>
        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-3">
            <label className="text-sm font-medium text-neutral-200">
              Current entity
            </label>
            <select
              className="w-full rounded-xl border border-neutral-800 bg-neutral-950 px-3 py-2 text-sm text-white"
              value={inputs.entityType}
              onChange={(event) =>
                setInputs((prev) => ({
                  ...prev,
                  entityType: event.target.value as EntityType,
                }))
              }
            >
              {Object.entries(ENTITY_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-3">
            <label className="text-sm font-medium text-neutral-200">
              Funding plan
            </label>
            <select
              className="w-full rounded-xl border border-neutral-800 bg-neutral-950 px-3 py-2 text-sm text-white"
              value={inputs.fundingPlan}
              onChange={(event) =>
                setInputs((prev) => ({
                  ...prev,
                  fundingPlan: event.target.value as FundingPlan,
                }))
              }
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
              onChange={(event) =>
                setInputs((prev) => ({
                  ...prev,
                  ownerRole: event.target.value as OwnerRole,
                }))
              }
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
              onChange={(event) =>
                setInputs((prev) => ({
                  ...prev,
                  filingStatus: event.target.value as "single" | "married",
                }))
              }
            >
              <option value="single">Single</option>
              <option value="married">Married Filing Jointly</option>
            </select>
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
              onChange={(event) =>
                setInputs((prev) => ({
                  ...prev,
                  entityStartDate: event.target.value,
                }))
              }
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
              onChange={(event) =>
                setInputs((prev) => ({
                  ...prev,
                  taxYearStartDate: event.target.value,
                }))
              }
            />
          </div>
          <div className="space-y-3">
            <label className="text-sm font-medium text-neutral-200">
              Filing S-Corp election?
            </label>
            <select
              className="w-full rounded-xl border border-neutral-800 bg-neutral-950 px-3 py-2 text-sm text-white"
              value={inputs.usesSorpElection ? "yes" : "no"}
              onChange={(event) =>
                setInputs((prev) => ({
                  ...prev,
                  usesSorpElection: event.target.value === "yes",
                }))
              }
            >
              <option value="yes">Yes</option>
              <option value="no">No</option>
            </select>
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
              onChange={(event) =>
                setInputs((prev) => ({
                  ...prev,
                  currentQuarter: Number(event.target.value) as 1 | 2 | 3 | 4,
                }))
              }
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
              onChange={(event) =>
                setInputs((prev) => ({
                  ...prev,
                  reimbursementPolicy: event.target.value as
                    | "none"
                    | "manual"
                    | "accountable",
                }))
              }
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
              onChange={(event) =>
                setInputs((prev) => ({
                  ...prev,
                  payrollCadence: event.target.value as
                    | "monthly"
                    | "biweekly"
                    | "weekly",
                }))
              }
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
              onChange={(event) =>
                setInputs((prev) => ({
                  ...prev,
                  hasEquityGrants: event.target.value === "yes",
                }))
              }
            >
              <option value="yes">Yes</option>
              <option value="no">No</option>
            </select>
          </div>
          <SliderInput
            label="Days since grant (for 83(b))"
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
              onChange={(event) =>
                setInputs((prev) => ({
                  ...prev,
                  isQualifiedBusiness: event.target.value === "yes",
                }))
              }
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
