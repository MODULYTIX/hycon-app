import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import PaginaMisCursos from './PaginaMisCursos';
import AutenticacionProveedor from '@/features/autenticacion/contexto/AutenticacionProveedor';
import * as api from '@/features/aprendizaje/servicios/aprendizaje.api';
import * as autenticacionApi from '@/features/autenticacion/servicios/autenticacion.api';
import { marcarSesionActiva } from '@/shared/utilidades/almacenamiento-sesion';
import type { CursoComprado } from '@/features/aprendizaje/tipos/aprendizaje.tipos';
import type { Sesion } from '@/features/autenticacion/tipos/autenticacion.tipos';

vi.mock('@/features/aprendizaje/servicios/aprendizaje.api');
vi.mock('@/features/autenticacion/servicios/autenticacion.api');

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

const logistica: CursoComprado = {
  uuid: 'b7b299d8-ee8f-4bea-a618-0a5f8261136f',
  name: 'Logistica de ultima milla',
  description: 'Ruteo y tiempos de entrega',
  videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
  youtubeId: 'dQw4w9WgXcQ',
  thumbnailUrl: null,
  durationMinutes: 150,
  compradoEl: '2026-10-07T12:00:00.000Z',
};

const renderizar = () =>
  render(
    <AutenticacionProveedor>
      <MemoryRouter>
        <PaginaMisCursos />
      </MemoryRouter>
    </AutenticacionProveedor>
  );

const conSesion = () => {
  marcarSesionActiva(true);
  vi.mocked(autenticacionApi.restaurarSesionApi).mockResolvedValue(sesion);
};

describe('PaginaMisCursos', () => {
  beforeEach(() => {
    window.localStorage.clear();
    vi.mocked(autenticacionApi.restaurarSesionApi).mockRejectedValue(new Error('sin sesion'));
    vi.mocked(api.listarMisCursosApi).mockResolvedValue([logistica]);
  });

  it('sin sesion no consulta nada y pide entrar', async () => {
    renderizar();

    expect(await screen.findByText(/entra a tu cuenta para ver tus cursos/i)).toBeInTheDocument();
    expect(api.listarMisCursosApi).not.toHaveBeenCalled();
  });

  it('muestra cada curso con su duracion, la fecha de compra y la entrada al contenido', async () => {
    conSesion();
    renderizar();

    const tarjeta = (await screen.findByRole('heading', { name: logistica.name })).closest(
      'li'
    ) as HTMLElement;
    const curso = within(tarjeta);

    expect(curso.getByText('Con acceso')).toBeInTheDocument();
    expect(curso.getByText('2 h 30 min')).toBeInTheDocument();
    expect(curso.getByText(/comprado el 07\/10\/2026/i)).toBeInTheDocument();
    expect(curso.getByRole('link', { name: /entrar al curso/i })).toHaveAttribute(
      'href',
      `/cursos/${logistica.uuid}`
    );
  });

  it('sin miniatura propia usa la del video', async () => {
    conSesion();
    renderizar();
    await screen.findByRole('heading', { name: logistica.name });

    expect(document.querySelector('img')).toHaveAttribute(
      'src',
      'https://i.ytimg.com/vi/dQw4w9WgXcQ/hqdefault.jpg'
    );
  });

  it('sin cursos comprados invita al catalogo', async () => {
    vi.mocked(api.listarMisCursosApi).mockResolvedValue([]);
    conSesion();
    renderizar();

    expect(await screen.findByText(/todavía no tienes cursos/i)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /ver los cursos/i })).toHaveAttribute('href', '/cursos');
  });

  it('avisa si la consulta falla', async () => {
    vi.mocked(api.listarMisCursosApi).mockRejectedValue(new Error('Servidor no disponible'));
    conSesion();
    renderizar();

    expect(await screen.findByRole('alert')).toHaveTextContent(/servidor no disponible/i);
  });
});
