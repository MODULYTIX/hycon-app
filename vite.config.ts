import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import tailwindcss from '@tailwindcss/vite';
import { fileURLToPath, URL } from 'node:url';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  // Variables del .env que se exponen al navegador. Cualquier variable que
  // empiece por HYCON_ acaba en el bundle publico: no poner secretos con ese prefijo.
  envPrefix: ['VITE_', 'HYCON_'],
  resolve: {
    alias: {
      // Alias absoluto para que mover carpetas no rompa los imports
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
});
