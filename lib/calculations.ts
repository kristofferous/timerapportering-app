import {
  startOfISOWeek,
  endOfISOWeek,
  getISOWeek,
  parseISO,
  isWithinInterval,
} from "date-fns";
import { TimeEntry, Settings } from "@/types";
import { yearMonthFromDate, timeToMinutes } from "./time-utils";

export interface WeekSummary {
  weekNumber: number;
  weekStart: string; // YYYY-MM-DD
  weekEnd: string; // YYYY-MM-DD
  totalMinutes: number;
  basePayNOK: number;
  supplementNOK: number;
  totalPayNOK: number;
  entries: TimeEntry[];
  isOverLimit: boolean;
}

export interface MonthSummary {
  yearMonth: string;
  totalMinutes: number;
  basePayNOK: number;
  supplementNOK: number;
  payNOK: number; // total (base + supplement)
  entryCount: number;
  weeks: WeekSummary[];
  hasOverLimitWeek: boolean;
}

function dateToString(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

/** Calculate supplement pay for a single entry based on supplement rules */
export function calcSupplementNOK(entry: TimeEntry, settings: Settings): number {
  if (!settings.supplements || settings.supplements.length === 0) return 0;
  if (settings.hourlyRateNOK <= 0) return 0;

  const [year, month, day] = entry.date.split("-").map(Number);
  const entryDate = new Date(year, month - 1, day);
  const dayOfWeek = entryDate.getDay(); // 0=Sun, 1=Mon, ..., 6=Sat

  const entryStart = timeToMinutes(entry.startTime);
  const entryEnd = timeToMinutes(entry.endTime);

  let supplementNOK = 0;

  for (const rule of settings.supplements) {
    if (!rule.days.includes(dayOfWeek)) continue;

    const ruleStart = timeToMinutes(rule.fromTime);
    // "24:00" is stored as string but timeToMinutes("24:00") = 1440
    const ruleEndStr = rule.toTime === "24:00" ? "23:59" : rule.toTime;
    const ruleEnd = rule.toTime === "24:00" ? 1440 : timeToMinutes(ruleEndStr);

    const overlapStart = Math.max(entryStart, ruleStart);
    const overlapEnd = Math.min(entryEnd, ruleEnd);
    const overlapMinutes = Math.max(0, overlapEnd - overlapStart);

    if (overlapMinutes > 0) {
      supplementNOK += (overlapMinutes / 60) * settings.hourlyRateNOK * (rule.percentage / 100);
    }
  }

  return supplementNOK;
}

export function groupByMonth(
  entries: TimeEntry[],
  settings: Settings
): MonthSummary[] {
  const monthMap = new Map<string, TimeEntry[]>();
  for (const entry of entries) {
    const ym = yearMonthFromDate(entry.date);
    if (!monthMap.has(ym)) monthMap.set(ym, []);
    monthMap.get(ym)!.push(entry);
  }

  const summaries: MonthSummary[] = [];
  for (const [yearMonth, monthEntries] of monthMap) {
    const totalMinutes = monthEntries.reduce(
      (sum, e) => sum + e.durationMinutes,
      0
    );
    const basePayNOK = (totalMinutes / 60) * settings.hourlyRateNOK;
    const supplementNOK = monthEntries.reduce(
      (sum, e) => sum + calcSupplementNOK(e, settings),
      0
    );
    const weeks = groupByWeek(monthEntries, settings);
    const hasOverLimitWeek = weeks.some((w) => w.isOverLimit);

    summaries.push({
      yearMonth,
      totalMinutes,
      basePayNOK,
      supplementNOK,
      payNOK: basePayNOK + supplementNOK,
      entryCount: monthEntries.length,
      weeks,
      hasOverLimitWeek,
    });
  }

  return summaries.sort((a, b) => b.yearMonth.localeCompare(a.yearMonth));
}

export function groupByWeek(
  entries: TimeEntry[],
  settings: Settings
): WeekSummary[] {
  const weekMap = new Map<string, TimeEntry[]>();

  for (const entry of entries) {
    const entryDate = parseISO(entry.date);
    const weekStart = startOfISOWeek(entryDate);
    const key = dateToString(weekStart);
    if (!weekMap.has(key)) weekMap.set(key, []);
    weekMap.get(key)!.push(entry);
  }

  const summaries: WeekSummary[] = [];
  for (const [weekStartStr, weekEntries] of weekMap) {
    const weekStart = parseISO(weekStartStr);
    const weekEnd = endOfISOWeek(weekStart);
    const totalMinutes = weekEntries.reduce(
      (sum, e) => sum + e.durationMinutes,
      0
    );
    const basePayNOK = (totalMinutes / 60) * settings.hourlyRateNOK;
    const supplementNOK = weekEntries.reduce(
      (sum, e) => sum + calcSupplementNOK(e, settings),
      0
    );
    const maxMinutes = settings.maxHoursPerWeek * 60;

    summaries.push({
      weekNumber: getISOWeek(weekStart),
      weekStart: weekStartStr,
      weekEnd: dateToString(weekEnd),
      totalMinutes,
      basePayNOK,
      supplementNOK,
      totalPayNOK: basePayNOK + supplementNOK,
      entries: weekEntries.sort((a, b) => a.date.localeCompare(b.date)),
      isOverLimit: totalMinutes > maxMinutes,
    });
  }

  return summaries.sort((a, b) => a.weekStart.localeCompare(b.weekStart));
}

export function getEntriesForDate(
  entries: TimeEntry[],
  date: string
): TimeEntry[] {
  return entries.filter((e) => e.date === date);
}

export function getEntriesForMonth(
  entries: TimeEntry[],
  yearMonth: string
): TimeEntry[] {
  return entries.filter((e) => yearMonthFromDate(e.date) === yearMonth);
}

export function getTodayMinutes(
  entries: TimeEntry[],
  date: string
): number {
  return getEntriesForDate(entries, date).reduce(
    (sum, e) => sum + e.durationMinutes,
    0
  );
}

export function getWeekMinutes(
  entries: TimeEntry[],
  date: string
): number {
  const d = parseISO(date);
  const weekStart = startOfISOWeek(d);
  const weekEnd = endOfISOWeek(d);
  return entries
    .filter((e) =>
      isWithinInterval(parseISO(e.date), { start: weekStart, end: weekEnd })
    )
    .reduce((sum, e) => sum + e.durationMinutes, 0);
}
