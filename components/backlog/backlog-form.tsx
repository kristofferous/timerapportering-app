"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import { nb } from "date-fns/locale";
import { CalendarIcon, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { TimeInput } from "@/components/ui/time-input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useTimeStore } from "@/hooks/use-time-store";
import { calcDurationMinutes, today } from "@/lib/time-utils";
import { cn } from "@/lib/utils";

const schema = z
  .object({
    date: z.date({ required_error: "Velg en dato", invalid_type_error: "Velg en dato" }),
    startTime: z.string().min(1, "Påkrevd"),
    endTime: z.string().min(1, "Påkrevd"),
    note: z.string().optional(),
  })
  .refine(
    (data) => calcDurationMinutes(data.startTime, data.endTime) > 0,
    { message: "Sluttid må være etter starttid", path: ["endTime"] }
  )
  .refine(
    (data) => calcDurationMinutes(data.startTime, data.endTime) <= 16 * 60,
    { message: "Varighet kan ikke overstige 16 timer", path: ["endTime"] }
  )
  .refine(
    (data) => {
      const dateStr = `${data.date.getFullYear()}-${String(data.date.getMonth() + 1).padStart(2, "0")}-${String(data.date.getDate()).padStart(2, "0")}`;
      return dateStr <= today();
    },
    { message: "Kan ikke registrere fremtidig dato", path: ["date"] }
  );

type FormValues = z.infer<typeof schema>;

export function BacklogForm() {
  const addEntry = useTimeStore((s) => s.addEntry);
  const [success, setSuccess] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      startTime: "09:00",
      endTime: "17:00",
      note: "",
    },
  });

  const onSubmit = async (values: FormValues) => {
    const d = values.date;
    const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    const duration = calcDurationMinutes(values.startTime, values.endTime);

    await addEntry({
      date: dateStr,
      startTime: values.startTime,
      endTime: values.endTime,
      durationMinutes: duration,
      note: values.note ?? "",
      isManual: true,
    });

    setSuccess(true);
    form.reset({ startTime: "09:00", endTime: "17:00", note: "" });
    setTimeout(() => setSuccess(false), 3000);
  };

  return (
    <div className="max-w-sm">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
          {/* Date */}
          <FormField
            control={form.control}
            name="date"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel className="text-sm font-medium">Dato</FormLabel>
                <Popover>
                  <PopoverTrigger
                    className={cn(
                      "inline-flex w-full items-center justify-start gap-2 rounded-md border border-input bg-background px-3 py-2.5 text-sm transition-colors",
                      "hover:bg-accent hover:text-accent-foreground",
                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                      !field.value && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="h-4 w-4 shrink-0 text-muted-foreground" />
                    {field.value
                      ? format(field.value, "PPP", { locale: nb })
                      : "Velg dato"}
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      disabled={(date) => date > new Date()}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Times */}
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="startTime"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium">Starttid</FormLabel>
                  <FormControl>
                    <TimeInput
                      value={field.value}
                      onChange={field.onChange}
                      onBlur={field.onBlur}
                      name={field.name}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="endTime"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium">Sluttid</FormLabel>
                  <FormControl>
                    <TimeInput
                      value={field.value}
                      onChange={field.onChange}
                      onBlur={field.onBlur}
                      name={field.name}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Duration preview */}
          {form.watch("startTime") && form.watch("endTime") && (() => {
            const dur = calcDurationMinutes(form.watch("startTime"), form.watch("endTime"));
            if (dur > 0) {
              const h = Math.floor(dur / 60);
              const m = dur % 60;
              return (
                <p className="text-xs text-muted-foreground -mt-2">
                  Varighet:{" "}
                  <span className="font-mono text-foreground/70">
                    {h > 0 ? `${h}t ` : ""}{m > 0 ? `${m}m` : ""}
                  </span>
                </p>
              );
            }
            return null;
          })()}

          {/* Note */}
          <FormField
            control={form.control}
            name="note"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium">
                  Notat{" "}
                  <span className="font-normal text-muted-foreground">(valgfritt)</span>
                </FormLabel>
                <FormControl>
                  <Input placeholder="Hva jobbet du med?" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex items-center gap-3 pt-1">
            <Button type="submit" disabled={form.formState.isSubmitting} size="sm">
              Legg til
            </Button>
            {success && (
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
