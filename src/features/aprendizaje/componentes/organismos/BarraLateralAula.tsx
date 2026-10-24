import { Icon } from '@iconify/react';
import { formatearDuracion } from '@/shared/utilidades/formato';
import type { Leccion } from '@/features/cursos/tipos/leccion.tipos';

interface Props {
  cursoNombre: string;
  partes: Leccion[];
  activaUuid: string | null;
  onElegir: (parte: Leccion) => void;
  onCerrar: () => void;
}

/** El temario del curso mientras se ve: en que parte se esta y a cual se salta. */
export default function BarraLateralAula({
  cursoNombre,
  partes,
  activaUuid,
  onElegir,
  onCerrar,
}: Props) {
  const posicionActual = partes.findIndex((parte) => parte.uuid === activaUuid) + 1;
  const minutos = partes.reduce((suma, parte) => suma + (parte.duracionMinutos ?? 0), 0);

  return (
    <aside
      aria-label="Contenido del curso"
      className="order-2 w-full shrink-0 self-start border-g-20 bg-white lg:sticky lg:top-0 lg:order-1 lg:max-h-screen lg:w-[324px] lg:overflow-y-auto lg:border-r"
    >
      <div className="border-b border-g-20 px-5 py-4">
        <div className="flex items-start gap-3">
          <span
            aria-hidden
            className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-hy-10 text-primary"
          >
            <Icon icon="solar:play-stream-linear" width="19" height="19" />
          </span>

          <div className="min-w-0 flex-1">
            <p className="text-[10.5px] font-semibold uppercase tracking-[0.14em] text-g-50">
              Contenido del curso
            </p>
            <h2 className="mt-1 text-[15px] font-semibold leading-snug text-g-90">{cursoNombre}</h2>
          </div>

          <button
            type="button"
            onClick={onCerrar}
            aria-label="Ocultar el contenido del curso"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-g-50 transition-colors hover:bg-g-5 hover:text-g-80"
          >
            <Icon icon="solar:close-circle-linear" width="18" height="18" aria-hidden />
          </button>
        </div>

        <p className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1 text-[12px] text-g-50">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-g-5 px-2.5 py-1 font-medium text-g-70">
            <Icon icon="solar:play-circle-linear" width="13" height="13" aria-hidden />
            {posicionActual > 0
              ? `Parte ${posicionActual} de ${partes.length}`
              : `${partes.length} partes`}
          </span>
          {minutos > 0 && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-g-5 px-2.5 py-1 font-medium text-g-70">
              <Icon icon="solar:clock-circle-linear" width="13" height="13" aria-hidden />
              {formatearDuracion(minutos)}
            </span>
          )}
        </p>
      </div>

      <ol aria-label="Partes del curso" className="p-2">
        {partes.map((parte, indice) => {
          const esActiva = parte.uuid === activaUuid;

          return (
            <li key={parte.uuid}>
              <button
                type="button"
                onClick={() => onElegir(parte)}
                aria-current={esActiva ? 'true' : undefined}
                className={`relative flex w-full items-start gap-3 rounded-xl px-3 py-2.5 text-left transition-colors ${
                  esActiva ? 'bg-hy-5' : 'hover:bg-g-5'
                }`}
              >
                {esActiva && (
                  <span
                    aria-hidden
                    className="absolute inset-y-2 left-0 w-[3px] rounded-full bg-primary"
                  />
                )}

                <span
                  aria-hidden
                  className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11.5px] font-semibold tabular-nums ${
                    esActiva ? 'bg-primary text-white' : 'bg-g-10 text-g-60'
                  }`}
                >
                  {indice + 1}
                </span>

                <span className="min-w-0 flex-1">
                  <span
                    className={`block text-[13.5px] leading-snug ${
                      esActiva ? 'font-semibold text-primary' : 'font-medium text-g-80'
                    }`}
                  >
                    {parte.titulo}
                  </span>
                  {parte.duracionMinutos !== null && (
                    <span className="mt-1 block text-[11.5px] text-g-50">
                      {formatearDuracion(parte.duracionMinutos)}
                    </span>
                  )}
                </span>

                <Icon
                  icon={esActiva ? 'solar:play-circle-bold' : 'solar:play-circle-linear'}
                  width="17"
                  height="17"
                  aria-hidden
                  className={`mt-0.5 shrink-0 ${esActiva ? 'text-primary' : 'text-g-30'}`}
                />
              </button>
            </li>
          );
        })}
      </ol>
    </aside>
  );
}
