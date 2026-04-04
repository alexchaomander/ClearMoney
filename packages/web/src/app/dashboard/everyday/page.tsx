"use client";

import { useMemo, useState } from "react";
import { BellRing, CalendarDays, CheckCircle2, CircleAlert, Goal, Plus, Repeat, Wallet } from "lucide-react";

import { DashboardHeader } from "@/components/layout/DashboardHeader";
import { ConsentGate } from "@/components/shared/ConsentGate";
import { ApiErrorState } from "@/components/shared/ApiErrorState";
import { DashboardLoadingSkeleton } from "@/components/shared/LoadingSkeleton";
import {
  useConsumerHome,
  useCreateBudget,
  useCreateGoal,
  useCreateTransactionRule,
  useUpdateInboxItem,
  useUpdateRecurringItem,
  useUpdateReviewItem,
} from "@/lib/strata/hooks";
import { formatCurrency } from "@/lib/shared/formatters";

function monthStartIso(date = new Date()) {
  return new Date(date.getFullYear(), date.getMonth(), 1).toISOString().slice(0, 10);
}

export default function EverydayDashboardPage() {
  const [ruleText, setRuleText] = useState("");
  const [goalName, setGoalName] = useState("Emergency fund");
  const [goalTarget, setGoalTarget] = useState("25000");

  const { data, isLoading, isError, error, refetch } = useConsumerHome();
  const createBudget = useCreateBudget();
  const createGoal = useCreateGoal();
  const createRule = useCreateTransactionRule();
  const updateRecurring = useUpdateRecurringItem();
  const updateInbox = useUpdateInboxItem();
  const updateReview = useUpdateReviewItem();

  const starterBudgetCategories = useMemo(
    () => [
      { name: "FOOD_AND_DRINK", planned_amount: 600, category_type: "flexible" as const },
      { name: "SHOPPING", planned_amount: 400, category_type: "flexible" as const },
      { name: "TRANSPORTATION", planned_amount: 300, category_type: "flexible" as const },
      { name: "TRANSFER_OUT", planned_amount: 1200, category_type: "fixed" as const },
    ],
    []
  );

  const handleCreateBudget = async () => {
    await createBudget.mutateAsync({
      name: "Monthly plan",
      month_start: monthStartIso(),
      categories: starterBudgetCategories,
    });
  };

  const handleCreateGoal = async () => {
    const target = Number(goalTarget);
    if (!goalName.trim() || !Number.isFinite(target) || target <= 0) return;
    await createGoal.mutateAsync({
      name: goalName.trim(),
      goal_type: "emergency_fund",
      target_amount: target,
      current_amount: 0,
      monthly_contribution: Math.round(target / 12),
      target_date: new Date(new Date().getFullYear() + 1, new Date().getMonth(), 1).toISOString().slice(0, 10),
    });
  };

  const handleCreateRule = async () => {
    if (!ruleText.trim()) return;
    await createRule.mutateAsync({
      name: `Auto-rule: ${ruleText.trim()}`,
      match_text: ruleText.trim(),
      match_mode: "contains",
      primary_category_override: "TRANSFER_OUT",
      transaction_kind_override: "business",
    });
    setRuleText("");
  };

  if (isLoading) {
    return <DashboardLoadingSkeleton />;
  }

  if (isError || !data) {
    return (
      <ApiErrorState
        message={error instanceof Error ? error.message : "Try refreshing your data and loading the consumer workspace again."}
        error={error}
        onRetry={() => {
          void refetch();
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <DashboardHeader />
      <main className="max-w-7xl mx-auto px-6 py-8 lg:px-8">
        <ConsentGate
          scopes={["accounts:read", "accounts:write", "notifications:read", "notifications:write"]}
          purpose="Power your Everyday Money workspace with budgets, goals, recurring bills, and review workflows."
        >
          <div className="mb-8 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.22em] text-emerald-600">Everyday Money</p>
              <h1 className="mt-2 text-3xl font-serif text-slate-900 dark:text-white">One place for the month, the week, and the next move.</h1>
              <p className="mt-2 max-w-3xl text-sm text-slate-600 dark:text-slate-300">
                This is the consumer surface for ClearMoney: budget, goals, recurring charges, review queue, and an inbox that tells you what matters now.
              </p>
            </div>
            <div className="rounded-2xl border border-emerald-200 bg-white px-5 py-4 shadow-sm dark:border-emerald-900/40 dark:bg-slate-900">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Weekly briefing</p>
              <p className="mt-2 text-lg font-semibold text-slate-900 dark:text-white">{data.weekly_briefing.headline}</p>
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
            <section className="space-y-6">
              <div className="grid gap-4 md:grid-cols-3">
                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                  <div className="flex items-center gap-2 text-slate-500"><Wallet className="h-4 w-4" /> Monthly plan</div>
                  <p className="mt-3 text-3xl font-semibold text-slate-900 dark:text-white">
                    {data.budget_summary ? formatCurrency(data.budget_summary.safe_to_spend) : "No budget"}
                  </p>
                  <p className="mt-1 text-sm text-slate-500">Safe to spend this month</p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                  <div className="flex items-center gap-2 text-slate-500"><Goal className="h-4 w-4" /> Active goals</div>
                  <p className="mt-3 text-3xl font-semibold text-slate-900 dark:text-white">{data.goals.length}</p>
                  <p className="mt-1 text-sm text-slate-500">Savings and payoff tracks in motion</p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                  <div className="flex items-center gap-2 text-slate-500"><BellRing className="h-4 w-4" /> Open items</div>
                  <p className="mt-3 text-3xl font-semibold text-slate-900 dark:text-white">
                    {data.inbox_items.filter((item) => !item.is_resolved).length + data.review_items.filter((item) => item.status === "open").length}
                  </p>
                  <p className="mt-1 text-sm text-slate-500">Decisions and reviews waiting on you</p>
                </div>
              </div>

              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Monthly budget</h2>
                    <p className="text-sm text-slate-500">Budget vs actual with a simple setup path.</p>
                  </div>
                  {!data.budget_summary && (
                    <button
                      onClick={handleCreateBudget}
                      className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white dark:bg-white dark:text-slate-950"
                    >
                      <Plus className="h-4 w-4" />
                      Create starter budget
                    </button>
                  )}
                </div>
                {data.budget_summary ? (
                  <div className="mt-6 space-y-3">
                    {data.budget_summary.categories.map((category) => (
                      <div key={category.id} className="rounded-2xl border border-slate-200 p-4 dark:border-slate-800">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-slate-900 dark:text-white">{category.name}</p>
                            <p className="text-xs uppercase tracking-[0.18em] text-slate-500">{category.category_type}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-slate-500">Planned {formatCurrency(category.planned_amount)}</p>
                            <p className="font-semibold text-slate-900 dark:text-white">Actual {formatCurrency(category.actual_amount)}</p>
                          </div>
                        </div>
                        <div className="mt-3 h-2 rounded-full bg-slate-100 dark:bg-slate-800">
                          <div
                            className="h-2 rounded-full bg-emerald-500"
                            style={{ width: `${Math.min(100, (category.actual_amount / Math.max(category.planned_amount, 1)) * 100)}%` }}
                          />
                        </div>
                        <p className="mt-2 text-sm text-slate-500">Remaining {formatCurrency(category.remaining_amount)}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="mt-6 text-sm text-slate-500">No budget exists yet. Start with the default monthly plan and refine from there.</p>
                )}
              </div>

              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Goals</h2>
                <div className="mt-4 grid gap-3 md:grid-cols-[1fr_160px_auto]">
                  <input
                    className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm dark:border-slate-800 dark:bg-slate-950"
                    value={goalName}
                    onChange={(event) => setGoalName(event.target.value)}
                    placeholder="Goal name"
                  />
                  <input
                    className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm dark:border-slate-800 dark:bg-slate-950"
                    value={goalTarget}
                    onChange={(event) => setGoalTarget(event.target.value)}
                    placeholder="25000"
                  />
                  <button
                    onClick={handleCreateGoal}
                    className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-medium text-white"
                  >
                    Add goal
                  </button>
                </div>
                <div className="mt-6 space-y-3">
                  {data.goals.map((goal) => (
                    <div key={goal.id} className="rounded-2xl border border-slate-200 p-4 dark:border-slate-800">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-slate-900 dark:text-white">{goal.name}</p>
                          <p className="text-sm text-slate-500">{formatCurrency(goal.current_amount)} of {formatCurrency(goal.target_amount)}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-semibold text-slate-900 dark:text-white">{goal.progress_percent}%</p>
                          {goal.required_monthly_contribution != null && (
                            <p className="text-xs text-amber-600">Need {formatCurrency(goal.required_monthly_contribution)}/mo</p>
                          )}
                        </div>
                      </div>
                      <div className="mt-3 h-2 rounded-full bg-slate-100 dark:bg-slate-800">
                        <div className="h-2 rounded-full bg-sky-500" style={{ width: `${Math.min(100, goal.progress_percent)}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            <section className="space-y-6">
              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <div className="flex items-center gap-2">
                  <Repeat className="h-4 w-4 text-slate-500" />
                  <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Recurring bills</h2>
                </div>
                <div className="mt-4 space-y-3">
                  {data.recurring_items.map((item) => (
                    <div key={item.id} className="rounded-2xl border border-slate-200 p-4 dark:border-slate-800">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="font-medium text-slate-900 dark:text-white">{item.name}</p>
                          <p className="text-sm text-slate-500">{item.cadence} • due {item.next_due_date ?? "TBD"}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-slate-900 dark:text-white">{formatCurrency(item.expected_amount)}</p>
                          <button
                            onClick={() => updateRecurring.mutate({ itemId: item.id, data: { state: item.state === "review" ? "active" : "review" } })}
                            className="mt-1 text-xs font-medium text-emerald-600"
                          >
                            {item.state === "review" ? "Confirm" : "Mark for review"}
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Quick rule</h2>
                <p className="mt-1 text-sm text-slate-500">Create a persistent transaction rule so similar activity stays clean.</p>
                <div className="mt-4 flex gap-2">
                  <input
                    className="flex-1 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm dark:border-slate-800 dark:bg-slate-950"
                    value={ruleText}
                    onChange={(event) => setRuleText(event.target.value)}
                    placeholder="merchant match text"
                  />
                  <button onClick={handleCreateRule} className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white dark:bg-white dark:text-slate-950">
                    Save rule
                  </button>
                </div>
              </div>

              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <div className="flex items-center gap-2">
                  <CalendarDays className="h-4 w-4 text-slate-500" />
                  <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Inbox</h2>
                </div>
                <div className="mt-4 space-y-3">
                  {data.inbox_items.map((item) => (
                    <div key={item.id} className="rounded-2xl border border-slate-200 p-4 dark:border-slate-800">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-medium text-slate-900 dark:text-white">{item.title}</p>
                          <p className="mt-1 text-sm text-slate-500">{item.message}</p>
                        </div>
                        <button
                          onClick={() => updateInbox.mutate({ itemId: item.id, isResolved: !item.is_resolved })}
                          className="inline-flex items-center gap-1 text-xs font-medium text-emerald-600"
                        >
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          {item.is_resolved ? "Reopen" : "Resolve"}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <div className="flex items-center gap-2">
                  <CircleAlert className="h-4 w-4 text-slate-500" />
                  <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Review queue</h2>
                </div>
                <div className="mt-4 space-y-3">
                  {data.review_items.map((item) => (
                    <div key={item.id} className="rounded-2xl border border-slate-200 p-4 dark:border-slate-800">
                      <p className="font-medium text-slate-900 dark:text-white">{item.title}</p>
                      <p className="mt-1 text-sm text-slate-500">{item.message}</p>
                      <button
                        onClick={() => updateReview.mutate({ itemId: item.id, status: item.status === "open" ? "resolved" : "open" })}
                        className="mt-3 text-xs font-medium text-emerald-600"
                      >
                        {item.status === "open" ? "Mark resolved" : "Reopen"}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          </div>
        </ConsentGate>
      </main>
    </div>
  );
}
