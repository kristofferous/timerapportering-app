"use client";

import { useState } from "react";
import { useTimeStore } from "@/hooks/use-time-store";
import { LogIn, LogOut, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export function ClockButton() {
  const activeSession = useTimeStore((s) => s.activeSession);
  const clockIn = useTimeStore((s) => s.clockIn);
  const clockOut = useTimeStore((s) => s.clockOut);
  const isLoaded = useTimeStore((s) => s.isLoaded);
  const [loading, setLoading] = useState(false);

  if (!isLoaded) {
    return <div className="w-44 h-44 rounded-full bg-muted/30 animate-pulse" />;
  }

  const handleClick = async () => {
    setLoading(true);
    try {
      if (activeSession) {
        await clockOut();
      } else {
        await clockIn();
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex items-center justify-center">
      {/* Outer decorative ring */}
      <span
        className={cn(
          "absolute inset-[-14px] rounded-full border",
          activeSession ? "border-red-500/10" : "border-primary/10"
        )}
      />
      {/* Middle ring */}
      <span
        className={cn(
          "absolute inset-[-5px] rounded-full border",
          activeSession ? "border-red-500/20" : "border-primary/20"
        )}
      />
      {/* Ping ring — only when session is active */}
      {activeSession && !loading && (
        <span className="absolute inset-[-5px] rounded-full border border-red-500/30 animate-ping" />
      )}

      <button
        onClick={handleClick}
        disabled={loading}
        className={cn(
          "relative flex flex-col items-center justify-center gap-2",
          "w-44 h-44 rounded-full border-2",
          "font-medium text-xs tracking-[0.14em] uppercase",
          "transition-all duration-500 ease-out",
          "outline-none focus-visible:ring-2 focus-visible:ring-offset-4 focus-visible:ring-offset-background",
          "disabled:opacity-60 disabled:cursor-wait cursor-pointer select-none",
          activeSession
            ? "border-red-500/50 bg-red-500/8 text-red-400 hover:bg-red-500/14 focus-visible:ring-red-500 animate-session-glow"
            : "border-primary/50 bg-primary/8 text-primary hover:bg-primary/14 focus-visible:ring-primary animate-idle-glow"
        )}
      >
        {loading ? (
          <Loader2 className="h-7 w-7 animate-spin" />
        ) : activeSession ? (
          <>
            <LogOut className="h-7 w-7" />
            <span>Klokk ut</span>
          </>
        ) : (
          <>
            <LogIn className="h-7 w-7" />
            <span>Klokk inn</span>
          </>
        )}
      </button>
    </div>
  );
}
