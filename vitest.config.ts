import { defineConfig, mergeConfig } from 'vitest/config';
import configuracionVite from './vite.config';

export default mergeConfig(
  configuracionVite,
  defineConfig({
    test: {
      environment: 'jsdom',
      setupFiles: ['./src/pruebas/configuracion.ts'],
      include: ['src/**/*.test.{ts,tsx}'],
      css: false,
      restoreMocks: true,
    },
  })
);
