"use client";

import { useMemo } from "react";
import {
  buildActionPlan,
  type ActionItem,
  type CalendarEvent,
} from "@/lib/calculators/founder-coverage-planner/actionPlan";
import type {
  CalculatorInputs,
  CalculatorResults,
} from "@/lib/calculators/founder-coverage-planner/types";

export type { ActionItem, CalendarEvent };

export function useActionPlan(args: {
  inputs: CalculatorInputs;
  results: CalculatorResults;
}): {
  showSCorp: boolean;
  actionItems: ActionItem[];
  actionEvents: CalendarEvent[];
} {
  const { inputs, results } = args;

  const plan = useMemo(() => {
    return buildActionPlan({ inputs, results });
  }, [inputs, results]);

  return {
    showSCorp: plan.showSCorp,
    actionItems: plan.actionItems,
    actionEvents: plan.actionEvents,
  };
}
