import { Icon } from '@iconify/react';
import { Link } from 'react-router-dom';
import { rutaCursoDetalle } from '@/app/rutas/rutas';
import { formatearDuracion, formatearFecha } from '@/shared/utilidades/formato';
import { miniaturaYoutube } from '@/shared/utilidades/youtube';
import type { CursoComprado } from '@/features/aprendizaje/tipos/aprendizaje.tipos';

// Un curso al que ya tiene acceso: portada, datos y entrada al contenido
export default function TarjetaCursoComprado({ curso }: { curso: CursoComprado }) {
  // Sin miniatura propia se usa la del video
  const portada = curso.thumbnailUrl ?? (curso.youtubeId ? miniaturaYoutube(curso.youtubeId) : null);

  return (
    <li className="group flex flex-col overflow-hidden rounded-xl border border-g-20 bg-white shadow-sm transition-shadow duration-300 hover:shadow-[0_14px_40px_rgba(28,58,57,0.10)]">
      <Link to={rutaCursoDetalle(curso.uuid)} tabIndex={-1} aria-hidden className="block">
        <div className="relative aspect-[16/8] overflow-hidden bg-g-5">
          {portada ? (
            <img
              src={portada}
              alt=""
              loading="lazy"
              className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
            />
          ) : (
            <span className="flex h-full w-full items-center justify-center text-hy-30">
              <Icon icon="solar:diploma-linear" width="56" height="56" />
            </span>
          )}

          <span className="absolute left-3 top-3 rounded-md bg-primary px-3 py-1.5 text-[10.5px] font-bold uppercase tracking-[0.16em] text-white">
            Con acceso
          </span>

          {curso.durationMinutes !== null && (
            <span className="absolute bottom-3 right-3 inline-flex rounded-md items-center gap-1 bg-g-90/85 px-2.5 py-1 text-[11px] font-medium text-white">
              <Icon icon="solar:clock-circle-linear" width="13" height="13" aria-hidden />
              {formatearDuracion(curso.durationMinutes)}
            </span>
          )}
        </div>
      </Link>

      <div className="flex flex-1 flex-col gap-2 border-t border-g-20 p-4">
        <h3 className="line-clamp-2 text-[16px] font-semibold leading-snug text-g-90">
          <Link
            to={rutaCursoDetalle(curso.uuid)}
            className="outline-offset-4 hover:text-primary focus-visible:outline-2 focus-visible:outline-primary"
          >
            {curso.name}
          </Link>
        </h3>

        {curso.description && (
          <p className="line-clamp-2 text-[13px] leading-relaxed text-g-50">{curso.description}</p>
        )}

        <p className="mt-auto pt-2 text-[12px] text-g-50">
          Comprado el {formatearFecha(curso.compradoEl)}
        </p>

        <Link
          to={rutaCursoDetalle(curso.uuid)}
          className="mt-2 inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-primary text-[13px] font-medium text-white transition-colors hover:bg-marca-oscuro"
        >
          <Icon icon="solar:play-circle-linear" width="16" height="16" aria-hidden />
          Entrar al curso
        </Link>
      </div>
    </li>
  );
}
