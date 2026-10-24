import { useEffect, useState, type ReactNode } from 'react';
import { Icon } from '@iconify/react';
import AvisoMuestraAgotada from '@/shared/ui/moleculas/AvisoMuestraAgotada';

interface Props {
  // Enlace del reproductor del proveedor, ya firmado
  url: string;
  titulo: string;
  // Corta la muestra al llegar a este segundo
  limiteSegundos?: number | null;
  alTerminarMuestra?: ReactNode;
}

const conAutoplay = (url: string) => `${url}${url.includes('?') ? '&' : '?'}autoplay=true`;

/**
 * Reproductor del proveedor dentro de la web (Cloudflare Stream). El video se
 * sirve en varias calidades y nunca se descarga completo.
 */
export default function ReproductorIncrustado({
  url,
  titulo,
  limiteSegundos = null,
  alTerminarMuestra,
}: Props) {
  const [viendo, setViendo] = useState(false);
  const [agotada, setAgotada] = useState(false);

  useEffect(() => {
    setViendo(false);
    setAgotada(false);
  }, [url, limiteSegundos]);

  /**
   * La cuenta empieza al dar al play: el reproductor es del proveedor y no nos
   * dice por que segundo va, asi que la muestra se mide con el reloj.
   */
  useEffect(() => {
    if (!viendo || limiteSegundos === null) return;

    const temporizador = setTimeout(() => {
      setViendo(false);
      setAgotada(true);
    }, limiteSegundos * 1000);

    return () => clearTimeout(temporizador);
  }, [viendo, limiteSegundos]);

  return (
    <div className="relative aspect-video w-full overflow-hidden bg-black">
      {viendo && (
        <iframe
          src={conAutoplay(url)}
          title={`Reproductor: ${titulo}`}
          allow="accelerometer; gyroscope; encrypted-media; picture-in-picture;"
          allowFullScreen
          className="absolute inset-0 h-full w-full border-0"
        />
      )}

      {!viendo && !agotada && (
        <button
          type="button"
          onClick={() => setViendo(true)}
          className="group absolute inset-0 flex flex-col items-center justify-center gap-4 px-6 text-center focus-visible:outline-2 focus-visible:-outline-offset-4 focus-visible:outline-white"
        >
          <span className="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-white shadow-lg transition-transform group-hover:scale-105 sm:h-20 sm:w-20">
            <Icon icon="solar:play-bold" width="34" height="34" aria-hidden className="ml-1" />
          </span>
          <span className="line-clamp-2 text-[13px] font-medium text-white/80 sm:text-[15px]">
            {titulo}
          </span>
        </button>
      )}

      {agotada && <AvisoMuestraAgotada>{alTerminarMuestra}</AvisoMuestraAgotada>}
    </div>
  );
}
