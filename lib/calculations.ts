import {
  startOfISOWeek,
  endOfISOWeek,
  getISOWeek,
  parseISO,
  isWithinInterval,
} from "date-fns";
import { TimeEntry, Settings } from "@/types";
import { yearMonthFromDate } from "./time-utils";

export interface WeekSummary {
  weekNumber: number;
  weekStart: string; // YYYY-MM-DD
  weekEnd: string; // YYYY-MM-DD
  totalMinutes: number;
  entries: TimeEntry[];
  isOverLimit: boolean;
}

export interface MonthSummary {
  yearMonth: string;
  totalMinutes: number;
  payNOK: number;
  entryCount: number;
  weeks: WeekSummary[];
  hasOverLimitWeek: boolean;
}

function dateToString(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
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
    const payNOK = (totalMinutes / 60) * settings.hourlyRateNOK;
    const weeks = groupByWeek(monthEntries, settings);
    const hasOverLimitWeek = weeks.some((w) => w.isOverLimit);

    summaries.push({
      yearMonth,
      totalMinutes,
      payNOK,
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
    const maxMinutes = settings.maxHoursPerWeek * 60;

    summaries.push({
      weekNumber: getISOWeek(weekStart),
      weekStart: weekStartStr,
      weekEnd: dateToString(weekEnd),
      totalMinutes,
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
