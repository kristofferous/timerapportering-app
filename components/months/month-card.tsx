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
  const hasSupplements = summary.supplementNOK > 0;

  return (
    <button
      onClick={onClick}
      className="w-full text-left rounded-md border border-border/40 bg-card px-4 py-3 hover:bg-accent/20 hover:border-border/70 transition-all duration-150 group"
    >
      <div className="flex items-center gap-3">
        {/* Month name */}
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <span className="text-sm font-medium capitalize truncate">
            {formatYearMonth(summary.yearMonth)}
          </span>
          {summary.hasOverLimitWeek && (
            <Badge variant="destructive" className="text-[10px] h-4 px-1.5 gap-1 shrink-0">
              <AlertTriangle className="h-2.5 w-2.5" />
              Over grense
            </Badge>
          )}
        </div>

        {/* Stats */}
        <div className="flex items-center gap-5 shrink-0">
          <span className="font-mono text-sm tabular-nums text-muted-foreground">
            {formatMinutes(summary.totalMinutes)}
          </span>

          {hourlyRate > 0 && (
            <div className="text-right">
              <span className="font-mono text-sm font-semibold tabular-nums text-emerald-400">
                {formatNOK(summary.payNOK)}
                <span className="text-xs font-normal text-emerald-400/60 ml-0.5">kr</span>
              </span>
              {hasSupplements && (
                <div className="text-[10px] text-muted-foreground tabular-nums text-right leading-none mt-0.5">
                  +{formatNOK(summary.supplementNOK)} tillegg
                </div>
              )}
            </div>
          )}

          <span className="text-xs text-muted-foreground tabular-nums w-6 text-right">
            {summary.entryCount}
          </span>
        </div>

        <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/30 group-hover:text-muted-foreground shrink-0 transition-colors" />
      </div>
    </button>
  );
}
