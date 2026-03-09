import { BacklogForm } from "@/components/backlog/backlog-form";

export default function BacklogPage() {
  return (
    <div className="max-w-xl mx-auto space-y-8">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Legg til tid</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Registrer timer fra tidligere dager manuelt
        </p>
      </div>

      <div className="rounded-lg border border-border/50 bg-card p-6">
        <BacklogForm />
      </div>
    </div>
  );
}
