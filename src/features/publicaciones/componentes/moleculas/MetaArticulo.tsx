import { Icon } from '@iconify/react';
import { formatearFecha } from '@/shared/utilidades/formato';
import type { Publicacion } from '@/features/publicaciones/tipos/publicacion.tipos';

// Fecha y tiempo de lectura, la linea que acompana a todo articulo
export default function MetaArticulo({
  publicacion,
  conLectura = true,
  clase = '',
}: {
  publicacion: Publicacion;
  conLectura?: boolean;
  clase?: string;
}) {
  return (
    <p className={`flex flex-wrap items-center gap-x-2 gap-y-1 text-[12px] text-g-50 ${clase}`}>
      <time dateTime={publicacion.publishedAt}>{formatearFecha(publicacion.publishedAt)}</time>
      {conLectura && (
        <>
          <span aria-hidden className="text-g-30">·</span>
          <span className="inline-flex items-center gap-1">
            <Icon icon="solar:clock-circle-linear" width="13" height="13" aria-hidden />
            {publicacion.readingMinutes} min de lectura
          </span>
        </>
      )}
    </p>
  );
}
