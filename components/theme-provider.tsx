"use client";

import { useEffect } from "react";
import { useTimeStore } from "@/hooks/use-time-store";
import { Theme } from "@/types";

export function applyTheme(theme: Theme) {
  const root = document.documentElement;
  if (theme === "dark") {
    root.classList.add("dark");
  } else if (theme === "light") {
    root.classList.remove("dark");
  } else {
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    root.classList.toggle("dark", prefersDark);
  }
}

export function ThemeProvider() {
  const theme = useTimeStore((s) => s.settings.theme);
  const isLoaded = useTimeStore((s) => s.isLoaded);

  // Apply theme from localStorage immediately on mount (before store loads)
  useEffect(() => {
    const saved = localStorage.getItem("theme") as Theme | null;
    if (saved) applyTheme(saved);
  }, []);

  // Apply theme once store is loaded, and persist to localStorage
  useEffect(() => {
    if (!isLoaded) return;
    localStorage.setItem("theme", theme);
    applyTheme(theme);
  }, [theme, isLoaded]);

  // Re-apply when system preference changes (relevant for "system" mode)
  useEffect(() => {
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = () => applyTheme(theme);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, [theme]);

  return null;
}
