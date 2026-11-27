import { Icon } from '@iconify/react';
import { Link } from 'react-router-dom';
import { rutaPublicacionDetalle } from '@/app/rutas/rutas';
import PortadaArticulo from '@/features/publicaciones/componentes/atomos/PortadaArticulo';
import MetaArticulo from '@/features/publicaciones/componentes/moleculas/MetaArticulo';
import { resumenDe } from '@/features/publicaciones/utilidades/resumen';
import type { Publicacion } from '@/features/publicaciones/tipos/publicacion.tipos';

interface Props {
  publicacion: Publicacion;
  // Cuando no hay articulos de apoyo ocupa todo el ancho: portada y texto van uno al lado del otro
  horizontal?: boolean;
  etiqueta?: string;
}

// El articulo mas reciente, encabezando la pagina
export default function TarjetaArticuloDestacado({ publicacion, horizontal = false, etiqueta = 'Lo último' }: Props) {
  return (
    <article
      className={`publicaciones-destacado group flex h-full overflow-hidden ${
        horizontal ? 'flex-col md:flex-row' : 'flex-col'
      }`}
    >
      <Link
        to={rutaPublicacionDetalle(publicacion.slug)}
        tabIndex={-1}
        aria-hidden
        className={horizontal ? 'block md:w-[54%]' : 'block'}
      >
        {/* En pantalla ancha la portada crece para igualar la altura de lo que tiene al lado */}
        <PortadaArticulo
          url={publicacion.coverUrl}
          titulo={publicacion.title}
          clase={
            horizontal
              ? 'aspect-[16/9] md:aspect-auto md:h-full md:min-h-[230px]'
              : 'aspect-[16/10]'
          }
          tamanoIcono={56}
        />
      </Link>

      <div
        className={`publicaciones-destacado-texto flex flex-1 flex-col gap-2.5 py-4 ${
          horizontal ? 'md:justify-center md:px-7' : ''
        }`}
      >
        <span className="w-fit text-[length:var(--hy-texto-nota)] font-semibold uppercase tracking-[0.12em] text-primary">
          {etiqueta}
        </span>

        <h2 className="publicaciones-titular font-semibold leading-tight tracking-tight text-g-90">
          <Link
            to={rutaPublicacionDetalle(publicacion.slug)}
            className="outline-offset-4 hover:text-primary focus-visible:outline-2 focus-visible:outline-primary"
          >
            {publicacion.title}
          </Link>
        </h2>

        <MetaArticulo publicacion={publicacion} />

        <p className="line-clamp-2 text-[length:var(--hy-texto-control)] leading-relaxed text-g-60">{resumenDe(publicacion, 200)}</p>

        <Link
          to={rutaPublicacionDetalle(publicacion.slug)}
          className="mt-1 inline-flex min-h-9 w-fit items-center gap-1.5 border-b border-primary text-[length:var(--hy-texto-control)] font-medium text-marca-oscuro hover:text-g-90 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
        >
          Leer artículo completo
          <Icon icon="solar:arrow-right-linear" width="15" height="15" aria-hidden />
        </Link>
      </div>
    </article>
  );
}
