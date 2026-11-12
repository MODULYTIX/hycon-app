import { describe, expect, it } from 'vitest';
import { estaEnElFinal, SEGUNDOS_PARA_EL_FINAL } from './final-de-video';

describe('estaEnElFinal', () => {
  it('avisa en los ultimos cinco segundos', () => {
    expect(estaEnElFinal(595, 600)).toBe(true);
    expect(estaEnElFinal(594.9, 600)).toBe(false);
  });

  // Da igual como llego: lo que cuenta es estar al final
  it('da igual si el usuario salto hasta ahi', () => {
    expect(estaEnElFinal(1796, 1800)).toBe(true);
  });

  it('al terminar tambien cuenta', () => {
    expect(estaEnElFinal(600, 600)).toBe(true);
  });

  // En un video de 6 segundos, los ultimos 5 serian casi todo
  it('en videos cortos pide haber pasado de la mitad', () => {
    expect(estaEnElFinal(1, 6)).toBe(false);
    expect(estaEnElFinal(3, 6)).toBe(true);
  });

  it('sin duracion todavia no se puede saber', () => {
    expect(estaEnElFinal(0, 0)).toBe(false);
    expect(estaEnElFinal(5, Number.NaN)).toBe(false);
    expect(estaEnElFinal(0, 600)).toBe(false);
  });

  it('el margen son cinco segundos', () => {
    expect(SEGUNDOS_PARA_EL_FINAL).toBe(5);
  });
});
