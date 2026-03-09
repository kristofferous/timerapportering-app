"use client";

import { useTimeStore } from "@/hooks/use-time-store";
import { groupByWeek, getEntriesForMonth, calcSupplementNOK } from "@/lib/calculations";
import { MonthEntryRow } from "@/components/months/month-entry-row";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatMinutes, formatNOK } from "@/lib/time-utils";
import { exportMonth } from "@/lib/export";
import { Download, FileText, FileJson } from "lucide-react";

interface Props {
  yearMonth: string;
}

export function MonthDetail({ yearMonth }: Props) {
  const { entries, settings } = useTimeStore();

  const monthEntries = getEntriesForMonth(entries, yearMonth);
  const weeks = groupByWeek(monthEntries, settings);
  const totalMinutes = monthEntries.reduce((sum, e) => sum + e.durationMinutes, 0);
  const basePayNOK = (totalMinutes / 60) * settings.hourlyRateNOK;
  const supplementNOK = monthEntries.reduce((sum, e) => sum + calcSupplementNOK(e, settings), 0);
  const payNOK = basePayNOK + supplementNOK;

  const handleExport = (format: "json" | "text") => {
    exportMonth(
      yearMonth,
      weeks,
      totalMinutes,
      payNOK,
      settings.hourlyRateNOK,
      format,
      settings.exportPath
    );
  };

  return (
    <div className="space-y-5 pt-2 px-4 pb-6">
      {/* Summary stats */}
      <div className="grid grid-cols-2 gap-2">
        <div className="rounded-lg border border-border/50 bg-muted/30 p-3">
          <p className="text-[10px] font-medium tracking-wider uppercase text-muted-foreground mb-1.5">
            Total tid
          </p>
          <p className="font-mono text-base font-bold tabular-nums">{formatMinutes(totalMinutes)}</p>
        </div>

        {settings.hourlyRateNOK > 0 && (
          <div className="rounded-lg border border-border/50 bg-muted/30 p-3">
            <p className="text-[10px] font-medium tracking-wider uppercase text-muted-foreground mb-1.5">
              Estimert lønn
            </p>
            <p className="font-mono text-base font-bold tabular-nums text-emerald-400">
              {formatNOK(payNOK)}{" "}
              <span className="text-xs font-medium text-emerald-400/70">kr</span>
            </p>
            {supplementNOK > 0 && (
              <div className="mt-1.5 space-y-0.5">
                <div className="flex justify-between text-[10px] text-muted-foreground">
                  <span>Grunnlønn</span>
                  <span className="font-mono tabular-nums">{formatNOK(basePayNOK)} kr</span>
                </div>
                <div className="flex justify-between text-[10px] text-emerald-400/70">
                  <span>Tillegg</span>
                  <span className="font-mono tabular-nums">+{formatNOK(supplementNOK)} kr</span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Export */}
      <div className="flex items-center justify-between">
        {settings.exportPath ? (
          <p className="text-[10px] text-muted-foreground truncate max-w-[60%]">
            → {settings.exportPath}
          </p>
        ) : (
          <span />
        )}
        <DropdownMenu>
          <DropdownMenuTrigger className="inline-flex items-center gap-2 h-8 rounded-md border border-input bg-background px-3 text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-colors">
            <Download className="h-3.5 w-3.5" />
            Eksporter
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => handleExport("json")}>
              <FileJson className="mr-2 h-4 w-4" />
              JSON
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleExport("text")}>
              <FileText className="mr-2 h-4 w-4" />
              Lesbar tekst (.txt)
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Entries by week */}
      {monthEntries.length === 0 ? (
        <p className="text-sm text-muted-foreground py-4">
          Ingen registreringer denne måneden.
        </p>
      ) : (
        <div className="space-y-5">
          {weeks.map((week) => (
            <div key={week.weekStart}>
              <div className="flex items-center gap-3 mb-1">
                <span className="text-[10px] font-semibold tracking-[0.25em] uppercase text-muted-foreground">
                  Uke {week.weekNumber}
                </span>
                <div className="flex-1 h-px bg-border/50" />
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-medium">{formatMinutes(week.totalMinutes)}</span>
                  {settings.hourlyRateNOK > 0 && week.totalPayNOK > 0 && (
                    <span className="font-mono text-xs text-emerald-400/80">
                      {formatNOK(week.totalPayNOK)} kr
                      {week.supplementNOK > 0 && (
                        <span className="text-emerald-400/50 ml-1">
                          (+{formatNOK(week.supplementNOK)})
                        </span>
                      )}
                    </span>
                  )}
                  {week.isOverLimit && (
                    <Badge variant="destructive" className="text-[10px] h-4 px-1.5">
                      Over grense
                    </Badge>
                  )}
                </div>
              </div>
              <div>
                {week.entries.map((entry) => (
                  <MonthEntryRow key={entry.id} entry={entry} />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
