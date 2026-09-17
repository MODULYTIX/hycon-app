import { Icon } from '@iconify/react';
import EtiquetaEstado from '@/shared/ui/atomos/EtiquetaEstado';
import AccionesFila from '@/shared/ui/moleculas/AccionesFila';
import Miniatura from '@/shared/ui/moleculas/Miniatura';
import { formatearDuracion, formatearPrecio } from '@/shared/utilidades/formato';
import type { Curso } from '@/features/cursos/tipos/curso.tipos';

export const COLUMNAS_CURSO = 'lg:grid-cols-[minmax(0,1fr)_130px_110px_110px_88px]';

interface Props {
  curso: Curso;
  onEditar: (curso: Curso) => void;
  onEliminar: (curso: Curso) => void;
}

export default function FilaCurso({ curso, onEditar, onEliminar }: Props) {
  const enOferta = curso.discountPrice !== null;

  return (
    <li className={`grid gap-3 px-4 py-4 transition-colors hover:bg-hy-5/60 sm:px-5 lg:items-center lg:gap-4 ${COLUMNAS_CURSO}`}>
      <div className="flex min-w-0 gap-3.5">
        <Miniatura url={curso.thumbnailUrl} iconoReserva="solar:diploma-linear" clase="h-16 w-24" />

        <div className="min-w-0 flex-1 self-center">
          <p className="truncate text-[15px] font-semibold text-hy-tinta">{curso.name}</p>
          {curso.description && (
            <p className="line-clamp-1 text-[13px] text-g-50">{curso.description}</p>
          )}
          {curso.videoUrl && (
            <a
              href={curso.videoUrl}
              target="_blank"
              rel="noreferrer"
              className="mt-1 inline-flex items-center gap-1 text-[12.5px] font-semibold text-hy-60 hover:text-hy-80 hover:underline"
            >
              <Icon icon="solar:play-circle-linear" width="14" height="14" aria-hidden />
              Ver video
            </a>
          )}
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 border-t border-hy-10 pt-3 lg:contents">
        <div>
          <p className={`text-[15px] font-bold ${enOferta ? 'text-hy-60' : 'text-hy-tinta'}`}>
            {formatearPrecio(enOferta ? (curso.discountPrice as number) : curso.price)}
          </p>
          {enOferta && (
            <p className="text-[12px] text-g-40 line-through">{formatearPrecio(curso.price)}</p>
          )}
        </div>

        <p className="flex items-center gap-1 text-[14px] text-g-60">
          <Icon icon="solar:clock-circle-linear" width="15" height="15" aria-hidden className="lg:hidden" />
          {formatearDuracion(curso.durationMinutes)}
        </p>

        <div>
          <EtiquetaEstado estado={curso.status} />
        </div>

        <AccionesFila
          nombre={curso.name}
          onEditar={() => onEditar(curso)}
          onEliminar={() => onEliminar(curso)}
        />
      </div>
    </li>
  );
}
