"use client";

import { useState, useEffect } from "react";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { CheckCircle2, FolderOpen, X, Plus, Trash2, RotateCcw } from "lucide-react";
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
import { DEFAULT_SUPPLEMENTS } from "@/types";

const supplementSchema = z.object({
  id: z.string(),
  label: z.string().min(1, "Påkrevd"),
  days: z.array(z.number()).min(1, "Velg minst én dag"),
  fromTime: z.string().regex(/^\d{2}:\d{2}$/, "Ugyldig tid"),
  toTime: z.string().regex(/^(\d{2}:\d{2}|24:00)$/, "Ugyldig tid"),
  percentage: z.coerce.number().min(1, "Min 1%").max(500, "Maks 500%"),
});

const schema = z.object({
  hourlyRateNOK: z.coerce.number().min(0, "Kan ikke være negativ"),
  maxHoursPerDay: z.coerce.number().min(0.5, "Minst 0.5 timer").max(24, "Maks 24 timer"),
  maxHoursPerWeek: z.coerce.number().min(1, "Minst 1 time").max(168, "Maks 168 timer"),
  theme: z.enum(["light", "dark", "system"]),
  exportPath: z.string(),
  supplements: z.array(supplementSchema),
});

type FormValues = z.infer<typeof schema>;

const DAY_LABELS = ["Søn", "Man", "Tir", "Ons", "Tor", "Fre", "Lør"];
// Ordered Mon–Sun for display
const DAY_ORDER = [1, 2, 3, 4, 5, 6, 0];

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
      supplements: DEFAULT_SUPPLEMENTS,
    },
  });

  const { fields, append, remove, replace } = useFieldArray({
    control: form.control,
    name: "supplements",
  });

  useEffect(() => {
    if (isLoaded) {
      form.reset({
        hourlyRateNOK: settings.hourlyRateNOK,
        maxHoursPerDay: settings.maxHoursPerDay,
        maxHoursPerWeek: settings.maxHoursPerWeek,
        theme: settings.theme,
        exportPath: settings.exportPath,
        supplements: settings.supplements ?? DEFAULT_SUPPLEMENTS,
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

  const addRule = () => {
    append({
      id: crypto.randomUUID(),
      label: "Nytt tillegg",
      days: [1, 2, 3, 4, 5],
      fromTime: "17:00",
      toTime: "21:00",
      percentage: 25,
    });
  };

  const resetToDefaults = () => {
    replace(DEFAULT_SUPPLEMENTS);
  };

  if (!isLoaded) {
    return (
      <div className="max-w-xl space-y-5">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="h-14 animate-pulse bg-muted/50 rounded-lg border border-border/50" />
        ))}
      </div>
    );
  }

  return (
    <div className="max-w-xl">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          {/* --- Lønn --- */}
          <section className="space-y-5">
            <h2 className="text-xs font-semibold tracking-widest uppercase text-muted-foreground">Lønn</h2>

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
          </section>

          <div className="h-px bg-border/50" />

          {/* --- Tillegg --- */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-semibold tracking-widest uppercase text-muted-foreground">Tillegg</h2>
              <button
                type="button"
                onClick={resetToDefaults}
                className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                <RotateCcw className="h-3 w-3" />
                Bruk norske standardsatser
              </button>
            </div>

            <div className="space-y-3">
              {fields.map((field, index) => (
                <div
                  key={field.id}
                  className="rounded-lg border border-border/60 bg-muted/20 p-3 space-y-3"
                >
                  {/* Label + delete */}
                  <div className="flex items-center gap-2">
                    <Controller
                      control={form.control}
                      name={`supplements.${index}.label`}
                      render={({ field: f }) => (
                        <Input
                          {...f}
                          placeholder="Navn på tillegg"
                          className="flex-1 h-8 text-sm"
                        />
                      )}
                    />
                    <button
                      type="button"
                      onClick={() => remove(index)}
                      className="shrink-0 inline-flex items-center justify-center h-8 w-8 rounded-md border border-input hover:bg-destructive/10 hover:border-destructive/50 hover:text-destructive transition-colors"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  {/* Days */}
                  <Controller
                    control={form.control}
                    name={`supplements.${index}.days`}
                    render={({ field: f }) => (
                      <div className="flex gap-1">
                        {DAY_ORDER.map((day) => {
                          const active = f.value.includes(day);
                          return (
                            <button
                              key={day}
                              type="button"
                              onClick={() => {
                                if (active) {
                                  f.onChange(f.value.filter((d: number) => d !== day));
                                } else {
                                  f.onChange([...f.value, day].sort());
                                }
                              }}
                              className={`flex-1 py-1 rounded text-[11px] font-medium transition-all ${
                                active
                                  ? "bg-primary text-primary-foreground"
                                  : "border border-border text-muted-foreground hover:text-foreground hover:border-border/80"
                              }`}
                            >
                              {DAY_LABELS[day]}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  />

                  {/* Time range + percentage */}
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-xs text-muted-foreground shrink-0">Fra</span>
                    <Controller
                      control={form.control}
                      name={`supplements.${index}.fromTime`}
                      render={({ field: f }) => (
                        <Input
                          {...f}
                          placeholder="HH:MM"
                          className="h-8 w-24 font-mono text-sm"
                        />
                      )}
                    />
                    <span className="text-xs text-muted-foreground shrink-0">til</span>
                    <Controller
                      control={form.control}
                      name={`supplements.${index}.toTime`}
                      render={({ field: f }) => (
                        <Input
                          {...f}
                          placeholder="24:00"
                          className="h-8 w-24 font-mono text-sm"
                        />
                      )}
                    />
                    <span className="text-xs text-muted-foreground ml-auto shrink-0">+</span>
                    <div className="relative w-20">
                      <Controller
                        control={form.control}
                        name={`supplements.${index}.percentage`}
                        render={({ field: f }) => (
                          <Input
                            {...f}
                            type="number"
                            min="1"
                            max="500"
                            step="1"
                            className="h-8 font-mono text-sm pr-6"
                          />
                        )}
                      />
                      <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">%</span>
                    </div>
                  </div>
                </div>
              ))}

              <button
                type="button"
                onClick={addRule}
                className="w-full flex items-center justify-center gap-2 h-9 rounded-lg border border-dashed border-border/60 text-xs text-muted-foreground hover:text-foreground hover:border-border transition-colors"
              >
                <Plus className="h-3.5 w-3.5" />
                Legg til tillegg
              </button>
            </div>
          </section>

          <div className="h-px bg-border/50" />

          {/* --- Arbeidstid --- */}
          <section className="space-y-5">
            <h2 className="text-xs font-semibold tracking-widest uppercase text-muted-foreground">Arbeidstid</h2>

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
          </section>

          <div className="h-px bg-border/50" />

          {/* --- Utseende --- */}
          <section className="space-y-5">
            <h2 className="text-xs font-semibold tracking-widest uppercase text-muted-foreground">Utseende</h2>

            <FormField
              control={form.control}
              name="theme"
              render={({ field }) => (
                <FormItem>
                  <SettingRow label="Tema">
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
          </section>

          <div className="h-px bg-border/50" />

          {/* --- Eksport --- */}
          <section className="space-y-5">
            <h2 className="text-xs font-semibold tracking-widest uppercase text-muted-foreground">Eksport</h2>

            <FormField
              control={form.control}
              name="exportPath"
              render={({ field }) => (
                <FormItem>
                  <SettingRow label="Eksportmappe" hint="Standard lagringsplass">
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
          </section>

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
