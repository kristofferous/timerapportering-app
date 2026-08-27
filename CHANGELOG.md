# Endringslogg

Alle viktige endringer i prosjektet dokumenteres her.
Format basert på [Keep a Changelog](https://keepachangelog.com/no/1.0.0/).

---

## [Ureleased]

---

## [0.2.0] — 2026-08-27

### Lagt til
- Statistikk-side med ukentlige søylediagram, ukedagssnitt og månedstrender
- Auto-backup ved oppstart til konfigurert eksportmappe (daglig, én gang per dag)
- Import av JSON-filer (støtter måneds-eksport og backup-format) med duplikatdeteksjon
- Datoendring i redigeringsdialogens skjema for eksisterende registreringer
- Hurtiglegg-til-knapp på dashboard for manuell registrering av dagens timer
- Signert og notarisert macOS-build (universal binær) i CI, med `.dmg` i Releases
- Installasjonsinstruksjoner for sluttbrukere i README (Windows, Linux, macOS)

---

## [0.1.0] — 2025

### Lagt til
- Klokk inn/ut med aktiv økt-timer
- Manuell registrering via baklogg-skjema
- Månedsoversikt gruppert per år med ukentlig detaljvisning
- Tilleggsberegning basert på norske tariffavtaler (KS/NHO-LO)
- Eksport av måneder som JSON eller tekstfil
- Konfigurbar eksportmappe for automatisk lagring
- Innstillinger: timesats, maks timer per dag/uke, tilleggs-regler
- Lys, mørk og systemtema
- Persistens via `tauri-plugin-store`
