import { Icon } from '@iconify/react';
import { formatearFecha, formatearPrecio } from '@/shared/utilidades/formato';
import type { Pedido } from '@/features/pedidos/tipos/pedido.tipos';

const METODOS: Record<string, { nombre: string; icono: string }> = {
  tarjeta: { nombre: 'Tarjeta', icono: 'solar:card-linear' },
  yape: { nombre: 'Yape', icono: 'solar:qr-code-linear' },
  whatsapp: { nombre: 'WhatsApp', icono: 'ic:baseline-whatsapp' },
};

// Una compra con su detalle, tal como quedo guardada
export default function TarjetaPedido({ pedido }: { pedido: Pedido }) {
  const pagado = pedido.estadoPago === 'pagado';
  const metodo = METODOS[pedido.metodoPago] ?? { nombre: pedido.metodoPago, icono: 'solar:wallet-linear' };

  return (
    <li className="min-w-0 overflow-hidden rounded-xl border border-g-20 bg-white p-4 shadow-sm sm:p-5">
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-g-20 pb-4">
        <div>
          <p className="text-[15px] font-semibold tracking-tight text-g-90">{pedido.codigo}</p>
          <p className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-[12.5px] text-g-50">
            <time dateTime={pedido.createdAt}>{formatearFecha(pedido.createdAt)}</time>
            <span aria-hidden className="text-g-30">·</span>
            <span className="inline-flex items-center gap-1">
              <Icon icon={metodo.icono} width="14" height="14" aria-hidden />
              {metodo.nombre}
            </span>
          </p>
        </div>

        <span
          className={`rounded-full px-3 py-1 text-[11.5px] font-medium ${
            pagado ? 'bg-hy-10 text-primary' : 'bg-y-10 text-y-80'
          }`}
        >
          {pagado ? 'Pagado' : 'Pendiente de pago'}
        </span>
      </div>

      <ul className="divide-y divide-g-20 text-[13.5px]">
        {pedido.items.map((linea, posicion) => (
          <li key={`${pedido.uuid}-${posicion}`} className="flex items-start justify-between gap-4 py-3">
            <span className="min-w-0 break-words text-g-70">
              <span className="tabular-nums text-g-50">{linea.cantidad} x </span>
              {linea.nombre}
            </span>
            <span className="shrink-0 tabular-nums text-g-80">{formatearPrecio(linea.total)}</span>
          </li>
        ))}
      </ul>

      <div className="flex flex-wrap items-end justify-between gap-3 rounded-lg bg-hy-5 px-3 py-3">
        {pedido.descuento > 0 ? (
          <p className="text-[12.5px] text-primary">
            Ahorraste {formatearPrecio(pedido.descuento)}
          </p>
        ) : (
          <span />
        )}
        <p className="text-right">
          <span className="block text-[11px] uppercase tracking-[0.12em] text-g-50">Total</span>
          <span className="text-[19px] font-semibold tabular-nums text-primary">
            {formatearPrecio(pedido.total)}
          </span>
        </p>
      </div>
    </li>
  );
}
