export function today(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export function calcDurationMinutes(
  startTime: string,
  endTime: string
): number {
  const [sh, sm] = startTime.split(":").map(Number);
  const [eh, em] = endTime.split(":").map(Number);
  return eh * 60 + em - (sh * 60 + sm);
}

export function formatMinutes(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (m === 0) return `${h}t`;
  return `${h}t ${m}m`;
}

export function formatHoursDecimal(minutes: number): string {
  return (minutes / 60).toFixed(1);
}

export function formatNOK(amount: number): string {
  return new Intl.NumberFormat("nb-NO", {
    style: "decimal",
    maximumFractionDigits: 0,
  }).format(Math.round(amount));
}

export function formatLiveTimer(totalSeconds: number): string {
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  return [h, m, s].map((n) => String(n).padStart(2, "0")).join(":");
}

export function timeToMinutes(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

export function minutesToTime(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

export function yearMonthFromDate(date: string): string {
  return date.substring(0, 7); // "YYYY-MM"
}

export function formatYearMonth(yearMonth: string): string {
  const [year, month] = yearMonth.split("-");
  const d = new Date(Number(year), Number(month) - 1, 1);
  return d.toLocaleDateString("nb-NO", { month: "long", year: "numeric" });
}

export function formatDate(date: string): string {
  const [year, month, day] = date.split("-").map(Number);
  const d = new Date(year, month - 1, day);
  return d.toLocaleDateString("nb-NO", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
}
