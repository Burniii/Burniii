# Asset-Register

Jedes Asset im Spiel steht hier: Name, Quelle, Lizenz, Status.
Status: **Platzhalter** (Graybox) · **Entwurf** (läuft, noch nicht abgenommen) · **final**.

Namenskonvention: `cr_<name>_lv<n>.png` (Kreaturen), `fx_<element>_<art>.json` (Effekte), `sfx_<name>` (Sound), `mdl_<quelle>_<name>.glb` (3D-Quellen), `tex_<biom>_<name>.png` (Texturen).
Jedes externe Asset läuft automatisch durch die Palettenreduktion auf die Hauptpalette.

| Name | Art | Quelle | Lizenz | Status | Datei / Ort |
| --- | --- | --- | --- | --- | --- |
| Glutling / Tropfling / Sprössling | Kreatur 16×16 | eigener Code (Pixel-Raster) | eigen | Entwurf | `src/data/creatures.js` |
| Wildschleim | Gegner 14×10 | eigener Code (Pixel-Raster) | eigen | Entwurf | `src/data/creatures.js` |
| Sprite-Normal-Maps | Normal-Map | eigener Code (Höhenfeld) | eigen | Entwurf | `src/sprites.js` |
| Waldruine: Gras, Erde, Sandweg, Steinziegel, Rinde, Laub | Textur 16×16 | eigener Code (Rauschen) | eigen | Entwurf | `src/terrain.js` |
| Waldruine: Gelände, Säulen, Bäume, Büsche, Fackeln, Kristalle | 3D-Szene | eigener Code (Regeln) | eigen | Entwurf | `src/terrain.js` |
| Bergkulisse je Tageszeit | Textur 160×60 | eigener Code | eigen | Entwurf | `src/scene.js` |
| Umgebungspartikel, Treffer-Funken | Partikel | eigener Code | eigen | Platzhalter | `src/fx.js` |
| Bloom, Tilt-Shift, Vignette | Nachbearbeitung | three.js-Addons | MIT | Entwurf | `src/fx.js` |
| Pixelify Sans | Schrift | Google Fonts via @fontsource | SIL OFL 1.1 | final | npm `@fontsource/pixelify-sans` |
