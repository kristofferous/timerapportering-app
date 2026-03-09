"use client";

import { Badge } from "@/components/ui/badge";
import { MonthSummary } from "@/lib/calculations";
import { formatMinutes, formatNOK, formatYearMonth } from "@/lib/time-utils";
import { ChevronRight, AlertTriangle } from "lucide-react";

interface Props {
  summary: MonthSummary;
  hourlyRate: number;
  onClick: () => void;
}

export function MonthCard({ summary, hourlyRate, onClick }: Props) {
  return (
    <button
      onClick={onClick}
      className="w-full text-left rounded-lg border border-border/50 bg-card p-5 hover:bg-accent/30 hover:border-border transition-all duration-200 group"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-3">
            <h3 className="text-sm font-semibold capitalize tracking-tight">
              {formatYearMonth(summary.yearMonth)}
            </h3>
            {summary.hasOverLimitWeek && (
              <Badge variant="destructive" className="text-[10px] h-4 px-1.5 gap-1">
                <AlertTriangle className="h-2.5 w-2.5" />
                Uke over grense
              </Badge>
            )}
          </div>

          <div className="flex items-baseline gap-5">
            <div>
              <p className="font-mono text-xl font-bold tabular-nums leading-none">
                {formatMinutes(summary.totalMinutes)}
              </p>
              <p className="text-[10px] text-muted-foreground mt-1 tracking-wide uppercase">
                Total tid
              </p>
            </div>

            {hourlyRate > 0 && (
              <div>
                <p className="font-mono text-xl font-bold tabular-nums leading-none text-emerald-400">
                  {formatNOK(summary.payNOK)}
                  <span className="text-sm font-medium text-emerald-400/70 ml-1">kr</span>
                </p>
                <p className="text-[10px] text-muted-foreground mt-1 tracking-wide uppercase">
                  Estimert lønn
                </p>
              </div>
            )}

            <div>
              <p className="font-mono text-xl font-bold tabular-nums leading-none">
                {summary.entryCount}
              </p>
              <p className="text-[10px] text-muted-foreground mt-1 tracking-wide uppercase">
                {summary.entryCount === 1 ? "økt" : "økter"}
              </p>
            </div>
          </div>
        </div>

        <ChevronRight className="h-4 w-4 text-muted-foreground/40 group-hover:text-muted-foreground shrink-0 mt-1 transition-colors" />
      </div>
    </button>
  );
}
