import { Icon } from '@iconify/react';
import { Link } from 'react-router-dom';
import { rutaCursoDetalle } from '@/app/rutas/rutas';
import { formatearDuracion, formatearPrecio } from '@/shared/utilidades/formato';
import { miniaturaYoutube } from '@/shared/utilidades/youtube';
import type { Curso } from '@/features/cursos/tipos/curso.tipos';

interface Props {
  curso: Curso;
  onVerAvance?: (curso: Curso) => void;
}

// Mismo formato que el catalogo de productos, con la duracion sobre la miniatura.
export default function TarjetaCurso({ curso, onVerAvance }: Props) {
  const enOferta = curso.discountPrice !== null;
  // Sin miniatura propia se usa la del video de YouTube
  const portada = curso.thumbnailUrl ?? (curso.youtubeId ? miniaturaYoutube(curso.youtubeId) : null);
  const conAvance = Boolean(curso.videoUrl && onVerAvance);

  return (
    <li className="tarjeta-catalogo group flex flex-col overflow-hidden rounded-xl bg-white ring-1 ring-g-20 transition-shadow duration-300 hover:ring-primary/40 hover:shadow-[0_14px_40px_rgba(28,58,57,0.10)]">
      <Link
        to={rutaCursoDetalle(curso.uuid)}
        aria-label={`Ver detalles de ${curso.name}`}
        className="flex flex-1 flex-col outline-offset-2 focus-visible:outline-2 focus-visible:outline-primary"
      >
        <div className="relative aspect-[16/9] overflow-hidden bg-g-5">
          {portada ? (
            <img
              src={portada}
              alt={curso.name}
              draggable={false}
              loading="lazy"
              className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
            />
          ) : (
            <span aria-hidden className="flex h-full w-full items-center justify-center bg-hy-5 text-hy-30">
              <Icon icon="solar:diploma-linear" width="48" height="48" />
            </span>
          )}

          {enOferta && (
            <span className="absolute left-3 top-3 rounded-md bg-secondary px-2 py-1 text-[9px] font-semibold tracking-[0.08em] text-g-90">
              OFERTA
            </span>
          )}

          {curso.durationMinutes !== null && (
            <span className="absolute bottom-4 right-4 inline-flex items-center gap-1 bg-g-90/85 px-2.5 py-1 text-[11px] font-medium text-white">
              <Icon icon="solar:clock-circle-linear" width="13" height="13" aria-hidden />
              {formatearDuracion(curso.durationMinutes)}
            </span>
          )}
        </div>

        <div className="flex flex-1 flex-col gap-2.5 border-t border-g-20 p-4">
          <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-primary">Curso</p>

          <h3 className="line-clamp-2 text-[15px] font-semibold leading-snug tracking-tight text-g-90">
            {curso.name}
          </h3>

          {curso.description && (
            <p className="line-clamp-2 text-[12px] leading-relaxed text-g-50">{curso.description}</p>
          )}

          <div className="mt-auto flex items-end justify-between gap-3 border-t border-g-20 pt-3">
            <div>
              <p className="text-[19px] font-semibold leading-none text-primary">
                {formatearPrecio(enOferta ? (curso.discountPrice as number) : curso.price)}
              </p>
              {enOferta && (
                <p className="mt-1 text-[12px] text-g-50 line-through">{formatearPrecio(curso.price)}</p>
              )}
            </div>

            <span className="inline-flex items-center gap-1 text-[11.5px] font-medium text-g-70 transition-colors group-hover:text-primary">
              Ver detalle
              <Icon
                icon="solar:arrow-right-linear"
                width="15"
                height="15"
                aria-hidden
                className="transition-transform duration-300 group-hover:translate-x-0.5"
              />
            </span>
          </div>
        </div>
      </Link>

      {/* El avance abre el reproductor, por eso va fuera del enlace al detalle */}
      {conAvance && (
        <button
          type="button"
          onClick={() => onVerAvance?.(curso)}
          className="flex items-center justify-center gap-2 border-t border-g-20 bg-g-5 py-2.5 text-[12px] font-medium text-g-70 transition-colors hover:bg-hy-5 hover:text-primary"
        >
          <Icon icon="solar:play-circle-linear" width="16" height="16" aria-hidden />
          Ver avance
        </button>
      )}
    </li>
  );
}
