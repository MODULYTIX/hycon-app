import { Icon } from '@iconify/react';

// Portada del articulo; si no tiene, deja un marcador con el color de marca
export default function PortadaArticulo({
  url,
  titulo,
  clase = '',
  tamanoIcono = 48,
}: {
  url: string | null;
  titulo: string;
  clase?: string;
  tamanoIcono?: number;
}) {
  return (
    <div className={`relative overflow-hidden bg-hy-5 ${clase}`}>
      {url ? (
        <img
          src={url}
          alt={titulo}
          loading="lazy"
          draggable={false}
          className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
        />
      ) : (
        <span aria-hidden className="flex h-full w-full items-center justify-center text-primary/30">
          <Icon icon="solar:document-text-linear" width={tamanoIcono} height={tamanoIcono} />
        </span>
      )}
    </div>
  );
}
