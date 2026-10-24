import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import tailwindcss from '@tailwindcss/vite';
import { fileURLToPath, URL } from 'node:url';
import {
  CONSTRUCCION,
  limpiezaDeCodigo,
  PREFIJOS_ENTORNO,
} from './src/shared/configuracion/construccion';

// https://vite.dev/config/
export default defineConfig(({ mode }) => ({
  plugins: [react(), tailwindcss()],
  envPrefix: [...PREFIJOS_ENTORNO],
  resolve: {
    alias: {
      // Alias absoluto para que mover carpetas no rompa los imports
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  build: { ...CONSTRUCCION },
  esbuild: limpiezaDeCodigo(mode === 'production'),
}));
