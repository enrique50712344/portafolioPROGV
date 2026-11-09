import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  // Rutas relativas: funciona en local y en un project page de GitHub Pages
  // (https://usuario.github.io/portafolioPROGV/).
  base: './',
  plugins: [react(), tailwindcss()],
  server: { port: 5183, strictPort: false },
  build: {
    chunkSizeWarningLimit: 1400,
    target: 'es2020',
  },
});

