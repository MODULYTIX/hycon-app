import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  contarPalabras,
  fechaLarga,
  fechaParaCampo,
  hoyParaCampo,
  minutosDeLectura,
} from './lectura';

afterEach(() => {
  vi.useRealTimers();
});

describe('lectura', () => {
  it('cuenta palabras y calcula minutos igual que el backend', () => {
    expect(contarPalabras('  uno dos\n\ntres ')).toBe(3);
    expect(minutosDeLectura('')).toBe(1);
    expect(minutosDeLectura('palabra '.repeat(201))).toBe(2);
  });

  it('en HTML solo cuenta el texto visible', () => {
    expect(contarPalabras('<h2>Titulo</h2><p><strong>uno</strong>&nbsp;dos</p>')).toBe(3);
    expect(contarPalabras('<p></p>')).toBe(0);
  });
});

describe('fechas del formulario', () => {
  it('hoy en formato de campo de fecha', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 8, 7, 10, 30));

    expect(hoyParaCampo()).toBe('2026-09-07');
  });

  it('una fecha guardada a mediodia UTC cae el mismo dia en Peru', () => {
    expect(fechaParaCampo('2026-03-01T12:00:00.000Z')).toBe('2026-03-01');
  });

  it('una fecha rota vuelve a hoy', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 0, 2));

    expect(fechaParaCampo('no-es-fecha')).toBe('2026-01-02');
  });

  it('fecha larga en espanol', () => {
    expect(fechaLarga('2026-03-01')).toBe('1 de marzo de 2026');
    expect(fechaLarga('')).toBe('');
  });
});
