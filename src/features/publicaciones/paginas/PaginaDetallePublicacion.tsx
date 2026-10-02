import { useEffect, useState } from 'react';
import { Icon } from '@iconify/react';
import { Link, useParams } from 'react-router-dom';
import { RUTAS, rutaPublicacionDetalle } from '@/app/rutas/rutas';
import PortadaArticulo from '@/features/publicaciones/componentes/atomos/PortadaArticulo';
import MetaArticulo from '@/features/publicaciones/componentes/moleculas/MetaArticulo';
import { resumenDe } from '@/features/publicaciones/utilidades/resumen';
import { usePublicacionesPublicas } from '@/features/publicaciones/hooks/usePublicacionesPublicas';
import { obtenerPublicacionApi } from '@/features/publicaciones/servicios/publicaciones.api';
import type { Publicacion } from '@/features/publicaciones/tipos/publicacion.tipos';

export default function PaginaDetallePublicacion() {
  const { slug = '' } = useParams();
  const [publicacion, setPublicacion] = useState<Publicacion | null>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const otros = usePublicacionesPublicas({ porPagina: 4 });

  useEffect(() => {
    const controlador = new AbortController();
    setCargando(true);
    setError(null);

    obtenerPublicacionApi(slug, controlador.signal)
      .then(setPublicacion)
      .catch((fallo: unknown) => {
        if (controlador.signal.aborted) return;
        setError(fallo instanceof Error ? fallo.message : 'No se pudo cargar el artículo');
      })
      .finally(() => {
        if (!controlador.signal.aborted) setCargando(false);
      });

    return () => controlador.abort();
  }, [slug]);

  if (cargando) {
    return (
      <div className="mx-auto w-full max-w-[1340px] px-4 py-10 sm:px-6 md:px-12" aria-label="Cargando artículo">
        <div className="h-6 w-40 animate-pulse rounded bg-g-10" />
        <div className="mt-6 h-10 w-3/4 animate-pulse rounded bg-g-10" />
        <div className="mt-6 aspect-[16/9] animate-pulse rounded-[3px] bg-g-10" />
      </div>
    );
  }

  if (error || !publicacion) {
    return (
      <div className="mx-auto w-full max-w-[720px] px-4 py-16 text-center sm:px-6">
        <Icon icon="solar:document-text-linear" width="48" height="48" aria-hidden className="mx-auto text-g-30" />
        <h1 className="mt-4 text-[24px] font-semibold text-g-90">No encontramos este artículo</h1>
        <p role="alert" className="mt-2 text-[15px] text-g-50">
          {error ?? 'Puede que se haya retirado de la web.'}
        </p>
        <Link
          to={RUTAS.publicaciones}
          className="mt-6 inline-flex h-11 items-center gap-2 rounded-xl bg-primary px-5 text-sm font-medium text-white transition-colors hover:bg-marca-oscuro"
        >
          Ver todos los artículos
        </Link>
      </div>
    );
  }

  // El artículo abierto no se repite en la columna lateral
  const relacionados = otros.publicaciones.filter((otra) => otra.uuid !== publicacion.uuid).slice(0, 3);

  return (
    <div className="detalle-interior lectura-interior mx-auto w-full max-w-[1180px] px-4 py-9 sm:px-6 md:px-10">
      <Link
        to={RUTAS.publicaciones}
        className="inline-flex items-center gap-2 text-xs text-g-50 transition-colors hover:text-primary"
      >
        <Icon icon="solar:arrow-left-linear" width="15" height="15" aria-hidden />
        Artículos
      </Link>

      <div className="mt-5 grid gap-8 lg:grid-cols-[minmax(0,1fr)_268px] lg:gap-12">
        <article>
          <h1 className="text-[30px] font-semibold leading-[1.12] tracking-tight text-g-90 sm:text-[42px]">
            {publicacion.title}
          </h1>

          <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1">
            <MetaArticulo publicacion={publicacion} />
            <span aria-hidden className="text-g-30">·</span>
            <p className="text-[12px] text-g-50">Por {publicacion.authorName}</p>
          </div>

          <PortadaArticulo
            url={publicacion.coverUrl}
            titulo={publicacion.title}
            clase="mt-5 aspect-[16/9] rounded-[3px] ring-1 ring-g-20"
            tamanoIcono={56}
          />

          {publicacion.excerpt && (
            <p className="mt-6 border-l-2 border-primary pl-4 text-[15.5px] leading-relaxed text-g-70">
              {publicacion.excerpt}
            </p>
          )}

          {/* El backend ya limpia este HTML al guardarlo: solo deja el formato del editor */}
          <div
            className="contenido-articulo mt-8 text-[16px]"
            dangerouslySetInnerHTML={{ __html: publicacion.content }}
          />

          <div className="mt-8 flex flex-wrap items-center justify-between gap-4 border-t border-g-20 pt-5">
            <p className="text-xs text-g-50">
              {publicacion.views} {publicacion.views === 1 ? 'lectura' : 'lecturas'}
            </p>
            <a
              href={`https://wa.me/51902665565?text=${encodeURIComponent(`Hola Hycon, leí el artículo "${publicacion.title}" y quisiera más información.`)}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex h-10 items-center gap-2 rounded-xl bg-primary px-4 text-[13px] font-medium text-white transition-colors hover:bg-marca-oscuro"
            >
              <Icon icon="ic:baseline-whatsapp" width="18" height="18" aria-hidden />
              Conversemos sobre esto
            </a>
          </div>
        </article>

        {relacionados.length > 0 && (
          <aside aria-labelledby="titulo-otros" className="lg:border-l lg:border-g-20 lg:pl-9">
            <h2 id="titulo-otros" className="mb-4 border-l-2 border-primary pl-3 text-[16px] font-semibold tracking-tight text-g-90">
              Otros artículos
            </h2>

            <ul className="space-y-4">
              {relacionados.map((otra) => (
                <li key={otra.uuid}>
                  <article className="group flex gap-3">
                    <div className="min-w-0 flex-1">
                      <h3 className="line-clamp-2 text-[13.5px] font-medium leading-snug text-g-80">
                        <Link
                          to={rutaPublicacionDetalle(otra.slug)}
                          className="outline-offset-4 hover:text-primary focus-visible:outline-2 focus-visible:outline-primary"
                        >
                          {otra.title}
                        </Link>
                      </h3>
                      <p className="mt-1 line-clamp-2 text-[12px] leading-relaxed text-g-50">
                        {resumenDe(otra, 90)}
                      </p>
                      <MetaArticulo publicacion={otra} conLectura={false} clase="mt-1" />
                    </div>

                    <PortadaArticulo
                      url={otra.coverUrl}
                      titulo={otra.title}
                      clase="h-14 w-[70px] shrink-0 rounded-[3px] ring-1 ring-g-20"
                      tamanoIcono={22}
                    />
                  </article>
                </li>
              ))}
            </ul>

            <Link
              to={RUTAS.publicaciones}
              className="mt-5 inline-flex h-9 w-full items-center justify-center gap-2 rounded-xl border border-g-30 text-[12.5px] font-medium text-g-70 transition-colors hover:border-primary hover:text-primary"
            >
              Ver más artículos
            </Link>
          </aside>
        )}
      </div>
    </div>
  );
}
