import { describe, expect, it, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Navigate, Route, Routes } from 'react-router-dom';
import PlantillaPanel from '@/features/administracion/componentes/plantillas/PlantillaPanel';
import PaginaProductos from '@/features/administracion/paginas/PaginaProductos';
import PaginaCursos from '@/features/administracion/paginas/PaginaCursos';
import { AutenticacionContexto } from '@/features/autenticacion/contexto/AutenticacionContexto';
import * as api from '@/features/administracion/servicios/catalogo.api';
import type { Usuario } from '@/features/autenticacion/tipos/autenticacion.tipos';

vi.mock('@/features/administracion/servicios/catalogo.api');

const admin: Usuario = {
  userId: 4,
  name: 'Esau',
  lastname: 'Morales',
  email: 'info@hycon.lat',
  phone: null,
  avatarUrl: null,
  roleId: 1,
  rol: 'ADMIN',
};

// Se replica el arbol de rutas real: layout con Outlet y secciones anidadas
const renderizar = () =>
  render(
    <AutenticacionContexto.Provider
      value={{
        usuario: admin,
        cargando: false,
        autenticado: true,
        iniciarSesion: vi.fn(),
        registrar: vi.fn(),
        cerrarSesion: vi.fn(),
      }}
    >
      <MemoryRouter initialEntries={['/panel-de-configuracion']}>
        <Routes>
          <Route path="/panel-de-configuracion" element={<PlantillaPanel />}>
            <Route index element={<Navigate to="productos" replace />} />
            <Route path="productos" element={<PaginaProductos />} />
            <Route path="cursos" element={<PaginaCursos />} />
          </Route>
        </Routes>
      </MemoryRouter>
    </AutenticacionContexto.Provider>
  );

describe('rutas del panel', () => {
  beforeEach(() => {
    window.localStorage.clear();
    vi.mocked(api.listarProductosApi).mockResolvedValue([]);
    vi.mocked(api.listarCursosApi).mockResolvedValue([]);
  });

  it('la ruta base redirige a la seccion de productos', async () => {
    renderizar();

    expect(await screen.findByRole('heading', { name: 'Productos' })).toBeInTheDocument();
  });

  it('cambia de seccion al pulsar la barra lateral', async () => {
    const usuario = userEvent.setup();
    renderizar();
    await screen.findByRole('heading', { name: 'Productos' });

    await usuario.click(screen.getByRole('link', { name: 'CURSOS' }));

    expect(await screen.findByRole('heading', { name: 'Cursos' })).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'Productos' })).not.toBeInTheDocument();
  });

  it('conserva el encabezado y la barra lateral al cambiar de seccion', async () => {
    const usuario = userEvent.setup();
    renderizar();
    await screen.findByRole('heading', { name: 'Productos' });

    // Si el layout se remontara, estos nodos serian sustituidos por otros nuevos
    const barraLateralAntes = screen.getByRole('navigation', { name: /secciones del panel/i });
    const logoAntes = screen.getByAltText('Hycon');

    await usuario.click(screen.getByRole('link', { name: 'CURSOS' }));
    await screen.findByRole('heading', { name: 'Cursos' });

    expect(screen.getByRole('navigation', { name: /secciones del panel/i })).toBe(
      barraLateralAntes
    );
    expect(screen.getByAltText('Hycon')).toBe(logoAntes);
  });

  it('solo vuelve a pedir datos de la seccion a la que entras', async () => {
    const usuario = userEvent.setup();
    renderizar();
    await screen.findByRole('heading', { name: 'Productos' });

    expect(api.listarProductosApi).toHaveBeenCalledTimes(1);
    expect(api.listarCursosApi).not.toHaveBeenCalled();

    await usuario.click(screen.getByRole('link', { name: 'CURSOS' }));
    await screen.findByRole('heading', { name: 'Cursos' });

    await waitFor(() => expect(api.listarCursosApi).toHaveBeenCalledTimes(1));
    expect(api.listarProductosApi).toHaveBeenCalledTimes(1);
  });

  it('marca en la barra lateral la seccion abierta', async () => {
    const usuario = userEvent.setup();
    renderizar();
    await screen.findByRole('heading', { name: 'Productos' });

    expect(screen.getByRole('link', { name: 'PRODUCTOS' })).toHaveAttribute(
      'aria-current',
      'page'
    );

    await usuario.click(screen.getByRole('link', { name: 'CURSOS' }));

    expect(await screen.findByRole('heading', { name: 'Cursos' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'CURSOS' })).toHaveAttribute('aria-current', 'page');
    expect(screen.getByRole('link', { name: 'PRODUCTOS' })).not.toHaveAttribute('aria-current');
  });
});
