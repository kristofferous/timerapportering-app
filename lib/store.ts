import { TimeEntry, ActiveSession, Settings } from "@/types";

const STORE_PATH = "timerapportering.json";

async function getStore() {
  const { load } = await import("@tauri-apps/plugin-store");
  return load(STORE_PATH);
}

export async function getEntries(): Promise<TimeEntry[]> {
  const store = await getStore();
  return (await store.get<TimeEntry[]>("entries")) ?? [];
}

export async function saveEntries(entries: TimeEntry[]): Promise<void> {
  const store = await getStore();
  await store.set("entries", entries);
}

export async function getActiveSession(): Promise<ActiveSession | null> {
  const store = await getStore();
  return (await store.get<ActiveSession | null>("activeSession")) ?? null;
}

export async function saveActiveSession(
  session: ActiveSession | null
): Promise<void> {
  const store = await getStore();
  await store.set("activeSession", session);
}

export async function getSettings(): Promise<Settings> {
  const store = await getStore();
  const saved = await store.get<Partial<Settings>>("settings");
  return {
    hourlyRateNOK: saved?.hourlyRateNOK ?? 0,
    maxHoursPerDay: saved?.maxHoursPerDay ?? 7.5,
    maxHoursPerWeek: saved?.maxHoursPerWeek ?? 37.5,
    theme: saved?.theme ?? "system",
    exportPath: saved?.exportPath ?? "",
  };
}

export async function saveSettings(settings: Settings): Promise<void> {
  const store = await getStore();
  await store.set("settings", settings);
}
