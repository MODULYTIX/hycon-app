import { Icon } from '@iconify/react';
import { Link } from 'react-router-dom';
import { rutaPublicacionDetalle } from '@/app/rutas/rutas';
import PortadaArticulo from '@/features/publicaciones/componentes/atomos/PortadaArticulo';
import MetaArticulo from '@/features/publicaciones/componentes/moleculas/MetaArticulo';
import { resumenDe } from '@/features/publicaciones/utilidades/resumen';
import type { Publicacion } from '@/features/publicaciones/tipos/publicacion.tipos';

// Cada articulo del listado principal: portada a la izquierda y texto a la derecha
export default function FilaArticulo({ publicacion }: { publicacion: Publicacion }) {
  return (
    <li className="group">
      <article className="flex flex-row gap-3 sm:gap-4">
        <Link
          to={rutaPublicacionDetalle(publicacion.slug)}
          tabIndex={-1}
          aria-hidden
          className="shrink-0 w-[112px] sm:w-[128px]"
        >
          <PortadaArticulo
            url={publicacion.coverUrl}
            titulo={publicacion.title}
            clase="aspect-[16/9] rounded-lg ring-1 ring-g-20 sm:aspect-[4/3]"
            tamanoIcono={32}
          />
        </Link>

        <div className="flex min-w-0 flex-1 flex-col gap-1.5">
          <h3 className="line-clamp-2 text-[15.5px] font-semibold leading-snug text-g-90 sm:text-[15px]">
            <Link
              to={rutaPublicacionDetalle(publicacion.slug)}
              className="outline-offset-4 hover:text-primary focus-visible:outline-2 focus-visible:outline-primary"
            >
              {publicacion.title}
            </Link>
          </h3>

          <MetaArticulo publicacion={publicacion} />

          <p className="line-clamp-2 text-[13px] leading-relaxed text-g-60">{resumenDe(publicacion, 180)}</p>

          <Link
            to={rutaPublicacionDetalle(publicacion.slug)}
            aria-label={`Leer ${publicacion.title}`}
            className="mt-0.5 inline-flex w-fit items-center gap-1 text-[12.5px] font-medium text-primary hover:underline"
          >
            Leer artículo
            <Icon icon="solar:arrow-right-linear" width="14" height="14" aria-hidden />
          </Link>
        </div>
      </article>
    </li>
  );
}
