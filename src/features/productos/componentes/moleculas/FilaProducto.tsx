import { Icon } from '@iconify/react';
import EtiquetaEstado from '@/shared/ui/atomos/EtiquetaEstado';
import AccionesFila from '@/shared/ui/moleculas/AccionesFila';
import Miniatura from '@/shared/ui/moleculas/Miniatura';
import { formatearPrecio } from '@/shared/utilidades/formato';
import type { Producto } from '@/features/productos/tipos/producto.tipos';

export const COLUMNAS_PRODUCTO =
  'lg:grid-cols-[minmax(0,1fr)_130px_110px_110px_88px]';

interface Props {
  producto: Producto;
  onEditar: (producto: Producto) => void;
  onEliminar: (producto: Producto) => void;
}

// Fila del listado del panel. En movil los datos bajan a una segunda linea;
// desde lg cada dato ocupa su columna (lg:contents libera los hijos en la rejilla).
export default function FilaProducto({ producto, onEditar, onEliminar }: Props) {
  const enOferta = producto.discountPrice !== null;
  const detalles = [producto.brand, producto.model].filter(Boolean).join(' · ');
  const agotado = producto.stock === 0;

  return (
    <li className={`grid gap-3 px-4 py-4 transition-colors hover:bg-hy-5/60 sm:px-5 lg:items-center lg:gap-4 ${COLUMNAS_PRODUCTO}`}>
      <div className="flex min-w-0 gap-3.5">
        <Miniatura url={producto.imageUrl} iconoReserva="solar:box-linear" />

        <div className="min-w-0 flex-1 self-center">
          <p className="truncate text-[15px] font-semibold text-hy-tinta">{producto.name}</p>
          {detalles && <p className="truncate text-[13px] text-g-50">{detalles}</p>}

          {(producto.color || producto.shippingAgencies.length > 0) && (
            <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
              {producto.color && (
                <span className="inline-flex items-center gap-1 rounded-md border border-hy-20 px-1.5 py-0.5 text-[11.5px] font-medium text-hy-80">
                  <Icon icon="solar:pallete-2-linear" width="12" height="12" aria-hidden />
                  {producto.color}
                </span>
              )}
              {producto.shippingAgencies.map((agencia) => (
                <span
                  key={agencia.code}
                  className="inline-flex items-center gap-1 rounded-md bg-hy-10 px-1.5 py-0.5 text-[11.5px] font-medium text-hy-70"
                >
                  <Icon icon="solar:delivery-linear" width="12" height="12" aria-hidden />
                  {agencia.name}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 border-t border-hy-10 pt-3 lg:contents">
        <div className="lg:text-left">
          <p className={`text-[15px] font-bold ${enOferta ? 'text-hy-60' : 'text-hy-tinta'}`}>
            {formatearPrecio(enOferta ? (producto.discountPrice as number) : producto.price)}
          </p>
          {enOferta && (
            <p className="text-[12px] text-g-40 line-through">{formatearPrecio(producto.price)}</p>
          )}
        </div>

        <p className={`text-[14px] ${agotado ? 'font-semibold text-red-600' : 'text-g-60'}`}>
          {agotado ? 'Sin stock' : `${producto.stock} unid.`}
        </p>

        <div>
          <EtiquetaEstado estado={producto.status} />
        </div>

        <AccionesFila
          nombre={producto.name}
          onEditar={() => onEditar(producto)}
          onEliminar={() => onEliminar(producto)}
        />
      </div>
    </li>
  );
}
