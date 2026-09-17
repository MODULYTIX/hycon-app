import { Icon } from '@iconify/react';
import { fechaLarga, minutosDeLectura } from '@/features/publicaciones/utilidades/lectura';
import { textoPlano } from '@/shared/utilidades/texto-enriquecido';

interface Props {
  titulo: string;
  resumen: string;
  contenido: string;
  fecha: string;
  portada: string | null;
}

// Como se vera el articulo en la web, siguiendo el diseño de la vista de articulo
export default function VistaPreviaArticulo({ titulo, resumen, contenido, fecha, portada }: Props) {
  const vacio = textoPlano(contenido) === '';

  return (
    <article aria-label="Vista previa del artículo" className="mx-auto w-full max-w-[760px]">
      <h1 className="text-[28px] font-medium uppercase leading-tight text-g-80 sm:text-[34px]">
        {titulo.trim() || 'Título del artículo'}
      </h1>

      <p className="mt-2 flex flex-wrap items-center gap-x-2 text-[13px] text-g-50">
        <span>{fechaLarga(fecha)}</span>
        <span aria-hidden>·</span>
        <span className="inline-flex items-center gap-1">
          <Icon icon="solar:clock-circle-linear" width="14" height="14" aria-hidden />
          {minutosDeLectura(contenido)} min de lectura
        </span>
      </p>

      <div className="mt-5 aspect-video overflow-hidden rounded-xl bg-g-10">
        {portada ? (
          <img src={portada} alt="" className="h-full w-full object-cover" />
        ) : (
          <span className="flex h-full w-full flex-col items-center justify-center gap-2 text-g-40">
            <Icon icon="solar:gallery-wide-linear" width="44" height="44" aria-hidden />
            <span className="text-[13px]">Sin portada</span>
          </span>
        )}
      </div>

      {resumen.trim() && (
        <p className="mt-6 border-l-4 border-primary pl-4 text-[17px] leading-relaxed text-g-70">
          {resumen.trim()}
        </p>
      )}

      {vacio ? (
        <p className="mt-6 text-[15.5px] text-g-40">El contenido del artículo aparecerá aquí.</p>
      ) : (
        <div
          className="contenido-articulo mt-6 text-[15.5px]"
          // HTML del editor, que solo produce el formato de su barra; lo que llega
          // del servidor ya paso por la limpieza del backend
          dangerouslySetInnerHTML={{ __html: contenido }}
        />
      )}
    </article>
  );
}
