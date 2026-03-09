"use client";

import { useEffect } from "react";
import { useTimeStore } from "@/hooks/use-time-store";
import { exportBackup } from "@/lib/export";

const BACKUP_DATE_KEY = "timerapportering:lastBackup";

export function AppInitializer() {
  const initialize = useTimeStore((s) => s.initialize);
  const isLoaded = useTimeStore((s) => s.isLoaded);
  const entries = useTimeStore((s) => s.entries);
  const settings = useTimeStore((s) => s.settings);

  useEffect(() => {
    initialize();
  }, [initialize]);

  useEffect(() => {
    if (!isLoaded) return;
    if (!settings.exportPath) return;

    const todayStr = new Date().toISOString().split("T")[0];
    const lastBackup = localStorage.getItem(BACKUP_DATE_KEY);
    if (lastBackup === todayStr) return;

    exportBackup(entries, settings.exportPath).then(() => {
      localStorage.setItem(BACKUP_DATE_KEY, todayStr);
    });
  }, [isLoaded, entries, settings.exportPath]);

  return null;
}
