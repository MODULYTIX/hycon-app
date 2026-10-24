import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
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

// Respuesta del backend: siempre con su paginacion
const pagina = (cursos: CursoComprado[], total = cursos.length, numero = 1) => ({
  elementos: cursos,
  paginacion: { pagina: numero, porPagina: 6, total, totalPaginas: Math.max(1, Math.ceil(total / 6)) },
});

// Los filtros vienen plegados: primero hay que abrirlos
const abrirFiltros = async (usuario: ReturnType<typeof userEvent.setup>) =>
  usuario.click(await screen.findByRole('button', { name: /filtrar mis cursos/i }));

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
    vi.mocked(api.listarMisCursosApi).mockResolvedValue(pagina([logistica]));
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
    // Un curso comprado entra directo al aula, no a la ficha donde se vende
    expect(curso.getByRole('link', { name: /entrar al curso/i })).toHaveAttribute(
      'href',
      `/cursos/${logistica.uuid}/aula`
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
    vi.mocked(api.listarMisCursosApi).mockResolvedValue(pagina([]));
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

describe('filtros y paginacion de mis cursos', () => {
  beforeEach(() => {
    window.localStorage.clear();
    vi.mocked(api.listarMisCursosApi).mockResolvedValue(pagina([logistica]));
    conSesion();
  });

  it('la primera carga pide la pagina uno sin filtros', async () => {
    renderizar();
    await screen.findByRole('heading', { name: logistica.name });

    expect(api.listarMisCursosApi).toHaveBeenCalledWith(1, expect.any(AbortSignal), {});
  });

  // El filtro lo resuelve el backend: aqui solo viaja en la consulta
  it('al aplicar un filtro se vuelve a pedir al backend', async () => {
    const usuario = userEvent.setup();
    renderizar();
    await screen.findByRole('heading', { name: logistica.name });

    await abrirFiltros(usuario);
    await usuario.type(screen.getByLabelText(/buscar/i), 'ergonomia');
    await usuario.selectOptions(screen.getByLabelText(/ordenar por/i), 'nombre');
    await usuario.click(screen.getByRole('button', { name: /aplicar filtros/i }));

    await waitFor(() =>
      expect(api.listarMisCursosApi).toHaveBeenLastCalledWith(1, expect.any(AbortSignal), {
        buscar: 'ergonomia',
        orden: 'nombre',
      })
    );
  });

  it('limpiar los filtros vuelve a pedir la lista completa', async () => {
    const usuario = userEvent.setup();
    renderizar();
    await screen.findByRole('heading', { name: logistica.name });

    await abrirFiltros(usuario);
    await usuario.type(screen.getByLabelText(/buscar/i), 'ergonomia');
    await usuario.click(screen.getByRole('button', { name: /aplicar filtros/i }));
    await waitFor(() => expect(api.listarMisCursosApi).toHaveBeenCalledTimes(2));

    await usuario.click(screen.getByRole('button', { name: /limpiar/i }));

    await waitFor(() =>
      expect(api.listarMisCursosApi).toHaveBeenLastCalledWith(1, expect.any(AbortSignal), {})
    );
  });

  it('con un filtro sin resultados lo dice sin invitar al catalogo', async () => {
    const usuario = userEvent.setup();
    renderizar();
    await screen.findByRole('heading', { name: logistica.name });
    vi.mocked(api.listarMisCursosApi).mockResolvedValue(pagina([], 0));

    await abrirFiltros(usuario);
    await usuario.type(screen.getByLabelText(/buscar/i), 'soldadura');
    await usuario.click(screen.getByRole('button', { name: /aplicar filtros/i }));

    expect(await screen.findByText(/ningún curso coincide/i)).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /ver los cursos/i })).not.toBeInTheDocument();
  });

  it('el paginador manda la pagina elegida al backend', async () => {
    const usuario = userEvent.setup();
    vi.mocked(api.listarMisCursosApi).mockResolvedValue(pagina([logistica], 14));
    renderizar();
    await screen.findByRole('heading', { name: logistica.name });

    await usuario.click(screen.getByRole('button', { name: /página siguiente|pagina siguiente/i }));

    await waitFor(() =>
      expect(api.listarMisCursosApi).toHaveBeenLastCalledWith(2, expect.any(AbortSignal), {})
    );
  });

  it('sin mas de una pagina no se pinta el paginador', async () => {
    renderizar();
    await screen.findByRole('heading', { name: logistica.name });

    expect(screen.queryByRole('navigation', { name: /paginas de cursos/i })).not.toBeInTheDocument();
  });
});

describe('los filtros ocupan poco mientras no se usan', () => {
  beforeEach(() => {
    window.localStorage.clear();
    vi.mocked(api.listarMisCursosApi).mockResolvedValue(pagina([logistica]));
    conSesion();
  });

  it('empiezan plegados', async () => {
    renderizar();
    await screen.findByRole('heading', { name: logistica.name });

    expect(screen.getByRole('button', { name: /filtrar mis cursos/i })).toHaveAttribute(
      'aria-expanded',
      'false'
    );
    expect(screen.queryByRole('button', { name: /aplicar filtros/i })).toBeNull();
  });

  it('se abren y se vuelven a cerrar', async () => {
    const usuario = userEvent.setup();
    renderizar();
    await screen.findByRole('heading', { name: logistica.name });
    const interruptor = screen.getByRole('button', { name: /filtrar mis cursos/i });

    await usuario.click(interruptor);
    expect(screen.getByRole('button', { name: /aplicar filtros/i })).toBeVisible();

    await usuario.click(interruptor);
    expect(screen.queryByRole('button', { name: /aplicar filtros/i })).toBeNull();
  });

  // Plegados hay que poder ver que la lista esta filtrada
  it('plegados siguen diciendo cuantos filtros hay puestos', async () => {
    const usuario = userEvent.setup();
    renderizar();
    await screen.findByRole('heading', { name: logistica.name });

    await abrirFiltros(usuario);
    await usuario.type(screen.getByLabelText(/buscar/i), 'ergonomia');
    await usuario.click(screen.getByRole('button', { name: /aplicar filtros/i }));
    await usuario.click(screen.getByRole('button', { name: /filtrar mis cursos/i }));

    expect(screen.getByRole('status')).toHaveTextContent('1 filtro activo');
  });
});
