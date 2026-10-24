import { peticion } from '@/shared/utilidades/cliente-http';
import { parametrosCuenta, type FiltrosCuenta } from '@/shared/utilidades/filtros-listado';
import type { Pagina, Paginacion } from '@/shared/utilidades/paginacion';
import type { ItemPedido, MetodoPago, Pedido } from '@/features/pedidos/tipos/pedido.tipos';

const BASE = '/api/v1/orders';

export const POR_PAGINA = 6;

export const crearPedidoApi = (metodoPago: MetodoPago, items: ItemPedido[]) =>
  peticion<{ pedido: Pedido }>(BASE, {
    metodo: 'POST',
    cuerpo: { metodoPago, items },
    autenticada: true,
  }).then((r) => r.pedido);

/** Las compras del usuario: el backend filtra, ordena y pagina. */
export const listarMisPedidosApi = (
  pagina = 1,
  senal?: AbortSignal,
  filtros: FiltrosCuenta = {}
): Promise<Pagina<Pedido>> =>
  peticion<{ pedidos: Pedido[]; paginacion: Paginacion }>(
    `${BASE}/mios?pagina=${pagina}&porPagina=${POR_PAGINA}${parametrosCuenta(filtros)}`,
    { autenticada: true, senal }
  ).then((r) => ({ elementos: r.pedidos, paginacion: r.paginacion }));
