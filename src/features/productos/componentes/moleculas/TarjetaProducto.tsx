import { Icon } from '@iconify/react';
import { formatearPrecio } from '@/shared/utilidades/formato';
import type { Producto } from '@/features/productos/tipos/producto.tipos';

// Tarjeta del catalogo publico
export default function TarjetaProducto({ producto }: { producto: Producto }) {
  const enOferta = producto.discountPrice !== null;
  const sinStock = producto.stock === 0;
  const detalles = [producto.brand, producto.model].filter(Boolean).join(' - ');

  return (
    <li className="group flex flex-col overflow-hidden rounded-xl border border-g-20 bg-white transition-shadow hover:shadow-lg">
      <div className="relative aspect-[4/3] overflow-hidden bg-g-5">
        {producto.imageUrl ? (
          <img
            src={producto.imageUrl}
            alt={producto.name}
            draggable={false}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <span
            aria-hidden
            className="flex h-full w-full items-center justify-center text-g-30"
          >
            <Icon icon="solar:box-linear" width="56" height="56" />
          </span>
        )}

        {enOferta && (
          <span className="absolute left-3 top-3 rounded-full bg-secondary px-2.5 py-0.5 text-[12px] font-bold text-g-90">
            OFERTA
          </span>
        )}

        {sinStock && (
          <span className="absolute right-3 top-3 rounded-full bg-g-80/85 px-2.5 py-0.5 text-[12px] font-semibold text-white">
            Sin stock
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-1 p-4">
        {detalles && (
          <p className="text-[12px] font-semibold tracking-wide text-g-40">{detalles}</p>
        )}

        <h3 className="line-clamp-2 text-[16px] font-semibold text-g-80">{producto.name}</h3>

        {producto.description && (
          <p className="line-clamp-2 text-[14px] text-g-50">{producto.description}</p>
        )}

        <div className="mt-auto flex items-end justify-between pt-3">
          <div>
            <p className={`text-[20px] font-bold ${enOferta ? 'text-primary' : 'text-g-80'}`}>
              {formatearPrecio(enOferta ? (producto.discountPrice as number) : producto.price)}
            </p>
            {enOferta && (
              <p className="text-[13px] text-g-40 line-through">
                {formatearPrecio(producto.price)}
              </p>
            )}
          </div>

          <span className="text-[13px] text-g-50">
            {sinStock ? 'Agotado' : `${producto.stock} disp.`}
          </span>
        </div>
      </div>
    </li>
  );
}
