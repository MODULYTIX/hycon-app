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
      className={`tarjeta-editorial group flex h-full overflow-hidden rounded-xl bg-white ring-1 ring-g-20 transition-shadow duration-300 hover:shadow-[0_14px_40px_rgba(28,58,57,0.10)] ${
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
              : 'aspect-[16/9]'
          }
          tamanoIcono={56}
        />
      </Link>

      <div
        className={`flex flex-1 flex-col gap-2.5 border-t border-g-20 p-4 ${
          horizontal ? 'md:justify-center md:border-l md:border-t-0 md:p-7' : ''
        }`}
      >
        <span className="w-fit bg-hy-10 px-2 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-primary">
          {etiqueta}
        </span>

        <h2 className="text-[15px] font-semibold leading-snug tracking-tight text-g-90 sm:text-[16px]">
          <Link
            to={rutaPublicacionDetalle(publicacion.slug)}
            className="outline-offset-4 hover:text-primary focus-visible:outline-2 focus-visible:outline-primary"
          >
            {publicacion.title}
          </Link>
        </h2>

        <MetaArticulo publicacion={publicacion} />

        <p className="line-clamp-2 text-[12px] leading-relaxed text-g-60">{resumenDe(publicacion, 200)}</p>

        <Link
          to={rutaPublicacionDetalle(publicacion.slug)}
          className="mt-1 inline-flex h-9 w-fit items-center gap-1.5 rounded-lg bg-primary px-4 text-[12px] font-medium text-white transition-colors hover:bg-marca-oscuro focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
        >
          Leer artículo completo
          <Icon icon="solar:arrow-right-linear" width="15" height="15" aria-hidden />
        </Link>
      </div>
    </article>
  );
}
