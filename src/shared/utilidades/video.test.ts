import { describe, expect, it } from 'vitest';
import { esVideoSubido, nombreDeVideoSubido } from './video';

describe('esVideoSubido', () => {
  it('reconoce lo que esta en nuestro almacen', () => {
    expect(esVideoSubido('r2:cursos/01a0/clase.mp4')).toBe(true);
    expect(esVideoSubido('stream:ea95132c15732412d22c1476fa83f27a')).toBe(true);
    expect(esVideoSubido('  r2:cursos/01a0/clase.mp4  ')).toBe(true);
  });

  it('un enlace de YouTube no es un archivo nuestro', () => {
    expect(esVideoSubido('https://youtu.be/dQw4w9WgXcQ')).toBe(false);
    expect(esVideoSubido('')).toBe(false);
  });
});

describe('nombreDeVideoSubido', () => {
  it('muestra el archivo en lugar de la ruta entera', () => {
    expect(nombreDeVideoSubido('r2:cursos/01a0/clase-1.mp4')).toBe('Video subido (clase-1.mp4)');
  });

  it('nombra el proveedor cuando el video no es un archivo nuestro', () => {
    expect(nombreDeVideoSubido('stream:ea95132c15732412d22c1476fa83f27a')).toMatch(
      /cloudflare stream/i
    );
  });
});
