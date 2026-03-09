"use client";

import { useState } from "react";
import { useTimeStore } from "@/hooks/use-time-store";
import { groupByMonth, MonthSummary } from "@/lib/calculations";
import { MonthCard } from "@/components/months/month-card";
import { MonthDetail } from "@/components/months/month-detail";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { formatYearMonth, formatNOK, formatMinutes } from "@/lib/time-utils";

interface YearGroup {
  year: string;
  months: MonthSummary[];
  totalMinutes: number;
  totalPayNOK: number;
}

function groupByYear(months: MonthSummary[]): YearGroup[] {
  const map = new Map<string, MonthSummary[]>();
  for (const m of months) {
    const year = m.yearMonth.substring(0, 4);
    if (!map.has(year)) map.set(year, []);
    map.get(year)!.push(m);
  }
  return Array.from(map.entries())
    .map(([year, ms]) => ({
      year,
      months: ms,
      totalMinutes: ms.reduce((s, m) => s + m.totalMinutes, 0),
      totalPayNOK: ms.reduce((s, m) => s + m.payNOK, 0),
    }))
    .sort((a, b) => b.year.localeCompare(a.year));
}

export default function MonthsPage() {
  const { entries, settings, isLoaded } = useTimeStore();
  const [selectedMonth, setSelectedMonth] = useState<string | null>(null);

  if (!isLoaded) {
    return (
      <div className="max-w-2xl mx-auto space-y-3">
        <div className="h-6 w-32 bg-muted animate-pulse rounded" />
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-12 bg-card animate-pulse rounded-md border border-border/50" />
        ))}
      </div>
    );
  }

  const months = groupByMonth(entries, settings);
  const years = groupByYear(months);

  const allTimeMinutes = months.reduce((s, m) => s + m.totalMinutes, 0);
  const allPayNOK = months.reduce((s, m) => s + m.payNOK, 0);
  const hasAnyPay = settings.hourlyRateNOK > 0;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Måneder</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Oversikt over alle registrerte måneder
          </p>
        </div>

        {months.length > 0 && (
          <div className="text-right">
            <p className="font-mono text-sm font-semibold tabular-nums">
              {formatMinutes(allTimeMinutes)}
              {hasAnyPay && (
                <span className="text-emerald-400 ml-3">
                  {formatNOK(allPayNOK)}
                  <span className="text-xs text-emerald-400/60 ml-0.5">kr</span>
                </span>
              )}
            </p>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider mt-0.5">Totalt alle år</p>
          </div>
        )}
      </div>

      {months.length === 0 ? (
        <div className="rounded-lg border border-border/50 bg-card p-10 text-center">
          <p className="text-sm text-muted-foreground">
            Ingen registreringer ennå. Klokk inn for å komme i gang!
          </p>
        </div>
      ) : (
        <ScrollArea className="h-[calc(100vh-200px)] pr-2">
          <div className="space-y-6 pb-4">
            {years.map((yearGroup) => (
              <div key={yearGroup.year}>
                {/* Year header */}
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-xs font-bold tracking-widest uppercase text-muted-foreground">
                    {yearGroup.year}
                  </span>
                  <div className="flex-1 h-px bg-border/40" />
                  <span className="font-mono text-xs tabular-nums text-muted-foreground">
                    {formatMinutes(yearGroup.totalMinutes)}
                    {hasAnyPay && yearGroup.totalPayNOK > 0 && (
                      <span className="text-emerald-400/80 ml-3">
                        {formatNOK(yearGroup.totalPayNOK)}
                        <span className="text-emerald-400/50 ml-0.5">kr</span>
                      </span>
                    )}
                  </span>
                </div>

                {/* Month cards */}
                <div className="space-y-1">
                  {yearGroup.months.map((month) => (
                    <MonthCard
                      key={month.yearMonth}
                      summary={month}
                      hourlyRate={settings.hourlyRateNOK}
                      onClick={() => setSelectedMonth(month.yearMonth)}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      )}

      <Sheet
        open={selectedMonth !== null}
        onOpenChange={(open) => !open && setSelectedMonth(null)}
      >
        <SheetContent side="right" className="w-full sm:max-w-xl overflow-y-auto">
          <SheetHeader>
            <SheetTitle className="capitalize text-base">
              {selectedMonth ? formatYearMonth(selectedMonth) : ""}
            </SheetTitle>
          </SheetHeader>
          {selectedMonth && <MonthDetail yearMonth={selectedMonth} />}
        </SheetContent>
      </Sheet>
    </div>
  );
}
