import { toast } from "sonner";
import { WeekSummary } from "./calculations";
import { formatMinutes, formatNOK, formatYearMonth, formatDate, calcDurationMinutes } from "./time-utils";
import { TimeEntry } from "@/types";

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

/** Write an automatic backup of all entries to the configured export path. Silent on errors. */
export async function exportBackup(entries: TimeEntry[], exportPath: string): Promise<void> {
  if (!exportPath || !isTauri()) return;

  try {
    const { invoke } = await import("@tauri-apps/api/core");
    const dateStr = new Date().toISOString().split("T")[0];
    const path = `${exportPath}/backup-${dateStr}.json`;
    const content = JSON.stringify(entries, null, 2);
    await invoke("write_file", { path, content });
  } catch (err) {
    console.error("Auto-backup failed:", err);
  }
}

/**
 * Parse a JSON file (either month-export or backup format) and merge with existing entries.
 * Skips duplicates by date+startTime+endTime.
 */
export function importFromJSON(
  jsonString: string,
  existingEntries: TimeEntry[]
): { entries: TimeEntry[]; imported: number; skipped: number } {
  const parsed = JSON.parse(jsonString);

  let candidates: Partial<TimeEntry>[] = [];

  if (Array.isArray(parsed)) {
    // Backup format: raw array of TimeEntry objects
    candidates = parsed;
  } else if (parsed.weeks && Array.isArray(parsed.weeks)) {
    // Month export format
    for (const week of parsed.weeks) {
      if (week.entries && Array.isArray(week.entries)) {
        candidates.push(...week.entries);
      }
    }
  } else {
    throw new Error("Ukjent filformat — forventet backup-array eller måneds-eksport");
  }

  const existingKeys = new Set(
    existingEntries.map((e) => `${e.date}|${e.startTime}|${e.endTime}`)
  );

  let imported = 0;
  let skipped = 0;
  const newEntries: TimeEntry[] = [...existingEntries];

  for (const c of candidates) {
    if (!c.date || !c.startTime || !c.endTime) { skipped++; continue; }
    const key = `${c.date}|${c.startTime}|${c.endTime}`;
    if (existingKeys.has(key)) { skipped++; continue; }
    const durationMinutes = c.durationMinutes ?? calcDurationMinutes(c.startTime, c.endTime);
    if (durationMinutes <= 0) { skipped++; continue; }
    newEntries.push({
      id: crypto.randomUUID(),
      date: c.date,
      startTime: c.startTime,
      endTime: c.endTime,
      durationMinutes,
      note: c.note ?? "",
      isManual: true,
      createdAt: new Date().toISOString(),
    });
    existingKeys.add(key);
    imported++;
  }

  return { entries: newEntries, imported, skipped };
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
