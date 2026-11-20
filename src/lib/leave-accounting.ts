import { addDays, format, getDay, isAfter, isBefore, parseISO, subDays } from "date-fns";

export type LeavePolicyRules = {
  cycleType: "calendar_year" | "anniversary_year";
  excludeHolidays: boolean;
  excludeWeekends: boolean;
  weekendDays: number[];
};

const iso = (date: Date) => format(date, "yyyy-MM-dd");

export function getLeaveCycle(dateValue: string, joiningDate: string, cycleType: LeavePolicyRules["cycleType"]) {
  const date = parseISO(dateValue);
  if (cycleType === "calendar_year") {
    const year = date.getFullYear();
    return { start: `${year}-01-01`, end: `${year}-12-31` };
  }
  const joined = parseISO(joiningDate);
  let start = new Date(date.getFullYear(), joined.getMonth(), joined.getDate());
  if (isAfter(start, date)) start = new Date(date.getFullYear() - 1, joined.getMonth(), joined.getDate());
  const end = subDays(new Date(start.getFullYear() + 1, start.getMonth(), start.getDate()), 1);
  return { start: iso(start), end: iso(end) };
}

export function countChargeableLeaveDays(input: {
  dayFraction?: number;
  endDate: string;
  holidays?: string[];
  policy: Pick<LeavePolicyRules, "excludeHolidays" | "excludeWeekends" | "weekendDays">;
  startDate: string;
}) {
  let cursor = parseISO(input.startDate);
  const end = parseISO(input.endDate);
  if (isAfter(cursor, end)) throw new Error("End date cannot be before start date.");
  const holidays = new Set(input.holidays ?? []);
  let days = 0;
  while (!isAfter(cursor, end)) {
    const weekend = input.policy.excludeWeekends && input.policy.weekendDays.includes(getDay(cursor));
    const holiday = input.policy.excludeHolidays && holidays.has(iso(cursor));
    if (!weekend && !holiday) days += 1;
    cursor = addDays(cursor, 1);
  }
  const fraction = input.dayFraction ?? 1;
  if (fraction === 0.5) {
    if (input.startDate !== input.endDate || days !== 1) throw new Error("Half-day leave must be one working day.");
    return 0.5;
  }
  return days;
}

export function dateRangesOverlap(aStart: string, aEnd: string, bStart: string, bEnd: string) {
  return !isBefore(parseISO(aEnd), parseISO(bStart)) && !isAfter(parseISO(aStart), parseISO(bEnd));
}

export function availableLeaveBalance(ledgerAmounts: number[]) {
  return ledgerAmounts.reduce((total, amount) => total + amount, 0);
}

export function canRequestLeave(userActive: boolean, employmentStatus: "active" | "on_leave" | "inactive") {
  return userActive && employmentStatus !== "inactive";
}
