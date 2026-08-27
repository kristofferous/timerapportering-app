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

## Installasjon

Ferdigbygde versjoner finnes på [Releases](https://github.com/kristofferous/timerapportering-app/releases). Last ned filen for ditt OS fra siste utgivelse.

### Windows

Last ned `.msi` eller `.exe` (NSIS) og kjør den. Windows kan vise en SmartScreen-advarsel siden appen ikke er signert — velg **Mer info → Kjør likevel**.

### Linux

Last ned `.deb` eller `.rpm` og installer med pakkebehandleren din:

```bash
# Debian/Ubuntu
sudo apt install ./timerapportering_*.deb

# Fedora/RHEL
sudo dnf install ./timerapportering-*.rpm
```

Alternativt kan du bygge selv og kjøre [`install-linux.sh`](install-linux.sh), som installerer binærfilen og registrerer et `.desktop`-oppføring for GNOME/freedesktop.

### macOS

Last ned `.dmg` fra Releases, åpne den, og dra Timerapportering til `Programmer`-mappen.

> **Merk om Gatekeeper:** Hvis `.dmg`-en ennå ikke er signert med et Apple Developer ID-sertifikat, vil macOS vise «Appen er skadet» eller «kan ikke åpnes». Høyreklikk appen i `Programmer` → **Åpne**, eller kjør `xattr -cr /Applications/Timerapportering.app` i Terminal. Se [egen seksjon](#gjøre-macos-installasjonen-mer-native) for hvordan vi signerer og notariserer builden.

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

## Gjøre macOS-installasjonen mer native

macOS-builden er nå lagt til i CI ([`.github/workflows/build.yml`](.github/workflows/build.yml)) som en universal binær (Intel + Apple Silicon i én `.dmg`), signert og notarisert med et Apple Developer ID-sertifikat. Dette krever følgende GitHub Actions-secrets:

| Secret | Beskrivelse |
|--------|-------------|
| `APPLE_CERTIFICATE` | Developer ID Application-sertifikat, eksportert som `.p12` og base64-kodet |
| `APPLE_CERTIFICATE_PASSWORD` | Passord for `.p12`-filen |
| `APPLE_SIGNING_IDENTITY` | Navnet på sertifikatet, f.eks. `Developer ID Application: Ditt Navn (TEAMID)` |
| `APPLE_ID` | Apple-ID brukt til notarisering |
| `APPLE_PASSWORD` | App-spesifikt passord for Apple-IDen (opprettes på [appleid.apple.com](https://appleid.apple.com)) |
| `APPLE_TEAM_ID` | Team ID fra Apple Developer-kontoen |

Uten signering og notarisering blokkerer Gatekeeper appen med «kan ikke åpnes fordi utvikleren ikke kan bekreftes» / «Appen er skadet», og brukere må manuelt kjøre `xattr -cr /Applications/Timerapportering.app` eller høyreklikke → Åpne. Med secretene over signerer og notariserer `tauri build` automatisk (`tauri-bundler` plukker opp `APPLE_*`-variablene), så `.dmg`-filen installeres uten advarsler — samme opplevelse som en App Store-app.

Neste steg for en enda mer native installasjon:

- **Homebrew Cask** — publiser en cask (`brew install --cask timerapportering`) som peker på `.dmg`-en i hver Release. Dette er den installasjonsmetoden Mac-brukere kjenner best fra andre utviklerverktøy.
- **Auto-oppdatering** — legg til [`tauri-plugin-updater`](https://v2.tauri.app/plugin/updater/) slik at appen selv sjekker og installerer nye versjoner, i stedet for at brukeren må laste ned manuelt fra Releases.
- **Universal binary** — bygges allerede med `--target universal-apple-darwin` slik at samme `.dmg` fungerer på både Intel- og Apple Silicon-Mac-er, uten at brukeren må velge riktig arkitektur selv.

## Bidra

Se [CONTRIBUTING.md](CONTRIBUTING.md) for retningslinjer.

## Lisens

[MIT](LICENSE)
