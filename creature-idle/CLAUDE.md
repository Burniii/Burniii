# Creature-Collector-Idle-Game – Projektkontext

Übergabe aus dem claude.ai-Chat vom 2. November 2026. Diese Datei ist die verbindliche Grundlage für alle Arbeiten in diesem Projekt. Sprache mit dem Nutzer: Deutsch, Anrede „Sie“ (Herr Merklinger).

## 1. Projekt in einem Satz

Webbasiertes Idle-Game im Genre **Creature Collector**: Kreaturen sammeln, mit einem aktiven Team Stages und Bosse durchkämpfen und das Team über diverse Mechaniken aufwerten. Später Export als **Android-APK** (Capacitor) für den Play Store.

**Wichtig:** Dies ist ein **eigenständiges neues Projekt**. Es hat nichts mit dem separaten Finanz-/Wirtschafts-Idle-Game des Nutzers zu tun. Keine Inhalte, Begriffe oder Mechaniken von dort übernehmen.

## 2. Verbindliche Vorgaben des Nutzers

1. **Grafik, Animationen, Sounds sollen massiv hochwertig sein**, aber:
2. **Alle externen Ressourcen müssen kostenlos sein** (auch für kommerzielle Nutzung im Play Store).
3. **Keine menschliche Nachbearbeitung.** Jedes Asset muss vollautomatisch durch Claude erzeugt, umgewandelt und eingebaut werden können.
4. **Keine KI-Bild- oder KI-Musikgeneratoren** (Nachbearbeitung nötig, Lizenzen unklar).
5. Der Nutzer liefert Konzeptideen; Grafik/Animation/Sound ist explizit Claudes Aufgabe.

## 3. Bisher getroffene Entscheidungen

| Thema | Entscheidung |
| --- | --- |
| Grundstil | **Stil B: Pixel-Art** (gewählt aus drei Stilproben: Flat-Vektor, Pixel-Art, Cartoon mit Outline) |
| Gesamtlook | Pixel-Sprites in beleuchteter 3D-Diorama-Arena, angelehnt an den Octopath-Traveler-Look |
| Begriff | „HD-2D“ ist eine Marke von Square Enix → **nirgends verwenden** (Code-Kommentare egal, aber Store, UI, Werbung nie). Neutral: „Pixel-Art im 3D-Diorama“ |
| 3D-Basis | **three.js** (Prototyp: r165 / 0.165.0) |
| Oberfläche | HTML/CSS-Overlay über dem 3D-Canvas für Menüs, Team, Upgrades |
| APK | **Capacitor** |
| Bildrate | fest **30 fps**, Rendern pausieren in Menüs/Hintergrund |
| Spiellogik | strikt getrennt vom Rendering; Offline-Ertrag rein rechnerisch |
| IP-Abstand | Keine Nähe zu Pokémon (Designs und Namen) oder Square-Enix-Inhalten |

## 4. Workflow-Regeln

- **Graybox zuerst:** Spielbar mit Platzhaltern, Grafik blockiert nie die Entwicklung.
- **Asset-Register** führen (`assets/ASSETS.md` o. ä.): Name, Quelle, Lizenz, Status (Platzhalter/Entwurf/final). Zusätzlich `CREDITS.md` für Store-Pflichten.
- **Namenskonvention:** z. B. `assets/creatures/cr_glutling_lv1.png`, `assets/fx/fx_fire_hit.json`.
- **Jedes externe Asset** läuft automatisch durch die Palettenreduktion auf die Hauptpalette.
- Qualitätsstufen (niedrig/mittel/hoch) für jeden teuren Effekt.

## 5. Stil-Werte aus den Prototypen (Ist-Stand)

### Element-Paletten (Kreaturen)

| Element | Name Probekreatur | body | dark | light | accent |
| --- | --- | --- | --- | --- | --- |
| Feuer | Glutling | `#F28C38` | `#B8461A` | `#FFD39A` | `#FFD25E` |
| Wasser | Tropfling | `#4AA3DF` | `#235E9C` | `#C4E8FA` | `#8FE0E8` |
| Pflanze | Sprössling | `#6CC24A` | `#347A28` | `#D6F1B8` | `#F6E27A` |

Kontur/Pupillen: `#1A1F2C`, Augenweiß `#FFFFFF`. Gegner „Wildschleim“: `p #8A63C4`, `q #5E4387`, `h #C3A8EE`.

### Pixel-Kreatur (16 × 16, linke Hälfte, wird gespiegelt)

Zeichen: `.` transparent, `o` Kontur, `b` body, `l` light, `d` dark, `a` accent, `w` weiß, `k` Pupille.

```
.oo.....
.oao....
.oaao...
..oaoooo
.obllbbb
.oblbbbb
obbwwkbb
obbwkkbb
obbbbbbb
obabbbbo
odbbbbbb
.odbbbbb
.oddbbbb
..oddddd
..oddooo
...oo...
```

Wildschleim (14 × 10, linke Hälfte): `p` Körper, `q` Schatten, `h` Highlight, `k` Augen/Brauen.

```
....ooo
...oppp
..ohppp
.ohpkpp
.opkkpp
oppkkpp
oqppppp
oqqpppp
oqqqqqq
.oooooo
```

Diese Daten liegen auch maschinenlesbar in `prototypes/creature-data.js`.

### Normal-Maps für Sprites (automatisch)

Höhe je Pixel = Chebyshev-Abstand zum nächsten transparenten Pixel (max. 5). Normale aus Gradient: `nx = -(h[x+1]-h[x-1])*0.55`, `ny = -(h[y-1]-h[y+1])*0.55`, `nz = 1`, normalisieren. Transparente Pixel: `rgb(128,128,255)`. Ergebnis: Kanten-/Randlicht durch Fackeln.

### UI (Pixel-Stil)

- Schrift: **Pixelify Sans** (Google Fonts), Fallback monospace.
- Farben: Hintergrund `#141A29`, Fläche `#1C2436`, Panel `#222C42`, Linien `#0B0F18`, Text `#EEF1F7`, gedämpft `#A9B3C7`, Akzent `#FFD24A`, Angriff `#F06A4A`, HP `#6CDB5A`.
- Buttons: 3 px Rahmen, harter Schatten `3px 3px 0`, aktive Auswahl in Akzentfarbe, Mindesthöhe 44 px.
- Animationen im Pixel-Stil mit `steps()` (ruckartig), z. B. Idle-Wippen 2 Schritte, Schadenszahl 7 Schritte.

### Kampf-Animationen (Code)

- Idle: Wippen in 2 Stufen (y +0.07, leichtes Squash & Stretch), ca. 2,4 Wechsel/s.
- Angriff 0,6 s: Ausholen nach hinten (−0,3), Vorstoß zum Gegner, Treffer bei 48 %, Rückkehr.
- Treffer 0,45 s: Schütteln + weißes Aufblitzen (emissive).
- Gegner besiegt 0,9 s: Flackern, Stauchen; nach 0,6 s Respawn mit Überschwing-Skalierung.
- Schaden 14–26, 15 % Krit (×2, gelbe größere Zahl, stärkere Kameraerschütterung), Funkenburst in Element-Akzentfarbe.

### Diorama-Szene (Werte aus `prototypes/diorama-probe.html`)

- Kamera: Perspective, FOV 28, Position (0, 4.4, 12), Ziel (0, 1.1, −1), langsames Schwenken ±0,7 (aus bei reduced motion).
- Gelände: Raster x −10…10, z −7…5; Terrassen hinten (z ≤ −3) 1–3 Blöcke hoch; Kampfweg x −5…5, z −2…2 mit ausgefransten Rändern.
- Texturen 16 × 16 prozedural (Gras oben/Seite, Erde, Sandweg, Steinziegel mit Moos, Rinde, Laub), NearestFilter.
- Requisiten: Steinsäulen/Bogen, Geröll, Voxel-Bäume, Büsche im Vordergrund (werden durch Tilt-Shift unscharf), 2 Fackeln mit flackerndem Punktlicht, Kristalle (emissiv).
- Licht: Hemisphere + Directional mit Schatten (Bounds ±12, bias −0.0006, normalBias 0.02), PCF-Schatten.
- Nachbearbeitung (three.js-Addons): UnrealBloom (0.55 / 0.45 / 0.85) → OutputPass → Tilt-Shift H+V (r = 0.45, Stärke 4/px-Höhe) → Vignette (offset 0.95, darkness 1.25). ACES-Tonemapping.
- Qualitätsstufen: Renderskalierung 0,5 / 0,75 / min(dpr, 2); Schattenkarte 512 / 1024 / 2048. Canvas mit `image-rendering: pixelated`.

| Tageszeit | Himmel/BG | Nebel | Sonne | Fackel-Basis | Kristall | Partikel |
| --- | --- | --- | --- | --- | --- | --- |
| Tag | `#A9DCF5` | `#CBE9F5` 16–40 | `#FFF1D6` 2.4 | 0.5 | 0.3 | `#FFF2A8` |
| Abend (Start) | `#F2A97A` | `#E9A07E` 14–36 | `#FF9A5A` 1.9 | 2.2 | 0.9 | `#FFB067` |
| Nacht | `#18213A` | `#1E2A48` 12–32 | `#9FB8FF` 0.9 | 3.4 | 2.6 | `#C8FF7A` |

(Fackel-Intensität im Code zusätzlich ×2,5.)

## 6. Geplante Qualitäts-Pipeline (nächste Ausbaustufe)

Details und Quellen: `docs/02-qualitaets-boost-tools.md`. Kurzfassung:

1. **3D-zu-Pixel:** CC0-Monster von Quaternius (50 animierte Monster, glTF) per Playwright + three.js headless Bild für Bild rendern (feste Kamera, kein AA, Cel-Shading, ca. 48 × 48 px), mit **image-q** auf die Hauptpalette reduzieren, Kontur + Normal-Map automatisch, Sprite-Sheet + JSON (Frames, Dauer, Trefferframe), automatische Qualitätsprüfung (Silhouette, Unterscheidbarkeit, Kontrast).
2. **Varianten:** Palette-Swaps (Element, Seltenheit), angehängte 3D-Teile an Knochen, Größenstufen, Fusion aus Bausteinen (Vorbild Cassette Beasts).
3. **Effekte:** three.quarks (Partikel als JSON je Element: Angriff, Treffer, Aura), pmndrs postprocessing (God Rays, SSAO, LUT, Schockwelle), GSAP für UI, Kamera-Choreografie.
4. **Sound:** ZzFX (Effekte als Zahlenreihen), jsfxr (Varianten, WAV), Tone.js (generative Musik je Biom mit Kampf-/Boss-Spuren), Kenney-CC0-Audio. Wiedergabe mit leichter Zufallsvariation.
5. **Vielfalt:** Hauptpalette ca. 20–24 Farben für alles; Arenen per Biom-Regeln + Wave Function Collapse; Namen aus Element-Silben + Stufen-Endungen mit Prüfung gegen Dopplungen/Marken.

Lizenzen: Quaternius/Kenney/Poly Haven CC0 · three.js, three.quarks, ZzFX, Tone.js, image-q MIT · postprocessing Zlib · jsfxr Unlicense · GSAP kostenlos auch kommerziell.

## 7. Referenzspiele (Qualitätsmaßstab, nicht Vorlage)

- **Cassette Beasts** – Pixel-Monster in 3D-Welt, gemeinsame Palette, Fusion. Am nächsten am Konzept.
- **Octopath Traveler** – Licht, Schatten, Tiefenunschärfe, Atmosphäre.
- **Dead Cells** – flüssige Pixel-Animation aus 3D, Normal-Map-Sprites.

## 8. Fahrplan

- [x] Stilproben (A Flat, B Pixel, C Cartoon) → B gewählt
- [x] HD-2D-artiges Konzept und Recherche (`docs/01-hd2d-konzept.md`)
- [x] Diorama-Probe (`prototypes/diorama-probe.html`) – nur syntaxgeprüft, im Browser noch nicht vom Nutzer bestätigt
- [x] Tool-Recherche (`docs/02-qualitaets-boost-tools.md`)
- [x] **Projekt aufsetzen:** Vite + three.js, Diorama-Probe in Module zerlegt (scene, terrain, sprites, combat, fx, ui, audio, quality) – per Headless-Vergleich in 10 Szenarien pixelgleich zum Prototyp. Capacitor folgt mit dem APK-Schritt.
- [ ] Sounds (ZzFX) und Partikel (three.quarks) einbauen
- [ ] Machbarkeitstest 3D-zu-Pixel mit einem Quaternius-Modell
- [ ] Hauptpalette + Style Guide festschreiben (Sprite-Größen z. B. 16/24/32 bzw. 48 px für 3D-Quellen)
- [ ] Batch-Pipeline aller Modelle + Varianten
- [ ] Kern-Spielschleife: Stages, Bosse, Team, Upgrades, Idle-/Offline-Ertrag (Mechaniken mit dem Nutzer klären)
- [ ] Generative Musik, Arenen-Generator
- [ ] Leistungstest auf dem Android-Gerät des Nutzers, Qualitätsstufen justieren
- [ ] APK-Build via Capacitor

## 8a. Technische Festlegungen beim Aufsetzen

- Projekt liegt im Unterordner `creature-idle/` des Repos (Repo-Wurzel ist das GitHub-Profil-README).
- Schrift Pixelify Sans lokal über `@fontsource/pixelify-sans` statt Google-Fonts-Link (offline-fähig für die APK).
- Vite `base: './'` (relative Pfade für Capacitor).
- `src/combat.js` enthält Kampflogik ohne three.js/DOM; Darstellung über Callbacks und Posen.
- `prototypes/` bleibt unverändert als Referenz.

## 9. Offene Fragen an den Nutzer

- Konkrete Spielmechaniken für das Aufwerten des aktiven Teams (Level, Ausrüstung, Fusion, Talente …)?
- Setting/Welt und Element-System (nur Feuer/Wasser/Pflanze oder mehr)?
- Teamgröße, Kampfablauf (automatisch, Taps, Fähigkeiten)?
- Monetarisierung (Werbung, In-App-Käufe, keine)?

## 10. Links aus dem Chat (claude.ai, nur mit Konto des Nutzers erreichbar)

- Stilproben-Canvas: https://claude.ai/artifact/8xvwBZceAnz2T1H6M9jxat
- Konzept HD-2D: https://claude.ai/artifact/QuHSJMQpfWoAhwkPXYzRMz
- Diorama-Probe: https://claude.ai/artifact/U1haJsn67MQ2MPGKGuuitj
- Qualitäts-Boost-Tools: https://claude.ai/artifact/SfRAasQXYxvbWqXJcDQi8f
