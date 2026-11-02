# HD-2D-Stil für das Creature-Idle-Game

Stand: 2. November 2026 · Export aus dem Konzeptdokument im Claude-Chat

## Kurzfazit

Der Stil von Octopath Traveler heißt **HD-2D**: Pixel-Art-Figuren stehen als flache Sprites in einer echten 3D-Umgebung, die modern ausgeleuchtet und nachbearbeitet wird. Dadurch wirkt die Szene wie ein beleuchtetes Diorama.

Für unser Spiel ist das vollständig automatisiert umsetzbar: Die Kreaturen bleiben Pixel-Sprites aus Code (wie Stilprobe B), die Umgebung wird aus einfachen 3D-Blöcken mit Pixel-Texturen erzeugt, und den „HD“-Anteil liefern Licht, Schatten und Effekte aus freien Bibliotheken (three.js und postprocessing). Fertige Bilder muss dabei niemand zeichnen oder nachbearbeiten.

Zwei Einschränkungen: Den Begriff „HD-2D“ dürfen wir nicht verwenden (Marke von Square Enix), und auf schwächeren Android-Geräten müssen die Effekte skalierbar sein.

## Was HD-2D ausmacht

HD-2D wurde von Square Enix für Octopath Traveler (2018) entwickelt, gemeinsam mit dem Studio Acquire, auf Basis der Unreal Engine 4. Inzwischen nutzen ihn auch Triangle Strategy, Live A Live, die Dragon-Quest-Remakes sowie Spiele anderer Studios wie Eiyuden Chronicle ([Wikipedia](https://en.wikipedia.org/wiki/HD-2D)).

| Baustein | Wirkung | Bei uns |
| --- | --- | --- |
| Pixel-Sprites als Billboards | Figuren bleiben „Retro“, stehen aber im Raum | Kreaturen aus Stilprobe B, als flache Fläche in 3D |
| Echte 3D-Umgebung | Tiefe, Kamerafahrten, Perspektive | Kampfarenen aus Blöcken mit Pixel-Texturen |
| Dynamisches Licht und Schatten | Figuren werfen Schatten, Fackeln flackern | Punktlichter pro Arena, Schatten der Sprites |
| Tiefenunschärfe / Tilt-Shift | Miniatur- bzw. Diorama-Eindruck | Vorder- und Hintergrund weich, Kampfzone scharf |
| Bloom, Nebel, volumetrisches Licht | Leuchten, Atmosphäre | Bloom auf Effekten, Nebel je Biom |
| Partikel | Lebendigkeit | Funken, Blätter, Glut, Treffer-Effekte |

## Rechtliches: Name ja, Stil frei

Geschützt ist nur der Name, nicht die Technik. Square Enix hat „HD-2D“ und „HD2D“ im Januar 2019 in Europa und Japan angemeldet ([GameSpot](https://www.gamespot.com/articles/octopath-traveler-studio-trademarks-hd-2d/1100-6464573/)); in den USA ist „HD-2D“ seit Mai 2022 registriert ([Markinton](https://markinton.com/trademark/hd-2d-90590303)).

- Im Store-Eintrag, im Spiel und in der Werbung nicht „HD-2D“ schreiben. Neutrale Beschreibungen wie „Pixel-Art im 3D-Diorama“ verwenden.
- Keine Figuren, Orte oder Grafiken aus Square-Enix-Spielen nachbauen.
- Technik und Look-Elemente (Sprites in 3D, Tilt-Shift, Bloom) sind frei nutzbar.

Das ist eine Einordnung, keine Rechtsberatung.

## Technische Umsetzung im Web

three.js als 3D-Basis, darüber eine HTML-Oberfläche für Menüs, Team und Upgrades. APK-Export über Capacitor.

1. **Szene:** Arena aus Blöcken (Boden, Felsen, Bäume, Ruinen) mit Pixel-Texturen; Kamera leicht erhöht, flacher Blickwinkel.
2. **Kreaturen:** Sprite als flache, beleuchtbare Fläche, Nearest-Filterung, automatisch erzeugte Normal-Map für Lichtreaktion.
3. **Licht und Schatten:** Hauptlicht (Sonne/Mond) plus 1–3 Punktlichter je Arena; Sprites werfen Schatten entlang ihrer Silhouette.
4. **Atmosphäre:** Nebel je Biom, Partikel (Glut, Pollen, Schnee) als Pixel-Quadrate.
5. **Nachbearbeitung:** [postprocessing](https://github.com/pmndrs/postprocessing) (Bloom, Tilt-Shift/DoF, Vignette, Farbkorrektur; [TiltShiftEffect](https://pmndrs.github.io/postprocessing/public/docs/class/src/effects/TiltShiftEffect.js~TiltShiftEffect.html)) oder three.js-eigene Shader ([VerticalTiltShiftShader](https://threejs.org/docs/pages/module-VerticalTiltShiftShader.html)).
6. **Kampf-Feedback:** Wippen, Vorstoß, Aufblitzen, Schadenszahlen auf den 3D-Flächen.

### Performance auf Android

- Qualitätsstufen (niedrig / mittel / hoch), Schatten, Bloom, Tilt-Shift einzeln abschaltbar.
- 3D-Szene mit 50–75 % Auflösung rendern und scharf hochskalieren.
- 30 fps Limit; Rendern in Menüs und im Hintergrund pausieren.
- Spiellogik getrennt vom Rendering; Offline-Ertrag rechnerisch.

## Asset-Pipeline ohne Nachbearbeitung

| Asset | Quelle | Was automatisch passiert | Lizenz |
| --- | --- | --- | --- |
| Kreaturen | Baukasten im Code (Körper, Ohren, Schwänze, Augen als Pixel-Raster) | Zusammensetzen, Spiegeln, Kontur, Schattierung, Normal-Map, Element- und Seltenheitspaletten | eigener Code |
| Entwicklungsstufen | dieselben Bausteine, größeres Raster | Hochskalieren, zusätzliche Teile je Stufe | eigener Code |
| Animationen | Code-Tweening | Wippen, Angriff, Treffer, Niederlage, Blinzeln | eigener Code |
| Arenen | Biom-Regeln | Gelände aus Rauschen, Props, Lichtquellen | eigener Code |
| Pixel-Texturen | Rauschen, 3–4 Palettenfarben | 16×16-Kacheln je Biom | eigener Code |
| Ergänzende Modelle/Texturen | [Kenney](https://kenney.nl/support) | direkt einsetzbar, Stil prüfen | CC0 |
| Umgebungslicht | [Poly Haven](https://polyhaven.com/license) HDRIs | nur als Lichtquelle | CC0 |
| Effekte | three.js, postprocessing | Bloom, Tilt-Shift, Nebel, Partikel | MIT / Zlib |

Keine KI-Bildgeneratoren (brauchen Nachbearbeitung, Nutzungsrechte uneinheitlich).

## Grenzen und Risiken

| Risiko | Auswirkung | Gegenmaßnahme |
| --- | --- | --- |
| Generierte Kreaturen wirken gleichförmig | Sammelreiz sinkt | großer Teile-Baukasten, markante Silhouetten, Sonderteile für Bosse |
| Leistung auf schwachen Android-Geräten | Ruckeln, Akku | Qualitätsstufen, reduzierte Auflösung, 30 fps |
| Gemischte Asset-Quellen | Stilbruch | alle Farben automatisch auf Spielpalette reduzieren |
| Begriff „HD-2D“ | Markenkonflikt | nirgends verwenden |
| Mehr Technik-Aufwand als 2D | längere Zeit bis Prototyp | erst eine Arena komplett, dann ausbauen |

Ziel ist der gleiche Eindruck (Pixel-Figuren im beleuchteten Diorama), nicht die Detailtiefe eines großen Teams.
