"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTimeStore } from "@/hooks/use-time-store";
import { importFromJSON } from "@/lib/export";

const isTauri = () =>
  typeof window !== "undefined" && "__TAURI_INTERNALS__" in window;

export function DataSection() {
  const store = useTimeStore();
  const [importing, setImporting] = useState(false);

  const handleImport = async () => {
    setImporting(true);
    try {
      let jsonString: string | null = null;

      if (isTauri()) {
        const { invoke } = await import("@tauri-apps/api/core");
        const { open } = await import("@tauri-apps/plugin-dialog");

        const selected = await open({
          filters: [{ name: "JSON", extensions: ["json"] }],
          multiple: false,
        });
        if (!selected || typeof selected !== "string") return;

        jsonString = await invoke<string>("read_file", { path: selected });
      } else {
        // Browser fallback via file input
        jsonString = await new Promise<string | null>((resolve) => {
          const input = document.createElement("input");
          input.type = "file";
          input.accept = ".json";
          input.onchange = () => {
            const file = input.files?.[0];
            if (!file) { resolve(null); return; }
            const reader = new FileReader();
            reader.onload = (e) => resolve((e.target?.result as string) ?? null);
            reader.readAsText(file);
          };
          input.click();
        });
      }

      if (!jsonString) return;

      const result = importFromJSON(jsonString, store.entries);

      const { saveEntries } = await import("@/lib/store");
      await saveEntries(result.entries);
      await store.initialize();

      toast.success(
        `Importert ${result.imported} ny${result.imported !== 1 ? "e" : ""} registrering${result.imported !== 1 ? "er" : ""}`,
        {
          description:
            result.skipped > 0
              ? `${result.skipped} duplikat${result.skipped !== 1 ? "er" : ""} hoppet over`
              : undefined,
        }
      );
    } catch (err) {
      console.error("Import failed:", err);
      toast.error("Import feilet", {
        description: err instanceof Error ? err.message : "Ukjent feil",
      });
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="space-y-3">
      <div>
        <h3 className="text-sm font-medium">Importer data</h3>
        <p className="text-xs text-muted-foreground mt-0.5">
          Gjenopprett registreringer fra en tidligere eksportert JSON-fil eller backup.
          Duplikater hoppes over automatisk.
        </p>
      </div>
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={handleImport}
        disabled={importing || !store.isLoaded}
        className="gap-2"
      >
        <Upload className="h-3.5 w-3.5" />
        {importing ? "Importerer…" : "Importer JSON-fil"}
      </Button>
    </div>
  );
}
