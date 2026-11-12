import { useEffect, useState } from 'react';
import { Icon } from '@iconify/react';
import { Link } from 'react-router-dom';
import { RUTAS, rutaCursoDetalle, rutaProductoDetalle } from '@/app/rutas/rutas';
import { listarProductosApi } from '@/features/productos/servicios/productos.api';
import { listarCursosApi } from '@/features/cursos/servicios/cursos.api';
import type { Producto } from '@/features/productos/tipos/producto.tipos';
import type { Curso } from '@/features/cursos/tipos/curso.tipos';
import { formatearPrecio } from '@/shared/utilidades/formato';
import { miniaturaYoutube } from '@/shared/utilidades/youtube';

import ambiente from '@/assets/images/home/banner-panoramico.webp';
import sillas from '@/assets/images/home/categoria-sillas.webp';
import escritorios from '@/assets/images/home/categoria-escritorios.webp';
import accesorios from '@/assets/images/home/categoria-accesorios.webp';
import './home.css';

const ERGONOMIA = /ergon[oó]m|postur|silla|escritorio|laptop|soporte|reposapi[eé]s|lumbar|oficina|trabajo/i;
const elegirProductos = (lista: Producto[]) => {
  const pertinentes = lista.filter(p => ERGONOMIA.test(p.name));
  return pertinentes.length ? pertinentes : lista;
};

function TarjetaHome({ producto }: { producto: Producto }) {
  const oferta = producto.discountPrice !== null && producto.discountPrice < producto.price;
  const categoria = /silla/i.test(producto.name) ? 'Sillas' : /mesa|escritorio/i.test(producto.name) ? 'Escritorios' : /soporte|laptop/i.test(producto.name) ? 'Accesorios' : 'Ergonomía';
  return <li className="home-producto"><Link to={rutaProductoDetalle(producto.uuid)} aria-label={`Ver ${producto.name}`}>
    <div className="home-producto-titulo"><h3>{producto.name}</h3><p>{categoria}</p></div>
    <div className="home-producto-imagen">
      {producto.imageUrl ? <img src={producto.imageUrl} alt={producto.name} loading="lazy" /> : <Icon icon="solar:box-linear" width="54" aria-hidden />}
      {oferta && <span className="home-producto-oferta">−{Math.round((1 - producto.discountPrice! / producto.price) * 100)}%</span>}
    </div>
    <div className="home-producto-info">
      <div className="home-producto-precios"><strong>{formatearPrecio(oferta ? producto.discountPrice! : producto.price)}</strong>{oferta && <del>{formatearPrecio(producto.price)}</del>}</div>
      <span className="home-producto-ver">Ver producto <Icon icon="solar:arrow-right-linear" width="17" aria-hidden /></span>
    </div>
  </Link></li>;
}

function EncabezadoSeccion({ kicker, titulo, descripcion, enlace, textoEnlace }: { kicker: string; titulo: string; descripcion?: string; enlace: string; textoEnlace: string }) {
  return <div className="home-seccion-cabecera"><div><p className="home-kicker">{kicker}</p><h2>{titulo}</h2>{descripcion && <p className="home-seccion-descripcion">{descripcion}</p>}</div><Link className="home-link" to={enlace}>{textoEnlace}<Icon icon="solar:arrow-right-linear" width="18" aria-hidden /></Link></div>;
}

export default function PaginaHome() {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [cursos, setCursos] = useState<Curso[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const controlador = new AbortController();
    listarProductosApi('active', 1, controlador.signal, 24)
      .then(pagina => setProductos(elegirProductos(pagina.elementos)))
      .catch(() => { if (!controlador.signal.aborted) setError(true); })
      .finally(() => { if (!controlador.signal.aborted) setCargando(false); });
    listarCursosApi('active', 1, controlador.signal, 24)
      .then(pagina => setCursos(pagina.elementos.filter(c => ERGONOMIA.test(c.name)).slice(0, 3)))
      .catch(() => {});
    return () => controlador.abort();
  }, []);

  const destacados = productos.slice(0, 4);
  const masProductos = productos.slice(4, 8);

  return <div className="home">
    <section className="home-categorias home-contenedor" aria-label="Explora productos ergonómicos">
      {[
        { titulo: 'Sillas ergonómicas', texto: 'Apoyo para tus horas de trabajo', foto: sillas, buscar: 'silla' },
        { titulo: 'Escritorios', texto: 'Un espacio que se adapta a ti', foto: escritorios, buscar: 'escritorio' },
        { titulo: 'Soportes para laptop', texto: 'Eleva y ordena tu espacio', foto: accesorios, buscar: 'soporte' },
      ].map((categoria, indice) => <Link className="home-categoria" to={`${RUTAS.productos}?buscar=${categoria.buscar}`} key={categoria.titulo}>
        <img src={categoria.foto} alt="" loading="lazy" /><span className="home-categoria-capa" />
        <span className="home-categoria-texto"><small>0{indice + 1} / CATÁLOGO</small><strong>{categoria.titulo}</strong><span>{categoria.texto}</span><em>Explorar <Icon icon="solar:arrow-right-linear" width="16" aria-hidden /></em></span>
      </Link>)}
    </section>

    <section className="home-productos-seccion" aria-labelledby="home-destacados">
      <div className="home-contenedor">
        <EncabezadoSeccion kicker="Una selección para empezar" titulo="Productos destacados" descripcion="Ideas para equipar tu jornada con más comodidad." enlace={RUTAS.productos} textoEnlace="Ver todo el catálogo" />
        <div id="home-destacados" className="sr-only">Productos destacados</div>
        {cargando ? <div className="home-cargando" role="status">Cargando productos…</div>
          : error ? <div className="home-cargando"><p>No pudimos cargar los productos ahora.</p><Link to={RUTAS.productos}>Ir al catálogo</Link></div>
          : destacados.length ? <ul className="home-productos-grid">{destacados.map(p => <TarjetaHome key={p.uuid} producto={p} />)}</ul>
          : <div className="home-cargando"><p>Pronto encontrarás aquí nuestra selección.</p><Link to={RUTAS.productos}>Explorar el catálogo</Link></div>}
      </div>
    </section>

    <section className="home-editorial" aria-labelledby="home-editorial-titulo">
      <img src={ambiente} alt="Espacio de trabajo equipado para una jornada cómoda" loading="lazy" /><div className="home-editorial-sombra" />
      <div className="home-editorial-contenido home-contenedor"><div><p className="home-kicker">Diseñado para el día a día</p><h2 id="home-editorial-titulo">Haz espacio para trabajar mejor.</h2><p>Encuentra el equipamiento que acompaña tus rutinas y se ajusta a tu espacio.</p><Link className="home-boton home-boton-claro" to={RUTAS.productos}>Descubrir productos <Icon icon="solar:arrow-right-linear" width="18" aria-hidden /></Link></div></div>
    </section>

    {masProductos.length > 0 && <section className="home-productos-seccion home-segunda-seleccion" aria-labelledby="home-mas-productos"><div className="home-contenedor"><EncabezadoSeccion kicker="Sigue explorando" titulo="Más para tu espacio" enlace={RUTAS.productos} textoEnlace="Ver más productos" /><div id="home-mas-productos" className="sr-only">Más productos</div><ul className="home-productos-grid">{masProductos.map(p => <TarjetaHome key={p.uuid} producto={p} />)}</ul></div></section>}

    <section className="home-cursos" aria-labelledby="home-cursos-titulo"><div className="home-contenedor home-cursos-interior">
      <div className="home-cursos-intro"><p className="home-kicker">Aprende con Hycon</p><h2 id="home-cursos-titulo">Conocimiento que también acompaña tu trabajo.</h2><p>Explora cursos de ergonomía para incorporar mejores prácticas a tu jornada y a tu equipo.</p><Link className="home-link" to={RUTAS.cursos}>Ver todos los cursos <Icon icon="solar:arrow-right-linear" width="18" aria-hidden /></Link></div>
      {cursos.length > 0 && <ul className="home-cursos-lista">{cursos.map(c => <li key={c.uuid}><Link to={rutaCursoDetalle(c.uuid)}><span className="home-curso-imagen">{(c.thumbnailUrl || c.youtubeId) ? <img src={c.thumbnailUrl || miniaturaYoutube(c.youtubeId!)} alt="" loading="lazy" /> : <Icon icon="solar:diploma-linear" width="38" aria-hidden />}</span><span className="home-curso-datos"><small>CURSO</small><strong>{c.name}</strong><span>{formatearPrecio(c.discountPrice ?? c.price)}</span></span><Icon icon="solar:arrow-up-right-linear" width="20" aria-hidden /></Link></li>)}</ul>}
    </div></section>

    <section className="home-ventajas home-contenedor" aria-label="Cómo comprar en Hycon">
      <div><Icon icon="solar:cart-large-2-linear" width="27" aria-hidden /><h3>Compra desde la web</h3><p>Explora productos, revisa sus detalles y agrégalos a tu carrito.</p></div>
      <div><Icon icon="solar:card-2-linear" width="27" aria-hidden /><h3>Opciones de pago</h3><p>Paga con tarjeta o Yape, o coordina tu pedido por WhatsApp.</p></div>
      <div><Icon icon="solar:chat-round-dots-linear" width="27" aria-hidden /><h3>Estamos para ayudarte</h3><p>Si tienes dudas sobre un producto, escríbenos antes de comprar.</p></div>
    </section>
    <section className="home-cierre home-contenedor" aria-label="Descubre más sobre ergonomía"><div><p className="home-kicker">Lecturas para seguir aprendiendo</p><h2>Ideas y conocimiento para un trabajo más cómodo.</h2></div><Link className="home-boton home-boton-oscuro" to={RUTAS.publicaciones}>Leer publicaciones <Icon icon="solar:arrow-right-linear" width="18" aria-hidden /></Link></section>
  </div>;
}
