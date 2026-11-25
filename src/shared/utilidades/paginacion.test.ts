import { describe, expect, it } from 'vitest';
import { PAGINACION_INICIAL, paginaDe, rangoMostrado, rangoPaginas } from './paginacion';

describe('rangoPaginas', () => {
  it('muestra todas las paginas si son 7 o menos', () => {
    expect(rangoPaginas(1, 1)).toEqual([1]);
    expect(rangoPaginas(3, 7)).toEqual([1, 2, 3, 4, 5, 6, 7]);
  });

  it('cerca del inicio salta solo hacia el final', () => {
    expect(rangoPaginas(2, 20)).toEqual([1, 2, 3, 4, 5, 'hueco', 20]);
  });

  it('cerca del final salta solo desde el inicio', () => {
    expect(rangoPaginas(19, 20)).toEqual([1, 'hueco', 16, 17, 18, 19, 20]);
  });

  it('en medio muestra la actual con sus vecinas', () => {
    expect(rangoPaginas(10, 20)).toEqual([1, 'hueco', 9, 10, 11, 'hueco', 20]);
  });

  it('nunca pasa de 7 posiciones', () => {
    for (let actual = 1; actual <= 50; actual += 1) {
      expect(rangoPaginas(actual, 50).length).toBeLessThanOrEqual(7);
    }
  });
});

describe('rangoMostrado', () => {
  it('calcula el tramo de la pagina actual', () => {
    expect(rangoMostrado({ pagina: 2, porPagina: 6, total: 14, totalPaginas: 3 })).toEqual({
      desde: 7,
      hasta: 12,
    });
  });

  it('la ultima pagina no pasa del total', () => {
    expect(rangoMostrado({ pagina: 3, porPagina: 6, total: 14, totalPaginas: 3 })).toEqual({
      desde: 13,
      hasta: 14,
    });
  });

  it('sin registros devuelve cero', () => {
    expect(rangoMostrado({ pagina: 1, porPagina: 6, total: 0, totalPaginas: 1 })).toEqual({
      desde: 0,
      hasta: 0,
    });
  });
});

describe('paginaDe', () => {
  const paginacion = { pagina: 2, porPagina: 6, total: 9, totalPaginas: 2 };

  it('deja pasar la lista y los metadatos que manda el backend', () => {
    expect(paginaDe(['a', 'b'], paginacion)).toEqual({ elementos: ['a', 'b'], paginacion });
  });

  // Lo que antes dejaba la pagina en blanco al recorrer algo que no era lista
  it('sin lista devuelve una vacia en vez de nada', () => {
    expect(paginaDe(undefined, paginacion).elementos).toEqual([]);
  });

  it('sin metadatos usa los de arranque', () => {
    expect(paginaDe(['a'], undefined).paginacion).toEqual(PAGINACION_INICIAL);
  });

  it('con metadatos a medias tampoco se los cree', () => {
    const aMedias = { pagina: 1 } as unknown as typeof paginacion;

    expect(paginaDe(['a'], aMedias).paginacion).toEqual(PAGINACION_INICIAL);
  });
});
