# Qualitäts-Boost durch freie Tools

Stand: 2. November 2026 · Export aus dem Konzeptdokument im Claude-Chat

## Kurzfazit

1. **3D-zu-Pixel-Pipeline:** Freie, animierte 3D-Monster (CC0) automatisch in Pixel-Sprite-Sheets umrechnen → echte Animationen für Laufen, Angriff, Niederlage.
2. **Effekt-Bibliothek:** Partikelsystem (three.quarks) für Element-Angriffe, Treffer, Boss-Auren.
3. **Sound aus Code plus freie Bibliotheken:** ZzFX/jsfxr für Effekte, Tone.js für generative Musik, Kenney-CC0-Audio.

Downloads von Asset-Seiten (itch.io usw.) sind in Claude Code auf dem PC möglich, im claude.ai-Chat nicht.

## Sprites und Animation: 3D-Modelle als Pixel-Quelle

Studios wie Motion Twin (Dead Cells) animieren in 3D und rendern als niedrig aufgelöste Pixelgrafik ([Diskussion](https://lr.eu.psf.lt/r/howdidtheycodeit/comments/1jozx2b/converting_3d_art_to_2d_pixel_animation_blender), [Dead-Cells-Fallstudie](https://80.lv/articles/case-study-dead-cells-character-art-pipeline/)).

**Quelle:** Quaternius, 50 animierte Monster (Angriff, Tod, Laufen, Gehen u. a.), CC0, u. a. glTF ([Ankündigung](https://lr.in.psf.lt/r/gamedev/comments/ylzhze/ive_made_50_animated_monsters_you_can_use_in_any)); weiteres CC0-Paket [LowPoly Animated Monsters](https://quaternius.itch.io/lowpoly-animated-monsters) (OBJ/FBX/Blend).

**Ablauf per Skript:**

1. Modell in unsichtbarem Browser (Playwright) mit three.js laden.
2. Jede Animation Bild für Bild mit fester Kamera, ohne Antialiasing, mit Cel-Shading in z. B. 48 × 48 px rendern.
3. Farben auf Spielpalette reduzieren ([image-q](https://github.com/ibezkrovnyi/image-quantization), MIT).
4. Kontur per Code, Normal-Map aus demselben Render.
5. Sprite-Sheet + JSON (Frames, Dauer, Trefferzeitpunkt).
6. Automatische Prüfung: Silhouettengröße, Unterscheidbarkeit, Kontrast.

**Varianten:** Palette-Swaps je Element/Seltenheit, angehängte 3D-Teile (Hörner, Kristalle, Rüstung) an Knochen, Größenstufen für Entwicklungen und Bosse.

**Grenze:** Feine Details gehen bei kleiner Auflösung verloren → kompakte Modelle bevorzugen. Eigener Pixel-Generator bleibt für kleine Kreaturen/Sonderfälle.

## Vielfalt

50 Basismodelle × 3 Elemente × 3 Seltenheiten = 450 Varianten vor Entwicklungen und Bossen.

- **Eine Hauptpalette:** Cassette Beasts hält 120 Monster in ca. 20 Farben ([Interview](https://www.pockettactics.com/cassette-beasts/interview)); bei uns erzwingt die Farbreduzierung das automatisch.
- **Fusion aus Bausteinen** wie Cassette Beasts, mit angehängten 3D-Teilen.
- **Arenen per Algorithmus:** Biom-Regeln + Wave Function Collapse ([Beschreibung](https://awesome.ecosyste.ms/projects/github.com%2Fmxgmn%2FWaveFunctionCollapse)).
- **Namen aus Silben** je Element plus Endungen je Stufe; Prüfung auf Dopplungen und Marken-Anklänge.
- **Bosse:** doppelte Größe, eigene Palette, Aura-Partikel, Zusatzteil.

## Darstellung und Effekte

- **three.quarks** (MIT): Emitter, Verläufe, Kraftfelder, Texturanimation, Sub-Emitter; Effekte als JSON ([GitHub](https://github.com/Alchemist0823/three.quarks/)).
- **postprocessing** (Zlib): Bloom, God Rays, SSAO, LUT, Schockwelle ([GitHub](https://github.com/pmndrs/postprocessing)).
- **GSAP:** inkl. aller Plugins kostenlos, auch kommerziell ([Webflow](https://webflow.com/blog/gsap-becomes-free)) – für UI, Belohnungen, Level-ups.
- **Kamera-Choreografie:** Zoom bei Krit, Kamerafahrt beim Boss, Zeitlupe beim letzten Treffer.

Alle Effekte mit Qualitätsstufe.

## Sounds und Musik

- **ZzFX** (MIT): Effekt = ~20 Zahlen, Player < 1 KB ([GitHub](https://github.com/KilledByAPixel/ZzFX)). ZzFXM für kurze Chiptunes.
- **jsfxr** (Unlicense): Vorlagen (pickupCoin, explosion, hitHurt …), Zufallsvarianten, WAV-Export ([GitHub](https://github.com/chr15m/jsfxr)).
- Jede Wiedergabe mit leichter Zufallsabweichung in Tonhöhe/Lautstärke.
- **Tone.js** (MIT): generative Musik je Biom, Zusatzspuren bei Kampf/Boss ([Projektseite](https://sourceforge.net/mirror/tone-js/profile)).
- **Kenney** (CC0): Audio-Pakete ([Lizenz](https://kenney.nl/support)).
- **Keine KI-Musikgeneratoren** (Lizenzbedingungen, z. B. Stable Audio Open uneinheitlich dargestellt: [Übersicht](https://dynamoi.com/learn/ai-music-distribution/can-i-distribute-stable-audio-commercially)).

## Tool-Übersicht

| Tool | Wofür | Lizenz | Automatisierung |
| --- | --- | --- | --- |
| Quaternius-Monster | animierte 3D-Kreaturen | CC0 | Download + Sprite-Sheet-Skript |
| Playwright + three.js | Rendern Bild für Bild | Open Source | Batch über alle Modelle |
| image-q | Palettenreduktion | MIT | Teil des Render-Skripts |
| three.quarks | Partikel | MIT | JSON |
| postprocessing | Bloom, God Rays, SSAO, LUT | Zlib | Code |
| GSAP | UI-Animation | kostenlos | Code |
| ZzFX | Soundeffekte | MIT | Zahlenreihen |
| jsfxr | SFX-Varianten, WAV | Unlicense | Vorlagen + Zufall |
| Tone.js | generative Musik | MIT | Regeln je Biom |
| Kenney | Modelle, UI, Audio | CC0 | Download + Farbreduktion |
| Wave Function Collapse | Arenen-Layouts | eigene Umsetzung | Code |

## Referenzen für das Ergebnis

| Spiel | Maßstab |
| --- | --- |
| Cassette Beasts | Pixel-Monster in 3D-Welt, gemeinsame Palette, Fusion aus Bausteinen – am nächsten am Konzept |
| Octopath Traveler | Licht, Schatten, Tiefenunschärfe, Atmosphäre |
| Dead Cells | flüssige Pixel-Animationen aus 3D, Sprites mit Normal-Maps |

## Empfohlene Reihenfolge

1. Sound (ZzFX) und Effekte (three.quarks) in die Diorama-Probe.
2. Machbarkeitstest 3D-zu-Pixel mit einem CC0-Modell.
3. Paletten- und Stilregeln festschreiben (Hauptpalette ca. 24 Farben, Sprite-Größen, Kamera).
4. Batch-Umwandlung aller Modelle plus Varianten.
5. Generative Musik je Biom (Tone.js).
6. Arenen-Generator (Biom-Regeln + WFC).
