"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { CheckCircle2, FolderOpen, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useTimeStore } from "@/hooks/use-time-store";

const schema = z.object({
  hourlyRateNOK: z.coerce.number().min(0, "Kan ikke være negativ"),
  maxHoursPerDay: z.coerce.number().min(0.5, "Minst 0.5 timer").max(24, "Maks 24 timer"),
  maxHoursPerWeek: z.coerce.number().min(1, "Minst 1 time").max(168, "Maks 168 timer"),
  theme: z.enum(["light", "dark", "system"]),
  exportPath: z.string(),
});

type FormValues = z.infer<typeof schema>;

function SettingRow({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-baseline justify-between">
        <span className="text-sm font-medium">{label}</span>
        {hint && <span className="text-xs text-muted-foreground">{hint}</span>}
      </div>
      {children}
    </div>
  );
}

const isTauri = () =>
  typeof window !== "undefined" && "__TAURI_INTERNALS__" in window;

export function SettingsForm() {
  const { settings, saveSettings, isLoaded } = useTimeStore();
  const [saved, setSaved] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      hourlyRateNOK: 0,
      maxHoursPerDay: 7.5,
      maxHoursPerWeek: 37.5,
      theme: "system",
      exportPath: "",
    },
  });

  useEffect(() => {
    if (isLoaded) {
      form.reset({
        hourlyRateNOK: settings.hourlyRateNOK,
        maxHoursPerDay: settings.maxHoursPerDay,
        maxHoursPerWeek: settings.maxHoursPerWeek,
        theme: settings.theme,
        exportPath: settings.exportPath,
      });
    }
  }, [isLoaded, settings, form]);

  const onSubmit = async (values: FormValues) => {
    await saveSettings(values);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const browseExportPath = async (onChange: (v: string) => void) => {
    if (!isTauri()) return;
    try {
      const { open } = await import("@tauri-apps/plugin-dialog");
      const result = await open({ directory: true, multiple: false });
      if (typeof result === "string") onChange(result);
    } catch (err) {
      console.error("Failed to open folder picker:", err);
    }
  };

  if (!isLoaded) {
    return (
      <div className="max-w-sm space-y-5">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="h-14 animate-pulse bg-muted/50 rounded-lg border border-border/50" />
        ))}
      </div>
    );
  }

  return (
    <div className="max-w-sm">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Timesats */}
          <FormField
            control={form.control}
            name="hourlyRateNOK"
            render={({ field }) => (
              <FormItem>
                <SettingRow label="Timesats" hint="NOK per time">
                  <FormControl>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground font-mono">
                        kr
                      </span>
                      <Input type="number" min="0" step="1" className="pl-8 font-mono" {...field} />
                    </div>
                  </FormControl>
                </SettingRow>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="h-px bg-border/50" />

          {/* Maks timer per dag */}
          <FormField
            control={form.control}
            name="maxHoursPerDay"
            render={({ field }) => (
              <FormItem>
                <SettingRow label="Maks timer per dag" hint="0.5–24t">
                  <FormControl>
                    <div className="relative">
                      <Input type="number" min="0.5" max="24" step="0.5" className="font-mono" {...field} />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">t</span>
                    </div>
                  </FormControl>
                </SettingRow>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Maks timer per uke */}
          <FormField
            control={form.control}
            name="maxHoursPerWeek"
            render={({ field }) => (
              <FormItem>
                <SettingRow label="Maks timer per uke" hint="1–168t">
                  <FormControl>
                    <div className="relative">
                      <Input type="number" min="1" max="168" step="0.5" className="font-mono" {...field} />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">t</span>
                    </div>
                  </FormControl>
                </SettingRow>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="h-px bg-border/50" />

          {/* Theme */}
          <FormField
            control={form.control}
            name="theme"
            render={({ field }) => (
              <FormItem>
                <SettingRow label="Utseende">
                  <div className="flex gap-2">
                    {(["light", "dark", "system"] as const).map((t) => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => field.onChange(t)}
                        className={`flex-1 py-2 rounded-md border text-xs font-medium transition-all ${
                          field.value === t
                            ? "border-primary bg-primary/10 text-primary"
                            : "border-border text-muted-foreground hover:border-border/80 hover:text-foreground"
                        }`}
                      >
                        {t === "light" ? "Lys" : t === "dark" ? "Mørk" : "System"}
                      </button>
                    ))}
                  </div>
                </SettingRow>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="h-px bg-border/50" />

          {/* Export path */}
          <FormField
            control={form.control}
            name="exportPath"
            render={({ field }) => (
              <FormItem>
                <SettingRow
                  label="Eksportmappe"
                  hint="Standard lagringsplass"
                >
                  <FormControl>
                    <div className="flex gap-2">
                      <Input
                        readOnly
                        value={field.value}
                        placeholder="Velg mappe (valgfritt)…"
                        className="flex-1 cursor-default font-mono text-xs"
                        onClick={() => browseExportPath(field.onChange)}
                      />
                      {isTauri() && (
                        <button
                          type="button"
                          onClick={() => browseExportPath(field.onChange)}
                          className="inline-flex items-center justify-center h-10 w-10 rounded-md border border-input bg-background hover:bg-accent transition-colors shrink-0"
                          title="Velg mappe"
                        >
                          <FolderOpen className="h-4 w-4 text-muted-foreground" />
                        </button>
                      )}
                      {field.value && (
                        <button
                          type="button"
                          onClick={() => field.onChange("")}
                          className="inline-flex items-center justify-center h-10 w-10 rounded-md border border-input bg-background hover:bg-accent transition-colors shrink-0"
                          title="Fjern"
                        >
                          <X className="h-4 w-4 text-muted-foreground" />
                        </button>
                      )}
                    </div>
                  </FormControl>
                </SettingRow>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex items-center gap-3 pt-1">
            <Button type="submit" disabled={form.formState.isSubmitting} size="sm">
              Lagre
            </Button>
            {saved && (
              <span className="flex items-center gap-1.5 text-xs text-emerald-400">
                <CheckCircle2 className="h-3.5 w-3.5" />
                Lagret
              </span>
            )}
          </div>
        </form>
      </Form>
    </div>
  );
}
