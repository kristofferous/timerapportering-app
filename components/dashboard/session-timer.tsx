"use client";

import { useTimeStore } from "@/hooks/use-time-store";
import { useLiveTimer } from "@/hooks/use-live-timer";
import { formatLiveTimer } from "@/lib/time-utils";

export function SessionTimer() {
  const activeSession = useTimeStore((s) => s.activeSession);
  const elapsed = useLiveTimer(activeSession?.startTime ?? null);

  if (!activeSession) return null;

  const startedAt = new Date(activeSession.startTime).toLocaleTimeString("nb-NO", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

  return (
    <div className="text-center select-none">
      <p className="text-[10px] font-medium tracking-[0.35em] uppercase text-muted-foreground mb-3">
        Økt pågår
      </p>
      <p className="font-mono text-6xl md:text-7xl font-bold tabular-nums tracking-tight text-emerald-400 leading-none">
        {formatLiveTimer(elapsed)}
      </p>
      <p className="text-xs text-muted-foreground mt-3">
        Startet kl.{" "}
        <span className="font-mono text-foreground/60">{startedAt}</span>
      </p>
    </div>
  );
}
