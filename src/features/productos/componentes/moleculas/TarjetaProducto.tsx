import { Icon } from '@iconify/react';
import { Link } from 'react-router-dom';
import { rutaProductoDetalle } from '@/app/rutas/rutas';
import { formatearPrecio } from '@/shared/utilidades/formato';
import type { Producto } from '@/features/productos/tipos/producto.tipos';

// Tarjeta del catalogo: la foto arriba y la ficha debajo, sin tapar el producto.
export default function TarjetaProducto({ producto }: { producto: Producto }) {
  const enOferta = producto.discountPrice !== null;
  const sinStock = producto.stock === 0;
  // Marca y modelo se leen juntos como una sola linea de referencia
  const referencia = [producto.brand, producto.model].filter(Boolean).join(' · ');

  return (
    <li className="group flex flex-col bg-white ring-1 ring-g-20 transition-shadow duration-300 hover:ring-primary/40 hover:shadow-[0_14px_40px_rgba(28,58,57,0.10)]">
      <Link
        to={rutaProductoDetalle(producto.uuid)}
        aria-label={`Ver detalles de ${producto.name}`}
        className="flex flex-1 flex-col outline-offset-2 focus-visible:outline-2 focus-visible:outline-primary"
      >
        <div className="relative aspect-[4/3] overflow-hidden bg-g-5">
          {producto.imageUrl ? (
            <img
              src={producto.imageUrl}
              alt={producto.name}
              draggable={false}
              loading="lazy"
              className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
            />
          ) : (
            <span aria-hidden className="flex h-full w-full items-center justify-center bg-hy-5 text-hy-30">
              <Icon icon="solar:box-linear" width="72" height="72" />
            </span>
          )}

          {enOferta && (
            <span className="absolute left-0 top-4 bg-secondary px-3 py-1.5 text-[10.5px] font-bold tracking-[0.18em] text-g-90">
              OFERTA
            </span>
          )}

          {sinStock && (
            <span className="absolute right-4 top-4 bg-g-90/85 px-3 py-1.5 text-[10.5px] font-medium tracking-wide text-white">
              Sin stock
            </span>
          )}
        </div>

        <div className="flex flex-1 flex-col gap-3 border-t border-g-20 p-5">
          {referencia && (
            <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-primary">{referencia}</p>
          )}

          <h3 className="line-clamp-2 text-[17px] font-semibold leading-snug tracking-tight text-g-90">
            {producto.name}
          </h3>

          {producto.description && (
            <p className="line-clamp-2 text-[13.5px] leading-relaxed text-g-50">{producto.description}</p>
          )}

          <div className="mt-auto flex flex-wrap items-center gap-x-3 gap-y-1 text-[12px] text-g-50">
            {producto.color && (
              <span className="inline-flex items-center gap-1.5">
                <Icon icon="solar:palette-linear" width="14" height="14" aria-hidden />
                {producto.color}
              </span>
            )}
            {!sinStock && <span>{producto.stock} disponibles</span>}
          </div>

          <div className="flex items-end justify-between gap-3 border-t border-g-20 pt-4">
            <div>
              <p className="text-[20px] font-semibold leading-none text-primary">
                {formatearPrecio(enOferta ? (producto.discountPrice as number) : producto.price)}
              </p>
              {enOferta && (
                <p className="mt-1 text-[12px] text-g-50 line-through">{formatearPrecio(producto.price)}</p>
              )}
            </div>

            <span className="inline-flex items-center gap-1 text-[12.5px] font-medium text-g-70 transition-colors group-hover:text-primary">
              Ver detalle
              <Icon
                icon="solar:arrow-right-linear"
                width="15"
                height="15"
                aria-hidden
                className="transition-transform duration-300 group-hover:translate-x-0.5"
              />
            </span>
          </div>
        </div>
      </Link>
    </li>
  );
}
