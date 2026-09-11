import { Icon } from '@iconify/react';
import EtiquetaEstado from '@/features/administracion/componentes/atomos/EtiquetaEstado';
import {
  formatearDuracion,
  formatearFecha,
  formatearPrecio,
} from '@/features/administracion/utilidades/formato';
import type { Curso } from '@/features/administracion/tipos/catalogo.tipos';

export default function FilaCurso({ curso }: { curso: Curso }) {
  const enOferta = curso.discountPrice !== null;

  return (
    <li className="flex flex-col gap-3 px-5 py-4 transition-colors hover:bg-g-5 sm:flex-row sm:items-center">
      {curso.thumbnailUrl ? (
        <img
          src={curso.thumbnailUrl}
          alt=""
          className="h-14 w-14 shrink-0 rounded-lg border border-g-20 object-cover"
        />
      ) : (
        <span
          aria-hidden
          className="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg border border-g-20 bg-g-5"
        >
          <Icon icon="solar:diploma-linear" width="22" height="22" className="text-g-40" />
        </span>
      )}

      <div className="min-w-0 flex-1">
        <p className="truncate text-[16px] font-semibold text-g-80">{curso.name}</p>
        <p className="flex flex-wrap items-center gap-x-1 text-[13px] text-g-50">
          <span>{formatearDuracion(curso.durationMinutes)}</span>
          <span>· Alta {formatearFecha(curso.createdAt)}</span>
          {curso.videoUrl && (
            <>
              <span>·</span>
              <a
                href={curso.videoUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-0.5 text-primary hover:underline"
              >
                Ver video
                <Icon icon="solar:arrow-right-up-linear" width="13" height="13" aria-hidden />
              </a>
            </>
          )}
        </p>
        {curso.description && (
          <p className="mt-1 line-clamp-1 text-[13px] text-g-40">{curso.description}</p>
        )}
      </div>

      <div className="flex shrink-0 flex-wrap items-center gap-3 sm:justify-end">
        <EtiquetaEstado estado={curso.status} />

        <div className="text-right">
          <p className={`text-[17px] font-bold ${enOferta ? 'text-primary' : 'text-g-80'}`}>
            {formatearPrecio(enOferta ? (curso.discountPrice as number) : curso.price)}
          </p>
          {enOferta && (
            <p className="text-[12px] text-g-40 line-through">{formatearPrecio(curso.price)}</p>
          )}
        </div>
      </div>
    </li>
  );
}
