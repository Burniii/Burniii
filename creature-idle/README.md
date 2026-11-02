# Creature-Idle (Arbeitstitel)

Idle-Game im Genre Creature Collector: Pixel-Sprites in einer beleuchteten 3D-Diorama-Arena. Web (Vite + three.js), später Android über Capacitor.

Projektkontext und verbindliche Entscheidungen: [`CLAUDE.md`](CLAUDE.md).

## Starten

```bash
npm install
npm run dev      # Entwicklungsserver, http://localhost:5173
npm run build    # Produktions-Build nach dist/
npm run preview  # Build lokal ansehen
```

## Aufbau

```
index.html            HTML-Oberfläche (HUD, Bedienpult)
src/main.js           Zusammenbau + 30-fps-Schleife
src/scene.js          Renderer, Kamera, Licht, Nebel, Kulisse, Tageszeiten
src/terrain.js        Pixel-Texturen, Gelände aus Regeln, Requisiten, Fackeln, Kristalle
src/sprites.js        Pixel-Raster → Sprite + automatische Normal-Map, Billboards
src/combat.js         Kampflogik + Animationsposen (ohne three.js/DOM)
src/fx.js             Partikel, Nachbearbeitung (Bloom, Tilt-Shift, Vignette)
src/quality.js        Qualitätsstufen und Effekt-Schalter
src/ui.js             DOM: HUD, Schadenszahlen, Bedienelemente
src/audio.js          Soundeffekte (folgt mit ZzFX)
src/core/pixel.js     Zufall mit Seed, Canvas-Texturen
src/data/creatures.js Kreaturen-Raster und Paletten
assets/               Asset-Register (ASSETS.md) und künftige Dateien
docs/                 Konzept und Tool-Recherche aus der Übergabe
prototypes/           Original-Prototyp (Referenz, nicht verändern)
```
