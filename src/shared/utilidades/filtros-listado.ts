export type OrdenListado = 'recientes' | 'antiguos' | 'nombre' | 'precio-asc' | 'precio-desc' | 'leidos' | 'titulo';
export interface FiltrosListado {
  buscar?: string;
  estado?: 'active' | 'inactive' | 'todos';
  orden?: OrdenListado;
  precioMin?: number;
  precioMax?: number;
  stock?: 'disponible' | 'agotado';
  duracionMax?: number;
  desde?: string;
  hasta?: string;
}
export function parametrosFiltros(filtros: FiltrosListado) {
  const parametros = new URLSearchParams();
  for (const [clave, valor] of Object.entries(filtros)) {
    if (clave !== 'estado' && valor !== undefined && valor !== '') parametros.set(clave, String(valor));
  }
  const consulta = parametros.toString();
  return consulta ? `&${consulta}` : '';
}

/**
 * Filtros de las listas de la cuenta (mis cursos, mis compras). Aqui "estado"
 * es el del pago, no el del catalogo, por eso van por separado.
 */
export interface FiltrosCuenta {
  buscar?: string;
  orden?: 'recientes' | 'antiguos' | 'nombre';
  estado?: 'todos' | 'pagado' | 'pendiente';
  desde?: string;
  hasta?: string;
}

export function parametrosCuenta(filtros: FiltrosCuenta) {
  const parametros = new URLSearchParams();
  for (const [clave, valor] of Object.entries(filtros)) {
    if (valor !== undefined && valor !== '') parametros.set(clave, String(valor));
  }
  const consulta = parametros.toString();
  return consulta ? `&${consulta}` : '';
}
