"use client";

import { cn } from "@/lib/utils";

interface Bar {
  label: string;
  minutes: number;
  sublabel?: string;
}

interface BarChartProps {
  bars: Bar[];
  maxMinutes?: number;
  limitMinutes?: number; // draws a reference line at this height
  formatValue?: (minutes: number) => string;
  className?: string;
}

export function BarChart({
  bars,
  maxMinutes,
  limitMinutes,
  formatValue = (m) => `${(m / 60).toFixed(1)}t`,
  className,
}: BarChartProps) {
  const max = maxMinutes ?? Math.max(...bars.map((b) => b.minutes), 1);

  return (
    <div className={cn("flex items-end gap-1.5 h-32 relative", className)}>
      {/* Reference line */}
      {limitMinutes && limitMinutes <= max && (
        <div
          className="absolute left-0 right-0 border-t border-dashed border-amber-400/50 pointer-events-none"
          style={{ bottom: `${(limitMinutes / max) * 100}%` }}
        />
      )}

      {bars.map((bar, i) => {
        const pct = max > 0 ? (bar.minutes / max) * 100 : 0;
        const isOver = limitMinutes ? bar.minutes > limitMinutes : false;
        return (
          <div
            key={i}
            className="flex flex-col items-center flex-1 h-full justify-end gap-1 group"
          >
            {bar.minutes > 0 && (
              <span className="text-[9px] text-muted-foreground tabular-nums opacity-0 group-hover:opacity-100 transition-opacity leading-none">
                {formatValue(bar.minutes)}
              </span>
            )}
            <div
              className={cn(
                "w-full rounded-t transition-all duration-500",
                bar.minutes === 0
                  ? "bg-muted/30"
                  : isOver
                  ? "bg-amber-400/70"
                  : "bg-primary/70 group-hover:bg-primary/90"
              )}
              style={{ height: `${Math.max(pct, bar.minutes > 0 ? 2 : 0)}%` }}
            />
            <span className="text-[9px] text-muted-foreground/60 truncate w-full text-center leading-none">
              {bar.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}
