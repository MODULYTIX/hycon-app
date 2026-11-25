import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '@/app/App';
import { RUTAS } from '@/app/rutas/rutas';
import { peticion } from '@/shared/utilidades/cliente-http';

// Toda la aplicacion habla con el backend por aqui: se contesta segun la direccion
vi.mock('@/shared/utilidades/cliente-http', async (original) => {
  const real = await original<typeof import('@/shared/utilidades/cliente-http')>();
  return { ...real, peticion: vi.fn() };
});

const UUID = '00000000-0000-4000-8000-000000000001';
const SLUG = 'una-publicacion';
const paginacion = { pagina: 1, porPagina: 6, total: 1, totalPaginas: 1 };

const producto = {
  uuid: UUID,
  name: 'Silla ergonomica de prueba',
  description: 'Con apoyo lumbar',
  brand: 'Hycon',
  model: 'S1',
  color: 'Negro',
  price: 900,
  discountPrice: null,
  stock: 4,
  shippingAgencies: [],
  status: 'active',
  imageUrl: null,
  createdAt: '2026-10-01T12:00:00.000Z',
  imageUrls: [],
};

const curso = {
  uuid: UUID,
  name: 'Curso de prueba',
  description: 'Para comprobar la ruta',
  thumbnailUrl: null,
  youtubeId: null,
  videoUrl: null,
  durationMinutes: 60,
  partes: 1,
  previewSegundos: 10,
  price: 219,
  discountPrice: null,
  status: 'active',
  createdAt: '2026-10-01T12:00:00.000Z',
};

const publicacion = {
  uuid: UUID,
  title: 'Articulo de prueba',
  slug: SLUG,
  excerpt: 'Resumen',
  content: 'Texto del articulo',
  coverUrl: null,
  status: 'active',
  views: 3,
  readingMinutes: 4,
  authorName: 'Hycon',
  publishedAt: '2026-10-01T12:00:00.000Z',
  createdAt: '2026-10-01T12:00:00.000Z',
};

const respuestaPara = (url: string): unknown => {
  // Sin sesion: lo mismo que contesta el backend a un visitante
  if (url.startsWith('/api/v1/auth')) throw new Error('No autenticado');
  if (url.includes('/lecciones')) {
    return { temario: { cursoUuid: UUID, tieneAcceso: false, previewSegundos: 10, lecciones: [] } };
  }
  if (url.includes('/catalog/shipping-agencies')) return { agencias: [] };
  if (url.includes('/catalog/products/')) return { producto };
  if (url.startsWith('/api/v1/catalog/products')) return { productos: [producto], paginacion };
  if (url.includes('/catalog/courses/')) return { curso };
  if (url.startsWith('/api/v1/catalog/courses')) return { cursos: [curso], paginacion };
  if (url.includes('/posts/')) return { publicacion };
  if (url.startsWith('/api/v1/posts')) return { publicaciones: [publicacion], paginacion };
  if (url.startsWith('/api/v1/orders')) return { pedidos: [], paginacion };
  if (url.includes('/mis-cursos')) return { cursos: [], paginacion };
  if (url.includes('/cotizaciones/evaluaciones')) return { evaluaciones: [] };
  if (url.startsWith('/api/v1/ergo')) return [];
  return {};
};

const abrir = (ruta: string) => {
  window.history.pushState({}, '', ruta);
  return render(<App />);
};

const encabezado = (texto: RegExp) =>
  screen.findByRole('heading', { name: texto }, { timeout: 5000 });

beforeEach(() => {
  window.localStorage.clear();
  vi.mocked(peticion).mockImplementation(async (url: string) => respuestaPara(url) as never);
});

// Cada direccion del catalogo de rutas tiene que pintar su pagina. Si alguien
// renombra una ruta o se olvida de montarla, el visitante ve la de "no encontrada"
// y esta tabla lo detecta.
describe('todas las rutas abren su pagina', () => {
  const paginas: [string, string, RegExp][] = [
    ['home', RUTAS.home, /productos destacados/i],
    ['productos', RUTAS.productos, /^productos$/i],
    ['detalle de producto', `/productos/${UUID}`, /silla ergonomica de prueba/i],
    ['cursos', RUTAS.cursos, /^cursos$/i],
    ['detalle de curso', `/cursos/${UUID}`, /curso de prueba/i],
    ['publicaciones', RUTAS.publicaciones, /^publicaciones$/i],
    ['detalle de publicacion', `/publicaciones/${SLUG}`, /articulo de prueba/i],
    ['acerca de', RUTAS.acercaDe, /acerca de hycon/i],
    ['contactanos', RUTAS.contactanos, /^contactanos$/i],
    ['carrito', RUTAS.carrito, /^carrito$/i],
    ['perfil', RUTAS.perfil, /mi cuenta/i],
    ['historial de compras', RUTAS.historial, /mis compras/i],
    ['panel de cursos', RUTAS.panelCursos, /mis cursos/i],
    ['software ergonomico', RUTAS.softwareErgonomico, /empresas y evaluaciones/i],
    ['empresa del software', '/software-ergonomico/empresas/7', /empresas y evaluaciones/i],
  ];

  it.each(paginas)('%s', async (_nombre, ruta, titulo) => {
    abrir(ruta);

    expect(await encabezado(titulo)).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: /pagina no encontrada/i })).not.toBeInTheDocument();
  });
});

// Las que piden sesion o permisos no se quedan en blanco: llevan a otra parte
describe('rutas que piden permiso', () => {
  it('el aula sin sesion devuelve a la ficha del curso', async () => {
    abrir(`/cursos/${UUID}/aula`);

    expect(await encabezado(/curso de prueba/i)).toBeInTheDocument();
    expect(await screen.findByText(/contenido del curso/i)).toBeInTheDocument();
  });

  it('el certificado sin sesion devuelve a la ficha del curso', async () => {
    abrir(`/cursos/${UUID}/certificado`);

    expect(await encabezado(/curso de prueba/i)).toBeInTheDocument();
  });

  it.each([
    ['la portada del panel', RUTAS.panel],
    ['los productos del panel', RUTAS.panelProductos],
    ['los cursos del panel', RUTAS.panelCursosAdmin],
    ['las publicaciones del panel', RUTAS.panelPublicaciones],
  ])('%s sin ser admin lleva al inicio', async (_nombre, ruta) => {
    abrir(ruta);

    expect(await encabezado(/productos destacados/i)).toBeInTheDocument();
    expect(window.location.pathname).toBe(RUTAS.home);
  });
});

describe('una direccion que no existe', () => {
  it('muestra la pagina de no encontrada, con su menu y su pie', async () => {
    abrir('/una-direccion-inventada');

    expect(await encabezado(/pagina no encontrada/i)).toBeInTheDocument();
    expect(screen.getByRole('navigation', { name: /principal/i })).toBeInTheDocument();
  });
});

// Moverse por el menu no puede dejar la pagina a medias ni perder el encabezado
describe('cambiar de pagina desde el menu', () => {
  it('recorre todas las secciones y conserva el encabezado y el pie', async () => {
    const usuario = userEvent.setup();
    abrir(RUTAS.home);
    await encabezado(/productos destacados/i);

    const menu = screen.getByRole('navigation', { name: /principal/i });
    const pie = screen.getByRole('contentinfo');

    const recorrido: [RegExp, RegExp, string][] = [
      [/^productos$/i, /^productos$/i, RUTAS.productos],
      [/^cursos$/i, /^cursos$/i, RUTAS.cursos],
      [/^publicaciones$/i, /^publicaciones$/i, RUTAS.publicaciones],
      [/^contactanos$/i, /^contactanos$/i, RUTAS.contactanos],
      [/^home$/i, /productos destacados/i, RUTAS.home],
    ];

    for (const [enlace, titulo, destino] of recorrido) {
      await usuario.click(within(menu).getByRole('link', { name: enlace }));

      expect(await encabezado(titulo)).toBeInTheDocument();
      expect(window.location.pathname).toBe(destino);
      // El layout no se vuelve a montar: siguen siendo los mismos nodos
      expect(screen.getByRole('navigation', { name: /principal/i })).toBe(menu);
      expect(screen.getByRole('contentinfo')).toBe(pie);
    }
  });

  it('volver atras en el navegador regresa a la pagina anterior', async () => {
    const usuario = userEvent.setup();
    abrir(RUTAS.home);
    await encabezado(/productos destacados/i);

    await usuario.click(screen.getByRole('navigation', { name: /principal/i }).querySelector('a[href="/cursos"]') as HTMLElement);
    expect(await encabezado(/^cursos$/i)).toBeInTheDocument();

    window.history.back();

    await waitFor(() => expect(window.location.pathname).toBe(RUTAS.home));
    expect(await encabezado(/productos destacados/i)).toBeInTheDocument();
  });
});
