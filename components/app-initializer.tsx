"use client";

import { useEffect } from "react";
import { useTimeStore } from "@/hooks/use-time-store";

export function AppInitializer() {
  const initialize = useTimeStore((s) => s.initialize);

  useEffect(() => {
    initialize();
  }, [initialize]);

  return null;
}
