// Metadatos de paginacion tal como los devuelve el backend
export interface Paginacion {
  pagina: number;
  porPagina: number;
  total: number;
  totalPaginas: number;
}

export interface Pagina<T> {
  elementos: T[];
  paginacion: Paginacion;
}

export const PAGINACION_INICIAL: Paginacion = {
  pagina: 1,
  porPagina: 6,
  total: 0,
  totalPaginas: 1,
};

export type ElementoPaginador = number | 'hueco';

// Siempre devuelve como mucho 7 posiciones para que el paginador no cambie de ancho
// al moverse: primera, ultima, la actual con sus vecinas y huecos donde se salta.
export const rangoPaginas = (actual: number, total: number): ElementoPaginador[] => {
  if (total <= 7) {
    return Array.from({ length: total }, (_, indice) => indice + 1);
  }
  if (actual <= 4) {
    return [1, 2, 3, 4, 5, 'hueco', total];
  }
  if (actual >= total - 3) {
    return [1, 'hueco', total - 4, total - 3, total - 2, total - 1, total];
  }
  return [1, 'hueco', actual - 1, actual, actual + 1, 'hueco', total];
};

// Primer y ultimo registro visibles, para el texto "Mostrando 7-12 de 14"
export const rangoMostrado = ({ pagina, porPagina, total }: Paginacion) => {
  if (total === 0) return { desde: 0, hasta: 0 };
  return {
    desde: (pagina - 1) * porPagina + 1,
    hasta: Math.min(pagina * porPagina, total),
  };
};
