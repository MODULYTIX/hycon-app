import { Icon } from '@iconify/react';
import { Link } from 'react-router-dom';
import { rutaCursoDetalle } from '@/app/rutas/rutas';
import { formatearDuracion, formatearPrecio } from '@/shared/utilidades/formato';
import type { Curso } from '@/features/cursos/tipos/curso.tipos';

// Comparte el formato visual del catalogo de productos, con datos propios del curso.
export default function TarjetaCurso({ curso }: { curso: Curso }) {
  const enOferta = curso.discountPrice !== null;

  return (
    <li className="group overflow-hidden rounded-[3px] bg-white ring-1 ring-g-20 transition-shadow duration-500 hover:shadow-xl">
      <Link
        to={rutaCursoDetalle(curso.courseId)}
        aria-label={`Ver detalles de ${curso.name}`}
        className="block outline-offset-4 focus-visible:outline-2 focus-visible:outline-primary"
      >
      <div className="relative aspect-[4/3] overflow-hidden bg-g-10 sm:aspect-[5/4]">
        {curso.thumbnailUrl ? (
          <img
            src={curso.thumbnailUrl}
            alt={curso.name}
            draggable={false}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
          />
        ) : (
          <span
            aria-hidden
            className="flex h-full w-full items-center justify-center bg-gradient-to-br from-bc-10 via-g-10 to-g-20 text-primary/35"
          >
            <Icon icon="solar:diploma-linear" width="96" height="96" />
          </span>
        )}

        {enOferta && (
          <span className="absolute left-5 top-5 rounded-[2px] bg-secondary px-3 py-1.5 text-[11px] font-bold tracking-[0.16em] text-g-90 sm:left-7 sm:top-7">
            OFERTA
          </span>
        )}

        <div className="absolute inset-x-4 bottom-4 flex items-center justify-between gap-4 border border-white/70 bg-white/90 px-4 py-3 shadow-[0_8px_30px_rgba(0,0,0,0.12)] backdrop-blur-sm sm:inset-x-6 sm:bottom-6 sm:px-5 sm:py-4">
          <div className="min-w-0 border-l-2 border-primary pl-3">
            <h3 className="line-clamp-2 text-[18px] font-semibold leading-tight tracking-tight text-g-90 sm:text-[20px]">
              {curso.name}
            </h3>
            {curso.durationMinutes !== null && (
              <p className="mt-1 flex items-center gap-1 text-[11px] text-g-50">
                <Icon icon="solar:clock-circle-linear" width="13" height="13" aria-hidden />
                {formatearDuracion(curso.durationMinutes)}
              </p>
            )}
          </div>

          <div className="shrink-0 text-right">
            <p className="text-[17px] font-semibold leading-tight text-primary sm:text-[19px]">
              {formatearPrecio(enOferta ? (curso.discountPrice as number) : curso.price)}
            </p>
            {enOferta && (
              <p className="mt-0.5 text-[11px] text-g-50 line-through">
                {formatearPrecio(curso.price)}
              </p>
            )}
            {curso.videoUrl && (
              <span className="mt-1 inline-flex items-center gap-0.5 text-[11px] font-medium text-primary">
                Ver curso
                <Icon icon="solar:arrow-right-up-linear" width="12" height="12" aria-hidden />
              </span>
            )}
          </div>
        </div>
      </div>
      </Link>
    </li>
  );
}
