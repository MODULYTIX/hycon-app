import { useRef, useState } from 'react';
import ModalCompraRapida from '@/features/carrito/componentes/organismos/ModalCompraRapida';
import { Icon } from '@iconify/react';
import { Link } from 'react-router-dom';
import { rutaProductoDetalle } from '@/app/rutas/rutas';
import { formatearPrecio } from '@/shared/utilidades/formato';
import type { Producto } from '@/features/productos/tipos/producto.tipos';

export default function TarjetaProducto({ producto, variante = 'catalogo' }: {
  producto: Producto;
  variante?: 'catalogo' | 'inicio';
}) {
  const [compraAbierta, setCompraAbierta] = useState(false);
  const botonCompra = useRef<HTMLButtonElement>(null);
  const esCatalogo = variante === 'catalogo';
  const precio = producto.discountPrice !== null && producto.discountPrice < producto.price
    ? producto.discountPrice : producto.price;
  const oferta = precio < producto.price;
  const sinStock = producto.stock === 0;
  const referencia = [producto.brand, producto.model].filter(Boolean).join(' · ');
  const categoria = /silla/i.test(producto.name) ? 'Sillas'
    : /mesa|escritorio/i.test(producto.name) ? 'Escritorios'
      : /soporte|laptop/i.test(producto.name) ? 'Accesorios' : undefined;
  const subtitulo = esCatalogo ? referencia || categoria : categoria || 'Ergonomía';

  return (
    <li className={esCatalogo ? 'home-producto productos-tarjeta' : 'home-producto'}>
      <Link to={rutaProductoDetalle(producto.uuid)} aria-label={esCatalogo ? `Ver detalles de ${producto.name}` : `Ver ${producto.name}`}>
        <div className="home-producto-titulo productos-tarjeta-titulo">
          <h3>{producto.name}</h3>
          {esCatalogo ? (
            <>
              <p className="productos-tarjeta-categoria">{categoria ?? 'Productos'}</p>
              {subtitulo && <p className="productos-tarjeta-referencia">{subtitulo}</p>}
            </>
          ) : <p>{subtitulo}</p>}
        </div>
        <div className="home-producto-imagen productos-tarjeta-foto">
          {producto.imageUrl
            ? <img src={producto.imageUrl} alt={producto.name} loading="lazy" />
            : <Icon icon="solar:box-linear" width="54" aria-hidden />}
          {oferta && <span className="home-producto-oferta">
            <span className="sr-only">Oferta: </span>−{Math.round((1 - precio / producto.price) * 100)}%
          </span>}
          {esCatalogo && sinStock && <span className="productos-agotado">Sin stock</span>}
        </div>
        {esCatalogo && <span className="productos-vista-rapida" aria-hidden>
          <Icon icon="solar:magnifer-linear" width="19" />
        </span>}
        <div className="home-producto-info">
          <div className="home-producto-precios">
            <strong>{formatearPrecio(precio)}</strong>
            {oferta && <del>{formatearPrecio(producto.price)}</del>}
          </div>
          {esCatalogo && (
            <div className="productos-tarjeta-stock flex flex-wrap justify-center gap-x-2">
              {producto.color && <span>{producto.color}</span>}
              {!sinStock && <span>{producto.stock} disponibles</span>}
            </div>
          )}
          <span className="home-producto-ver">{esCatalogo ? 'Ver detalle' : 'Ver producto'} <Icon icon="solar:arrow-right-linear" width="17" aria-hidden /></span>
        </div>
      </Link>
      {esCatalogo && !sinStock && <button ref={botonCompra} type="button" className="productos-compra-rapida"
        aria-label={`Agregar ${producto.name} al carrito`} aria-haspopup="dialog" title="Agregar al carrito"
        onClick={() => setCompraAbierta(true)}>
        <Icon icon="solar:cart-plus-linear" width="19" aria-hidden />
      </button>}
      {compraAbierta && <ModalCompraRapida articulo={{ ...producto, tipo: 'producto', imagen: producto.imageUrl }} precio={precio} onCerrar={() => {
        setCompraAbierta(false);
        botonCompra.current?.focus({ preventScroll: true });
      }} />}
    </li>
  );
}
