import { describe, expect, it } from 'vitest';
import { formatearTamano, TAMANO_MAXIMO_IMAGEN, validarArchivoImagen } from './imagenes';

const archivo = (tipo: string, bytes: number) =>
  new File([new Uint8Array(bytes)], 'foto', { type: tipo });

describe('validarArchivoImagen', () => {
  it('acepta jpg, png, webp y gif', () => {
    for (const tipo of ['image/jpeg', 'image/png', 'image/webp', 'image/gif']) {
      expect(validarArchivoImagen(archivo(tipo, 100))).toBeUndefined();
    }
  });

  it('rechaza otros formatos, incluido svg', () => {
    expect(validarArchivoImagen(archivo('image/svg+xml', 100))).toMatch(/formato no permitido/i);
    expect(validarArchivoImagen(archivo('application/pdf', 100))).toMatch(/formato no permitido/i);
  });

  it('rechaza archivos de mas de 5 MB y vacios', () => {
    expect(validarArchivoImagen(archivo('image/png', TAMANO_MAXIMO_IMAGEN + 1))).toMatch(/5 MB/);
    expect(validarArchivoImagen(archivo('image/png', 0))).toMatch(/vacio/);
  });
});

describe('formatearTamano', () => {
  it('usa la unidad adecuada', () => {
    expect(formatearTamano(512)).toBe('512 B');
    expect(formatearTamano(2048)).toBe('2 KB');
    expect(formatearTamano(3.5 * 1024 * 1024)).toBe('3.5 MB');
  });
});
