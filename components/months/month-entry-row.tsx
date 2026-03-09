"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { TimeEntry } from "@/types";
import { useTimeStore } from "@/hooks/use-time-store";
import { calcDurationMinutes, formatMinutes, formatDate } from "@/lib/time-utils";
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";

const editSchema = z
  .object({
    startTime: z.string().min(1, "Påkrevd"),
    endTime: z.string().min(1, "Påkrevd"),
    note: z.string().optional(),
  })
  .refine(
    (data) => calcDurationMinutes(data.startTime, data.endTime) > 0,
    { message: "Sluttid må være etter starttid", path: ["endTime"] }
  );

type EditValues = z.infer<typeof editSchema>;

interface Props {
  entry: TimeEntry;
}

export function MonthEntryRow({ entry }: Props) {
  const updateEntry = useTimeStore((s) => s.updateEntry);
  const deleteEntry = useTimeStore((s) => s.deleteEntry);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const form = useForm<EditValues>({
    resolver: zodResolver(editSchema),
    values: {
      startTime: entry.startTime,
      endTime: entry.endTime,
      note: entry.note,
    },
  });

  const onEdit = async (values: EditValues) => {
    const durationMinutes = calcDurationMinutes(values.startTime, values.endTime);
    await updateEntry(entry.id, {
      startTime: values.startTime,
      endTime: values.endTime,
      durationMinutes,
      note: values.note ?? "",
    });
    setEditOpen(false);
  };

  const onDelete = async () => {
    await deleteEntry(entry.id);
    setDeleteOpen(false);
  };

  return (
    <>
      <div className="py-2 border-b border-border/40 last:border-0 group min-w-0">
        {/* Line 1: date · time range · duration · actions */}
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-sm font-medium flex-1 min-w-0 truncate">
            {formatDate(entry.date)}
          </span>
          <span className="font-mono text-xs text-muted-foreground shrink-0">
            {entry.startTime}–{entry.endTime}
          </span>
          <span className="font-mono text-xs font-semibold shrink-0 w-16 text-right">
            {formatMinutes(entry.durationMinutes)}
          </span>
          <DropdownMenu>
            <DropdownMenuTrigger className="inline-flex h-6 w-6 items-center justify-center rounded opacity-0 group-hover:opacity-100 hover:bg-muted transition-all shrink-0">
              <MoreHorizontal className="h-3.5 w-3.5" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setEditOpen(true)}>
                <Pencil className="mr-2 h-3.5 w-3.5" />
                Rediger
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setDeleteOpen(true)}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="mr-2 h-3.5 w-3.5" />
                Slett
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Line 2: note + manual badge (only if present) */}
        {(entry.note || entry.isManual) && (
          <div className="flex items-center gap-2 mt-0.5 min-w-0">
            <span className="text-xs text-muted-foreground flex-1 min-w-0 truncate">
              {entry.note}
            </span>
            {entry.isManual && (
              <Badge variant="secondary" className="text-[10px] h-4 px-1.5 shrink-0">
                Manuell
              </Badge>
            )}
          </div>
        )}
      </div>

      {/* Edit dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rediger registrering</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onEdit)} className="space-y-4">
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
                    <FormLabel>Notat</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setEditOpen(false)}>
                  Avbryt
                </Button>
                <Button type="submit">Lagre</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Delete confirmation */}
      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Slett registrering?</AlertDialogTitle>
            <AlertDialogDescription>
              {formatDate(entry.date)}, {entry.startTime}–{entry.endTime} (
              {formatMinutes(entry.durationMinutes)}). Dette kan ikke angres.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Avbryt</AlertDialogCancel>
            <AlertDialogAction
              onClick={onDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Slett
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
