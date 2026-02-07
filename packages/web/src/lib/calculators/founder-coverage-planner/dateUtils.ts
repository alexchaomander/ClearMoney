export type DateOnly = string;

function pad2(n: number): string {
  return String(n).padStart(2, "0");
}

export function isDateOnly(value: string): value is DateOnly {
  return /^\d{4}-\d{2}-\d{2}$/.test(value);
}

export function parseDateOnlyUtc(dateOnly: DateOnly): Date {
  const [y, m, d] = dateOnly.split("-").map((x) => Number(x));
  return new Date(Date.UTC(y, m - 1, d));
}

export function formatDateOnlyUtc(date: Date): DateOnly {
  return `${date.getUTCFullYear()}-${pad2(date.getUTCMonth() + 1)}-${pad2(date.getUTCDate())}`;
}

export function addDaysUtc(date: Date, days: number): Date {
  const next = new Date(date);
  next.setUTCDate(next.getUTCDate() + days);
  return next;
}

export function isWeekendUtc(date: Date): boolean {
  const d = date.getUTCDay();
  return d === 0 || d === 6;
}

function getObservedFixedHolidayUtc(year: number, monthIndex0: number, day: number): DateOnly {
  const base = new Date(Date.UTC(year, monthIndex0, day));
  const weekday = base.getUTCDay();
  if (weekday === 6) return formatDateOnlyUtc(addDaysUtc(base, -1)); // Saturday -> Friday
  if (weekday === 0) return formatDateOnlyUtc(addDaysUtc(base, 1)); // Sunday -> Monday
  return formatDateOnlyUtc(base);
}

function nthWeekdayOfMonthUtc(args: {
  year: number;
  monthIndex0: number;
  weekday0Sun: number;
  n: number;
}): DateOnly {
  const { year, monthIndex0, weekday0Sun, n } = args;
  const first = new Date(Date.UTC(year, monthIndex0, 1));
  const offset = (weekday0Sun - first.getUTCDay() + 7) % 7;
  const day = 1 + offset + (n - 1) * 7;
  return formatDateOnlyUtc(new Date(Date.UTC(year, monthIndex0, day)));
}

function lastWeekdayOfMonthUtc(args: {
  year: number;
  monthIndex0: number;
  weekday0Sun: number;
}): DateOnly {
  const { year, monthIndex0, weekday0Sun } = args;
  const firstNextMonth = new Date(Date.UTC(year, monthIndex0 + 1, 1));
  const lastDay = addDaysUtc(firstNextMonth, -1);
  const offset = (lastDay.getUTCDay() - weekday0Sun + 7) % 7;
  return formatDateOnlyUtc(addDaysUtc(lastDay, -offset));
}

function buildUsFederalHolidaySet(year: number): Set<DateOnly> {
  // Observed dates for common federal holidays (sufficient for educational shifting).
  const set = new Set<DateOnly>();
  set.add(getObservedFixedHolidayUtc(year, 0, 1)); // New Year's Day
  set.add(nthWeekdayOfMonthUtc({ year, monthIndex0: 0, weekday0Sun: 1, n: 3 })); // MLK (3rd Mon Jan)
  set.add(nthWeekdayOfMonthUtc({ year, monthIndex0: 1, weekday0Sun: 1, n: 3 })); // Presidents' Day (3rd Mon Feb)
  set.add(lastWeekdayOfMonthUtc({ year, monthIndex0: 4, weekday0Sun: 1 })); // Memorial Day (last Mon May)
  set.add(getObservedFixedHolidayUtc(year, 5, 19)); // Juneteenth (Jun 19)
  set.add(getObservedFixedHolidayUtc(year, 6, 4)); // Independence Day (Jul 4)
  set.add(nthWeekdayOfMonthUtc({ year, monthIndex0: 8, weekday0Sun: 1, n: 1 })); // Labor Day (1st Mon Sep)
  set.add(nthWeekdayOfMonthUtc({ year, monthIndex0: 9, weekday0Sun: 1, n: 2 })); // Columbus/Indigenous Peoples (2nd Mon Oct)
  set.add(getObservedFixedHolidayUtc(year, 10, 11)); // Veterans Day (Nov 11)
  set.add(nthWeekdayOfMonthUtc({ year, monthIndex0: 10, weekday0Sun: 4, n: 4 })); // Thanksgiving (4th Thu Nov)
  set.add(getObservedFixedHolidayUtc(year, 11, 25)); // Christmas (Dec 25)
  return set;
}

export function nextBusinessDayDateOnlyUtc(dateOnly: DateOnly): DateOnly {
  let date = parseDateOnlyUtc(dateOnly);
  const holidays = new Set<DateOnly>([
    ...buildUsFederalHolidaySet(date.getUTCFullYear()),
    ...buildUsFederalHolidaySet(date.getUTCFullYear() + 1),
  ]);

  // Move forward until a weekday that is not an observed federal holiday.
  while (isWeekendUtc(date) || holidays.has(formatDateOnlyUtc(date))) {
    date = addDaysUtc(date, 1);
  }

  return formatDateOnlyUtc(date);
}
