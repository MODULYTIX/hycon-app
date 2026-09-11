import { peticion } from '@/shared/utilidades/cliente-http';
import type {
  FormularioProducto,
  Producto,
} from '@/features/productos/tipos/producto.tipos';

const BASE = '/api/v1/catalog/products';

// El backend solo publica los activos por defecto; el panel pide 'todos'
export type EstadoListado = 'active' | 'inactive' | 'todos';

export const listarProductosApi = (estado: EstadoListado = 'active', senal?: AbortSignal) =>
  peticion<{ productos: Producto[] }>(`${BASE}?estado=${estado}`, { senal }).then(
    (r) => r.productos
  );

export const crearProductoApi = (datos: FormularioProducto) =>
  peticion<{ producto: Producto }>(BASE, {
    metodo: 'POST',
    cuerpo: datos,
    autenticada: true,
  }).then((r) => r.producto);
