import { useEffect, useState } from 'react';
import { Icon } from '@iconify/react';
import { Link, useParams } from 'react-router-dom';
import { RUTAS } from '@/app/rutas/rutas';
import { obtenerProductoApi } from '@/features/productos/servicios/productos.api';
import type { ProductoDetalle } from '@/features/productos/tipos/producto.tipos';
import { formatearPrecio } from '@/shared/utilidades/formato';

const CLAVE_CARRITO = 'hycon.carrito.productos';

interface ItemCarrito {
  productId: number;
  quantity: number;
}

function agregarAlCarrito(productId: number, quantity: number, stock: number): boolean {
  const guardado = window.localStorage.getItem(CLAVE_CARRITO);
  const items: ItemCarrito[] = guardado ? JSON.parse(guardado) : [];
  const existente = items.find((item) => item.productId === productId);
  if ((existente?.quantity ?? 0) + quantity > stock) return false;
  if (existente) existente.quantity += quantity;
  else items.push({ productId, quantity });
  window.localStorage.setItem(CLAVE_CARRITO, JSON.stringify(items));
  return true;
}

export default function PaginaDetalleProducto() {
  const { productId } = useParams();
  const [producto, setProducto] = useState<ProductoDetalle | null>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cantidad, setCantidad] = useState(1);
  const [imagenActiva, setImagenActiva] = useState(0);
  const [aviso, setAviso] = useState<string | null>(null);
  const [imagenFallida, setImagenFallida] = useState(false);

  useEffect(() => {
    const id = Number(productId);
    if (!Number.isSafeInteger(id) || id < 1) {
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
    setImagenFallida(false);

    obtenerProductoApi(id, controlador.signal)
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
  }, [productId]);

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

  const imagenes = [...new Set(producto.imageUrls.length
    ? producto.imageUrls
    : producto.imageUrl
      ? [producto.imageUrl]
      : [])];
  const imagenPrincipal = imagenes[imagenActiva];
  const precioFinal = producto.discountPrice ?? producto.price;
  const enOferta = producto.discountPrice !== null && producto.discountPrice < producto.price;
  const sinStock = producto.stock === 0;
  const codigo = `HY-${String(producto.productId).padStart(6, '0')}`;
  const consultaUrl = `https://wa.me/51902665565?text=${encodeURIComponent(`Hola, quisiera más información sobre ${producto.name} (${codigo}).`)}`;
  const datosProducto = [
    { etiqueta: 'Marca', valor: producto.brand || 'Por confirmar' },
    { etiqueta: 'Modelo', valor: producto.model || 'Por confirmar' },
  ];

  const agregar = () => {
    try {
      if (agregarAlCarrito(producto.productId, cantidad, producto.stock)) {
        setAviso(`${cantidad} ${cantidad === 1 ? 'unidad agregada' : 'unidades agregadas'} al carrito.`);
      } else {
        setAviso('Ya tienes en el carrito la cantidad disponible de este producto.');
      }
    } catch {
      setAviso('No se pudo guardar el producto en este navegador.');
    }
  };

  return (
    <article className="mx-auto w-full max-w-[1180px] px-5 pb-16 pt-7 sm:px-8 sm:pt-9">
      <Link to={RUTAS.productos} className="inline-flex items-center gap-2 text-xs text-g-50 transition-colors hover:text-primary">
        <Icon icon="solar:arrow-left-linear" width="15" height="15" aria-hidden />
        Volver a productos
      </Link>
      <header className="mb-7 mt-5 sm:mb-9">
        <h1 className="max-w-[900px] text-[2rem] font-medium leading-[1.12] tracking-tight text-g-80 sm:text-[2.6rem]">{producto.name}</h1>
      </header>

      <section aria-label="Imagen e información principal" className="grid items-start gap-x-10 gap-y-8 min-[700px]:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] lg:gap-x-14">
        <div className="min-w-0">
          <div className="relative aspect-[6/5] overflow-hidden rounded-[2px] bg-g-10">
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
                  className={`h-14 w-14 shrink-0 overflow-hidden rounded-[2px] border-2 p-0.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${imagenActiva === indice ? 'border-primary' : 'border-transparent hover:border-g-30'}`}
                >
                  <img src={imagen} alt="" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}

          <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-[11px] text-g-50">
            <p>Referencia <span className="ml-1 text-g-70">{codigo}</span></p>
            {imagenes.length > 1 && <span>{imagenActiva + 1} / {imagenes.length} imágenes</span>}
          </div>
        </div>

        <div className="min-w-0 sm:pt-1">
          <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
            <p className="inline-flex items-center gap-2 text-g-60">
              <span className={`h-1.5 w-1.5 rounded-full ${sinStock ? 'bg-g-40' : 'bg-primary'}`} aria-hidden />
              {sinStock ? 'Agotado por el momento' : `${producto.stock} unidades disponibles`}
            </p>
            {enOferta && <span className="rounded-[2px] bg-secondary/15 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.1em] text-g-80">Oferta</span>}
          </div>
          <div className="mt-5 flex flex-wrap items-baseline gap-x-4 gap-y-1">
            <p className="text-[2.75rem] font-medium leading-none tracking-tight text-primary">{formatearPrecio(precioFinal)}</p>
            {enOferta && <p className="text-sm text-g-50 line-through">{formatearPrecio(producto.price)}</p>}
          </div>
          <p className="mt-2 text-xs text-g-50">Precio por unidad</p>

          <dl className="mt-6 grid grid-cols-2 gap-5 border-y border-g-20 py-4" aria-label="Datos del producto">
            {datosProducto.map(({ etiqueta, valor }) => (
              <div key={etiqueta} className="min-w-0">
                <dt className="text-xs text-g-50">{etiqueta}</dt>
                <dd className="mt-1 break-words text-sm font-medium text-g-80">{valor}</dd>
              </div>
            ))}
          </dl>

          <div className="mt-6">
            <p className="mb-2 text-xs text-g-50">Cantidad</p>
            <div className="flex flex-wrap gap-3">
              <div className="flex h-12 shrink-0 items-center rounded-[2px] border border-g-30" aria-label="Cantidad">
                <button type="button" aria-label="Reducir cantidad" disabled={cantidad <= 1 || sinStock} onClick={() => setCantidad((valor) => Math.max(1, valor - 1))} className="h-full w-10 text-lg text-g-80 hover:bg-g-5 disabled:opacity-35">−</button>
                <span className="min-w-7 text-center text-sm tabular-nums" aria-live="polite">{cantidad}</span>
                <button type="button" aria-label="Aumentar cantidad" disabled={cantidad >= producto.stock || sinStock} onClick={() => setCantidad((valor) => Math.min(producto.stock, valor + 1))} className="h-full w-10 text-lg text-g-80 hover:bg-g-5 disabled:opacity-35">+</button>
              </div>
              <button type="button" disabled={sinStock} onClick={agregar} className="inline-flex h-12 min-w-[175px] flex-1 items-center justify-center gap-2 rounded-[2px] bg-primary px-4 text-sm font-medium text-white transition-colors hover:bg-bc-90 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary disabled:cursor-not-allowed disabled:bg-g-40">
                <Icon icon="solar:cart-large-2-linear" width="19" height="19" aria-hidden />
                {sinStock ? 'Sin stock' : 'Agregar al carrito'}
              </button>
            </div>
            {aviso && <p role="status" className="mt-3 text-sm text-primary">{aviso}</p>}
          </div>

          <a href={consultaUrl} target="_blank" rel="noreferrer" className="mt-5 inline-flex items-center gap-2 text-xs text-g-60 transition-colors hover:text-primary">
            <Icon icon="ic:baseline-whatsapp" width="17" height="17" aria-hidden />
            Consultar antes de comprar
            <Icon icon="solar:arrow-right-up-linear" width="14" height="14" aria-hidden />
          </a>
        </div>
      </section>

      <section aria-label="Descripción y vista adicional" className="mt-9 grid gap-x-10 gap-y-7 border-t border-g-20 pt-7 min-[700px]:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] lg:gap-x-14">
        <div className="min-w-0" aria-label="Descripción del producto">
          <h2 className="text-lg font-medium tracking-tight text-g-80">Acerca de este producto</h2>
          <p className="mt-3 whitespace-pre-line text-sm leading-7 text-g-60">
            {producto.description || 'Este producto forma parte del catálogo Hycon. Consulta con nuestro equipo si necesitas detalles adicionales antes de comprar.'}
          </p>
        </div>

        {imagenes.length > 1 ? (
          <div className="aspect-[4/3] max-h-[340px] min-w-0 overflow-hidden rounded-[2px] bg-g-10">
            <img src={imagenes[1]} alt={`Vista adicional de ${producto.name}`} className="h-full w-full object-cover" loading="lazy" />
          </div>
        ) : (
          <aside aria-label="Envíos y asesoría" className="space-y-5 min-[700px]:border-l min-[700px]:border-g-20 min-[700px]:pl-6">
            <div className="flex gap-3">
              <Icon icon="solar:box-linear" width="21" height="21" className="mt-0.5 shrink-0 text-primary" aria-hidden />
              <div><h3 className="text-sm font-medium text-g-80">Entrega coordinada</h3><p className="mt-1 text-xs leading-relaxed text-g-50">Consulta la cobertura y fecha de despacho con nuestro equipo.</p></div>
            </div>
            <div className="flex gap-3">
              <Icon icon="solar:chat-round-line-linear" width="21" height="21" className="mt-0.5 shrink-0 text-primary" aria-hidden />
              <div><h3 className="text-sm font-medium text-g-80">Te ayudamos a elegir</h3><p className="mt-1 text-xs leading-relaxed text-g-50">Confirma medidas, materiales y compatibilidad antes de tu pedido.</p></div>
            </div>
          </aside>
        )}
      </section>
    </article>
  );
}
