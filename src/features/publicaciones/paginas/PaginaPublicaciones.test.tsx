import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import PaginaPublicaciones from './PaginaPublicaciones';
import * as api from '@/features/publicaciones/servicios/publicaciones.api';
import type { Publicacion } from '@/features/publicaciones/tipos/publicacion.tipos';

vi.mock('@/features/publicaciones/servicios/publicaciones.api');

const articulo = (numero: number, extra: Partial<Publicacion> = {}): Publicacion => ({
  uuid: `${String(numero).padStart(8, '0')}-0000-4000-8000-000000000000`,
  title: `Artículo ${numero}`,
  slug: `articulo-${numero}`,
  excerpt: `Resumen del artículo ${numero}`,
  content: `<p>Contenido del artículo ${numero}</p>`,
  coverUrl: `https://cdn.hycon.lat/${numero}.webp`,
  status: 'active',
  views: numero * 10,
  readingMinutes: 4,
  authorName: 'Esau Morales',
  publishedAt: '2026-03-01T12:00:00.000Z',
  createdAt: '2026-03-01T12:00:00.000Z',
  ...extra,
});

const pagina = (elementos: Publicacion[], extra = {}) => ({
  elementos,
  paginacion: { pagina: 1, porPagina: 9, total: elementos.length, totalPaginas: 1, ...extra },
});

const recientes = [1, 2, 3, 4, 5].map((numero) => articulo(numero));
const leidos = [articulo(9, { title: 'El más leído', views: 900 })];

const responder = (elementos: Publicacion[], extra = {}) =>
  vi.mocked(api.listarPublicacionesApi).mockImplementation(async (_estado, opciones) =>
    opciones?.orden === 'leidos' ? pagina(leidos) : pagina(elementos, extra)
  );

const renderizar = () =>
  render(
    <MemoryRouter initialEntries={['/publicaciones']}>
      <Routes>
        <Route path="/publicaciones" element={<PaginaPublicaciones />} />
        <Route path="/publicaciones/:slug" element={<h1>Detalle</h1>} />
      </Routes>
    </MemoryRouter>
  );

describe('PaginaPublicaciones (publica)', () => {
  beforeEach(() => {
    responder(recientes);
  });

  it('pide solo los articulos publicados, los mas recientes primero', async () => {
    renderizar();
    await screen.findByRole('heading', { name: 'Artículo 1' });

    expect(api.listarPublicacionesApi).toHaveBeenCalledWith(
      'active',
      expect.objectContaining({ pagina: 1, orden: 'recientes' })
    );
  });

  it('destaca el articulo mas reciente con su resumen y enlace', async () => {
    renderizar();

    const destacado = (await screen.findByRole('heading', { name: 'Artículo 1' })).closest('article');
    expect(destacado).not.toBeNull();
    expect(within(destacado as HTMLElement).getByText('Lo último')).toBeInTheDocument();
    expect(within(destacado as HTMLElement).getByText('Resumen del artículo 1')).toBeInTheDocument();
    expect(within(destacado as HTMLElement).getByRole('link', { name: /leer artículo completo/i })).toHaveAttribute(
      'href',
      '/publicaciones/articulo-1'
    );
    expect(within(destacado as HTMLElement).getByText('4 min de lectura')).toBeInTheDocument();
  });

  it('acompana el destacado con los dos siguientes y manda el resto al listado', async () => {
    renderizar();
    await screen.findByRole('heading', { name: 'Artículo 1' });

    expect(screen.getByRole('link', { name: 'Leer Artículo 2' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Leer Artículo 3' })).toBeInTheDocument();

    const listado = within(screen.getByRole('list', { name: /listado de artículos/i }));
    expect(listado.getAllByRole('listitem')).toHaveLength(2);
    expect(listado.getByRole('heading', { name: 'Artículo 4' })).toBeInTheDocument();
  });

  it('pide aparte los mas leidos y los numera', async () => {
    renderizar();
    await screen.findByRole('heading', { name: 'Lo más leído' });

    expect(api.listarPublicacionesApi).toHaveBeenCalledWith(
      'active',
      expect.objectContaining({ orden: 'leidos', porPagina: 3 })
    );
    const panel = within(screen.getByRole('heading', { name: 'Lo más leído' }).closest('section') as HTMLElement);
    expect(panel.getByRole('link', { name: 'El más leído' })).toBeInTheDocument();
    expect(panel.getByText('01')).toBeInTheDocument();
  });

  it('Ver más agrega la siguiente pagina sin perder los articulos ya cargados', async () => {
    const usuario = userEvent.setup();
    vi.mocked(api.listarPublicacionesApi).mockImplementation(async (_estado, opciones) => {
      if (opciones?.orden === 'leidos') return pagina(leidos);
      return opciones?.pagina === 1
        ? pagina(recientes, { total: 14, totalPaginas: 2 })
        : pagina([articulo(6, { title: 'Artículo de la segunda página' })], {
            pagina: 2,
            total: 14,
            totalPaginas: 2,
          });
    });
    renderizar();
    await screen.findByRole('heading', { name: 'Artículo 1' });

    await usuario.click(screen.getByRole('button', { name: /ver más artículos/i }));

    expect(await screen.findByRole('heading', { name: 'Artículo de la segunda página' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Artículo 4' })).toBeInTheDocument();
  });

  it('sin mas paginas no ofrece Ver mas', async () => {
    renderizar();
    await screen.findByRole('heading', { name: 'Artículo 1' });

    expect(screen.queryByRole('button', { name: /ver más artículos/i })).not.toBeInTheDocument();
  });

  it('al pulsar un articulo se abre su pagina', async () => {
    const usuario = userEvent.setup();
    renderizar();
    await screen.findByRole('heading', { name: 'Artículo 1' });

    await usuario.click(screen.getByRole('link', { name: /leer artículo completo/i }));

    expect(await screen.findByRole('heading', { name: 'Detalle' })).toBeInTheDocument();
  });

  it('con un solo articulo el destacado ocupa todo el ancho', async () => {
    responder([articulo(1)]);
    renderizar();

    const destacado = (await screen.findByRole('heading', { name: 'Artículo 1' })).closest('article');
    expect(destacado?.parentElement?.className).not.toMatch(/lg:grid-cols/);
    expect(screen.getByText(/por ahora solo están los artículos de arriba/i)).toBeInTheDocument();
  });

  it('muestra un estado vacio si todavia no hay articulos', async () => {
    responder([]);
    renderizar();

    expect(await screen.findByText(/todavía no hay artículos publicados/i)).toBeInTheDocument();
  });

  it('avisa si la carga falla', async () => {
    vi.mocked(api.listarPublicacionesApi).mockRejectedValue(new Error('Servidor no disponible'));
    renderizar();

    expect(await screen.findByRole('alert')).toHaveTextContent(/servidor no disponible/i);
  });
});
