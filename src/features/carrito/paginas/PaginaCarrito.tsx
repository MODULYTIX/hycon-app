import { Icon } from '@iconify/react';
import { Link } from 'react-router-dom';
import PlantillaSeccion from '@/shared/ui/plantillas/PlantillaSeccion';
import EstadoVacio from '@/shared/ui/atomos/EstadoVacio';
import LineaCarritoFila from '@/features/carrito/componentes/moleculas/LineaCarrito';
import { useCarrito } from '@/features/carrito/hooks/useCarrito';
import { useLineasDetalladas } from '@/features/carrito/hooks/useLineasDetalladas';
import { mensajeDePedido } from '@/features/carrito/utilidades/pedido';
import { RUTAS } from '@/app/rutas/rutas';
import { formatearPrecio } from '@/shared/utilidades/formato';

export default function PaginaCarrito() {
  const { lineas, cambiarCantidad, quitar, vaciar } = useCarrito();
  const { lineas: detalladas, cargando } = useLineasDetalladas(lineas);

  const total = detalladas.reduce((suma, linea) => suma + linea.precio * linea.cantidad, 0);
  const unidades = detalladas.reduce((suma, linea) => suma + linea.cantidad, 0);
  const pedidoUrl = `https://wa.me/51902665565?text=${encodeURIComponent(mensajeDePedido(detalladas, total))}`;

  return (
    <PlantillaSeccion
      titulo="Carrito"
      descripcion="Revisa lo que llevas y cierra el pedido con nuestro equipo por WhatsApp."
    >
      {cargando && (
        <div aria-label="Cargando carrito" className="space-y-4">
          {[0, 1].map((posicion) => (
            <div key={posicion} className="h-24 animate-pulse rounded-2xl bg-g-10" />
          ))}
        </div>
      )}

      {!cargando && detalladas.length === 0 && (
        <div className="rounded-2xl bg-white ring-1 ring-g-20">
          <EstadoVacio
            icono="solar:cart-large-2-linear"
            titulo="Tu carrito está vacío"
            descripcion="Agrega productos o cursos desde el catálogo y aparecerán aquí."
          />
          <div className="flex flex-wrap justify-center gap-3 px-6 pb-8">
            <Link
              to={RUTAS.productos}
              className="inline-flex h-10 items-center rounded-xl bg-primary px-5 text-[13px] font-medium text-white transition-colors hover:bg-marca-oscuro"
            >
              Ver productos
            </Link>
            <Link
              to={RUTAS.cursos}
              className="inline-flex h-10 items-center rounded-xl border border-g-30 px-5 text-[13px] font-medium text-g-70 transition-colors hover:border-primary hover:text-primary"
            >
              Ver cursos
            </Link>
          </div>
        </div>
      )}

      {!cargando && detalladas.length > 0 && (
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_360px] lg:gap-10">
          <section aria-label="Artículos del carrito">
            <ul className="divide-y divide-g-20 rounded-2xl border border-g-20 bg-white px-5 sm:px-7">
              {detalladas.map((linea) => (
                <LineaCarritoFila
                  key={linea.uuid}
                  linea={linea}
                  onCambiarCantidad={(cantidad) => cambiarCantidad(linea.uuid, cantidad)}
                  onQuitar={() => quitar(linea.uuid)}
                />
              ))}
            </ul>

            <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
              <Link
                to={RUTAS.productos}
                className="inline-flex items-center gap-1.5 text-[13px] font-medium text-primary hover:underline"
              >
                <Icon icon="solar:arrow-left-linear" width="15" height="15" aria-hidden />
                Seguir viendo el catálogo
              </Link>
              <button
                type="button"
                onClick={vaciar}
                className="text-[13px] text-g-50 transition-colors hover:text-red-600"
              >
                Vaciar carrito
              </button>
            </div>
          </section>

          <aside aria-labelledby="titulo-resumen" className="resumen-carrito h-fit rounded-2xl bg-white p-6 ring-1 ring-g-20 sm:p-8 lg:sticky lg:top-6">
            <h2 id="titulo-resumen" className="text-[16px] font-semibold tracking-tight text-g-90">
              Resumen
            </h2>

            <dl className="mt-4 space-y-2 border-b border-g-20 pb-4 text-[14px]">
              <div className="flex justify-between gap-4">
                <dt className="text-g-50">Artículos</dt>
                <dd className="tabular-nums text-g-80">{unidades}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-g-50">Envío</dt>
                <dd className="text-right text-g-80">Se coordina al confirmar</dd>
              </div>
            </dl>

            <div className="mt-4 flex items-baseline justify-between gap-4">
              <span className="text-[13px] uppercase tracking-[0.12em] text-g-50">Total</span>
              <span className="text-[32px] font-semibold leading-none text-primary">
                {formatearPrecio(total)}
              </span>
            </div>

            <a
              href={pedidoUrl}
              target="_blank"
              rel="noreferrer"
              className="mt-5 inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-primary text-sm font-medium text-white transition-colors hover:bg-marca-oscuro"
            >
              <Icon icon="ic:baseline-whatsapp" width="18" height="18" aria-hidden />
              Pedir por WhatsApp
            </a>

            <p className="mt-3 text-[12px] leading-relaxed text-g-50">
              Te escribimos para confirmar disponibilidad, envío y forma de pago.
            </p>
          </aside>
        </div>
      )}
    </PlantillaSeccion>
  );
}
