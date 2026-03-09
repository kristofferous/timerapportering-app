# Bidrag til Timerapportering

Takk for at du vurderer å bidra! Her er alt du trenger å vite.

## Komme i gang

1. **Fork** repoet og klon din fork lokalt
2. Installer avhengigheter: `pnpm install`
3. Start utviklingsmiljøet: `pnpm tauri dev`
4. Lag en ny branch fra `main`: `git checkout -b feat/beskrivelse`

## Kodestruktur

```
app/               # Next.js App Router-sider
components/        # React-komponenter
  dashboard/       # Dashboard-komponenter
  months/          # Månedsoversikt
  settings/        # Innstillinger
  statistics/      # Statistikk-side
  ui/              # Generiske UI-komponenter (shadcn)
hooks/             # Zustand-store og andre hooks
lib/               # Hjelpefunksjoner (beregninger, eksport, lagring)
types/             # TypeScript-typer
src-tauri/         # Tauri/Rust-backend
```

## Retningslinjer

### Kode

- Bruk TypeScript — unngå `any`
- Følg eksisterende kode-stil (ingen prettier-config er nødvendig, bare vær konsistent)
- Komponenter: én fil per komponent, navn i PascalCase
- Hjelpefunksjoner: legg i eksisterende filer i `lib/` der det passer
- Ikke legg til nye avhengigheter uten å diskutere det i en issue først

### Commits

Skriv beskrivende commit-meldinger på norsk eller engelsk:

```
feat: legg til ukestatistikk-diagram
fix: rett opp feil i tilleggsberegning over midnatt
refactor: flytt datoformatering til time-utils
```

Bruk prefiks: `feat`, `fix`, `refactor`, `docs`, `chore`, `test`

### Pull requests

- Én PR per funksjon eller feilretting
- Forklar *hvorfor* endringen er nødvendig, ikke bare *hva* som er gjort
- Sørg for at `pnpm build` og `pnpm exec tsc --noEmit` går igjennom uten feil
- Hold PR-er fokuserte og oversiktlige — del opp store endringer

## Rapportere feil

Åpne en issue med:

- Hva du forventet skulle skje
- Hva som faktisk skjedde
- Steg for å reprodusere
- OS og app-versjon

## Foreslå funksjoner

Åpne en issue og beskriv bruksscenariet. Diskuter gjerne før du begynner å kode, slik at vi unngår dobbeltarbeid.
