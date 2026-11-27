import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '@/app/App';
import { RUTAS } from '@/app/rutas/rutas';
import { peticion } from '@/shared/utilidades/cliente-http';

// La pantalla de cursos se rompe a proposito: es lo que antes dejaba la web en blanco
vi.mock('@/features/cursos/paginas/PaginaCursos', () => ({
  default: () => {
    throw new Error('la pantalla de cursos se rompio');
  },
}));

vi.mock('@/shared/utilidades/cliente-http', async (original) => {
  const real = await original<typeof import('@/shared/utilidades/cliente-http')>();
  return { ...real, peticion: vi.fn() };
});

const paginacion = { pagina: 1, porPagina: 6, total: 0, totalPaginas: 1 };

const respuestaPara = (url: string): unknown => {
  if (url.startsWith('/api/v1/auth')) throw new Error('No autenticado');
  if (url.startsWith('/api/v1/catalog/products')) return { productos: [], paginacion };
  return {};
};

describe('una pantalla rota dentro de la aplicacion', () => {
  beforeEach(() => {
    window.localStorage.clear();
    vi.mocked(peticion).mockImplementation(async (url: string) => respuestaPara(url) as never);
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  const abrirCursos = () => {
    window.history.pushState({}, '', RUTAS.cursos);
    return render(<App />);
  };

  it('avisa en vez de dejar la pagina en blanco', async () => {
    abrirCursos();

    expect(await screen.findByRole('alert')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /algo salió mal/i })).toBeInTheDocument();
  });

  // El fallo se queda dentro del contenido: la navegacion no se la lleva por delante
  it('conserva el menu y el pie', async () => {
    abrirCursos();
    await screen.findByRole('alert');

    expect(screen.getByRole('navigation', { name: /principal/i })).toBeInTheDocument();
    expect(screen.getByRole('contentinfo')).toBeInTheDocument();
  });

  it('desde el aviso se puede seguir navegando', async () => {
    const usuario = userEvent.setup();
    abrirCursos();
    await screen.findByRole('alert');

    const menu = screen.getByRole('navigation', { name: /principal/i });
    await usuario.click(within(menu).getByRole('link', { name: /^productos$/i }));

    expect(await screen.findByRole('heading', { name: /^productos ergonómicos$/i })).toBeInTheDocument();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    expect(window.location.pathname).toBe(RUTAS.productos);
  });
});
