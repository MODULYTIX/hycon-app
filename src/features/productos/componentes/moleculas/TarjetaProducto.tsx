import { Icon } from '@iconify/react';
import { Link } from 'react-router-dom';
import { rutaProductoDetalle } from '@/app/rutas/rutas';
import { formatearPrecio } from '@/shared/utilidades/formato';
import type { Producto } from '@/features/productos/tipos/producto.tipos';

// La informacion ocupa una franja pequena dentro de la imagen.
export default function TarjetaProducto({ producto }: { producto: Producto }) {
  const enOferta = producto.discountPrice !== null;
  const sinStock = producto.stock === 0;

  return (
    <li className="group overflow-hidden rounded-[3px] bg-white ring-1 ring-g-20 transition-shadow duration-500 hover:shadow-xl">
      <Link
        to={rutaProductoDetalle(producto.productId)}
        aria-label={`Ver detalles de ${producto.name}`}
        className="block outline-offset-4 focus-visible:outline-2 focus-visible:outline-primary"
      >
      <div className="relative aspect-[4/3] overflow-hidden bg-g-10 sm:aspect-[5/4]">
        {producto.imageUrl ? (
          <img
            src={producto.imageUrl}
            alt={producto.name}
            draggable={false}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
          />
        ) : (
          <span
            aria-hidden
            className="flex h-full w-full items-center justify-center bg-gradient-to-br from-bc-10 via-g-10 to-g-20 text-primary/35"
          >
            <Icon icon="solar:box-linear" width="96" height="96" />
          </span>
        )}

        <div className="absolute left-5 right-5 top-5 flex items-start justify-between gap-3 sm:left-7 sm:right-7 sm:top-7">
          {enOferta ? (
            <span className="rounded-[2px] bg-secondary px-3 py-1.5 text-[11px] font-bold tracking-[0.16em] text-g-90">
              OFERTA
            </span>
          ) : (
            <span />
          )}

          {sinStock && (
            <span className="rounded-[2px] bg-g-90/85 px-3 py-1.5 text-[11px] font-medium tracking-wide text-white backdrop-blur-sm">
              Sin stock
            </span>
          )}
        </div>

        <div className="absolute inset-x-4 bottom-4 flex items-center justify-between gap-4 border border-white/70 bg-white/90 px-4 py-3 shadow-[0_8px_30px_rgba(0,0,0,0.12)] backdrop-blur-sm sm:inset-x-6 sm:bottom-6 sm:px-5 sm:py-4">
          <h3 className="line-clamp-2 border-l-2 border-primary pl-3 text-[18px] font-semibold leading-tight tracking-tight text-g-90 sm:text-[20px]">
            {producto.name}
          </h3>

          <div className="shrink-0 text-right">
            <p className="text-[17px] font-semibold leading-tight text-primary sm:text-[19px]">
              {formatearPrecio(enOferta ? (producto.discountPrice as number) : producto.price)}
            </p>
            {enOferta && (
              <p className="mt-0.5 text-[11px] text-g-50 line-through">
                {formatearPrecio(producto.price)}
              </p>
            )}
            {sinStock && <p className="mt-0.5 text-[11px] text-g-50">Agotado</p>}
          </div>
        </div>
      </div>
      </Link>
    </li>
  );
}
