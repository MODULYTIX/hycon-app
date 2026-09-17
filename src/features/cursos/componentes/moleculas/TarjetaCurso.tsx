import { Icon } from '@iconify/react';
import { formatearDuracion, formatearPrecio } from '@/shared/utilidades/formato';
import { miniaturaYoutube } from '@/shared/utilidades/youtube';
import type { Curso } from '@/features/cursos/tipos/curso.tipos';

interface Props {
  curso: Curso;
  onVerAvance: (curso: Curso) => void;
}

// Tarjeta del catalogo publico de cursos
export default function TarjetaCurso({ curso, onVerAvance }: Props) {
  const enOferta = curso.discountPrice !== null;
  const tieneVideo = curso.youtubeId !== null;
  // Sin miniatura propia se usa la del video de YouTube
  const portada = curso.thumbnailUrl ?? (curso.youtubeId ? miniaturaYoutube(curso.youtubeId) : null);

  const imagen = portada ? (
    <img
      src={portada}
      alt={curso.name}
      draggable={false}
      loading="lazy"
      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
    />
  ) : (
    <span aria-hidden className="flex h-full w-full items-center justify-center text-g-30">
      <Icon icon="solar:diploma-linear" width="56" height="56" />
    </span>
  );

  return (
    <li className="group flex flex-col overflow-hidden rounded-xl border border-g-20 bg-white transition-shadow hover:shadow-lg">
      <div className="relative aspect-video overflow-hidden bg-g-5">
        {tieneVideo ? (
          <button
            type="button"
            onClick={() => onVerAvance(curso)}
            aria-label={`Reproducir avance de ${curso.name}`}
            className="block h-full w-full focus-visible:outline-3 focus-visible:-outline-offset-3 focus-visible:outline-primary"
          >
            {imagen}
            <span
              aria-hidden
              className="absolute left-1/2 top-1/2 flex h-14 w-14 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-g-90/75 text-white transition-colors group-hover:bg-primary"
            >
              <Icon icon="solar:play-bold" width="26" height="26" className="ml-0.5" />
            </span>
          </button>
        ) : (
          imagen
        )}

        <span className="pointer-events-none absolute bottom-3 left-3 flex items-center gap-1 rounded-full bg-g-90/80 px-2.5 py-0.5 text-[12px] font-semibold text-white">
          <Icon icon="solar:clock-circle-bold" width="13" height="13" aria-hidden />
          {formatearDuracion(curso.durationMinutes)}
        </span>
      </div>

      <div className="flex flex-1 flex-col gap-1 p-4">
        <h3 className="line-clamp-2 text-[16px] font-semibold text-g-80">{curso.name}</h3>

        {curso.description && (
          <p className="line-clamp-2 text-[14px] text-g-50">{curso.description}</p>
        )}

        <div className="mt-auto flex items-end justify-between pt-3">
          <div>
            <p className={`text-[20px] font-bold ${enOferta ? 'text-primary' : 'text-g-80'}`}>
              {formatearPrecio(enOferta ? (curso.discountPrice as number) : curso.price)}
            </p>
            {enOferta && (
              <p className="text-[13px] text-g-40 line-through">{formatearPrecio(curso.price)}</p>
            )}
          </div>

          {tieneVideo && (
            <button
              type="button"
              onClick={() => onVerAvance(curso)}
              className="inline-flex items-center gap-1 text-[14px] font-semibold text-primary hover:underline"
            >
              <Icon icon="solar:play-circle-linear" width="16" height="16" aria-hidden />
              Ver avance
            </button>
          )}
        </div>
      </div>
    </li>
  );
}
