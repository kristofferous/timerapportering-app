"use client";

import { ClockButton } from "@/components/dashboard/clock-button";
import { SessionTimer } from "@/components/dashboard/session-timer";
import { TodaySummary } from "@/components/dashboard/today-summary";

export default function DashboardPage() {
  return (
    <div className="flex flex-col gap-10 max-w-3xl mx-auto">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Registrer arbeidstid</p>
      </div>

      <div className="flex flex-col items-center justify-center gap-10 py-8">
        <SessionTimer />
        <ClockButton />
      </div>

      <TodaySummary />
    </div>
  );
}
