import { defineConfig } from 'vite';

export default defineConfig({
  // relative Pfade, damit der Build auch in der Capacitor-App (file/https-Schema) läuft
  base: './',
  build: {
    target: 'es2020',
    // three.js allein ist ~500 kB; Warnung erst darüber
    chunkSizeWarningLimit: 800
  }
});
