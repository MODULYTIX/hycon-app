import { peticion } from '@/shared/utilidades/cliente-http';
import type { Pagina, Paginacion } from '@/shared/utilidades/paginacion';
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
  senal?: AbortSignal
): Promise<Pagina<Producto>> =>
  peticion<{ productos: Producto[]; paginacion: Paginacion }>(
    `${BASE}?estado=${estado}&pagina=${pagina}&porPagina=${POR_PAGINA}`,
    { senal }
  ).then((r) => ({ elementos: r.productos, paginacion: r.paginacion }));

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
