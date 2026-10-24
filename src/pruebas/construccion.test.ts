import { describe, expect, it } from 'vitest';
import {
  CONSTRUCCION,
  limpiezaDeCodigo,
  PREFIJOS_ENTORNO,
} from '@/shared/configuracion/construccion';

/**
 * Reglas de despliegue, no de pantalla: si alguna se cae sin querer, el codigo
 * fuente o los mensajes internos acabarian publicados.
 */
describe('lo que se publica en produccion', () => {
  it('no publica los mapas de codigo fuente', () => {
    expect(CONSTRUCCION.sourcemap).toBe(false);
  });

  it('minifica lo que se sirve', () => {
    expect(CONSTRUCCION.minify).toBe('esbuild');
  });

  it('quita los console y los debugger del bundle', () => {
    expect(limpiezaDeCodigo(true)).toMatchObject({ drop: ['console', 'debugger'] });
  });

  it('en desarrollo no se quita nada, para poder depurar', () => {
    expect(limpiezaDeCodigo(false)).toEqual({});
  });

  // Un secreto con este prefijo acabaria dentro del bundle publico
  it('solo expone al navegador las variables con prefijo propio', () => {
    expect([...PREFIJOS_ENTORNO]).toEqual(['VITE_', 'HYCON_']);
  });
});
