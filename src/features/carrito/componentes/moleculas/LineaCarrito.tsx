import { Icon } from '@iconify/react';
import { Link } from 'react-router-dom';
import { formatearPrecio } from '@/shared/utilidades/formato';
import type { LineaDetallada } from '@/features/carrito/tipos/carrito.tipos';

interface Props {
  linea: LineaDetallada;
  onCambiarCantidad: (cantidad: number) => void;
  onQuitar: () => void;
}

// Una fila del carrito: foto, nombre, cantidad y lo que suma esa linea
export default function LineaCarrito({ linea, onCambiarCantidad, onQuitar }: Props) {
  const esCurso = linea.tipo === 'curso';
  const tope = linea.stock ?? 1;
  const enElTope = linea.cantidad >= tope;

  return (
    <li className="flex flex-wrap gap-4 py-6 sm:flex-nowrap">
      <Link to={linea.ruta} tabIndex={-1} aria-hidden className="shrink-0">
        <div className="h-24 w-24 overflow-hidden rounded-xl bg-hy-5 ring-1 ring-g-20">
          {linea.imagen ? (
            <img src={linea.imagen} alt="" loading="lazy" className="h-full w-full object-cover" />
          ) : (
            <span className="flex h-full w-full items-center justify-center text-hy-30">
              <Icon icon={esCurso ? 'solar:diploma-linear' : 'solar:box-linear'} width="28" height="28" />
            </span>
          )}
        </div>
      </Link>

      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-primary">
          {esCurso ? 'Curso' : 'Producto'}
        </p>
        <h3 className="line-clamp-2 text-[17px] font-semibold leading-snug text-g-90">
          <Link to={linea.ruta} className="outline-offset-4 hover:text-primary focus-visible:outline-2 focus-visible:outline-primary">
            {linea.nombre}
          </Link>
        </h3>
        <p className="text-[13px] text-g-50">
          {formatearPrecio(linea.precio)} c/u
          {linea.precioAnterior !== null && (
            <span className="ml-2 line-through">{formatearPrecio(linea.precioAnterior)}</span>
          )}
        </p>

        <div className="mt-1 flex flex-wrap items-center gap-3">
          {esCurso ? (
            <span className="text-[13px] text-g-50">1 inscripción</span>
          ) : (
            <div className="flex items-center rounded-lg border border-g-30">
              <button
                type="button"
                onClick={() => onCambiarCantidad(linea.cantidad - 1)}
                aria-label={`Una unidad menos de ${linea.nombre}`}
                className="flex h-9 w-9 items-center justify-center text-g-70 transition-colors hover:text-primary"
              >
                <Icon icon="solar:minus-square-linear" width="17" height="17" aria-hidden />
              </button>
              <span aria-live="polite" className="w-9 text-center text-[14px] font-medium tabular-nums text-g-90">
                {linea.cantidad}
              </span>
              <button
                type="button"
                onClick={() => onCambiarCantidad(linea.cantidad + 1)}
                disabled={enElTope}
                aria-label={`Una unidad más de ${linea.nombre}`}
                className="flex h-9 w-9 items-center justify-center text-g-70 transition-colors hover:text-primary disabled:opacity-40"
              >
                <Icon icon="solar:add-square-linear" width="17" height="17" aria-hidden />
              </button>
            </div>
          )}

          <button
            type="button"
            onClick={onQuitar}
            aria-label={`Quitar ${linea.nombre} del carrito`}
            className="inline-flex items-center gap-1 text-[13px] text-g-50 transition-colors hover:text-red-600"
          >
            <Icon icon="solar:trash-bin-minimalistic-linear" width="15" height="15" aria-hidden />
            Quitar
          </button>

          {!esCurso && enElTope && (
            <span className="text-[12px] text-g-50">Es todo el stock disponible</span>
          )}
        </div>
      </div>

      <p className="shrink-0 text-[16px] font-semibold tabular-nums text-g-90">
        {formatearPrecio(linea.precio * linea.cantidad)}
      </p>
    </li>
  );
}
