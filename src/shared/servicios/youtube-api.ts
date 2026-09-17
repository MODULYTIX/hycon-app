// Tipos minimos de la IFrame Player API de YouTube: solo lo que usa el reproductor
export interface JugadorYoutube {
  playVideo(): void;
  pauseVideo(): void;
  seekTo(segundos: number, permitirBusqueda: boolean): void;
  mute(): void;
  unMute(): void;
  isMuted(): boolean;
  setVolume(volumen: number): void;
  getVolume(): number;
  getCurrentTime(): number;
  getDuration(): number;
  destroy(): void;
}

export interface EventoJugador<T = unknown> {
  target: JugadorYoutube;
  data: T;
}

export interface OpcionesJugador {
  host?: string;
  videoId: string;
  width?: string | number;
  height?: string | number;
  playerVars?: Record<string, string | number>;
  events?: {
    onReady?: (evento: EventoJugador) => void;
    onStateChange?: (evento: EventoJugador<number>) => void;
    onError?: (evento: EventoJugador<number>) => void;
  };
}

export interface ApiYoutube {
  Player: new (destino: HTMLElement, opciones: OpcionesJugador) => JugadorYoutube;
  PlayerState: { ENDED: number; PLAYING: number; PAUSED: number; BUFFERING: number; CUED: number };
}

declare global {
  interface Window {
    YT?: ApiYoutube;
    onYouTubeIframeAPIReady?: () => void;
  }
}

const URL_SCRIPT = 'https://www.youtube.com/iframe_api';

let enCurso: Promise<ApiYoutube> | null = null;

/**
 * Carga el script oficial de YouTube una sola vez para toda la app.
 * Si falla (sin conexion, bloqueador), se puede volver a intentar.
 */
export const cargarApiYoutube = (): Promise<ApiYoutube> => {
  if (window.YT?.Player) return Promise.resolve(window.YT);
  if (enCurso) return enCurso;

  enCurso = new Promise<ApiYoutube>((resolver, rechazar) => {
    const avisoPrevio = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      avisoPrevio?.();
      if (window.YT) resolver(window.YT);
    };

    const script = document.createElement('script');
    script.src = URL_SCRIPT;
    script.async = true;
    script.onerror = () => {
      script.remove();
      enCurso = null;
      rechazar(new Error('No se pudo cargar el reproductor de video'));
    };
    document.head.appendChild(script);
  });

  return enCurso;
};

// Solo para las pruebas: olvida la carga en curso
export const reiniciarCargaYoutube = () => {
  enCurso = null;
};
