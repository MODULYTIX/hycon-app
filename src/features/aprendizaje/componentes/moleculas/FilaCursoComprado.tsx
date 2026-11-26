import { Icon } from '@iconify/react';
import { Link } from 'react-router-dom';
import { rutaAulaCurso, rutaCertificadoCurso } from '@/app/rutas/rutas';
import { formatearDuracion, formatearFecha } from '@/shared/utilidades/formato';
import { miniaturaYoutube } from '@/shared/utilidades/youtube';
import { ACCION, estadoDe, porcentajeVisto } from '@/features/aprendizaje/utilidades/panel-aprendizaje';
import type { CursoComprado } from '@/features/aprendizaje/tipos/aprendizaje.tipos';

// Por donde va el curso, en una linea
function Avance({ curso }: { curso: CursoComprado }) {
  if (curso.partes === 0) return null;

  return (
    <div className="mt-2 max-w-[420px]">
      <p className="flex items-center gap-2 text-[12.5px] text-g-50">
        <span>
          {curso.vistas} de {curso.partes} {curso.partes === 1 ? 'parte' : 'partes'}
        </span>
        <span aria-hidden className="text-g-30">
          ·
        </span>
        {curso.completado ? (
          <span className="inline-flex items-center gap-1 font-medium text-primary">
            <Icon icon="solar:check-circle-bold" width="14" height="14" aria-hidden />
            Terminado
          </span>
        ) : (
          <span>{porcentajeVisto(curso)}% completado</span>
        )}
      </p>

      <div
        role="progressbar"
        aria-label={`Avance de ${curso.name}`}
        aria-valuenow={curso.vistas}
        aria-valuemin={0}
        aria-valuemax={curso.partes}
        className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-g-10"
      >
        <div className="h-full bg-primary" style={{ width: `${porcentajeVisto(curso)}%` }} />
      </div>
    </div>
  );
}

/** Un curso comprado, en fila: se lee de un vistazo por donde va y como seguir. */
export default function FilaCursoComprado({ curso }: { curso: CursoComprado }) {
  const portada = curso.thumbnailUrl ?? (curso.youtubeId ? miniaturaYoutube(curso.youtubeId) : null);

  return (
    <li className="flex flex-col gap-4 rounded-xl border border-g-20 bg-white p-4 transition-colors hover:border-hy-30 sm:flex-row sm:items-center">
      <Link
        to={rutaAulaCurso(curso.uuid)}
        tabIndex={-1}
        aria-hidden
        className="relative block aspect-[16/9] w-full shrink-0 overflow-hidden rounded-lg bg-g-5 sm:aspect-auto sm:h-[72px] sm:w-[128px]"
      >
        {portada ? (
          <img src={portada} alt="" loading="lazy" className="h-full w-full object-cover" />
        ) : (
          <span className="flex h-full w-full items-center justify-center text-hy-30">
            <Icon icon="solar:diploma-linear" width="28" height="28" />
          </span>
        )}
      </Link>

      <div className="min-w-0 flex-1">
        <h3 className="text-[15.5px] font-semibold leading-snug text-g-90">
          <Link
            to={rutaAulaCurso(curso.uuid)}
            className="outline-offset-4 hover:text-primary focus-visible:outline-2 focus-visible:outline-primary"
          >
            {curso.name}
          </Link>
        </h3>

        <p className="mt-0.5 text-[12px] text-g-50">
          Comprado el {formatearFecha(curso.compradoEl)}
          {curso.durationMinutes !== null && ` · ${formatearDuracion(curso.durationMinutes)}`}
        </p>

        <Avance curso={curso} />
      </div>

      <div className="flex shrink-0 flex-col gap-2 sm:w-[170px]">
        <Link
          to={rutaAulaCurso(curso.uuid)}
          className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-primary px-4 text-[13px] font-medium text-white transition-colors hover:bg-marca-oscuro"
        >
          <Icon icon="solar:play-circle-linear" width="16" height="16" aria-hidden />
          {ACCION[estadoDe(curso)]}
        </Link>

        {/* El certificado aparece al terminar todas las partes */}
        {(curso.completado || curso.certificado) && (
          <Link
            to={rutaCertificadoCurso(curso.uuid)}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-g-30 px-4 text-[13px] font-medium text-g-70 transition-colors hover:border-primary hover:text-primary"
          >
            <Icon icon="solar:diploma-linear" width="16" height="16" aria-hidden />
            {curso.certificado ? 'Ver certificado' : 'Obtener certificado'}
          </Link>
        )}
      </div>
    </li>
  );
}
