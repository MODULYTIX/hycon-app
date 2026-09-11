import { describe, expect, it } from 'vitest';
import { formatearDuracion, formatearFecha, formatearPrecio } from './formato';

// Intl usa un espacio no separable tras el simbolo de moneda; se normaliza para comparar
const normalizar = (texto: string) => texto.replace(/\s/g, ' ');

describe('formatearPrecio', () => {
  it('muestra el importe en soles con dos decimales', () => {
    expect(normalizar(formatearPrecio(25.9))).toBe('S/ 25.90');
  });

  it('mantiene los dos decimales en importes enteros', () => {
    expect(normalizar(formatearPrecio(120))).toBe('S/ 120.00');
  });
});

describe('formatearDuracion', () => {
  it('muestra minutos por debajo de una hora', () => {
    expect(formatearDuracion(45)).toBe('45 min');
  });

  it('muestra solo horas cuando son exactas', () => {
    expect(formatearDuracion(120)).toBe('2 h');
  });

  it('combina horas y minutos', () => {
    expect(formatearDuracion(90)).toBe('1 h 30 min');
  });

  it('muestra un guion cuando el curso no declara duracion', () => {
    expect(formatearDuracion(null)).toBe('-');
  });
});

describe('formatearFecha', () => {
  it('convierte una fecha ISO a formato local', () => {
    expect(formatearFecha('2026-09-10T12:00:00.000Z')).toMatch(/\d{2}\/\d{2}\/\d{4}/);
  });

  it('devuelve un guion si la fecha no es valida', () => {
    expect(formatearFecha('no-es-fecha')).toBe('-');
  });
});
