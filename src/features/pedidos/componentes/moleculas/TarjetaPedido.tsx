import { Icon } from '@iconify/react';
import { formatearFecha, formatearPrecio } from '@/shared/utilidades/formato';
import type { Pedido } from '@/features/pedidos/tipos/pedido.tipos';

const METODOS: Record<string, { nombre: string; icono: string }> = {
  tarjeta: { nombre: 'Tarjeta', icono: 'solar:card-linear' },
  yape: { nombre: 'Yape', icono: 'solar:qr-code-linear' },
  whatsapp: { nombre: 'WhatsApp', icono: 'ic:baseline-whatsapp' },
};

const DATO = 'inline-flex items-center gap-1.5 rounded-full bg-g-5 px-2.5 py-1 text-[12px] text-g-60';

// Una compra con su detalle, tal como quedo guardada
export default function TarjetaPedido({ pedido }: { pedido: Pedido }) {
  const pagado = pedido.estadoPago === 'pagado';
  const metodo = METODOS[pedido.metodoPago] ?? {
    nombre: pedido.metodoPago,
    icono: 'solar:wallet-linear',
  };
  const articulos = pedido.items.reduce((suma, linea) => suma + linea.cantidad, 0);

  return (
    <li className="min-w-0 overflow-hidden rounded-2xl border border-g-20 bg-white shadow-sm transition-shadow hover:shadow-[0_10px_30px_rgba(28,58,57,0.07)]">
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-g-20 px-4 py-4 sm:px-5">
        <div className="flex min-w-0 items-start gap-3">
          <span
            aria-hidden
            className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-hy-5 text-primary"
          >
            <Icon icon="solar:bag-check-linear" width="20" height="20" />
          </span>

          <div className="min-w-0">
            <p className="text-[15.5px] font-semibold tracking-tight text-g-90">{pedido.codigo}</p>
            <p className="mt-1.5 flex flex-wrap items-center gap-1.5">
              <time dateTime={pedido.createdAt} className={DATO}>
                <Icon icon="solar:calendar-linear" width="13" height="13" aria-hidden />
                {formatearFecha(pedido.createdAt)}
              </time>
              <span className={DATO}>
                <Icon icon={metodo.icono} width="13" height="13" aria-hidden />
                {metodo.nombre}
              </span>
              <span className={DATO}>
                <Icon icon="solar:box-minimalistic-linear" width="13" height="13" aria-hidden />
                {articulos} {articulos === 1 ? 'artículo' : 'artículos'}
              </span>
            </p>
          </div>
        </div>

        <span
          className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11.5px] font-semibold ${
            pagado ? 'bg-hy-10 text-primary' : 'bg-y-10 text-y-80'
          }`}
        >
          <Icon
            icon={pagado ? 'solar:check-circle-bold' : 'solar:clock-circle-bold'}
            width="14"
            height="14"
            aria-hidden
          />
          {pagado ? 'Pagado' : 'Pendiente de pago'}
        </span>
      </div>

      <ul className="divide-y divide-g-10 px-4 text-[13.5px] sm:px-5">
        {pedido.items.map((linea, posicion) => (
          <li key={`${pedido.uuid}-${posicion}`} className="flex items-center gap-3 py-3 sm:gap-4">
            <span
              aria-hidden
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-g-5 text-g-50"
            >
              <Icon
                icon={linea.tipo === 'curso' ? 'solar:diploma-linear' : 'solar:box-linear'}
                width="16"
                height="16"
              />
            </span>

            <span className="min-w-0 flex-1 break-words text-g-80">
              <span className="tabular-nums text-g-50">{linea.cantidad} x </span>
              {linea.nombre}
              {linea.cantidad > 1 && (
                <span className="block text-[12px] text-g-50">
                  {formatearPrecio(linea.precio)} por unidad
                </span>
              )}
            </span>

            <span className="shrink-0 tabular-nums font-medium text-g-80">
              {formatearPrecio(linea.total)}
            </span>
          </li>
        ))}
      </ul>

      <div className="border-t border-g-20 bg-g-5/60 px-4 py-4 sm:px-5">
        <dl className="ml-auto w-full max-w-[280px] space-y-1.5 text-[13px]">
          <div className="flex items-baseline justify-between gap-4">
            <dt className="text-g-50">Subtotal</dt>
            <dd className="tabular-nums text-g-70">{formatearPrecio(pedido.subtotal)}</dd>
          </div>

          {pedido.descuento > 0 && (
            <div className="flex items-baseline justify-between gap-4">
              <dt className="text-primary">Ahorraste</dt>
              <dd className="tabular-nums font-medium text-primary">
                -{formatearPrecio(pedido.descuento)}
              </dd>
            </div>
          )}

          <div className="flex items-baseline justify-between gap-4 border-t border-g-20 pt-2">
            <dt className="text-[11px] font-semibold uppercase tracking-[0.12em] text-g-50">
              Total
            </dt>
            <dd className="text-[20px] font-semibold tabular-nums text-primary">
              {formatearPrecio(pedido.total)}
            </dd>
          </div>
        </dl>
      </div>
    </li>
  );
}
