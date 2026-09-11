import { Icon } from '@iconify/react';
import { formatearDuracion, formatearPrecio } from '@/shared/utilidades/formato';
import type { Curso } from '@/features/cursos/tipos/curso.tipos';

// Tarjeta del catalogo publico de cursos
export default function TarjetaCurso({ curso }: { curso: Curso }) {
  const enOferta = curso.discountPrice !== null;

  return (
    <li className="group flex flex-col overflow-hidden rounded-xl border border-g-20 bg-white transition-shadow hover:shadow-lg">
      <div className="relative aspect-video overflow-hidden bg-g-5">
        {curso.thumbnailUrl ? (
          <img
            src={curso.thumbnailUrl}
            alt={curso.name}
            draggable={false}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <span aria-hidden className="flex h-full w-full items-center justify-center text-g-30">
            <Icon icon="solar:diploma-linear" width="56" height="56" />
          </span>
        )}

        <span className="absolute bottom-3 left-3 flex items-center gap-1 rounded-full bg-g-90/80 px-2.5 py-0.5 text-[12px] font-semibold text-white">
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

          {curso.videoUrl && (
            <a
              href={curso.videoUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 text-[14px] font-semibold text-primary hover:underline"
            >
              Ver avance
              <Icon icon="solar:arrow-right-up-linear" width="14" height="14" aria-hidden />
            </a>
          )}
        </div>
      </div>
    </li>
  );
}
