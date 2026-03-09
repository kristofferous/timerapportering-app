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

// 0=Sunday, 1=Monday, ..., 6=Saturday (JS Date.getDay() convention)
export interface SupplementRule {
  id: string;
  label: string;       // e.g. "Kveldstillegg"
  days: number[];      // which weekdays this applies to
  fromTime: string;    // "HH:MM" — start of supplement window
  toTime: string;      // "HH:MM" — end of supplement window ("24:00" for midnight)
  percentage: number;  // e.g. 50 means 50% extra on top of base rate
}

export interface Settings {
  hourlyRateNOK: number;
  maxHoursPerDay: number;
  maxHoursPerWeek: number;
  theme: Theme;
  exportPath: string;
  supplements: SupplementRule[];
}

// Norwegian tariff defaults (based on KS/NHO-LO agreements)
export const DEFAULT_SUPPLEMENTS: SupplementRule[] = [
  {
    id: "weekday-evening",
    label: "Kveldstillegg (man–fre)",
    days: [1, 2, 3, 4, 5],
    fromTime: "18:00",
    toTime: "21:00",
    percentage: 25,
  },
  {
    id: "weekday-night",
    label: "Nattillegg (man–fre)",
    days: [1, 2, 3, 4, 5],
    fromTime: "21:00",
    toTime: "24:00",
    percentage: 50,
  },
  {
    id: "saturday-afternoon",
    label: "Lørdagstillegg etter kl. 13",
    days: [6],
    fromTime: "13:00",
    toTime: "16:00",
    percentage: 25,
  },
  {
    id: "saturday-evening",
    label: "Lørdagstillegg etter kl. 16",
    days: [6],
    fromTime: "16:00",
    toTime: "24:00",
    percentage: 50,
  },
  {
    id: "sunday",
    label: "Søndagstillegg",
    days: [0],
    fromTime: "00:00",
    toTime: "24:00",
    percentage: 50,
  },
];
