import { vi } from 'vitest';
import type { ApiYoutube, JugadorYoutube, OpcionesJugador } from '@/shared/servicios/youtube-api';

export const ESTADOS = { ENDED: 0, PLAYING: 1, PAUSED: 2, BUFFERING: 3, CUED: 5 };

export interface JugadorFalso extends JugadorYoutube {
  opciones: OpcionesJugador;
  destino: HTMLElement;
  // Simula los avisos que manda YouTube
  listo(): void;
  cambiarEstado(estado: number): void;
  fallar(codigo: number): void;
}

/**
 * API de YouTube de mentira para las pruebas: registra cada reproductor creado
 * y deja disparar sus eventos a mano, sin red ni iframe real.
 */
export const crearYoutubeFalso = () => {
  const jugadores: JugadorFalso[] = [];

  class Player {
    constructor(destino: HTMLElement, opciones: OpcionesJugador) {
      let silenciado = false;
      let tiempo = opciones.playerVars?.start ? Number(opciones.playerVars.start) : 0;

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
        listo: () => opciones.events?.onReady?.({ target: jugador, data: undefined }),
        cambiarEstado: (estado) => opciones.events?.onStateChange?.({ target: jugador, data: estado }),
        fallar: (codigo) => opciones.events?.onError?.({ target: jugador, data: codigo }),
      };
      jugadores.push(jugador);
      return jugador;
    }
  }

  const api = { Player, PlayerState: ESTADOS } as unknown as ApiYoutube;
  return { api, jugadores };
};
