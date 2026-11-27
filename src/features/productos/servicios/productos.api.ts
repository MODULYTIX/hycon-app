import { parametrosFiltros, type FiltrosListado } from '@/shared/utilidades/filtros-listado';
import { peticion } from '@/shared/utilidades/cliente-http';
import { paginaDe, type Pagina, type Paginacion } from '@/shared/utilidades/paginacion';
import type {
  AgenciaEnvio,
  DatosProducto,
  Producto,
  ProductoDetalle,
} from '@/features/productos/tipos/producto.tipos';

const BASE = '/api/v1/catalog/products';

// El backend solo publica los activos por defecto; el panel pide 'todos'
export type EstadoListado = 'active' | 'inactive' | 'todos';

export const POR_PAGINA = 6;

export const listarProductosApi = (
  estado: EstadoListado,
  pagina: number,
  senal?: AbortSignal,
  porPagina = POR_PAGINA,
  filtros: FiltrosListado = {}
): Promise<Pagina<Producto>> =>
  peticion<{ productos: Producto[]; paginacion: Paginacion }>(
    `${BASE}?estado=${estado}&pagina=${pagina}&porPagina=${porPagina}${parametrosFiltros(filtros)}`,
    { senal }
  ).then((r) => paginaDe(r.productos, r.paginacion));

export type AtributosProductos = Record<'marca' | 'modelo' | 'color', string[]>;

export const listarAtributosProductosApi = async (senal?: AbortSignal) => {
  const resultado = await peticion<{ atributos: AtributosProductos }>(`${BASE}/filters`, { senal });
  return resultado.atributos;
};

export const listarAgenciasApi = (senal?: AbortSignal) =>
  peticion<{ agencias: AgenciaEnvio[] }>('/api/v1/catalog/shipping-agencies', { senal }).then(
    (r) => r.agencias
  );

export const obtenerProductoApi = (uuid: string, senal?: AbortSignal) =>
  peticion<{ producto: ProductoDetalle }>(`${BASE}/${uuid}`, { senal }).then((r) => r.producto);

export const crearProductoApi = (datos: DatosProducto) =>
  peticion<{ producto: Producto }>(BASE, {
    metodo: 'POST',
    cuerpo: datos,
    autenticada: true,
  }).then((r) => r.producto);

export const actualizarProductoApi = (uuid: string, datos: DatosProducto) =>
  peticion<{ producto: Producto }>(`${BASE}/${uuid}`, {
    metodo: 'PUT',
    cuerpo: datos,
    autenticada: true,
  }).then((r) => r.producto);

export const eliminarProductoApi = (uuid: string) =>
  peticion<void>(`${BASE}/${uuid}`, { metodo: 'DELETE', autenticada: true });
