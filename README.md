# Timerapportering

En lokal desktop-app for registrering og rapportering av arbeidstid, bygget med Tauri og Next.js.

## Funksjoner

- **Klokk inn/ut** — start og stopp en økt med ett klikk
- **Manuell registrering** — legg til tidligere timer via baklogg-skjema
- **Månedsoversikt** — se alle registreringer gruppert per måned og uke
- **Statistikk** — ukentlige søylediagram, ukedagssnitt og månedstrender
- **Tillegg** — automatisk beregning av tillegg (kveld, natt, lørdag, søndag) basert på norske tariffavtaler
- **Eksport** — last ned måneder som JSON eller tekstfil, eller sett en eksportmappe for automatisk lagring
- **Import** — gjenopprett registreringer fra en tidligere eksportert JSON-fil
- **Auto-backup** — skriver daglig backup til eksportmappen ved oppstart
- **Temaer** — lys, mørk og systemtema

## Teknologi

| Lag | Teknologi |
|-----|-----------|
| Desktop-ramme | [Tauri 2](https://tauri.app) |
| Frontend | [Next.js 16](https://nextjs.org) (App Router, statisk eksport) |
| Språk | TypeScript |
| UI-komponenter | [shadcn/ui](https://ui.shadcn.com) (base-ui) |
| Tilstandshandtering | [Zustand 5](https://zustand-demo.pmnd.rs) |
| Skjemaer | [react-hook-form](https://react-hook-form.com) + [Zod](https://zod.dev) |
| Datobehandling | [date-fns 4](https://date-fns.org) |
| Persistens | [tauri-plugin-store](https://github.com/tauri-apps/plugins-workspace) |

## Kom i gang

### Forutsetninger

- [Node.js](https://nodejs.org) 18+
- [pnpm](https://pnpm.io)
- [Rust](https://rustup.rs) (stabil)
- Tauri-avhengigheter for ditt OS — se [Tauri-guiden](https://tauri.app/start/prerequisites/)

### Installer avhengigheter

```bash
pnpm install
```

### Kjør i utviklingsmodus

Starter Next.js-dev-server og Tauri-vinduet samtidig:

```bash
pnpm tauri dev
```

### Bygg for produksjon

```bash
pnpm tauri build
```

Ferdig binærfil ligger i `src-tauri/target/release/`.

## Datalagring

Data lagres lokalt via `tauri-plugin-store` i OS-appdata-mappen:

| OS | Bane |
|----|------|
| Linux | `~/.local/share/com.timerapportering.app/timerapportering.json` |
| macOS | `~/Library/Application Support/com.timerapportering.app/timerapportering.json` |
| Windows | `%APPDATA%\Timerapportering\timerapportering.json` |

Data overlever app-oppdateringer. For å sikre data mot tap ved avinstallering anbefales det å sette en eksportmappe i innstillinger — appen tar da daglig backup automatisk.

## Bidra

Se [CONTRIBUTING.md](CONTRIBUTING.md) for retningslinjer.

## Lisens

[MIT](LICENSE)
