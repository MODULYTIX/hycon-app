import { Link } from 'react-router-dom';
import { rutaPublicacionDetalle } from '@/app/rutas/rutas';
import PortadaArticulo from '@/features/publicaciones/componentes/atomos/PortadaArticulo';
import MetaArticulo from '@/features/publicaciones/componentes/moleculas/MetaArticulo';
import { resumenDe } from '@/features/publicaciones/utilidades/resumen';
import type { Publicacion } from '@/features/publicaciones/tipos/publicacion.tipos';

interface Props {
  publicaciones: Publicacion[];
  cargando: boolean;
}

// Columna lateral con los articulos que mas se leen, numerados
export default function PanelMasLeidos({ publicaciones, cargando }: Props) {
  if (cargando) {
    return (
      <div aria-label="Cargando lo mas leido" className="space-y-4">
        {[0, 1, 2].map((posicion) => (
          <div key={posicion} className="h-16 animate-pulse rounded-[3px] bg-g-10" />
        ))}
      </div>
    );
  }

  if (publicaciones.length === 0) return null;

  return (
    <section aria-labelledby="titulo-mas-leido">
      <h2
        id="titulo-mas-leido"
        className="mb-4 border-l-2 border-primary pl-3 text-[16px] font-semibold tracking-tight text-g-90"
      >
        Lo más leído
      </h2>

      <ol className="space-y-3.5">
        {publicaciones.map((publicacion, indice) => (
          <li key={publicacion.uuid}>
            <article className="group flex gap-3">
              <span
                aria-hidden
                className="mt-0.5 text-[13.5px] font-semibold tabular-nums text-primary/40 transition-colors group-hover:text-primary"
              >
                {String(indice + 1).padStart(2, '0')}
              </span>

              <div className="min-w-0 flex-1">
                <h3 className="line-clamp-2 text-[13.5px] font-medium leading-snug text-g-80">
                  <Link
                    to={rutaPublicacionDetalle(publicacion.slug)}
                    className="outline-offset-4 hover:text-primary focus-visible:outline-2 focus-visible:outline-primary"
                  >
                    {publicacion.title}
                  </Link>
                </h3>
                <p className="mt-1 line-clamp-2 text-[12px] leading-relaxed text-g-50">
                  {resumenDe(publicacion, 90)}
                </p>
                <MetaArticulo publicacion={publicacion} conLectura={false} clase="mt-1" />
              </div>

              <Link
                to={rutaPublicacionDetalle(publicacion.slug)}
                tabIndex={-1}
                aria-hidden
                className="hidden shrink-0 sm:block"
              >
                <PortadaArticulo
                  url={publicacion.coverUrl}
                  titulo={publicacion.title}
                  clase="h-14 w-[70px] rounded-[3px] ring-1 ring-g-20"
                  tamanoIcono={22}
                />
              </Link>
            </article>
          </li>
        ))}
      </ol>
    </section>
  );
}
