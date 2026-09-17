import { beforeEach, describe, expect, it, vi } from 'vitest';
import { act, fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ReproductorYoutube from './ReproductorYoutube';
import * as youtubeApi from '@/shared/servicios/youtube-api';
import { crearYoutubeFalso, ESTADOS, type JugadorFalso } from '@/pruebas/youtube-falso';

vi.mock('@/shared/servicios/youtube-api');

const ID = 'M7lc1UVf-VE';
let jugadores: JugadorFalso[];

const renderizar = async (inicio = 0) => {
  const resultado = render(<ReproductorYoutube id={ID} titulo="Pausas activas" inicio={inicio} />);
  // Espera a que la API "cargue" y cree el reproductor
  await vi.waitFor(() => expect(jugadores).toHaveLength(1));
  return { ...resultado, jugador: jugadores[0] };
};

const listoYReproduciendo = async (jugador: JugadorFalso) => {
  await act(async () => {
    jugador.listo();
    jugador.cambiarEstado(ESTADOS.PLAYING);
  });
};

describe('ReproductorYoutube', () => {
  beforeEach(() => {
    const falso = crearYoutubeFalso();
    jugadores = falso.jugadores;
    vi.mocked(youtubeApi.cargarApiYoutube).mockResolvedValue(falso.api);
  });

  it('crea el reproductor sin cookies y sin la barra ni los atajos de YouTube', async () => {
    const { jugador } = await renderizar(90);

    expect(jugador.opciones.host).toBe('https://www.youtube-nocookie.com');
    expect(jugador.opciones.videoId).toBe(ID);
    expect(jugador.opciones.playerVars).toMatchObject({
      controls: 0,
      disablekb: 1,
      fs: 0,
      rel: 0,
      iv_load_policy: 3,
      start: 90,
    });
    expect(screen.getByTestId('lienzo-video')).toContainElement(jugador.destino);
  });

  it('no hay ningun enlace a YouTube en el reproductor', async () => {
    await renderizar();

    expect(screen.queryByRole('link')).not.toBeInTheDocument();
  });

  it('empieza a reproducir en cuanto esta listo', async () => {
    const { jugador } = await renderizar();

    await act(async () => jugador.listo());

    expect(jugador.playVideo).toHaveBeenCalled();
  });

  it('los controles propios pausan y reanudan', async () => {
    const usuario = userEvent.setup();
    const { jugador } = await renderizar();
    await listoYReproduciendo(jugador);

    await usuario.click(screen.getByRole('button', { name: 'Pausar' }));
    expect(jugador.pauseVideo).toHaveBeenCalled();

    await act(async () => jugador.cambiarEstado(ESTADOS.PAUSED));
    await usuario.click(screen.getByRole('button', { name: 'Reproducir' }));
    expect(jugador.playVideo).toHaveBeenCalledTimes(2);
  });

  it('un clic sobre el video lo pausa en lugar de abrir YouTube', async () => {
    const { jugador } = await renderizar();
    await listoYReproduciendo(jugador);

    fireEvent.click(screen.getByTestId('capa-video'));

    expect(jugador.pauseVideo).toHaveBeenCalled();
  });

  it('muestra el tiempo y deja saltar con la barra de progreso', async () => {
    const { jugador } = await renderizar();
    await listoYReproduciendo(jugador);

    expect(screen.getByText('0:00 / 5:27')).toBeInTheDocument();

    fireEvent.change(screen.getByRole('slider', { name: /progreso del video/i }), {
      target: { value: '120' },
    });

    expect(jugador.seekTo).toHaveBeenCalledWith(120, true);
    expect(screen.getByText('2:00 / 5:27')).toBeInTheDocument();
  });

  it('silencia y vuelve a activar el sonido', async () => {
    const usuario = userEvent.setup();
    const { jugador } = await renderizar();
    await listoYReproduciendo(jugador);

    await usuario.click(screen.getByRole('button', { name: 'Silenciar' }));
    expect(jugador.mute).toHaveBeenCalled();

    await usuario.click(screen.getByRole('button', { name: 'Activar sonido' }));
    expect(jugador.unMute).toHaveBeenCalled();
  });

  it('responde al teclado: espacio pausa y las flechas avanzan 5 segundos', async () => {
    const { jugador } = await renderizar();
    await listoYReproduciendo(jugador);
    const marco = screen.getByRole('region', { name: /reproductor: pausas activas/i });

    fireEvent.keyDown(marco, { key: ' ' });
    expect(jugador.pauseVideo).toHaveBeenCalled();

    fireEvent.keyDown(marco, { key: 'ArrowRight' });
    expect(jugador.seekTo).toHaveBeenCalledWith(5, true);
  });

  it('al terminar vuelve al inicio para no dejar la pantalla final de YouTube', async () => {
    const { jugador } = await renderizar();
    await listoYReproduciendo(jugador);

    await act(async () => jugador.cambiarEstado(ESTADOS.ENDED));

    expect(jugador.seekTo).toHaveBeenCalledWith(0, true);
    expect(jugador.pauseVideo).toHaveBeenCalled();
    expect(screen.getByRole('button', { name: 'Reproducir' })).toBeInTheDocument();
  });

  it('explica sin enlaces cuando el video no se puede insertar', async () => {
    const { jugador } = await renderizar();

    await act(async () => jugador.fallar(150));

    expect(screen.getByRole('alert')).toHaveTextContent(/no permite reproducirlo fuera de YouTube/i);
    expect(screen.queryByRole('link')).not.toBeInTheDocument();
  });

  it('avisa si no se pudo cargar el reproductor', async () => {
    vi.mocked(youtubeApi.cargarApiYoutube).mockRejectedValue(
      new Error('No se pudo cargar el reproductor de video')
    );
    render(<ReproductorYoutube id={ID} titulo="Pausas activas" />);

    expect(await screen.findByRole('alert')).toHaveTextContent(/no se pudo cargar/i);
  });

  it('destruye el reproductor al cerrarse', async () => {
    const { jugador, unmount } = await renderizar();

    unmount();

    expect(jugador.destroy).toHaveBeenCalled();
  });
});
