import { describe, expect, it, vi, beforeEach } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import PlantillaPublica from '@/shared/ui/plantillas/PlantillaPublica';
import PaginaHome from '@/features/home/paginas/PaginaHome';
import PaginaProductos from '@/features/productos/paginas/PaginaProductos';
import PaginaCursos from '@/features/cursos/paginas/PaginaCursos';
import PaginaPublicaciones from '@/features/publicaciones/paginas/PaginaPublicaciones';
import PaginaAcercaDe from '@/features/acerca-de/paginas/PaginaAcercaDe';
import PaginaContacto from '@/features/contacto/paginas/PaginaContacto';
import PaginaNoEncontrada from '@/app/rutas/PaginaNoEncontrada';
import AutenticacionProveedor from '@/features/autenticacion/contexto/AutenticacionProveedor';
import { RUTAS } from '@/app/rutas/rutas';
import * as apiProductos from '@/features/productos/servicios/productos.api';
import * as apiCursos from '@/features/cursos/servicios/cursos.api';

vi.mock('@/features/productos/servicios/productos.api');
vi.mock('@/features/cursos/servicios/cursos.api');

// Se replica el arbol publico real: un layout con Outlet y las paginas dentro
const renderizar = (ruta: string = RUTAS.home) =>
  render(
    <AutenticacionProveedor>
      <MemoryRouter initialEntries={[ruta]}>
        <Routes>
          <Route element={<PlantillaPublica />}>
            <Route path={RUTAS.home} element={<PaginaHome />} />
            <Route path={RUTAS.productos} element={<PaginaProductos />} />
            <Route path={RUTAS.cursos} element={<PaginaCursos />} />
            <Route path={RUTAS.publicaciones} element={<PaginaPublicaciones />} />
            <Route path={RUTAS.acercaDe} element={<PaginaAcercaDe />} />
            <Route path={RUTAS.contactanos} element={<PaginaContacto />} />
            <Route path="*" element={<PaginaNoEncontrada />} />
          </Route>
        </Routes>
      </MemoryRouter>
    </AutenticacionProveedor>
  );

describe('rutas publicas', () => {
  beforeEach(() => {
    window.localStorage.clear();
    vi.mocked(apiProductos.listarProductosApi).mockResolvedValue({ elementos: [], paginacion: { pagina: 1, porPagina: 6, total: 0, totalPaginas: 1 } });
    vi.mocked(apiCursos.listarCursosApi).mockResolvedValue({ elementos: [], paginacion: { pagina: 1, porPagina: 6, total: 0, totalPaginas: 1 } });
  });

  it('la raiz muestra el home', () => {
    renderizar();

    expect(screen.getByRole('heading', { name: /tu espacio de trabajo, mejor pensado/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /comprar productos/i })).toHaveAttribute('href', RUTAS.productos);
  });

  it('cada seccion del menu tiene su pagina', async () => {
    const casos: Array<[string, RegExp]> = [
      [RUTAS.productos, /^productos$/i],
      [RUTAS.cursos, /^cursos$/i],
      [RUTAS.publicaciones, /^publicaciones$/i],
    ];

    for (const [ruta, titulo] of casos) {
      const { unmount } = renderizar(ruta);
      expect(await screen.findByRole('heading', { name: titulo, level: 1 })).toBeInTheDocument();
      unmount();
    }
  });

  it('acerca de muestra quienes somos', () => {
    renderizar(RUTAS.acercaDe);

    expect(screen.getByRole('heading', { name: /acerca de hycon/i, level: 1 })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /qui[eé]nes somos/i })).toBeInTheDocument();
  });

  it('contactanos muestra la cotizacion de evaluaciones', () => {
    renderizar(RUTAS.contactanos);

    expect(screen.getByRole('heading', { name: /contactanos/i, level: 1 })).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: /cotización de evaluaciones ergonómicas/i })
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /solicitar cotización/i })).toBeInTheDocument();
  });

  it('una direccion inexistente muestra la pagina de no encontrada', () => {
    renderizar('/una-ruta-que-no-existe');

    expect(screen.getByRole('heading', { name: /pagina no encontrada/i })).toBeInTheDocument();
  });

  it('el encabezado y el pie se conservan al cambiar de pagina', async () => {
    const usuario = userEvent.setup();
    renderizar();

    // Si el layout se remontara, estos nodos serian sustituidos por otros nuevos
    const navegacionAntes = screen.getByRole('navigation', { name: /navegacion principal/i });
    const logoAntes = within(screen.getByRole('link', { name: 'Ir al inicio' })).getByAltText('Hycon');

    await usuario.click(screen.getByRole('link', { name: 'PRODUCTOS' }));
    await screen.findByRole('heading', { name: /^productos$/i, level: 1 });

    expect(screen.getByRole('navigation', { name: /navegacion principal/i })).toBe(
      navegacionAntes
    );
    expect(within(screen.getByRole('link', { name: 'Ir al inicio' })).getByAltText('Hycon')).toBe(logoAntes);
  });

  it('el home carga su seleccion y el catalogo consulta su propia pagina', async () => {
    const usuario = userEvent.setup();
    renderizar();

    expect(apiProductos.listarProductosApi).toHaveBeenCalledTimes(1);
    expect(apiCursos.listarCursosApi).toHaveBeenCalledTimes(1);

    await usuario.click(screen.getByRole('link', { name: 'PRODUCTOS' }));
    await screen.findByRole('heading', { name: /^productos$/i, level: 1 });

    expect(apiProductos.listarProductosApi).toHaveBeenCalledTimes(2);
    expect(apiCursos.listarCursosApi).toHaveBeenCalledTimes(1);
  });
});
