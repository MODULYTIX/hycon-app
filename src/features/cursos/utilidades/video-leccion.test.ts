import { describe, expect, it } from 'vitest';
import { fuenteDeLeccion, inicioDeLeccion } from './video-leccion';
import type { Leccion } from '@/features/cursos/tipos/leccion.tipos';

const URL_FIRMADA = 'https://bucket.r2.cloudflarestorage.com/hycon/cursos/a.mp4?X-Amz-Signature=abc';

const leccion = (cambios: Partial<Leccion> = {}): Leccion => ({
  uuid: '01a0fef2-0000-70bf-a4e4-000000000001',
  titulo: 'Qué es la ergonomía',
  descripcion: null,
  duracionMinutos: 8,
  posicion: 1,
  esMuestra: true,
  bloqueada: false,
  tipoVideo: 'youtube',
  videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ&t=90',
  youtubeId: 'dQw4w9WgXcQ',
  limiteSegundos: null,
  ...cambios,
});

describe('fuenteDeLeccion', () => {
  it('de YouTube sale el id, no el enlace', () => {
    expect(fuenteDeLeccion(leccion())).toBe('dQw4w9WgXcQ');
  });

  it('de un video nuestro sale el enlace firmado', () => {
    expect(
      fuenteDeLeccion(leccion({ tipoVideo: 'archivo', videoUrl: URL_FIRMADA, youtubeId: null }))
    ).toBe(URL_FIRMADA);
    expect(
      fuenteDeLeccion(
        leccion({ tipoVideo: 'incrustado', videoUrl: 'https://stream/token/iframe', youtubeId: null })
      )
    ).toBe('https://stream/token/iframe');
  });

  // Una parte bloqueada llega sin tipo: no hay nada que reproducir
  it('sin tipo o sin leccion no hay fuente', () => {
    expect(fuenteDeLeccion(leccion({ tipoVideo: null, videoUrl: null, youtubeId: null }))).toBeNull();
    expect(fuenteDeLeccion(undefined)).toBeNull();
    expect(fuenteDeLeccion(null)).toBeNull();
  });

  it('un tipo de archivo sin enlace tampoco se reproduce', () => {
    expect(fuenteDeLeccion(leccion({ tipoVideo: 'archivo', videoUrl: null, youtubeId: null }))).toBeNull();
  });
});

describe('inicioDeLeccion', () => {
  it('respeta el minuto que trae el enlace de YouTube', () => {
    expect(inicioDeLeccion(leccion())).toBe(90);
  });

  it('un video nuestro siempre empieza por el principio', () => {
    expect(inicioDeLeccion(leccion({ tipoVideo: 'archivo', videoUrl: URL_FIRMADA }))).toBe(0);
  });
});
