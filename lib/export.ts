import { toast } from "sonner";
import { WeekSummary } from "./calculations";
import { formatMinutes, formatNOK, formatYearMonth, formatDate } from "./time-utils";

const isTauri = () =>
  typeof window !== "undefined" && "__TAURI_INTERNALS__" in window;

export function exportMonthAsJSON(
  yearMonth: string,
  weeks: WeekSummary[],
  totalMinutes: number,
  payNOK: number,
  hourlyRateNOK: number
): string {
  return JSON.stringify(
    {
      period: yearMonth,
      totalHours: parseFloat((totalMinutes / 60).toFixed(2)),
      totalMinutes,
      estimatedPayNOK: hourlyRateNOK > 0 ? Math.round(payNOK) : null,
      weeks: weeks.map((w) => ({
        weekNumber: w.weekNumber,
        weekStart: w.weekStart,
        weekEnd: w.weekEnd,
        totalMinutes: w.totalMinutes,
        isOverLimit: w.isOverLimit,
        entries: w.entries.map((e) => ({
          date: e.date,
          startTime: e.startTime,
          endTime: e.endTime,
          durationMinutes: e.durationMinutes,
          durationHours: parseFloat((e.durationMinutes / 60).toFixed(2)),
          note: e.note || null,
          isManual: e.isManual,
        })),
      })),
    },
    null,
    2
  );
}

export function exportMonthAsText(
  yearMonth: string,
  weeks: WeekSummary[],
  totalMinutes: number,
  payNOK: number,
  hourlyRateNOK: number
): string {
  const title = `TIMERAPPORTERING — ${formatYearMonth(yearMonth).toUpperCase()}`;
  const sep = "═".repeat(Math.max(title.length, 50));
  const lines: string[] = [title, sep, ""];

  lines.push(`Total tid:      ${formatMinutes(totalMinutes)}`);
  if (hourlyRateNOK > 0) {
    lines.push(`Estimert lønn:  NOK ${formatNOK(payNOK)}`);
  }
  lines.push("");

  for (const week of weeks) {
    const weekMins = week.entries.reduce((s, e) => s + e.durationMinutes, 0);
    const overLabel = week.isOverLimit ? "  ⚠ OVER GRENSE" : "";
    lines.push(
      `Uke ${week.weekNumber}  (${week.weekStart} – ${week.weekEnd})   ${formatMinutes(weekMins)}${overLabel}`
    );
    lines.push("─".repeat(48));
    for (const entry of week.entries) {
      const date = formatDate(entry.date).padEnd(16);
      const time = `${entry.startTime}–${entry.endTime}`.padEnd(14);
      const dur = formatMinutes(entry.durationMinutes).padEnd(8);
      const note = entry.note ? entry.note : "";
      const manual = entry.isManual ? " [manuell]" : "";
      lines.push(`  ${date} ${time} ${dur}${note}${manual}`);
    }
    lines.push("");
  }

  return lines.join("\n");
}

function blobDownload(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export async function exportMonth(
  yearMonth: string,
  weeks: WeekSummary[],
  totalMinutes: number,
  payNOK: number,
  hourlyRateNOK: number,
  format: "json" | "text",
  exportPath: string
) {
  const ext = format === "json" ? "json" : "txt";
  const filename = `timerapportering-${yearMonth}.${ext}`;
  const content =
    format === "json"
      ? exportMonthAsJSON(yearMonth, weeks, totalMinutes, payNOK, hourlyRateNOK)
      : exportMonthAsText(yearMonth, weeks, totalMinutes, payNOK, hourlyRateNOK);
  const mimeType =
    format === "json" ? "application/json" : "text/plain;charset=utf-8";

  // Outside Tauri: fall back to browser download
  if (!isTauri()) {
    blobDownload(content, filename, mimeType);
    toast.success("Fil nedlastet", { description: filename });
    return;
  }

  try {
    const { invoke } = await import("@tauri-apps/api/core");
    let savePath: string | null = null;

    if (exportPath) {
      // Write directly to configured export directory
      savePath = `${exportPath}/${filename}`;
    } else {
      // Show native save dialog
      const { save } = await import("@tauri-apps/plugin-dialog");
      savePath = await save({
        defaultPath: filename,
        filters:
          format === "json"
            ? [{ name: "JSON", extensions: ["json"] }]
            : [{ name: "Tekstfil", extensions: ["txt"] }],
      });
    }

    if (!savePath) return; // User cancelled

    await invoke("write_file", { path: savePath, content });
    toast.success("Fil lagret", { description: savePath });
  } catch (err) {
    console.error("Export failed:", err);
    blobDownload(content, filename, mimeType);
    toast.error("Kunne ikke lagre til fil", {
      description: "Lastet ned i stedet: " + filename,
    });
  }
}
