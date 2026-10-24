import { useEffect, useState } from 'react';
import { Icon } from '@iconify/react';
import { Link, useParams } from 'react-router-dom';
import { RUTAS } from '@/app/rutas/rutas';
import { obtenerProductoApi } from '@/features/productos/servicios/productos.api';
import type { ProductoDetalle } from '@/features/productos/tipos/producto.tipos';
import { formatearPrecio } from '@/shared/utilidades/formato';
import { esUuid } from '@/shared/utilidades/identificador';
import { agregarAlCarrito } from '@/features/carrito/servicios/carrito.almacen';

export default function PaginaDetalleProducto() {
  const { uuid = '' } = useParams();
  const [producto, setProducto] = useState<ProductoDetalle | null>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cantidad, setCantidad] = useState(1);
  const [imagenActiva, setImagenActiva] = useState(0);
  const [aviso, setAviso] = useState<string | null>(null);
  const [agregado, setAgregado] = useState(false);
  const [imagenFallida, setImagenFallida] = useState(false);

  useEffect(() => {
    if (!esUuid(uuid)) {
      setError('Este producto no existe.');
      setCargando(false);
      return;
    }

    const controlador = new AbortController();
    let vigente = true;
    setCargando(true);
    setError(null);
    setProducto(null);
    setCantidad(1);
    setImagenActiva(0);
    setAviso(null);
    setAgregado(false);
    setImagenFallida(false);

    obtenerProductoApi(uuid, controlador.signal)
      .then((detalle) => {
        if (vigente) setProducto(detalle);
      })
      .catch((fallo: unknown) => {
        if (vigente) setError(fallo instanceof Error ? fallo.message : 'No se pudo cargar el producto');
      })
      .finally(() => {
        if (vigente) setCargando(false);
      });

    return () => {
      vigente = false;
      controlador.abort();
    };
  }, [uuid]);

  if (cargando) {
    return (
      <div className="mx-auto grid w-full max-w-[1120px] animate-pulse gap-10 px-5 py-12 min-[700px]:grid-cols-2">
        <div className="aspect-square max-h-[530px] bg-g-10" />
        <div className="space-y-5">
          <div className="h-10 w-3/4 bg-g-10" />
          <div className="h-8 w-1/3 bg-g-10" />
          <div className="h-28 bg-g-10" />
        </div>
      </div>
    );
  }

  if (error || !producto) {
    return (
      <div className="mx-auto max-w-[720px] px-4 py-24 text-center">
        <h1 className="text-3xl font-semibold text-g-90">Producto no disponible</h1>
        <p className="mt-3 text-g-50">{error || 'No se pudo encontrar este producto.'}</p>
        <Link to={RUTAS.productos} className="mt-6 inline-block font-semibold text-primary hover:underline">
          Volver a productos
        </Link>
      </div>
    );
  }

  const imagenes = [...new Set(producto.imageUrls?.length
    ? producto.imageUrls
    : producto.imageUrl
      ? [producto.imageUrl]
      : [])];
  const imagenPrincipal = imagenes[imagenActiva];
  const enOferta = producto.discountPrice !== null && producto.discountPrice < producto.price;
  const precioFinal = enOferta ? producto.discountPrice! : producto.price;
  const sinStock = producto.stock === 0;
  // Del final del uuid: su cabecera es la hora de alta y dos productos creados
  // el mismo dia compartirian referencia
  const codigo = `HY-${producto.uuid.slice(-6).toUpperCase()}`;
  const consultaUrl = `https://wa.me/51902665565?text=${encodeURIComponent(`Hola, quisiera más información sobre ${producto.name} (${codigo}).`)}`;
  const datosProducto = [
    { etiqueta: 'Marca', valor: producto.brand || 'Por confirmar' },
    { etiqueta: 'Modelo', valor: producto.model || 'Por confirmar' },
    ...(producto.color ? [{ etiqueta: 'Color', valor: producto.color }] : []),
    { etiqueta: 'Referencia', valor: codigo },
  ];

  // Agencias con las que el administrador marco que se despacha este producto
  const agencias = producto.shippingAgencies ?? [];

  const agregar = () => {
    const guardado = agregarAlCarrito(
      { tipo: 'producto', uuid: producto.uuid, cantidad },
      producto.stock
    );
    setAviso(
      guardado
        ? `${cantidad} ${cantidad === 1 ? 'unidad agregada' : 'unidades agregadas'} al carrito.`
        : 'Ya tienes en el carrito la cantidad disponible de este producto.'
    );
    setAgregado(guardado);
  };

  return (
    <article className="mx-auto w-full max-w-[1180px] px-5 pb-14 pt-6 sm:px-8 sm:pb-20 sm:pt-9">
      <Link to={RUTAS.productos} className="inline-flex items-center gap-2 text-xs text-g-50 transition-colors hover:text-primary">
        <Icon icon="solar:arrow-left-linear" width="15" height="15" aria-hidden />
        Volver a productos
      </Link>
      <header className="mb-7 mt-5 grid items-center gap-5 border-b border-g-20 pb-6 md:grid-cols-[minmax(0,1fr)_auto] md:gap-x-10">
        <h1 className="max-w-[720px] break-words text-[1.8rem] font-medium leading-[1.2] tracking-tight text-g-80 sm:text-[2.25rem]">{producto.name}</h1>
        <div className="flex items-center gap-3">
          <div className="flex h-11 shrink-0 items-center overflow-hidden rounded-[2px] border border-g-30" role="group" aria-label="Cantidad">
            <button type="button" aria-label="Reducir cantidad" disabled={cantidad <= 1 || sinStock} onClick={() => setCantidad((valor) => Math.max(1, valor - 1))} className="h-full w-10 text-lg text-g-80 hover:bg-g-10 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-primary disabled:opacity-35">−</button>
            <span className="min-w-6 text-center text-sm tabular-nums" aria-live="polite">{cantidad}</span>
            <button type="button" aria-label="Aumentar cantidad" disabled={cantidad >= producto.stock || sinStock} onClick={() => setCantidad((valor) => Math.min(producto.stock, valor + 1))} className="h-full w-10 text-lg text-g-80 hover:bg-g-10 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-primary disabled:opacity-35">+</button>
          </div>
          <button type="button" disabled={sinStock} onClick={agregar} className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-[2px] bg-primary px-5 text-[13px] font-medium text-white transition-colors hover:bg-marca-oscuro focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary disabled:cursor-not-allowed disabled:bg-g-40">
            <Icon icon="solar:cart-large-2-linear" width="18" height="18" aria-hidden />
            {sinStock ? 'Sin stock' : 'Agregar al carrito'}
          </button>
        </div>
        {aviso && (
          <p role="status" className="text-sm text-primary md:col-span-2 md:text-right">
            {aviso}
            {agregado && <Link to={RUTAS.carrito} className="ml-2 font-medium underline underline-offset-4">Ver carrito</Link>}
          </p>
        )}
      </header>

      <section aria-label="Imagen e información principal" className="grid items-start gap-x-10 gap-y-8 md:grid-cols-2 lg:gap-x-14">
        <div className="min-w-0">
          <div className="relative aspect-square overflow-hidden rounded-[2px] bg-g-10">
            {imagenPrincipal && !imagenFallida ? (
              <img src={imagenPrincipal} alt={producto.name} onError={() => setImagenFallida(true)} className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full flex-col items-center justify-center gap-3 text-g-40">
                <Icon icon="solar:box-linear" width="64" height="64" aria-hidden />
                <span className="text-xs">Imagen no disponible</span>
              </div>
            )}
            {imagenPrincipal && !imagenFallida && (
              <a href={imagenPrincipal} target="_blank" rel="noreferrer" aria-label="Ampliar imagen" className="absolute bottom-4 right-4 flex h-10 w-10 items-center justify-center rounded-[2px] bg-white/95 text-g-80 transition-colors hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary">
                <Icon icon="solar:magnifer-zoom-in-linear" width="19" height="19" aria-hidden />
              </a>
            )}
          </div>

          {imagenes.length > 1 && (
            <div className="mt-3 flex gap-2 overflow-x-auto pb-1" aria-label="Imágenes del producto">
              {imagenes.map((imagen, indice) => (
                <button
                  key={`${imagen}-${indice}`}
                  type="button"
                  aria-label={`Ver imagen ${indice + 1}`}
                  aria-pressed={imagenActiva === indice}
                  onClick={() => { setImagenActiva(indice); setImagenFallida(false); }}
                  className={`h-14 w-14 shrink-0 overflow-hidden rounded-[2px] border p-0.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${imagenActiva === indice ? 'border-primary' : 'border-g-20 hover:border-g-40'}`}
                >
                  <img src={imagen} alt="" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}

          <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-[11px] text-g-50">
            <p>Imagen del producto</p>
            {imagenes.length > 1 && <span>{imagenActiva + 1} / {imagenes.length} imágenes</span>}
          </div>
        </div>

        <div className="min-w-0 py-1 lg:py-3">
          <div className="flex items-center justify-between gap-3">
            <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-g-50">Precio por unidad</p>
            {enOferta && <span className="rounded-[2px] bg-secondary/15 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.1em] text-g-80">Oferta</span>}
          </div>
          <div className="mt-3 flex flex-wrap items-baseline gap-x-4 gap-y-1">
            <p className="text-[2.75rem] font-medium leading-none tracking-tight text-primary sm:text-5xl">{formatearPrecio(precioFinal)}</p>
            {enOferta && <p className="text-sm text-g-50"><span className="sr-only">Precio anterior: </span><s>{formatearPrecio(producto.price)}</s></p>}
          </div>
          <p className="mt-4 inline-flex items-center gap-2 text-xs text-g-60">
            <span className={`h-1.5 w-1.5 rounded-full ${sinStock ? 'bg-g-40' : 'bg-primary'}`} aria-hidden />
            {sinStock ? 'Agotado por el momento' : `${producto.stock} unidades disponibles`}
          </p>

          <dl className="mt-7 divide-y divide-g-20 border-y border-g-20" aria-label="Datos del producto">
            {datosProducto.map(({ etiqueta, valor }) => (
              <div key={etiqueta} className="grid min-w-0 grid-cols-[1fr_2fr] items-baseline gap-4 py-3.5">
                <dt className="text-xs text-g-50">{etiqueta}</dt>
                <dd className="break-words text-right text-[13px] font-medium text-g-80">{valor}</dd>
              </div>
            ))}
          </dl>

          <div className="mt-6 flex gap-3">
            <Icon icon="solar:delivery-linear" width="20" height="20" aria-hidden className="shrink-0 text-primary" />
            <div className="text-xs leading-relaxed">
              <p className="font-medium text-g-70">{agencias.length > 0 ? `Envíos por ${agencias.map((agencia) => agencia.name).join(', ')}` : 'Entrega coordinada'}</p>
              <p className="mt-1 text-g-50">{agencias.length > 0 ? 'Elige tu agencia y consulta la fecha de despacho.' : 'Consulta la cobertura y fecha de despacho con nuestro equipo.'}</p>
            </div>
          </div>

          <a href={consultaUrl} target="_blank" rel="noreferrer" className="mt-5 inline-flex items-center gap-2 text-xs font-medium text-primary underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary">
            <Icon icon="ic:baseline-whatsapp" width="17" height="17" aria-hidden />
            Consultar antes de comprar
            <Icon icon="solar:arrow-right-up-linear" width="14" height="14" aria-hidden />
          </a>
        </div>
      </section>

      <section aria-label="Descripción y vista adicional" className="mt-9 grid items-start gap-x-10 gap-y-7 border-t border-g-20 pt-7 md:grid-cols-2 lg:gap-x-14">
        <div className="min-w-0" aria-label="Descripción del producto">
          <h2 className="text-lg font-medium tracking-tight text-g-80">Acerca de este producto</h2>
          <p className="mt-3 whitespace-pre-line break-words text-[13px] leading-6 text-g-60">
            {producto.description || 'Este producto forma parte del catálogo Hycon. Consulta con nuestro equipo si necesitas detalles adicionales antes de comprar.'}
          </p>
        </div>

        {imagenes.length > 1 ? (
          <div className="aspect-[4/3] max-h-[340px] min-w-0 overflow-hidden rounded-[2px] bg-g-10">
            <img src={imagenes[1]} alt={`Vista adicional de ${producto.name}`} className="h-full w-full object-cover" loading="lazy" />
          </div>
        ) : (
          <aside aria-label="Envíos y asesoría" className="rounded-[2px] bg-hy-5 p-5 sm:p-6">
            <div className="flex gap-3">
              <Icon icon="solar:chat-round-line-linear" width="21" height="21" className="mt-0.5 shrink-0 text-primary" aria-hidden />
              <div>
                <h3 className="text-sm font-medium text-g-80">Compra con la información que necesitas</h3>
                <p className="mt-2 text-xs leading-6 text-g-60">Nuestro equipo te ayuda a confirmar medidas, materiales y compatibilidad antes de realizar tu pedido.</p>
                <a href={consultaUrl} target="_blank" rel="noreferrer" className="mt-3 inline-flex items-center gap-2 text-xs font-medium text-primary underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary">Hablar con un asesor <Icon icon="solar:arrow-right-up-linear" width="14" aria-hidden /></a>
              </div>
            </div>
          </aside>
        )}
      </section>
    </article>
  );
}
