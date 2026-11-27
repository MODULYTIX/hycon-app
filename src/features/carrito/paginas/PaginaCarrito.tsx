import DialogoConfirmacion from '@/shared/ui/organismos/DialogoConfirmacion';
import { useState } from 'react';
import { Icon } from '@iconify/react';
import { Link } from 'react-router-dom';
import portada from '@/assets/images/home/banner-panoramico.webp';
import '@/features/productos/paginas/catalogo-productos.css';
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
  const [porQuitar, setPorQuitar] = useState<{ uuid: string; nombre: string } | null>(null);
  const [pagoAbierto, setPagoAbierto] = useState(false);
  const [motivoAcceso, setMotivoAcceso] = useState<'pago' | 'cantidad' | null>(null);

  const total = detalladas.reduce((suma, linea) => suma + linea.precio * linea.cantidad, 0);
  // El subtotal es a precio de lista; la diferencia con el total es lo que se ahorra
  const subtotal = detalladas.reduce(
    (suma, linea) => suma + (linea.precioAnterior ?? linea.precio) * linea.cantidad,
    0
  );
  const descuento = subtotal - total;
  const requiereEnvio = detalladas.some(linea => linea.tipo === 'producto');
  const unidades = detalladas.reduce((suma, linea) => suma + linea.cantidad, 0);
  const items = detalladas.map(({ tipo, uuid, cantidad }) => ({ tipo, uuid, cantidad }));

  // Comprar necesita cuenta: sin sesion se pide entrar y la compra sigue sola
  const irAPagar = () => {
    if (!usuario) {
      setMotivoAcceso('pago');
      return;
    }
    setPagoAbierto(true);
  };

  return (
    <div className="catalogo-productos">
      <header className="productos-portada">
        <img src={portada} alt="" />
        <div className="productos-portada-texto">
          <h1>Carrito de compras</h1>
          <nav className="productos-migas" aria-label="Ruta de navegación">
            <Link to={RUTAS.home}>Inicio</Link>
            <Icon icon="solar:alt-arrow-right-linear" width="14" aria-hidden />
            <span aria-current="page">Carrito</span>
          </nav>
          <p>Revisa tus artículos, cantidades y descuentos antes de continuar al pago.</p>
        </div>
      </header>
      <div className="hy-contenedor py-8 md:py-12">
        {cargando && (
          <div aria-label="Cargando carrito" className="space-y-4">
            {[0, 1].map((posicion) => (
              <div key={posicion} className="h-24 animate-pulse bg-g-10" />
            ))}
          </div>
        )}

        {!cargando && detalladas.length === 0 && (
          <div className="border-t-2 border-primary bg-white py-8">
            <EstadoVacio
              icono="solar:cart-large-2-linear"
              titulo="Tu carrito está vacío"
              descripcion="Agrega productos o cursos desde el catálogo y aparecerán aquí."
            />
            <div className="flex flex-wrap justify-center gap-3 px-6 pb-8">
              <Link
                to={RUTAS.productos}
                className="inline-flex h-10 items-center bg-primary px-5 text-[13px] font-medium text-white transition-colors hover:bg-marca-oscuro"
              >
                Ver productos
              </Link>
              <Link
                to={RUTAS.cursos}
                className="inline-flex h-10 items-center border border-g-30 px-5 text-[13px] font-medium text-g-70 transition-colors hover:border-primary hover:text-primary"
              >
                Ver cursos
              </Link>
            </div>
          </div>
        )}

        {!cargando && detalladas.length > 0 && (
          <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(300px,32%)] lg:gap-8">
            <section aria-label="Artículos del carrito" className="min-w-0 border border-g-20 bg-white p-4 sm:p-7">
              <div className="border-b border-g-20 pb-4 flex flex-wrap items-center justify-between gap-2">
                <div className="flex flex-wrap items-baseline gap-x-3">
                  <h2 className="text-2xl font-semibold text-g-90">Tu selección</h2>
                  <span className="text-sm text-g-50">{detalladas.length} {detalladas.length === 1 ? 'artículo' : 'artículos'}</span>
                </div>
                <button
                  type="button"
                  onClick={vaciar}
                  className="inline-flex items-center gap-1.5 min-h-9 px-1 text-[13px] text-g-50 transition-colors hover:bg-red-50 hover:text-red-600"
                >
                  <Icon icon="solar:trash-bin-trash-bold" width="16" height="16" aria-hidden />
                  Vaciar carrito
                </button>
              </div>
              <ul className="divide-y divide-g-20">
                {detalladas.map((linea) => (
                  <LineaCarritoFila
                    key={linea.uuid}
                    linea={linea}
                    onCambiarCantidad={(cantidad) => {
                      if (cantidad > linea.cantidad && !usuario) setMotivoAcceso('cantidad');
                      else cambiarCantidad(linea.uuid, cantidad);
                    }}
                    onQuitar={() => setPorQuitar(linea)}
                  />
                ))}
              </ul>

            </section>

            <aside aria-labelledby="titulo-resumen" className="min-w-0 border-t-[3px] border-[#bd9d5c] bg-[#183836] p-6 text-white lg:sticky lg:top-24">
              <h2 id="titulo-resumen" className="border-b border-white/20 pb-4 text-2xl font-semibold tracking-tight text-white">
                Resumen de compra
              </h2>

              <dl className="mt-4 space-y-2 border-b border-white/20 pb-4 text-[14px]">
                <div className="flex justify-between gap-4">
                  <dt className="text-[#dae6e1]">Unidades</dt>
                  <dd className="tabular-nums text-white">{unidades}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-[#dae6e1]"> {descuento > 0 ? 'Subtotal antes de descuentos' : 'Subtotal'}</dt>
                  <dd className="tabular-nums text-white">{formatearPrecio(subtotal)}</dd>
                </div>
                {descuento > 0 && (
                  <div className="flex justify-between gap-4">
                    <dt className="text-[#dae6e1]">Descuentos</dt>
                    <dd className="tabular-nums font-medium text-[#ead1a5]">
                      -{formatearPrecio(descuento)}
                    </dd>
                  </div>
                )}
                {requiereEnvio && (
                  <div className="flex justify-between gap-4">
                    <dt className="text-[#dae6e1]">Envío</dt>
                    <dd className="text-right text-white">Se coordina al confirmar</dd>
                  </div>
                )}
              </dl>

              <div className="mt-4 flex flex-wrap items-baseline justify-between gap-3 py-2">
                <span className="text-[13px] uppercase tracking-[0.12em] text-[#dae6e1]">{requiereEnvio ? 'Total sin envío' : 'Total'}</span>
                <span className="text-[26px] font-semibold leading-none tabular-nums tracking-tight text-[#ead1a5]">
                  {formatearPrecio(total)}
                </span>
              </div>

              <button
                type="button"
                onClick={irAPagar}
                className="mt-5 inline-flex h-11 w-full items-center justify-center gap-2 bg-white text-sm font-semibold text-[#183836] transition-colors hover:bg-[#e5eee9]"
              >
                <Icon icon="solar:lock-keyhole-minimalistic-bold" width="17" height="17" aria-hidden />
                Ir a pagar
              </button>

              <p className="mt-3 text-[12px] leading-relaxed text-[#dae6e1]">
                Paga con tarjeta o Yape. También puedes coordinar el pago por WhatsApp.
              </p>


              <ul aria-label="Tarjetas aceptadas" className="mt-3 flex gap-2">
                {['Visa', 'Mastercard', 'Amex'].map(marca => (
                  <li key={marca} className="grid h-7 w-12 place-items-center bg-white">
                    <span className="sr-only">{marca}</span>
                    <Icon icon={`logos:${marca.toLowerCase()}`} width="30" height="18" aria-hidden />
                  </li>
                ))}
              </ul>
            </aside>
          </div>
        )}

      </div>

      {porQuitar && (
        <DialogoConfirmacion abierto titulo="¿Quitar este artículo?"
          descripcion={`Se quitará «${porQuitar.nombre}» de tu carrito.`}
          textoConfirmar="Sí, quitar" onCancelar={() => setPorQuitar(null)}
          onConfirmar={() => {
            quitar(porQuitar.uuid);
            setPorQuitar(null);
          }}
        />
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
        abierto={motivoAcceso !== null}
        onCerrar={() => setMotivoAcceso(null)}
        onAutenticado={() => {
          if (motivoAcceso === 'pago') setPagoAbierto(true);
          setMotivoAcceso(null);
        }}
      />
    </div>
  );
}
