import { defineConfig, mergeConfig } from 'vitest/config';
import type { ConfigEnv, UserConfig } from 'vite';
import configuracionVite from './vite.config';

// La configuracion de Vite es una funcion del entorno: aqui se resuelve para
// el modo de prueba antes de anadirle lo de Vitest
export default defineConfig((entorno: ConfigEnv) => {
  const base = (configuracionVite as unknown as (env: ConfigEnv) => UserConfig)(entorno);

  return mergeConfig(base, {
    test: {
      environment: 'jsdom',
      setupFiles: ['./src/pruebas/configuracion.ts'],
      include: ['src/**/*.test.{ts,tsx}'],
      css: false,
      restoreMocks: true,
      // Margen para las pruebas que escriben en formularios: con la maquina cargada
      // los 5 s por defecto se quedaban cortos y fallaban sin haber nada roto
      testTimeout: 15000,
    },
  });
});
