"use client";

import { cn } from "@/lib/utils";

interface TimeInputProps {
  value?: string;
  onChange?: (value: string) => void;
  onBlur?: () => void;
  name?: string;
  disabled?: boolean;
  className?: string;
}

export function TimeInput({ value = "00:00", onChange, onBlur, name, disabled, className }: TimeInputProps) {
  const parts = (value || "00:00").split(":");
  const hours = parts[0]?.padStart(2, "0") ?? "00";
  const minutes = parts[1]?.padStart(2, "0") ?? "00";

  const update = (h: string, m: string) => {
    onChange?.(`${h}:${m}`);
  };

  const handleHours = (e: React.ChangeEvent<HTMLInputElement>) => {
    const num = parseInt(e.target.value);
    if (isNaN(num)) return;
    update(String(Math.max(0, Math.min(23, num))).padStart(2, "0"), minutes);
  };

  const handleMinutes = (e: React.ChangeEvent<HTMLInputElement>) => {
    const num = parseInt(e.target.value);
    if (isNaN(num)) return;
    update(hours, String(Math.max(0, Math.min(59, num))).padStart(2, "0"));
  };

  return (
    <div
      className={cn(
        "flex items-center font-mono border border-input rounded-md bg-background px-3 h-10 text-sm",
        "focus-within:ring-2 focus-within:ring-ring focus-within:outline-none",
        "transition-colors",
        disabled && "opacity-50 cursor-not-allowed",
        className
      )}
    >
      <input
        type="number"
        min={0}
        max={23}
        value={parseInt(hours)}
        onChange={handleHours}
        onBlur={onBlur}
        name={name}
        disabled={disabled}
        className="w-7 bg-transparent text-center outline-none tabular-nums [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
      />
      <span className="text-muted-foreground/60 select-none px-0.5">:</span>
      <input
        type="number"
        min={0}
        max={59}
        value={parseInt(minutes)}
        onChange={handleMinutes}
        onBlur={onBlur}
        disabled={disabled}
        className="w-7 bg-transparent text-center outline-none tabular-nums [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
      />
    </div>
  );
}
