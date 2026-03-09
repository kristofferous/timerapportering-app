"use client";

import { create } from "zustand";
import { TimeEntry, ActiveSession, Settings } from "@/types";
import * as Store from "@/lib/store";
import { calcDurationMinutes, today, minutesToTime } from "@/lib/time-utils";

interface TimeStore {
  entries: TimeEntry[];
  activeSession: ActiveSession | null;
  settings: Settings;
  isLoaded: boolean;

  initialize: () => Promise<void>;
  clockIn: () => Promise<void>;
  clockOut: () => Promise<void>;
  addEntry: (entry: Omit<TimeEntry, "id" | "createdAt">) => Promise<void>;
  updateEntry: (id: string, updates: Partial<TimeEntry>) => Promise<void>;
  deleteEntry: (id: string) => Promise<void>;
  saveSettings: (settings: Settings) => Promise<void>;
}

export const useTimeStore = create<TimeStore>((set, get) => ({
  entries: [],
  activeSession: null,
  settings: {
    hourlyRateNOK: 0,
    maxHoursPerDay: 7.5,
    maxHoursPerWeek: 37.5,
    theme: "system" as const,
    exportPath: "",
    supplements: [],
  },
  isLoaded: false,

  initialize: async () => {
    const [entries, activeSession, settings] = await Promise.all([
      Store.getEntries(),
      Store.getActiveSession(),
      Store.getSettings(),
    ]);
    set({ entries, activeSession, settings, isLoaded: true });
  },

  clockIn: async () => {
    const session: ActiveSession = {
      startTime: new Date().toISOString(),
      date: today(),
    };
    await Store.saveActiveSession(session);
    set({ activeSession: session });
  },

  clockOut: async () => {
    const { activeSession, entries } = get();
    if (!activeSession) return;

    const startDate = new Date(activeSession.startTime);
    const endDate = new Date();
    const startTime = minutesToTime(
      startDate.getHours() * 60 + startDate.getMinutes()
    );
    const endTime = minutesToTime(
      endDate.getHours() * 60 + endDate.getMinutes()
    );
    const durationMinutes = calcDurationMinutes(startTime, endTime);

    if (durationMinutes <= 0) {
      await Store.saveActiveSession(null);
      set({ activeSession: null });
      return;
    }

    const newEntry: TimeEntry = {
      id: crypto.randomUUID(),
      date: activeSession.date,
      startTime,
      endTime,
      durationMinutes,
      note: "",
      isManual: false,
      createdAt: new Date().toISOString(),
    };

    const updatedEntries = [...entries, newEntry];
    await Promise.all([
      Store.saveEntries(updatedEntries),
      Store.saveActiveSession(null),
    ]);
    set({ entries: updatedEntries, activeSession: null });
  },

  addEntry: async (entry) => {
    const { entries } = get();
    const newEntry: TimeEntry = {
      ...entry,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
    };
    const updatedEntries = [...entries, newEntry];
    await Store.saveEntries(updatedEntries);
    set({ entries: updatedEntries });
  },

  updateEntry: async (id, updates) => {
    const { entries } = get();
    const updatedEntries = entries.map((e) =>
      e.id === id ? { ...e, ...updates } : e
    );
    await Store.saveEntries(updatedEntries);
    set({ entries: updatedEntries });
  },

  deleteEntry: async (id) => {
    const { entries } = get();
    const updatedEntries = entries.filter((e) => e.id !== id);
    await Store.saveEntries(updatedEntries);
    set({ entries: updatedEntries });
  },

  saveSettings: async (settings) => {
    await Store.saveSettings(settings);
    set({ settings });
  },
}));
