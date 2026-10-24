import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import PaginaAulaCurso from './PaginaAulaCurso';
import AutenticacionProveedor from '@/features/autenticacion/contexto/AutenticacionProveedor';
import * as cursosApi from '@/features/cursos/servicios/cursos.api';
import * as leccionesApi from '@/features/cursos/servicios/lecciones.api';
import * as autenticacionApi from '@/features/autenticacion/servicios/autenticacion.api';
import * as youtubeApi from '@/shared/servicios/youtube-api';
import { crearYoutubeFalso } from '@/pruebas/youtube-falso';
import { marcarSesionActiva } from '@/shared/utilidades/almacenamiento-sesion';
import type { Sesion } from '@/features/autenticacion/tipos/autenticacion.tipos';
import type { Curso } from '@/features/cursos/tipos/curso.tipos';
import type { Leccion, Temario } from '@/features/cursos/tipos/leccion.tipos';

vi.mock('@/features/cursos/servicios/cursos.api');
vi.mock('@/features/cursos/servicios/lecciones.api');
vi.mock('@/features/autenticacion/servicios/autenticacion.api');
vi.mock('@/shared/servicios/youtube-api');

const UUID = '00000007-0000-4000-8000-000000000000';
const URL_FIRMADA = 'https://bucket.r2.cloudflarestorage.com/hycon/cursos/parte.mp4?X-Amz-Signature=abc';

const curso: Curso = {
  uuid: UUID,
  name: 'Ergonomía en el puesto de trabajo',
  description: 'Un recorrido por los riesgos más comunes.',
  thumbnailUrl: null,
  youtubeId: null,
  videoUrl: null,
  durationMinutes: 150,
  partes: 0,
  previewSegundos: 60,
  price: 150,
  discountPrice: null,
  status: 'active',
  createdAt: '2026-09-17T12:00:00.000Z',
};

const sesion: Sesion = {
  token: 'token-de-prueba',
  expiraEn: 900,
  usuario: {
    userId: 7,
    name: 'Ana',
    lastname: 'Quispe',
    email: 'ana@hycon.com',
    phone: null,
    avatarUrl: null,
    roleId: 2,
    rol: 'CLIENTE',
  },
};

const parte = (cambios: Partial<Leccion> = {}): Leccion => ({
  uuid: '01a0fef2-0000-70bf-a4e4-000000000001',
  titulo: 'Qué es la ergonomía',
  descripcion: 'De qué trata el curso',
  duracionMinutos: 8,
  posicion: 1,
  esMuestra: false,
  bloqueada: false,
  tipoVideo: 'archivo',
  videoUrl: URL_FIRMADA,
  youtubeId: null,
  limiteSegundos: null,
  ...cambios,
});

const segunda = parte({
  uuid: '01a0fef2-0000-70bf-a4e4-000000000002',
  titulo: 'Evaluación de puestos',
  posicion: 2,
  duracionMinutos: 12,
  videoUrl: `${URL_FIRMADA}-2`,
});

const temario = (lecciones: Leccion[], tieneAcceso = true): Temario => ({
  cursoUuid: UUID,
  tieneAcceso,
  previewSegundos: 60,
  lecciones,
});

const renderizar = () =>
  render(
    <AutenticacionProveedor>
      <MemoryRouter initialEntries={[`/cursos/${UUID}/aula`]}>
        <Routes>
          <Route path="/cursos/:uuid" element={<p>Ficha del curso</p>} />
          <Route path="/cursos/:uuid/aula" element={<PaginaAulaCurso />} />
        </Routes>
      </MemoryRouter>
    </AutenticacionProveedor>
  );

const reproductor = (titulo: string) => screen.getByLabelText(`Reproductor: ${titulo}`);

const listaDePartes = () => within(screen.getByRole('list', { name: /partes del curso/i }));

// La parte en curso se anuncia en el temario y encima del titulo: aqui interesa el titulo
const zonaDelVideo = () => within(screen.getByRole('main'));

beforeEach(() => {
  vi.clearAllMocks();
  window.localStorage.clear();
  marcarSesionActiva(true);
  vi.mocked(autenticacionApi.restaurarSesionApi).mockResolvedValue(sesion);
  vi.mocked(cursosApi.obtenerCursoApi).mockResolvedValue(curso);
  vi.mocked(leccionesApi.obtenerTemarioApi).mockResolvedValue(temario([parte(), segunda]));
  vi.mocked(youtubeApi.cargarApiYoutube).mockResolvedValue(crearYoutubeFalso().api);
});

describe('aula del curso', () => {
  it('abre con la primera parte y el temario al lado', async () => {
    renderizar();

    expect(await screen.findByRole('heading', { level: 1, name: 'Qué es la ergonomía' })).toBeInTheDocument();
    expect(reproductor('Qué es la ergonomía')).toHaveAttribute('src', URL_FIRMADA);
    expect(listaDePartes().getAllByRole('listitem')).toHaveLength(2);
    expect(zonaDelVideo().getByText('Parte 1 de 2')).toBeInTheDocument();
  });

  it('el temario lleva el nombre del curso y su duracion total', async () => {
    renderizar();
    await screen.findByRole('list', { name: /partes del curso/i });

    const panel = within(screen.getByRole('complementary', { name: /contenido del curso/i }));
    expect(panel.getByRole('heading', { name: curso.name })).toBeInTheDocument();
    expect(panel.getByText(/20 min/)).toBeInTheDocument();
  });

  it('al elegir otra parte la reproduce y la marca como actual', async () => {
    const usuario = userEvent.setup();
    renderizar();
    await screen.findByRole('list', { name: /partes del curso/i });

    await usuario.click(listaDePartes().getByRole('button', { name: /evaluación de puestos/i }));

    expect(reproductor('Evaluación de puestos')).toHaveAttribute('src', `${URL_FIRMADA}-2`);
    expect(listaDePartes().getByRole('button', { name: /evaluación de puestos/i })).toHaveAttribute(
      'aria-current',
      'true'
    );
    expect(zonaDelVideo().getByText('Parte 2 de 2')).toBeInTheDocument();
  });

  it('avanza y retrocede de parte, y no deja salirse de los extremos', async () => {
    const usuario = userEvent.setup();
    renderizar();
    await screen.findByRole('list', { name: /partes del curso/i });

    expect(screen.getByRole('button', { name: /anterior/i })).toBeDisabled();

    await usuario.click(screen.getByRole('button', { name: /siguiente parte/i }));
    expect(reproductor('Evaluación de puestos')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /siguiente parte/i })).toBeDisabled();

    await usuario.click(screen.getByRole('button', { name: /anterior/i }));
    expect(reproductor('Qué es la ergonomía')).toBeInTheDocument();
  });

  it('el temario se puede ocultar y volver a mostrar', async () => {
    const usuario = userEvent.setup();
    renderizar();
    await screen.findByRole('list', { name: /partes del curso/i });

    await usuario.click(screen.getByRole('button', { name: /ocultar el contenido del curso/i }));
    expect(screen.queryByRole('list', { name: /partes del curso/i })).not.toBeInTheDocument();

    await usuario.click(screen.getByRole('button', { name: /^contenido$/i }));
    expect(screen.getByRole('list', { name: /partes del curso/i })).toBeInTheDocument();
  });

  it('una parte sin video lo dice en lugar de dejar el hueco', async () => {
    vi.mocked(leccionesApi.obtenerTemarioApi).mockResolvedValue(
      temario([parte({ tipoVideo: null, videoUrl: null, youtubeId: null })])
    );
    renderizar();

    expect(await screen.findByText(/todavía no tiene video/i)).toBeInTheDocument();
  });

  // Un curso que se vendio como un solo video se sigue viendo igual
  it('un curso sin partes usa su propio video', async () => {
    vi.mocked(cursosApi.obtenerCursoApi).mockResolvedValue({
      ...curso,
      youtubeId: 'dQw4w9WgXcQ',
      videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    });
    vi.mocked(leccionesApi.obtenerTemarioApi).mockResolvedValue(temario([]));
    renderizar();

    expect(await screen.findByLabelText(`Reproductor: ${curso.name}`)).toBeInTheDocument();
    expect(zonaDelVideo().getByText('Parte 1 de 1')).toBeInTheDocument();
  });
});

describe('quien no deberia estar en el aula', () => {
  it('sin el curso comprado vuelve a la ficha', async () => {
    vi.mocked(leccionesApi.obtenerTemarioApi).mockResolvedValue(temario([parte()], false));
    renderizar();

    expect(await screen.findByText('Ficha del curso')).toBeInTheDocument();
  });

  it('sin sesion vuelve a la ficha', async () => {
    window.localStorage.clear();
    vi.mocked(autenticacionApi.restaurarSesionApi).mockRejectedValue(new Error('sin sesion'));
    renderizar();

    expect(await screen.findByText('Ficha del curso')).toBeInTheDocument();
    expect(leccionesApi.obtenerTemarioApi).not.toHaveBeenCalled();
  });

  it('si algo falla al abrir lo explica y deja volver', async () => {
    vi.mocked(leccionesApi.obtenerTemarioApi).mockRejectedValue(new Error('sin conexión'));
    renderizar();

    expect(await screen.findByRole('alert')).toHaveTextContent(/sin conexión/i);
    expect(screen.getByRole('link', { name: /volver a mis cursos/i })).toHaveAttribute(
      'href',
      '/panel-de-cursos'
    );
  });
});
