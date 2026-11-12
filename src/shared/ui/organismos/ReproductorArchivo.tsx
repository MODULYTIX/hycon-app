import { useEffect, useRef, useState, type ReactNode } from 'react';
import AvisoMuestraAgotada from '@/shared/ui/moleculas/AvisoMuestraAgotada';
import { estaEnElFinal } from '@/shared/utilidades/final-de-video';

interface Props {
  // Enlace firmado que da el backend; caduca solo
  url: string;
  titulo: string;
  // Corta la reproduccion al llegar a este segundo (muestra gratuita)
  limiteSegundos?: number | null;
  alTerminarMuestra?: ReactNode;
  // Se avisa una vez al llegar al tramo final, aunque se haya saltado hasta ahi
  alLlegarAlFinal?: () => void;
  // Arranca el video solo, sin esperar a que pulsen play
  autoReproducir?: boolean;
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
  alLlegarAlFinal,
  autoReproducir = false,
}: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const avisado = useRef(false);
  const [agotada, setAgotada] = useState(false);

  // Al cambiar de parte se vuelve a empezar
  useEffect(() => {
    setAgotada(false);
    avisado.current = false;
  }, [url, limiteSegundos]);

  // Al pasar solo a la siguiente parte el video empieza sin tocar nada
  useEffect(() => {
    if (!autoReproducir) return;
    // El navegador puede negarse si nadie ha interactuado aun: se queda en pausa y ya
    void videoRef.current?.play?.()?.catch(() => undefined);
  }, [autoReproducir, url]);

  const alAvanzar = () => {
    const video = videoRef.current;
    if (!video) return;

    // En una muestra el final es el del recorte, no el del archivo
    if (limiteSegundos === null && !avisado.current && estaEnElFinal(video.currentTime, video.duration)) {
      avisado.current = true;
      alLlegarAlFinal?.();
    }

    // La muestra se para en seco y no deja seguir adelante
    if (limiteSegundos === null || video.currentTime < limiteSegundos) return;

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
        onTimeUpdate={alAvanzar}
        className="h-full w-full"
      />

      {agotada && <AvisoMuestraAgotada>{alTerminarMuestra}</AvisoMuestraAgotada>}
    </div>
  );
}
