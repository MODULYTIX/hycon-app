import { Icon } from '@iconify/react';
import { formatearDuracion } from '@/shared/utilidades/formato';
import type { Leccion } from '@/features/cursos/tipos/leccion.tipos';

interface Props {
  lecciones: Leccion[];
  // La que se esta viendo ahora mismo
  activa: string | null;
  onElegir: (leccion: Leccion) => void;
}

// Las partes del curso, en orden. Lo bloqueado se ve pero no se abre.
export default function TemarioCurso({ lecciones, activa, onElegir }: Props) {
  return (
    <ol className="divide-y divide-g-20 overflow-hidden rounded-xl border border-g-20 bg-white">
      {lecciones.map((leccion, indice) => {
        const esActiva = leccion.uuid === activa;

        return (
          <li key={leccion.uuid}>
            <button
              type="button"
              onClick={() => onElegir(leccion)}
              disabled={leccion.bloqueada}
              aria-current={esActiva ? 'true' : undefined}
              className={`flex w-full items-center gap-2 px-3 py-3 sm:gap-3 sm:px-4 text-left transition-colors ${
                esActiva ? 'bg-hy-5' : 'hover:bg-g-5'
              } disabled:cursor-not-allowed disabled:hover:bg-white`}
            >
              <span
                aria-hidden
                className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[12px] font-semibold tabular-nums ${
                  leccion.bloqueada ? 'bg-g-10 text-g-40' : 'bg-hy-10 text-primary'
                }`}
              >
                {indice + 1}
              </span>

              <span className="min-w-0 flex-1">
                <span className="flex flex-wrap items-center gap-2">
                  <span
                    className={`break-words text-[13px] font-medium leading-snug sm:text-[14px] ${
                      leccion.bloqueada ? 'text-g-50' : 'text-g-90'
                    }`}
                  >
                    {leccion.titulo}
                  </span>
                  {leccion.esMuestra && (
                    <span className="rounded-full bg-hy-10 px-2 py-0.5 text-[10.5px] font-semibold uppercase tracking-wide text-primary">
                      Muestra gratis
                    </span>
                  )}
                </span>
                {leccion.descripcion && (
                  <span className="mt-0.5 line-clamp-1 block text-[12.5px] text-g-50">
                    {leccion.descripcion}
                  </span>
                )}
              </span>

              <span className="flex shrink-0 flex-col items-end gap-1 text-[11px] sm:flex-row sm:items-center sm:gap-2 sm:text-[12px] text-g-50">
                {leccion.duracionMinutos !== null && formatearDuracion(leccion.duracionMinutos)}
                <Icon
                  icon={leccion.bloqueada ? 'solar:lock-keyhole-minimalistic-bold' : 'solar:play-circle-bold'}
                  width="18"
                  height="18"
                  aria-label={leccion.bloqueada ? 'Se desbloquea al comprar' : 'Reproducir'}
                  className={leccion.bloqueada ? 'text-g-40' : 'text-primary'}
                />
              </span>
            </button>
          </li>
        );
      })}
    </ol>
  );
}
