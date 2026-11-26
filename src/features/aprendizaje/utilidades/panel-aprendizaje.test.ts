import { describe, expect, it } from 'vitest';
import {
  ACCION,
  estadoDe,
  filtrarPorPestana,
  porcentajeVisto,
  resumir,
  saludoPorHora,
} from './panel-aprendizaje';
import type { CursoComprado } from '@/features/aprendizaje/tipos/aprendizaje.tipos';

const curso = (cambios: Partial<CursoComprado> = {}): CursoComprado => ({
  uuid: 'b7b299d8-ee8f-4bea-a618-0a5f8261136f',
  name: 'Logistica de ultima milla',
  description: null,
  videoUrl: null,
  youtubeId: null,
  thumbnailUrl: null,
  durationMinutes: 60,
  compradoEl: '2026-10-07T12:00:00.000Z',
  partes: 4,
  vistas: 0,
  completado: false,
  certificado: null,
  ...cambios,
});

describe('porcentajeVisto', () => {
  it('redondea lo que lleva visto', () => {
    expect(porcentajeVisto(curso({ partes: 3, vistas: 1 }))).toBe(33);
    expect(porcentajeVisto(curso({ partes: 4, vistas: 2 }))).toBe(50);
    expect(porcentajeVisto(curso({ partes: 4, vistas: 4 }))).toBe(100);
  });

  // Un curso sin partes no se puede dividir: antes esto daba NaN
  it('un curso sin partes se queda en cero', () => {
    expect(porcentajeVisto(curso({ partes: 0, vistas: 0 }))).toBe(0);
  });
});

describe('estadoDe', () => {
  it('distingue los tres momentos de un curso', () => {
    expect(estadoDe(curso({ vistas: 0 }))).toBe('sin-empezar');
    expect(estadoDe(curso({ vistas: 2 }))).toBe('en-curso');
    expect(estadoDe(curso({ vistas: 4, completado: true }))).toBe('terminado');
  });

  it('cada momento tiene su propio boton', () => {
    expect(ACCION['sin-empezar']).toBe('Empezar curso');
    expect(ACCION['en-curso']).toBe('Reanudar');
    expect(ACCION.terminado).toBe('Repasar');
  });
});

describe('resumir', () => {
  it('cuenta lo que falta, lo acabado y los certificados', () => {
    const cursos = [
      curso({ uuid: '1', vistas: 0 }),
      curso({ uuid: '2', vistas: 2 }),
      curso({ uuid: '3', vistas: 4, completado: true }),
      curso({ uuid: '4', vistas: 4, completado: true, certificado: 'HY-ABCD1234' }),
    ];

    expect(resumir(cursos)).toEqual({ porTerminar: 2, terminados: 2, certificados: 1 });
  });

  it('sin cursos no inventa numeros', () => {
    expect(resumir([])).toEqual({ porTerminar: 0, terminados: 0, certificados: 0 });
  });
});

describe('filtrarPorPestana', () => {
  const pendiente = curso({ uuid: '1', vistas: 1 });
  const acabado = curso({ uuid: '2', vistas: 4, completado: true });
  const cursos = [pendiente, acabado];

  it('cada pestana se queda con lo suyo', () => {
    expect(filtrarPorPestana(cursos, 'todos')).toEqual(cursos);
    expect(filtrarPorPestana(cursos, 'en-curso')).toEqual([pendiente]);
    expect(filtrarPorPestana(cursos, 'terminados')).toEqual([acabado]);
  });
});

describe('saludoPorHora', () => {
  const alas = (hora: number) => saludoPorHora(new Date(2026, 10, 25, hora, 0, 0));

  it('cambia con el momento del dia', () => {
    expect(alas(7)).toBe('Buenos días');
    expect(alas(15)).toBe('Buenas tardes');
    expect(alas(22)).toBe('Buenas noches');
  });

  // Los bordes son donde se nota si el corte esta mal puesto
  it('corta al mediodia y a las siete', () => {
    expect(alas(11)).toBe('Buenos días');
    expect(alas(12)).toBe('Buenas tardes');
    expect(alas(18)).toBe('Buenas tardes');
    expect(alas(19)).toBe('Buenas noches');
  });
});
