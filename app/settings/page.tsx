import { SettingsForm } from "@/components/settings/settings-form";

export default function SettingsPage() {
  return (
    <div className="max-w-xl mx-auto space-y-8">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Innstillinger</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Konfigurer timesats og arbeidstidsgrenser
        </p>
      </div>

      <div className="rounded-lg border border-border/50 bg-card p-6">
        <SettingsForm />
      </div>
    </div>
  );
}
