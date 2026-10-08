import { useState } from 'react';
import { Icon } from '@iconify/react';
import { Link } from 'react-router-dom';
import PlantillaSeccion from '@/shared/ui/plantillas/PlantillaSeccion';
import EstadoVacio from '@/shared/ui/atomos/EstadoVacio';
import LineaCarritoFila from '@/features/carrito/componentes/moleculas/LineaCarrito';
import ModalPago from '@/features/carrito/componentes/organismos/ModalPago';
import ModalAcceso from '@/features/autenticacion/componentes/organismos/ModalAcceso';
import { useAutenticacion } from '@/features/autenticacion/hooks/useAutenticacion';
import { useCarrito } from '@/features/carrito/hooks/useCarrito';
import { useLineasDetalladas } from '@/features/carrito/hooks/useLineasDetalladas';
import { RUTAS } from '@/app/rutas/rutas';
import { formatearPrecio } from '@/shared/utilidades/formato';

export default function PaginaCarrito() {
  const { lineas, cambiarCantidad, quitar, vaciar } = useCarrito();
  const { lineas: detalladas, cargando } = useLineasDetalladas(lineas);
  const { usuario } = useAutenticacion();
  const [pagoAbierto, setPagoAbierto] = useState(false);
  const [accesoAbierto, setAccesoAbierto] = useState(false);

  const total = detalladas.reduce((suma, linea) => suma + linea.precio * linea.cantidad, 0);
  // El subtotal es a precio de lista; la diferencia con el total es lo que se ahorra
  const subtotal = detalladas.reduce(
    (suma, linea) => suma + (linea.precioAnterior ?? linea.precio) * linea.cantidad,
    0
  );
  const descuento = subtotal - total;
  const unidades = detalladas.reduce((suma, linea) => suma + linea.cantidad, 0);
  const items = detalladas.map(({ tipo, uuid, cantidad }) => ({ tipo, uuid, cantidad }));

  // Comprar necesita cuenta: sin sesion se pide entrar y la compra sigue sola
  const irAPagar = () => {
    if (!usuario) {
      setAccesoAbierto(true);
      return;
    }
    setPagoAbierto(true);
  };

  return (
    <PlantillaSeccion
      titulo="Carrito"
      descripcion="Revisa lo que llevas y completa tu compra."
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
        <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_320px] lg:gap-7">
          <section aria-label="Artículos del carrito" className="min-w-0">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <h2 className="text-[15px] font-semibold text-g-90">Tu selección</h2>
              <span className="rounded-full bg-hy-5 px-3 py-1 text-[12px] font-medium text-primary">{detalladas.length} {detalladas.length === 1 ? 'artículo' : 'artículos'}</span>
            </div>
            <ul className="divide-y divide-g-20 rounded-xl border border-g-20 bg-white px-4 shadow-sm sm:px-5">
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
                className="inline-flex items-center gap-1.5 rounded-xl border border-g-20 px-3 py-1.5 text-[13px] text-g-50 transition-colors hover:border-red-200 hover:bg-red-50 hover:text-red-600"
              >
                <Icon icon="solar:trash-bin-trash-bold" width="16" height="16" aria-hidden />
                Vaciar carrito
              </button>
            </div>
          </section>

          <aside aria-labelledby="titulo-resumen" className="resumen-carrito min-w-0 h-fit rounded-xl border border-g-20 bg-white p-5 shadow-sm lg:sticky lg:top-6">
            <h2 id="titulo-resumen" className="border-b border-g-20 pb-4 text-[16px] font-semibold tracking-tight text-g-90">
              Resumen
            </h2>

            <dl className="mt-4 space-y-2 border-b border-g-20 pb-4 text-[14px]">
              <div className="flex justify-between gap-4">
                <dt className="text-g-50">Artículos</dt>
                <dd className="tabular-nums text-g-80">{unidades}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-g-50">Subtotal</dt>
                <dd className="tabular-nums text-g-80">{formatearPrecio(subtotal)}</dd>
              </div>
              {descuento > 0 && (
                <div className="flex justify-between gap-4">
                  <dt className="text-g-50">Descuentos</dt>
                  <dd className="tabular-nums font-medium text-primary">
                    -{formatearPrecio(descuento)}
                  </dd>
                </div>
              )}
              <div className="flex justify-between gap-4">
                <dt className="text-g-50">Envío</dt>
                <dd className="text-right text-g-80">Se coordina al confirmar</dd>
              </div>
            </dl>

            <div className="mt-4 flex flex-wrap items-baseline justify-between gap-3 rounded-lg bg-hy-5 px-4 py-4">
              <span className="text-[13px] uppercase tracking-[0.12em] text-g-50">Total</span>
              <span className="text-[26px] font-semibold leading-none tabular-nums tracking-tight text-primary">
                {formatearPrecio(total)}
              </span>
            </div>

            <button
              type="button"
              onClick={irAPagar}
              className="mt-5 inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-primary text-sm font-medium text-white transition-colors hover:bg-marca-oscuro"
            >
              <Icon icon="solar:lock-keyhole-minimalistic-bold" width="17" height="17" aria-hidden />
              Ir a pagar
            </button>

            <p className="mt-3 text-[12px] leading-relaxed text-g-50">
              Pagas con tarjeta o Yape. También puedes coordinar el pago por WhatsApp.
            </p>

            <ul className="mt-4 flex items-center justify-center gap-4 border-t border-g-20 pt-4 text-g-40">
              {['logos:visa', 'logos:mastercard', 'logos:amex'].map((logo) => (
                <li key={logo}>
                  <Icon icon={logo} width="34" height="22" aria-hidden />
                </li>
              ))}
            </ul>
          </aside>
        </div>
      )}

      <ModalPago
        abierto={pagoAbierto}
        onCerrar={() => setPagoAbierto(false)}
        total={total}
        items={items}
        // La compra ya quedo guardada en la cuenta: el carrito del navegador se limpia
        onPagado={vaciar}
      />

      <ModalAcceso
        abierto={accesoAbierto}
        onCerrar={() => setAccesoAbierto(false)}
        onAutenticado={() => {
          setAccesoAbierto(false);
          setPagoAbierto(true);
        }}
      />
    </PlantillaSeccion>
  );
}
