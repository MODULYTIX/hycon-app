import { useCallback, useEffect, useRef, useState, type RefObject } from 'react';
import { cargarApiYoutube, type JugadorYoutube } from '@/shared/servicios/youtube-api';
import {
  HOST_YOUTUBE_SIN_COOKIES,
  mensajeErrorYoutube,
  parametrosReproductor,
} from '@/shared/utilidades/youtube';

export interface EstadoReproductor {
  listo: boolean;
  reproduciendo: boolean;
  terminado: boolean;
  actual: number;
  duracion: number;
  silenciado: boolean;
  volumen: number;
  error: string | null;
}

const ESTADO_INICIAL: EstadoReproductor = {
  listo: false,
  reproduciendo: false,
  terminado: false,
  actual: 0,
  duracion: 0,
  silenciado: false,
  volumen: 100,
  error: null,
};

// Cada cuanto se lee el segundo actual para mover la barra de progreso
const INTERVALO_PROGRESO_MS = 250;

/**
 * Monta el reproductor oficial de YouTube dentro de `contenedor` y expone su estado
 * y acciones para que la interfaz pinte sus propios controles.
 */
export function useReproductorYoutube(
  id: string,
  inicio: number,
  contenedor: RefObject<HTMLDivElement | null>
) {
  const jugadorRef = useRef<JugadorYoutube | null>(null);
  const [estado, setEstado] = useState<EstadoReproductor>(ESTADO_INICIAL);

  useEffect(() => {
    let cancelado = false;
    let intervalo: ReturnType<typeof setInterval> | undefined;
    setEstado(ESTADO_INICIAL);

    cargarApiYoutube()
      .then((YT) => {
        if (cancelado || !contenedor.current) return;

        // YouTube sustituye este div por su iframe; React nunca lo toca
        const destino = document.createElement('div');
        contenedor.current.appendChild(destino);

        jugadorRef.current = new YT.Player(destino, {
          host: HOST_YOUTUBE_SIN_COOKIES,
          videoId: id,
          width: '100%',
          height: '100%',
          playerVars: parametrosReproductor(inicio, window.location.origin),
          events: {
            onReady: ({ target }) => {
              if (cancelado) return;
              setEstado((previo) => ({
                ...previo,
                listo: true,
                duracion: target.getDuration(),
                silenciado: target.isMuted(),
                volumen: target.getVolume(),
              }));
              target.playVideo();
            },
            onStateChange: ({ target, data }) => {
              if (cancelado) return;
              if (data === YT.PlayerState.ENDED) {
                // Al terminar se vuelve al inicio en pausa para no dejar a la vista
                // la pantalla final de YouTube con sus sugerencias
                target.seekTo(0, true);
                target.pauseVideo();
              }
              setEstado((previo) => ({
                ...previo,
                reproduciendo: data === YT.PlayerState.PLAYING,
                terminado: data === YT.PlayerState.ENDED,
              }));
            },
            onError: ({ data }) => {
              if (!cancelado) setEstado((previo) => ({ ...previo, error: mensajeErrorYoutube(data) }));
            },
          },
        });

        intervalo = setInterval(() => {
          const jugador = jugadorRef.current;
          if (!jugador?.getCurrentTime) return;
          const actual = jugador.getCurrentTime();
          const duracion = jugador.getDuration();
          setEstado((previo) =>
            previo.actual === actual && previo.duracion === duracion
              ? previo
              : { ...previo, actual, duracion: duracion || previo.duracion }
          );
        }, INTERVALO_PROGRESO_MS);
      })
      .catch((fallo: unknown) => {
        if (cancelado) return;
        setEstado((previo) => ({
          ...previo,
          error: fallo instanceof Error ? fallo.message : 'No se pudo cargar el reproductor',
        }));
      });

    return () => {
      cancelado = true;
      clearInterval(intervalo);
      jugadorRef.current?.destroy();
      jugadorRef.current = null;
    };
  }, [id, inicio, contenedor]);

  const alternarReproduccion = useCallback(() => {
    const jugador = jugadorRef.current;
    if (!jugador || !estado.listo) return;
    if (estado.reproduciendo) jugador.pauseVideo();
    else jugador.playVideo();
  }, [estado.listo, estado.reproduciendo]);

  const buscar = useCallback(
    (segundos: number) => {
      const jugador = jugadorRef.current;
      if (!jugador || !estado.listo) return;
      const destino = Math.min(Math.max(segundos, 0), estado.duracion || segundos);
      jugador.seekTo(destino, true);
      setEstado((previo) => ({ ...previo, actual: destino }));
    },
    [estado.listo, estado.duracion]
  );

  const alternarSonido = useCallback(() => {
    const jugador = jugadorRef.current;
    if (!jugador || !estado.listo) return;
    if (estado.silenciado) jugador.unMute();
    else jugador.mute();
    setEstado((previo) => ({ ...previo, silenciado: !previo.silenciado }));
  }, [estado.listo, estado.silenciado]);

  const cambiarVolumen = useCallback(
    (volumen: number) => {
      const jugador = jugadorRef.current;
      if (!jugador || !estado.listo) return;
      jugador.setVolume(volumen);
      // Subir el volumen desde cero equivale a quitar el silencio
      if (volumen > 0 && estado.silenciado) jugador.unMute();
      if (volumen === 0) jugador.mute();
      setEstado((previo) => ({ ...previo, volumen, silenciado: volumen === 0 }));
    },
    [estado.listo, estado.silenciado]
  );

  return { estado, alternarReproduccion, buscar, alternarSonido, cambiarVolumen };
}
