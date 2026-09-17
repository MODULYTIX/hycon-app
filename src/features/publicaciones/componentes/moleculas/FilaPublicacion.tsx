import { Icon } from '@iconify/react';
import EtiquetaEstado from '@/shared/ui/atomos/EtiquetaEstado';
import AccionesFila from '@/shared/ui/moleculas/AccionesFila';
import Miniatura from '@/shared/ui/moleculas/Miniatura';
import { formatearFecha } from '@/shared/utilidades/formato';
import { textoPlano } from '@/shared/utilidades/texto-enriquecido';
import {
  TEXTOS_ESTADO_PUBLICACION,
  type Publicacion,
} from '@/features/publicaciones/tipos/publicacion.tipos';

export const COLUMNAS_PUBLICACION = 'lg:grid-cols-[minmax(0,1fr)_120px_100px_110px_88px]';

interface Props {
  publicacion: Publicacion;
  onEditar: (publicacion: Publicacion) => void;
  onEliminar: (publicacion: Publicacion) => void;
}

export default function FilaPublicacion({ publicacion, onEditar, onEliminar }: Props) {
  const lecturas = publicacion.views;

  return (
    <li
      className={`grid gap-3 px-4 py-4 transition-colors hover:bg-hy-5/60 sm:px-5 lg:items-center lg:gap-4 ${COLUMNAS_PUBLICACION}`}
    >
      <div className="flex min-w-0 gap-3.5">
        <Miniatura
          url={publicacion.coverUrl}
          iconoReserva="solar:document-text-linear"
          clase="h-16 w-24"
        />

        <div className="min-w-0 flex-1 self-center">
          <p className="line-clamp-2 text-[15px] font-semibold leading-snug text-hy-tinta">
            {publicacion.title}
          </p>
          <p className="line-clamp-1 text-[13px] text-g-50">
            {publicacion.excerpt ?? textoPlano(publicacion.content)}
          </p>
          <p className="mt-1 flex items-center gap-1 text-[12px] text-g-40">
            <Icon icon="solar:clock-circle-linear" width="13" height="13" aria-hidden />
            {publicacion.readingMinutes} min de lectura
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 border-t border-hy-10 pt-3 lg:contents">
        <p className="flex items-center gap-1.5 text-[14px] text-g-60">
          <Icon icon="solar:calendar-linear" width="15" height="15" aria-hidden className="lg:hidden" />
          {formatearFecha(publicacion.publishedAt)}
        </p>

        <p className="flex items-center gap-1.5 text-[14px] text-g-60">
          <Icon icon="solar:eye-linear" width="15" height="15" aria-hidden className="text-g-40" />
          <span>
            {lecturas}
            <span className="lg:sr-only"> {lecturas === 1 ? 'lectura' : 'lecturas'}</span>
          </span>
        </p>

        <div>
          <EtiquetaEstado estado={publicacion.status} textos={TEXTOS_ESTADO_PUBLICACION} />
        </div>

        <AccionesFila
          nombre={publicacion.title}
          onEditar={() => onEditar(publicacion)}
          onEliminar={() => onEliminar(publicacion)}
        />
      </div>
    </li>
  );
}
