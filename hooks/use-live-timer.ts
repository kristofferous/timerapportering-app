"use client";

import { useState, useEffect } from "react";

export function useLiveTimer(startTime: string | null): number {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (!startTime) {
      setElapsed(0);
      return;
    }

    const calc = () => {
      const start = new Date(startTime).getTime();
      const now = Date.now();
      setElapsed(Math.floor((now - start) / 1000));
    };

    calc();
    const interval = setInterval(calc, 1000);
    return () => clearInterval(interval);
  }, [startTime]);

  return elapsed;
}
