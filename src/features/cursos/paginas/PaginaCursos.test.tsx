import { describe, expect, it, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import PaginaCursos from './PaginaCursos';
import * as api from '@/features/cursos/servicios/cursos.api';
import * as youtubeApi from '@/shared/servicios/youtube-api';
import { crearYoutubeFalso, type JugadorFalso } from '@/pruebas/youtube-falso';
import type { Curso } from '@/features/cursos/tipos/curso.tipos';

vi.mock('@/features/cursos/servicios/cursos.api');
vi.mock('@/shared/servicios/youtube-api');

let jugadores: JugadorFalso[];

const curso: Curso = {
  courseId: 1,
  name: 'Logistica de ultima milla',
  description: 'Ruteo y tiempos de entrega',
  videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ&t=1m30s',
  youtubeId: 'dQw4w9WgXcQ',
  thumbnailUrl: null,
  durationMinutes: 150,
  price: 199,
  discountPrice: 149,
  status: 'active',
  createdAt: '2026-09-10T12:00:00.000Z',
};

const pagina = (elementos: Curso[], extra = {}) => ({
  elementos,
  paginacion: { pagina: 1, porPagina: 6, total: elementos.length, totalPaginas: 1, ...extra },
});

const renderizar = () =>
  render(
    <MemoryRouter>
      <PaginaCursos />
    </MemoryRouter>
  );

describe('PaginaCursos (publica)', () => {
  beforeEach(() => {
    const falso = crearYoutubeFalso();
    jugadores = falso.jugadores;
    vi.mocked(youtubeApi.cargarApiYoutube).mockResolvedValue(falso.api);
    vi.mocked(api.listarCursosApi).mockResolvedValue(pagina([curso]));
  });

  it('pide al backend solo los cursos activos', async () => {
    renderizar();
    await screen.findByText('Logistica de ultima milla');

    expect(api.listarCursosApi).toHaveBeenCalledWith('active', 1, expect.anything());
  });

  it('muestra duracion, precio de oferta y enlace al detalle', async () => {
    renderizar();

    const tarjeta = within(
      await screen.findByRole('list', { name: /catalogo de cursos/i })
    ).getByRole('listitem');

    expect(within(tarjeta).getByText('2 h 30 min')).toBeInTheDocument();
    expect(within(tarjeta).getByText(/149\.00/)).toBeInTheDocument();
    expect(within(tarjeta).getByRole('link', { name: /ver detalles de logistica/i })).toHaveAttribute(
      'href',
      '/cursos/1'
    );
  });

  it('sin miniatura propia usa la del video de YouTube', async () => {
    renderizar();

    expect(await screen.findByAltText('Logistica de ultima milla')).toHaveAttribute(
      'src',
      'https://i.ytimg.com/vi/dQw4w9WgXcQ/hqdefault.jpg'
    );
  });

  it('el avance se reproduce dentro de la web, sin enlazar a YouTube', async () => {
    const usuario = userEvent.setup();
    renderizar();
    await screen.findByText('Logistica de ultima milla');

    // Hasta abrirlo no se carga ningun reproductor
    expect(youtubeApi.cargarApiYoutube).not.toHaveBeenCalled();
    expect(screen.queryByRole('link', { name: /ver avance/i })).not.toBeInTheDocument();

    await usuario.click(screen.getByRole('button', { name: /ver avance/i }));

    const dialogo = await screen.findByRole('dialog', { name: 'Logistica de ultima milla' });
    await waitFor(() => expect(jugadores).toHaveLength(1));
    expect(jugadores[0].opciones.videoId).toBe('dQw4w9WgXcQ');
    // Respeta el minuto del link
    expect(jugadores[0].opciones.playerVars).toMatchObject({ start: 90, controls: 0 });
    expect(within(dialogo).getByRole('region', { name: /reproductor/i })).toBeInTheDocument();
    // Nada dentro del modal lleva a YouTube
    expect(within(dialogo).queryByRole('link')).not.toBeInTheDocument();

    await usuario.keyboard('{Escape}');
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    expect(jugadores[0].destroy).toHaveBeenCalled();
  });



  it('un curso sin video no ofrece reproducirlo', async () => {
    vi.mocked(api.listarCursosApi).mockResolvedValue(
      pagina([{ ...curso, videoUrl: null, youtubeId: null }])
    );
    renderizar();
    await screen.findByText('Logistica de ultima milla');

    expect(screen.queryByRole('button', { name: /ver avance/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /reproducir avance/i })).not.toBeInTheDocument();
  });

  it('muestra un estado vacio si no hay cursos', async () => {
    vi.mocked(api.listarCursosApi).mockResolvedValue(pagina([]));
    renderizar();

    expect(await screen.findByText(/todavia no hay cursos publicados/i)).toBeInTheDocument();
  });

  it('pagina los cursos cuando hay mas de 6', async () => {
    const usuario = userEvent.setup();
    vi.mocked(api.listarCursosApi).mockImplementation(async (_estado, numero) =>
      numero === 1
        ? pagina([curso], { total: 7, totalPaginas: 2 })
        : pagina([{ ...curso, courseId: 7, name: 'Pausas activas' }], {
            pagina: 2,
            total: 7,
            totalPaginas: 2,
          })
    );
    renderizar();
    await screen.findByText('Logistica de ultima milla');

    await usuario.click(screen.getByRole('button', { name: /pagina siguiente/i }));

    expect(await screen.findByText('Pausas activas')).toBeInTheDocument();
    expect(api.listarCursosApi).toHaveBeenLastCalledWith('active', 2, expect.anything());
  });
});
