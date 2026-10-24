import { vi } from 'vitest';
import type { ApiYoutube, JugadorYoutube, OpcionesJugador } from '@/shared/servicios/youtube-api';

export const ESTADOS = { ENDED: 0, PLAYING: 1, PAUSED: 2, BUFFERING: 3, CUED: 5 };

export interface JugadorFalso extends JugadorYoutube {
  opciones: OpcionesJugador;
  destino: HTMLElement;
  // Modulos cargados ahora mismo: sirve para comprobar los subtitulos
  modulos: Set<string>;
  // La pista de subtitulos puesta; vacia cuando no se ve ninguna
  pistaPuesta(): Record<string, unknown>;
  // Simula los avisos que manda YouTube
  listo(): void;
  // YouTube anuncia aqui que el modulo de subtitulos ya responde
  apiLista(): void;
  cambiarEstado(estado: number): void;
  fallar(codigo: number): void;
  // Mueve el segundo actual como si el video siguiera corriendo
  avanzarA(segundos: number): void;
}

/**
 * API de YouTube de mentira para las pruebas: registra cada reproductor creado
 * y deja disparar sus eventos a mano, sin red ni iframe real.
 */
export const crearYoutubeFalso = ({ pistas = [] }: { pistas?: { languageCode: string }[] } = {}) => {
  const jugadores: JugadorFalso[] = [];

  class Player {
    constructor(destino: HTMLElement, opciones: OpcionesJugador) {
      let silenciado = false;
      let tiempo = opciones.playerVars?.start ? Number(opciones.playerVars.start) : 0;
      // YouTube trae los subtitulos cargados salvo que se le pida quitarlos
      const modulos = new Set<string>();
      // Hasta que YouTube avisa, el modulo de subtitulos no existe
      let apiAnunciada = false;
      let pistaPuesta: Record<string, unknown> = pistas.length > 0 ? { ...pistas[0] } : {};

      const jugador: JugadorFalso = {
        opciones,
        destino,
        playVideo: vi.fn(),
        pauseVideo: vi.fn(),
        seekTo: vi.fn((segundos: number) => {
          tiempo = segundos;
        }),
        mute: vi.fn(() => {
          silenciado = true;
        }),
        unMute: vi.fn(() => {
          silenciado = false;
        }),
        isMuted: () => silenciado,
        setVolume: vi.fn(),
        getVolume: () => 80,
        getCurrentTime: () => tiempo,
        getDuration: () => 327,
        destroy: vi.fn(),
        modulos,
        loadModule: vi.fn((modulo: string) => {
          if (apiAnunciada && pistas.length > 0) modulos.add(modulo);
        }),
        unloadModule: vi.fn((modulo: string) => {
          modulos.delete(modulo);
        }),
        getOption: vi.fn((modulo: string, opcion: string) => {
          if (modulo !== 'captions' || !modulos.has(modulo)) return undefined;
          return opcion === 'tracklist' ? pistas : pistaPuesta;
        }),
        setOption: vi.fn((modulo: string, opcion: string, valor: unknown) => {
          if (modulo === 'captions' && opcion === 'track') {
            pistaPuesta = (valor ?? {}) as Record<string, unknown>;
          }
        }),
        pistaPuesta: () => pistaPuesta,
        listo: () => opciones.events?.onReady?.({ target: jugador, data: undefined }),
        apiLista: () => {
          apiAnunciada = true;
          if (pistas.length > 0) {
            modulos.add('captions');
            pistaPuesta = { ...pistas[0] };
          }
          opciones.events?.onApiChange?.({ target: jugador, data: undefined });
        },
        cambiarEstado: (estado) => opciones.events?.onStateChange?.({ target: jugador, data: estado }),
        fallar: (codigo) => opciones.events?.onError?.({ target: jugador, data: codigo }),
        avanzarA: (segundos: number) => {
          tiempo = segundos;
        },
      };
      jugadores.push(jugador);
      return jugador;
    }
  }

  const api = { Player, PlayerState: ESTADOS } as unknown as ApiYoutube;
  return { api, jugadores };
};
