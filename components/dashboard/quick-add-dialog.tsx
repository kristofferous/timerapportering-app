"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { useTimeStore } from "@/hooks/use-time-store";
import { calcDurationMinutes, today } from "@/lib/time-utils";

const schema = z
  .object({
    startTime: z.string().min(1, "Påkrevd"),
    endTime: z.string().min(1, "Påkrevd"),
    note: z.string().optional(),
  })
  .refine((d) => calcDurationMinutes(d.startTime, d.endTime) > 0, {
    message: "Sluttid må være etter starttid",
    path: ["endTime"],
  })
  .refine((d) => calcDurationMinutes(d.startTime, d.endTime) <= 16 * 60, {
    message: "Varighet kan ikke overstige 16 timer",
    path: ["endTime"],
  });

type FormValues = z.infer<typeof schema>;

export function QuickAddDialog() {
  const addEntry = useTimeStore((s) => s.addEntry);
  const [open, setOpen] = useState(false);
  const [success, setSuccess] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { startTime: "09:00", endTime: "17:00", note: "" },
  });

  const onSubmit = async (values: FormValues) => {
    await addEntry({
      date: today(),
      startTime: values.startTime,
      endTime: values.endTime,
      durationMinutes: calcDurationMinutes(values.startTime, values.endTime),
      note: values.note ?? "",
      isManual: true,
    });
    setSuccess(true);
    form.reset({ startTime: "09:00", endTime: "17:00", note: "" });
    setTimeout(() => {
      setSuccess(false);
      setOpen(false);
    }, 1200);
  };

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setOpen(true)}
        className="gap-1.5"
      >
        <Plus className="h-3.5 w-3.5" />
        Legg til i dag
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Legg til tid for i dag</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="startTime"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Starttid</FormLabel>
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
                      <FormLabel>Sluttid</FormLabel>
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
              <FormField
                control={form.control}
                name="note"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
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
              <div className="flex items-center gap-3">
                <Button type="submit" disabled={form.formState.isSubmitting} size="sm">
                  Lagre
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
        </DialogContent>
      </Dialog>
    </>
  );
}
