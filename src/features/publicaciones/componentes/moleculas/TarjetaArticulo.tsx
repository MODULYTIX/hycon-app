import { Link } from 'react-router-dom';
import { rutaPublicacionDetalle } from '@/app/rutas/rutas';
import PortadaArticulo from '@/features/publicaciones/componentes/atomos/PortadaArticulo';
import MetaArticulo from '@/features/publicaciones/componentes/moleculas/MetaArticulo';
import { resumenDe } from '@/features/publicaciones/utilidades/resumen';
import type { Publicacion } from '@/features/publicaciones/tipos/publicacion.tipos';

// Tarjeta compacta de la columna derecha del destacado
export default function TarjetaArticulo({ publicacion }: { publicacion: Publicacion }) {
  return (
    <article className="publicaciones-articulo group">
      <Link to={rutaPublicacionDetalle(publicacion.slug)} aria-label={`Leer ${publicacion.title}`}>
        <PortadaArticulo url={publicacion.coverUrl} titulo={publicacion.title} clase="aspect-[16/10]" tamanoIcono={36} />
        <h3>{publicacion.title}</h3>
        <MetaArticulo publicacion={publicacion} conLectura={false} />
      </Link>
      <p className="publicaciones-resumen line-clamp-2">{resumenDe(publicacion, 135)}</p>
    </article>
  );
}
