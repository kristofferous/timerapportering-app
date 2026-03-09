export interface TimeEntry {
  id: string;
  date: string; // "YYYY-MM-DD"
  startTime: string; // "HH:MM"
  endTime: string; // "HH:MM"
  durationMinutes: number;
  note: string;
  isManual: boolean;
  createdAt: string; // ISO 8601
}

export interface ActiveSession {
  startTime: string; // ISO 8601 full timestamp
  date: string; // "YYYY-MM-DD"
}

export type Theme = "light" | "dark" | "system";

export interface Settings {
  hourlyRateNOK: number;
  maxHoursPerDay: number;
  maxHoursPerWeek: number;
  theme: Theme;
  exportPath: string;
}
