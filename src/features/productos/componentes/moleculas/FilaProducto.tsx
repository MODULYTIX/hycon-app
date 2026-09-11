import { Icon } from '@iconify/react';
import EtiquetaEstado from '@/features/administracion/componentes/atomos/EtiquetaEstado';
import { formatearFecha, formatearPrecio } from '@/features/administracion/utilidades/formato';
import type { Producto } from '@/features/administracion/tipos/catalogo.tipos';

export default function FilaProducto({ producto }: { producto: Producto }) {
  const enOferta = producto.discountPrice !== null;
  const detalles = [producto.brand, producto.model].filter(Boolean).join(' - ');

  return (
    <li className="flex flex-col gap-3 px-5 py-4 transition-colors hover:bg-g-5 sm:flex-row sm:items-center">
      {producto.imageUrl ? (
        <img
          src={producto.imageUrl}
          alt=""
          className="h-14 w-14 shrink-0 rounded-lg border border-g-20 object-cover"
        />
      ) : (
        <span
          aria-hidden
          className="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg border border-g-20 bg-g-5"
        >
          <Icon icon="solar:box-linear" width="22" height="22" className="text-g-40" />
        </span>
      )}

      <div className="min-w-0 flex-1">
        <p className="truncate text-[16px] font-semibold text-g-80">{producto.name}</p>
        <p className="truncate text-[13px] text-g-50">
          {detalles && <span>{detalles} · </span>}
          Alta {formatearFecha(producto.createdAt)}
        </p>
        {producto.description && (
          <p className="mt-1 line-clamp-1 text-[13px] text-g-40">{producto.description}</p>
        )}
      </div>

      <div className="flex shrink-0 flex-wrap items-center gap-3 sm:justify-end">
        <span className="rounded-full bg-g-10 px-2.5 py-0.5 text-[12px] font-semibold text-g-60">
          {producto.stock} en stock
        </span>

        <EtiquetaEstado estado={producto.status} />

        <div className="text-right">
          <p className={`text-[17px] font-bold ${enOferta ? 'text-primary' : 'text-g-80'}`}>
            {formatearPrecio(enOferta ? (producto.discountPrice as number) : producto.price)}
          </p>
          {enOferta && (
            <p className="text-[12px] text-g-40 line-through">
              {formatearPrecio(producto.price)}
            </p>
          )}
        </div>
      </div>
    </li>
  );
}
