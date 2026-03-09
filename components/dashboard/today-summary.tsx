"use client";

import { useTimeStore } from "@/hooks/use-time-store";
import { Badge } from "@/components/ui/badge";
import { getTodayMinutes, getWeekMinutes } from "@/lib/calculations";
import { formatMinutes, formatHoursDecimal, today } from "@/lib/time-utils";
import { Clock, CalendarDays, History } from "lucide-react";

export function TodaySummary() {
  const { entries, settings, isLoaded } = useTimeStore();
  const todayStr = today();

  if (!isLoaded) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-28 animate-pulse bg-card rounded-lg border border-border/50" />
        ))}
      </div>
    );
  }

  const todayMinutes = getTodayMinutes(entries, todayStr);
  const weekMinutes = getWeekMinutes(entries, todayStr);
  const maxWeekMinutes = settings.maxHoursPerWeek * 60;
  const weekProgress = Math.min((weekMinutes / maxWeekMinutes) * 100, 100);
  const isWeekOverLimit = weekMinutes > maxWeekMinutes;

  const recentEntries = [...entries]
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, 3);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* Today */}
      <div className="rounded-lg border border-border/50 bg-card p-5">
        <div className="flex items-center justify-between mb-4">
          <p className="text-[10px] font-medium tracking-[0.25em] uppercase text-muted-foreground">
            I dag
          </p>
          <Clock className="h-3.5 w-3.5 text-muted-foreground/50" />
        </div>
        <p className="font-mono text-3xl font-bold tabular-nums leading-none">
          {formatHoursDecimal(todayMinutes)}
          <span className="text-lg font-medium text-muted-foreground ml-1">t</span>
        </p>
        <p className="text-xs text-muted-foreground mt-2">{formatMinutes(todayMinutes)} totalt</p>
      </div>

      {/* This week */}
      <div className="rounded-lg border border-border/50 bg-card p-5">
        <div className="flex items-center justify-between mb-4">
          <p className="text-[10px] font-medium tracking-[0.25em] uppercase text-muted-foreground">
            Denne uken
          </p>
          <CalendarDays className="h-3.5 w-3.5 text-muted-foreground/50" />
        </div>
        <div className="flex items-baseline gap-2">
          <p className="font-mono text-3xl font-bold tabular-nums leading-none">
            {formatHoursDecimal(weekMinutes)}
            <span className="text-lg font-medium text-muted-foreground ml-1">t</span>
          </p>
          {isWeekOverLimit && (
            <Badge variant="destructive" className="text-[10px] h-4 px-1.5">
              Over
            </Badge>
          )}
        </div>
        <div className="mt-3 space-y-1.5">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{Math.round(weekProgress)}%</span>
            <span>av {settings.maxHoursPerWeek}t</span>
          </div>
          <div className="h-1 w-full bg-secondary rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-700 ${
                isWeekOverLimit ? "bg-destructive" : "bg-primary"
              }`}
              style={{ width: `${weekProgress}%` }}
            />
          </div>
        </div>
      </div>

      {/* Recent entries */}
      <div className="rounded-lg border border-border/50 bg-card p-5">
        <div className="flex items-center justify-between mb-4">
          <p className="text-[10px] font-medium tracking-[0.25em] uppercase text-muted-foreground">
            Siste
          </p>
          <History className="h-3.5 w-3.5 text-muted-foreground/50" />
        </div>
        {recentEntries.length === 0 ? (
          <p className="text-xs text-muted-foreground">Ingen registreringer ennå</p>
        ) : (
          <ul className="space-y-2">
            {recentEntries.map((e) => (
              <li key={e.id} className="flex items-center justify-between gap-2">
                <span className="text-xs text-muted-foreground truncate">{e.date}</span>
                <span className="font-mono text-xs text-foreground/70 shrink-0">
                  {e.startTime}–{e.endTime}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
