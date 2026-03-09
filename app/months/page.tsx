"use client";

import { useState } from "react";
import { useTimeStore } from "@/hooks/use-time-store";
import { groupByMonth } from "@/lib/calculations";
import { MonthCard } from "@/components/months/month-card";
import { MonthDetail } from "@/components/months/month-detail";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { formatYearMonth } from "@/lib/time-utils";

export default function MonthsPage() {
  const { entries, settings, isLoaded } = useTimeStore();
  const [selectedMonth, setSelectedMonth] = useState<string | null>(null);

  if (!isLoaded) {
    return (
      <div className="max-w-2xl mx-auto space-y-3">
        <div className="h-6 w-32 bg-muted animate-pulse rounded" />
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-24 bg-card animate-pulse rounded-lg border border-border/50" />
        ))}
      </div>
    );
  }

  const months = groupByMonth(entries, settings);

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Måneder</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Oversikt over alle registrerte måneder
        </p>
      </div>

      {months.length === 0 ? (
        <div className="rounded-lg border border-border/50 bg-card p-10 text-center">
          <p className="text-sm text-muted-foreground">
            Ingen registreringer ennå. Klokk inn for å komme i gang!
          </p>
        </div>
      ) : (
        <ScrollArea className="h-[600px] pr-2">
          <div className="space-y-2">
            {months.map((month) => (
              <MonthCard
                key={month.yearMonth}
                summary={month}
                hourlyRate={settings.hourlyRateNOK}
                onClick={() => setSelectedMonth(month.yearMonth)}
              />
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
