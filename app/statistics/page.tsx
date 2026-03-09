"use client";

import { useTimeStore } from "@/hooks/use-time-store";
import {
  getWeeklyStats,
  getDayOfWeekStats,
  getMonthlyStats,
} from "@/lib/calculations";
import { formatMinutes } from "@/lib/time-utils";
import { BarChart } from "@/components/statistics/bar-chart";

export default function StatisticsPage() {
  const { entries, settings, isLoaded } = useTimeStore();

  if (!isLoaded) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="h-6 w-40 bg-muted animate-pulse rounded" />
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-48 bg-card animate-pulse rounded-lg border border-border/50" />
        ))}
      </div>
    );
  }

  const weeklyStats = getWeeklyStats(entries, 12);
  const dayStats = getDayOfWeekStats(entries);
  const monthlyStats = getMonthlyStats(entries, 6);

  const allMinutes = entries.reduce((s, e) => s + e.durationMinutes, 0);
  const weeklyWithData = weeklyStats.filter((w) => w.totalMinutes > 0);
  const avgWeekMinutes =
    weeklyWithData.length > 0
      ? weeklyWithData.reduce((s, w) => s + w.totalMinutes, 0) / weeklyWithData.length
      : 0;

  const busiestDayEntry =
    entries.length > 0
      ? entries.reduce((max, e) => (e.durationMinutes > max.durationMinutes ? e : max))
      : null;

  const weekLimitMinutes = settings.maxHoursPerWeek * 60;

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Statistikk</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Oversikt over arbeidsmønster og historikk
        </p>
      </div>

      {entries.length === 0 ? (
        <div className="rounded-lg border border-border/50 bg-card p-10 text-center">
          <p className="text-sm text-muted-foreground">
            Ingen data ennå — kom tilbake etter noen registreringer.
          </p>
        </div>
      ) : (
        <>
          {/* Summary cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <StatCard label="Totalt alle tider" value={formatMinutes(allMinutes)} />
            <StatCard label="Snitt per uke" value={formatMinutes(Math.round(avgWeekMinutes))} />
            <StatCard label="Antall registreringer" value={String(entries.length)} />
            {busiestDayEntry && (
              <StatCard
                label="Lengste økt"
                value={formatMinutes(busiestDayEntry.durationMinutes)}
                sub={busiestDayEntry.date}
              />
            )}
          </div>

          {/* Last 12 weeks */}
          <div className="rounded-lg border border-border/50 bg-card p-5 space-y-4">
            <div>
              <h2 className="text-sm font-semibold">Siste 12 uker</h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Timer per uke — stiplet linje viser ukerensen ({settings.maxHoursPerWeek}t)
              </p>
            </div>
            <BarChart
              bars={weeklyStats.map((w) => ({
                label: `U${w.weekNumber}`,
                minutes: w.totalMinutes,
              }))}
              limitMinutes={weekLimitMinutes}
            />
          </div>

          {/* Day of week */}
          <div className="rounded-lg border border-border/50 bg-card p-5 space-y-4">
            <div>
              <h2 className="text-sm font-semibold">Snitt per ukedag</h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Gjennomsnittlig timer for arbeidsdager med registreringer
              </p>
            </div>
            <BarChart
              bars={dayStats.map((d) => ({
                label: d.label,
                minutes: Math.round(d.avgMinutes),
                sublabel: d.count > 0 ? `${d.count} ganger` : "",
              }))}
            />
          </div>

          {/* Last 6 months */}
          <div className="rounded-lg border border-border/50 bg-card p-5 space-y-4">
            <div>
              <h2 className="text-sm font-semibold">Siste 6 måneder</h2>
              <p className="text-xs text-muted-foreground mt-0.5">Timer per måned</p>
            </div>
            <BarChart
              bars={monthlyStats.map((m) => ({
                label: m.label,
                minutes: m.totalMinutes,
              }))}
            />
          </div>
        </>
      )}
    </div>
  );
}

function StatCard({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="rounded-lg border border-border/50 bg-card p-4">
      <p className="text-[10px] font-medium tracking-[0.2em] uppercase text-muted-foreground mb-2">
        {label}
      </p>
      <p className="font-mono text-xl font-bold tabular-nums leading-none">{value}</p>
      {sub && <p className="text-xs text-muted-foreground mt-1">{sub}</p>}
    </div>
  );
}
