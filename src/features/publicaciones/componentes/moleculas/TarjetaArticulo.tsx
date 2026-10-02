import { Icon } from '@iconify/react';
import { Link } from 'react-router-dom';
import { rutaPublicacionDetalle } from '@/app/rutas/rutas';
import PortadaArticulo from '@/features/publicaciones/componentes/atomos/PortadaArticulo';
import MetaArticulo from '@/features/publicaciones/componentes/moleculas/MetaArticulo';
import { resumenDe } from '@/features/publicaciones/utilidades/resumen';
import type { Publicacion } from '@/features/publicaciones/tipos/publicacion.tipos';

// Tarjeta compacta de la columna derecha del destacado
export default function TarjetaArticulo({ publicacion }: { publicacion: Publicacion }) {
  return (
    <article className="tarjeta-editorial group flex flex-1 flex-col overflow-hidden rounded-xl bg-white ring-1 ring-g-20 transition-shadow duration-300 hover:shadow-[0_10px_30px_rgba(28,58,57,0.09)]">
      <Link to={rutaPublicacionDetalle(publicacion.slug)} tabIndex={-1} aria-hidden className="block">
        <PortadaArticulo url={publicacion.coverUrl} titulo={publicacion.title} clase="aspect-[16/9]" tamanoIcono={36} />
      </Link>

      <div className="flex flex-1 flex-col gap-1.5 border-t border-g-20 p-4">
        <h3 className="line-clamp-2 text-[15px] font-semibold leading-snug text-g-90">
          <Link
            to={rutaPublicacionDetalle(publicacion.slug)}
            className="outline-offset-4 hover:text-primary focus-visible:outline-2 focus-visible:outline-primary"
          >
            {publicacion.title}
          </Link>
        </h3>

        <p className="line-clamp-2 text-[12.5px] leading-relaxed text-g-60">{resumenDe(publicacion, 110)}</p>

        <div className="mt-auto flex items-end justify-between gap-3 pt-1.5">
          <MetaArticulo publicacion={publicacion} conLectura={false} />
          <Link
            to={rutaPublicacionDetalle(publicacion.slug)}
            aria-label={`Leer ${publicacion.title}`}
            className="inline-flex h-8 items-center gap-1 rounded-lg border border-g-30 px-3 text-[12px] font-medium text-g-70 transition-colors hover:border-primary hover:text-primary"
          >
            Leer
            <Icon icon="solar:arrow-right-linear" width="13" height="13" aria-hidden />
          </Link>
        </div>
      </div>
    </article>
  );
}
