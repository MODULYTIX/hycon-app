import { useEffect, useRef, useState, type ReactNode } from 'react';
import AvisoMuestraAgotada from '@/shared/ui/moleculas/AvisoMuestraAgotada';

interface Props {
  // Enlace firmado que da el backend; caduca solo
  url: string;
  titulo: string;
  // Corta la reproduccion al llegar a este segundo (muestra gratuita)
  limiteSegundos?: number | null;
  alTerminarMuestra?: ReactNode;
}

/**
 * Reproductor de los videos alojados por nosotros. Usa los controles del
 * navegador, que ya traen barra, saltos, volumen y pantalla completa.
 */
export default function ReproductorArchivo({
  url,
  titulo,
  limiteSegundos = null,
  alTerminarMuestra,
}: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [agotada, setAgotada] = useState(false);

  // Al cambiar de parte se vuelve a empezar
  useEffect(() => setAgotada(false), [url, limiteSegundos]);

  // La muestra se para en seco y no deja seguir adelante
  const vigilarLimite = () => {
    const video = videoRef.current;
    if (!video || limiteSegundos === null) return;
    if (video.currentTime < limiteSegundos) return;

    video.pause();
    video.currentTime = limiteSegundos;
    setAgotada(true);
  };

  return (
    <div className="relative aspect-video w-full overflow-hidden bg-black">
      <video
        ref={videoRef}
        src={url}
        controls
        playsInline
        preload="metadata"
        aria-label={`Reproductor: ${titulo}`}
        // Se le quitan al navegador la descarga y el menu con "guardar video"
        controlsList="nodownload noplaybackrate"
        disablePictureInPicture
        onContextMenu={(evento) => evento.preventDefault()}
        onTimeUpdate={vigilarLimite}
        className="h-full w-full"
      />

      {agotada && <AvisoMuestraAgotada>{alTerminarMuestra}</AvisoMuestraAgotada>}
    </div>
  );
}
